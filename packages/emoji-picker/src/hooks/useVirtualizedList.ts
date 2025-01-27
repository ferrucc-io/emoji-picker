import { useMemo, useRef } from 'react';
import { defaultRangeExtractor, useVirtualizer } from '@tanstack/react-virtual';

interface UseVirtualizedListOptions<T> {
  rows: T[];
  getScrollElement: () => HTMLElement | null;
  estimateSize: (index: number) => number;
  isHeader: (row: T) => boolean;
  hideStickyHeader?: boolean;
}

export function useVirtualizedList<T>({
  rows,
  getScrollElement,
  estimateSize,
  isHeader,
  hideStickyHeader = false,
}: UseVirtualizedListOptions<T>) {
  const activeStickyIndexRef = useRef(0);

  const stickyIndexes = useMemo(() => {
    if (hideStickyHeader) return [];
    return rows.reduce<number[]>((acc, row, index) => {
      if (isHeader(row)) {
        acc.push(index);
      }
      return acc;
    }, []);
  }, [rows, isHeader, hideStickyHeader]);

  const isSticky = (index: number) => stickyIndexes.includes(index);
  const isActiveSticky = (index: number) =>
    !hideStickyHeader && activeStickyIndexRef.current === index;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement,
    estimateSize,
    overscan: 5,
    paddingEnd: 8,
    rangeExtractor: (range) => {
      if (hideStickyHeader) {
        return defaultRangeExtractor(range);
      }

      const activeIndex = stickyIndexes.findLast(index => range.startIndex >= index) ?? 0;
      activeStickyIndexRef.current = activeIndex;

      const defaultRange = defaultRangeExtractor(range);
      if (defaultRange.includes(activeIndex)) {
        return defaultRange;
      }
      return [activeIndex, ...defaultRange];
    },
  });

  return {
    virtualizer,
    isSticky,
    isActiveSticky,
  };
}
