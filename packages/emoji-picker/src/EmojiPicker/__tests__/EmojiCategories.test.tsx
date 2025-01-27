import React from 'react';
import { atom, createStore, Provider } from 'jotai';
import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { render } from '@testing-library/react';
import { mockEmojiData } from './testData';
import { EmojiPickerProvider } from '../EmojiPickerContext';
import { EmojiCategories } from '../EmojiCategories';

// Mock the emoji data module
mock.module('unicode-emoji-json/data-by-group.json', () => mockEmojiData);

// Mock the virtualizer
const mockVirtualizer = {
  getVirtualItems: () => [
    { index: 0, start: 0, size: 32, key: '0', measureElement: null },
    { index: 1, start: 32, size: 32, key: '1', measureElement: null },
    { index: 2, start: 64, size: 32, key: '2', measureElement: null },
    { index: 3, start: 96, size: 32, key: '3', measureElement: null },
  ],
  getTotalSize: () => 128,
  scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' }) => {},
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
  {
    category: 'People & Body',
    emojis: [
      {
        emoji: '✋',
        name: 'raised hand',
        slug: 'raised-hand',
        skin_tone_support: true,
      },
      {
        emoji: '👋',
        name: 'waving hand',
        slug: 'waving-hand',
        skin_tone_support: true,
      },
    ],
  },
];

const testFilteredEmojisAtom = atom(mockFilteredEmojis);
const testSkinToneAtom = atom('medium-dark');

// Mock the emoji atoms module
mock.module('../atoms/emoji', () => ({
  filteredEmojisAtom: testFilteredEmojisAtom,
  skinToneAtom: testSkinToneAtom,
  skinToneOnlyAtom: atom((get) => get(testSkinToneAtom)),
  hoveredEmojiAtom: atom(null),
  selectedEmojiAtom: atom(null),
  selectedPositionAtom: atom(null),
}));

describe('EmojiCategories', () => {
  const store = createStore();

  const renderWithProviders = (ui: React.ReactNode) => {
    store.set(testFilteredEmojisAtom, mockFilteredEmojis);
    store.set(testSkinToneAtom, 'medium-dark');

    return render(
      <Provider store={store}>
        <EmojiPickerProvider emojisPerRow={8} emojiSize={32} maxUnicodeVersion={15.0}>
          {ui}
        </EmojiPickerProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    store.set(testSkinToneAtom, 'medium-dark');
  });

  test('renders category headers and emoji buttons', () => {
    const { container } = renderWithProviders(<EmojiCategories />);

    // Should find category headers (we have 2 categories in mockFilteredEmojis)
    const headers = container.querySelectorAll('[data-testid="emoji-picker-list-header"]');
    expect(headers.length).toBe(1);

    // Should find emoji buttons
    const emojiButtons = container.querySelectorAll('button');
    expect(emojiButtons.length).toBeGreaterThan(0);
  });

  test('respects emojisPerRow from context', () => {
    const { container } = renderWithProviders(<EmojiCategories />);

    // Find emoji rows
    const emojiRows = container.querySelectorAll('[data-type="emojis"]');
    emojiRows.forEach((row) => {
      const buttons = row.querySelectorAll('button');
      expect(buttons.length).toBeLessThanOrEqual(8); // 8 is the emojisPerRow value from context
    });
  });

  test('respects containerHeight prop', () => {
    const customHeight = 500;
    const { container } = renderWithProviders(<EmojiCategories containerHeight={customHeight} />);

    const scrollContainer = container.querySelector('.overflow-y-auto');
    expect(scrollContainer).toBeDefined();
    expect(scrollContainer?.getAttribute('style')).toInclude(`height: ${customHeight}px`);
  });

  test('handles hideStickyHeader prop', () => {
    const { container } = renderWithProviders(<EmojiCategories hideStickyHeader />);

    const headers = container.querySelectorAll('[data-type="header"]');
    headers.forEach((header) => {
      const parentStyle = window.getComputedStyle(header.parentElement!);
      expect(parentStyle.position).not.toBe('sticky');
    });
  });

  test('renders with keyboard navigation support', () => {
    const { container } = renderWithProviders(<EmojiCategories />);

    const scrollContainer = container.querySelector('.overflow-y-auto');
    expect(scrollContainer?.getAttribute('tabIndex')).toBe('0');
  });
});
