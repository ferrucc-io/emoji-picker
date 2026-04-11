import { describe, expect, mock, test } from 'bun:test';
import { renderHook } from '@testing-library/react';

// Mock virtualizer
const mockVirtualizer = {
  getVirtualItems: () => [],
  getTotalSize: () => 0,
  scrollToIndex: () => {},
};

mock.module('@tanstack/react-virtual', () => ({
  useVirtualizer: () => mockVirtualizer,
  defaultRangeExtractor: (range: any) => {
    const start = range.startIndex;
    const end = range.endIndex;
    const result = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  },
}));

import { useVirtualizedList } from '../useVirtualizedList';

type TestRow = { type: 'header'; content: string } | { type: 'emojis'; content: string[] };

const testRows: TestRow[] = [
  { type: 'header', content: 'Category A' },
  { type: 'emojis', content: ['😀', '😃'] },
  { type: 'header', content: 'Category B' },
  { type: 'emojis', content: ['✋', '👋'] },
];

describe('useVirtualizedList', () => {
  const defaultOptions = {
    rows: testRows,
    getScrollElement: () => null,
    estimateSize: () => 32,
    isHeader: (row: TestRow) => row.type === 'header',
  };

  test('isSticky returns true for header indexes', () => {
    const { result } = renderHook(() => useVirtualizedList(defaultOptions));

    expect(result.current.isSticky(0)).toBe(true);
    expect(result.current.isSticky(2)).toBe(true);
  });

  test('isSticky returns false for non-header indexes', () => {
    const { result } = renderHook(() => useVirtualizedList(defaultOptions));

    expect(result.current.isSticky(1)).toBe(false);
    expect(result.current.isSticky(3)).toBe(false);
  });

  test('hideStickyHeader disables sticky behavior (empty stickyIndexes)', () => {
    const { result } = renderHook(() =>
      useVirtualizedList({ ...defaultOptions, hideStickyHeader: true })
    );

    // When hideStickyHeader is true, no indexes should be sticky
    expect(result.current.isSticky(0)).toBe(false);
    expect(result.current.isSticky(2)).toBe(false);
  });

  test('isActiveSticky returns false when hideStickyHeader is true', () => {
    const { result } = renderHook(() =>
      useVirtualizedList({ ...defaultOptions, hideStickyHeader: true })
    );

    expect(result.current.isActiveSticky(0)).toBe(false);
    expect(result.current.isActiveSticky(2)).toBe(false);
  });

  test('returns a virtualizer object', () => {
    const { result } = renderHook(() => useVirtualizedList(defaultOptions));

    expect(result.current.virtualizer).toBeDefined();
    expect(result.current.virtualizer.getVirtualItems).toBeDefined();
    expect(result.current.virtualizer.getTotalSize).toBeDefined();
  });
});
