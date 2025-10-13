import React from 'react';
import { atom, createStore, Provider } from 'jotai';
import { describe, expect, mock, test } from 'bun:test';
import { render } from '@testing-library/react';
import { EmojiSearchResults } from '../EmojiSearchResults';
import { EmojiPickerProvider } from '../EmojiPickerContext';

// Mock the virtualizer
const mockVirtualizer = {
  getVirtualItems: () => [
    { index: 0, start: 0, size: 32, key: '0', measureElement: null },
    { index: 1, start: 32, size: 32, key: '1', measureElement: null },
  ],
  getTotalSize: () => 64,
  scrollToIndex: (_index: number, _options?: { align?: 'start' | 'center' | 'end' }) => {},
};

mock.module('@tanstack/react-virtual', () => ({
  useVirtualizer: () => mockVirtualizer,
  defaultRangeExtractor: (range: any) => range,
}));

// Mock data
const mockFilteredEmojis = [
  {
    category: 'Smileys & Emotion',
    emojis: [
      {
        emoji: '😀',
        name: 'grinning face',
        slug: 'grinning-face',
        skin_tone_support: false,
      },
      {
        emoji: '😃',
        name: 'grinning face with big eyes',
        slug: 'grinning-face-with-big-eyes',
        skin_tone_support: false,
      },
    ],
  },
];

// Create writable test atoms
const testFilteredEmojisAtom = atom(mockFilteredEmojis);

// Mock the filteredEmojisAtom module
mock.module('../atoms/emoji', () => ({
  filteredEmojisAtom: testFilteredEmojisAtom,
  hoveredEmojiAtom: atom(null),
  selectedEmojiAtom: atom(null),
  selectedPositionAtom: atom(null),
}));

const renderWithProviders = (component: React.ReactElement) => {
  const store = createStore();
  store.set(testFilteredEmojisAtom, mockFilteredEmojis);

  return render(
    <Provider store={store}>
      <EmojiPickerProvider emojisPerRow={8} emojiSize={32} maxUnicodeVersion={16.0}>
        {component}
      </EmojiPickerProvider>
    </Provider>
  );
};

describe('EmojiSearchResults', () => {
  test('renders search results header', () => {
    const { container } = renderWithProviders(<EmojiSearchResults />);
    const headers = container.querySelectorAll('[data-type="header"]');
    expect(headers.length).toBe(1);
  });

  test('renders filtered emojis in grid layout', () => {
    const { container } = renderWithProviders(<EmojiSearchResults />);
    const emojiRows = container.querySelectorAll('[data-type="emojis"]');
    expect(emojiRows.length).toBeGreaterThan(0);
  });

  test('respects emojisPerRow from context', () => {
    const { container } = renderWithProviders(<EmojiSearchResults />);
    const emojiGrid = container.querySelector('[data-type="emojis"]');
    expect(emojiGrid).toBeDefined();
    expect(emojiGrid?.querySelector('.grid')?.getAttribute('style')).toContain(
      'grid-template-columns: repeat(8, minmax(0, 1fr))'
    );
  });

  test('respects containerHeight prop', () => {
    const { container } = renderWithProviders(<EmojiSearchResults containerHeight={300} />);
    const scrollContainer = container.querySelector('.overflow-y-auto');
    expect(scrollContainer).toBeDefined();
    expect(scrollContainer?.getAttribute('style')).toContain('height: 300px');
  });

  test('handles hideStickyHeader prop', () => {
    const { container } = renderWithProviders(<EmojiSearchResults hideStickyHeader={true} />);
    const header = container.querySelector('[data-type="header"]');
    expect(header?.getAttribute('style')).toContain('position: absolute');
  });

  test('renders with keyboard navigation support', () => {
    const { container } = renderWithProviders(<EmojiSearchResults />);
    const scrollContainer = container.querySelector('.overflow-y-auto');
    expect(scrollContainer?.getAttribute('tabIndex')).toBe('0');
  });

  test('renders virtualized list correctly', () => {
    const { container } = renderWithProviders(<EmojiSearchResults />);
    const virtualContainer = container.querySelector('[style*="position: relative"]');
    expect(virtualContainer).toBeDefined();

    const virtualItems = container.querySelectorAll('[style*="position: absolute"]');
    expect(virtualItems.length).toBeGreaterThan(0);
  });
});
