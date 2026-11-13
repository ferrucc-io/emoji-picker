import { useEffect, useLayoutEffect, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
  activeCategoryIdAtom,
  categoriesListAtom,
  categoryScrollerAtom,
  pendingScrollCategoryIdAtom,
} from '../atoms/categories';
import type { CategoryNavItem } from '../types/emoji';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface CategoryOffset {
  id: string;
  rowIndex: number;
  offsetTop: number;
}

interface UseCategorySyncOptions {
  categories: CategoryNavItem[];
  categoryOffsets: CategoryOffset[];
  scrollElementRef: { readonly current: HTMLDivElement | null };
  virtualizer: {
    scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' }) => void;
  };
}

export function useCategorySync({
  categories,
  categoryOffsets,
  scrollElementRef,
  virtualizer,
}: UseCategorySyncOptions) {
  const setCategoriesList = useSetAtom(categoriesListAtom);
  const setActiveCategoryId = useSetAtom(activeCategoryIdAtom);
  const setCategoryScroller = useSetAtom(categoryScrollerAtom);
  const [pendingScrollCategoryId, setPendingScrollCategoryId] = useAtom(
    pendingScrollCategoryIdAtom
  );

  const virtualizerRef = useRef(virtualizer);
  virtualizerRef.current = virtualizer;

  const categoryOffsetsRef = useRef(categoryOffsets);
  categoryOffsetsRef.current = categoryOffsets;

  useIsomorphicLayoutEffect(() => {
    setCategoriesList(categories);
    setActiveCategoryId((prev) => {
      if (prev && categories.some((c) => c.id === prev)) {
        return prev;
      }
      return categories[0]?.id ?? null;
    });
  }, [categories, setCategoriesList, setActiveCategoryId]);

  useIsomorphicLayoutEffect(() => {
    setCategoryScroller({
      scrollToRow: (rowIndex: number) => {
        virtualizerRef.current.scrollToIndex(rowIndex, { align: 'start' });
      },
    });
    return () => {
      setCategoryScroller(null);
    };
  }, [setCategoryScroller]);

  useIsomorphicLayoutEffect(() => {
    if (!pendingScrollCategoryId) {
      return;
    }

    const target = categories.find(
      (c) => c.id === pendingScrollCategoryId || c.name === pendingScrollCategoryId
    );
    if (target) {
      setActiveCategoryId(target.id);
      virtualizerRef.current.scrollToIndex(target.rowIndex, { align: 'start' });
    }
    setPendingScrollCategoryId(null);
  }, [pendingScrollCategoryId, categories, setActiveCategoryId, setPendingScrollCategoryId]);

  useEffect(() => {
    const el = scrollElementRef.current;
    if (!el) {
      return;
    }

    const handleScroll = () => {
      const offsets = categoryOffsetsRef.current;
      if (offsets.length === 0) {
        return;
      }

      const scrollTop = el.scrollTop;
      const maxScroll = el.scrollHeight - el.clientHeight;

      setActiveCategoryId((prev) => {
        if (maxScroll > 0 && scrollTop >= maxScroll - 2 && prev) {
          const current = offsets.find((c) => c.id === prev);
          if (current && current.offsetTop >= scrollTop) {
            return prev;
          }
        }

        let active = offsets[0].id;
        for (let i = 0; i < offsets.length; i++) {
          if (offsets[i].offsetTop <= scrollTop + 1) {
            active = offsets[i].id;
          } else {
            break;
          }
        }
        return prev === active ? prev : active;
      });
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
    };
  }, [scrollElementRef, setActiveCategoryId]);
}
