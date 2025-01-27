import { atom, createStore, Provider } from 'jotai';
import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { render } from '@testing-library/react';
import { mockEmojiData, mockFilteredEmojis } from './testData';
import { EmojiPickerList } from '../EmojiPickerList';
import { EmojiPickerProvider } from '../EmojiPickerContext';

// Create writable test atoms
const testSearchAtom = atom('');

// Mock the virtualizer
const mockVirtualizer = {
  getVirtualItems: () => [
    { index: 0, start: 0, size: 32, key: '0', measureElement: null },
    { index: 1, start: 32, size: 32, key: '1', measureElement: null },
  ],
  getTotalSize: () => 64,
  scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' }) => {},
};

// Mock the modules
mock.module('@tanstack/react-virtual', () => ({
  useVirtualizer: () => mockVirtualizer,
  defaultRangeExtractor: (range: any) => range,
}));
mock.module('unicode-emoji-json/data-by-group.json', () => mockEmojiData);
mock.module('../../utils/supportedEmojis', () => ({
  filterSupportedEmojis: () => mockFilteredEmojis,
}));
mock.module('../../atoms/emoji', () => ({
  searchAtom: testSearchAtom,
  filteredEmojisAtom: atom((get) => {
    const search = get(testSearchAtom);
    if (!search.trim()) {
      return mockFilteredEmojis;
    }
    return search === 'xyznotfound' ? [] : mockFilteredEmojis;
  }),
  skinToneAtom: atom('default'),
  skinToneOnlyAtom: atom('default'),
  hoveredEmojiAtom: atom(null),
  selectedEmojiAtom: atom(null),
  selectedPositionAtom: atom(null),
}));

describe('EmojiPickerList', () => {
  const store = createStore();

  const renderWithProviders = (ui: React.ReactNode) => {
    return render(
      <Provider store={store}>
        <EmojiPickerProvider emojisPerRow={8} emojiSize={32} maxUnicodeVersion={15.0}>
          {ui}
        </EmojiPickerProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    store.set(testSearchAtom, '');
  });

  test('renders EmojiCategories by default when no search', () => {
    store.set(testSearchAtom, '');
    const { container } = renderWithProviders(<EmojiPickerList />);

    // Should find at least one category header
    const headers = container.querySelectorAll('[data-testid="emoji-picker-list-header"]');
    expect(headers.length).toBeGreaterThan(0);
  });

  test('renders empty state when no search results found', () => {
    store.set(testSearchAtom, 'xyznotfound');
    const { container } = renderWithProviders(<EmojiPickerList />);

    // Should find the empty state message
    expect(container.textContent).toInclude('No emojis found');
  });

  test('respects hideStickyHeader prop', () => {
    store.set(testSearchAtom, '');
    const { container } = renderWithProviders(<EmojiPickerList hideStickyHeader />);

    // Headers should not have sticky positioning
    const headers = container.querySelectorAll('[data-testid="emoji-picker-list-header"]');
    headers.forEach((header) => {
      const parentStyle = window.getComputedStyle(header.parentElement!);
      expect(parentStyle.position).not.toBe('sticky');
    });
  });

  test('respects containerHeight prop', () => {
    const customHeight = 500;
    const { container } = renderWithProviders(<EmojiPickerList containerHeight={customHeight} />);

    // Find the scrollable container
    const scrollContainer = container.querySelector('.overflow-y-auto');
    expect(scrollContainer).toBeDefined();
    expect(scrollContainer?.getAttribute('style')).toInclude(`height: ${customHeight}px`);
  });

  test('renders with default containerHeight when not specified', () => {
    const { container } = renderWithProviders(<EmojiPickerList />);

    // Find the scrollable container
    const scrollContainer = container.querySelector('.overflow-y-auto');
    expect(scrollContainer).toBeDefined();
    expect(scrollContainer?.getAttribute('style')).toInclude('height: 364px');
  });
});
