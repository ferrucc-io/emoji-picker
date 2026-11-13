import { atom, useAtomValue, useSetAtom } from 'jotai';
import { searchAtom } from './emoji';
import type { CategoryNavItem } from '../types/emoji';

export const toCategoryId = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const categoriesListAtom = atom<CategoryNavItem[]>([]);

export const activeCategoryIdAtom = atom<string | null>(null);

export const pendingScrollCategoryIdAtom = atom<string | null>(null);

export interface CategoryScroller {
  scrollToRow: (rowIndex: number) => void;
}

export const categoryScrollerAtom = atom<CategoryScroller | null>(null);

export const scrollToCategoryAtom = atom(null, (get, set, categoryId: string) => {
  const categories = get(categoriesListAtom);
  const target = categories.find((c) => c.id === categoryId || c.name === categoryId);
  if (!target) {
    return;
  }

  set(activeCategoryIdAtom, target.id);

  const currentSearch = get(searchAtom);
  const scroller = get(categoryScrollerAtom);

  if (currentSearch.trim()) {
    set(pendingScrollCategoryIdAtom, target.id);
    set(searchAtom, '');
  } else if (scroller) {
    scroller.scrollToRow(target.rowIndex);
  } else {
    set(pendingScrollCategoryIdAtom, target.id);
  }
});

export interface UseCategoryNavigationResult {
  categories: CategoryNavItem[];
  activeCategoryId: string | null;
  scrollToCategory: (categoryId: string) => void;
}

export function useCategoryNavigation(): UseCategoryNavigationResult {
  const categories = useAtomValue(categoriesListAtom);
  const rawActiveCategoryId = useAtomValue(activeCategoryIdAtom);
  const search = useAtomValue(searchAtom);
  const scrollToCategory = useSetAtom(scrollToCategoryAtom);

  return {
    categories,
    activeCategoryId: search.trim() ? null : rawActiveCategoryId,
    scrollToCategory,
  };
}

export const useEmojiCategories = useCategoryNavigation;
