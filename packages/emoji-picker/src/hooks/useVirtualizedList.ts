import { useCallback, useMemo, useRef } from 'react';
import { defaultRangeExtractor, useVirtualizer } from '@tanstack/react-virtual';

import type { Range } from '@tanstack/react-virtual';

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

  const isSticky = useCallback((index: number) => stickyIndexes.includes(index), [stickyIndexes]);
  const isActiveSticky = useCallback(
    (index: number) => !hideStickyHeader && activeStickyIndexRef.current === index,
    [hideStickyHeader]
  );

  const rangeExtractor = useCallback(
    (range: Range) => {
      if (hideStickyHeader) {
        return defaultRangeExtractor(range);
      }

      activeStickyIndexRef.current =
        [...stickyIndexes].reverse().find((index) => range.startIndex >= index) ?? 0;

      const next = new Set([activeStickyIndexRef.current, ...defaultRangeExtractor(range)]);

      return [...next].sort((a, b) => a - b);
    },
    [hideStickyHeader, stickyIndexes]
  );

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement,
    estimateSize,
    overscan: 5,
    paddingEnd: 8,
    rangeExtractor,
  });

  return {
    virtualizer,
    isSticky,
    isActiveSticky,
  };
}
