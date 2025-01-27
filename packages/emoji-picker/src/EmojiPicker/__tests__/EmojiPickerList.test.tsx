import { atom, createStore, Provider } from 'jotai';
import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { render } from '@testing-library/react';
import { mockEmojiData, mockFilteredEmojis } from './testData';
import { EmojiPickerList } from '../EmojiPickerList';
import { EmojiPickerProvider } from '../EmojiPickerContext';

import type { EmojiMetadata } from '../../types/emoji';

// Create writable test atoms
const testSearchAtom = atom('');
const testFilteredEmojisAtom = atom(mockFilteredEmojis);

// Mock the modules
mock.module('unicode-emoji-json/data-by-group.json', () => mockEmojiData);
mock.module('../../atoms/emoji', () => ({
  searchAtom: testSearchAtom,
  filteredEmojisAtom: testFilteredEmojisAtom,
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
    store.set(testFilteredEmojisAtom, mockFilteredEmojis);
  });

  test('renders EmojiCategories by default when no search', () => {
    store.set(testSearchAtom, '');
    const { container } = renderWithProviders(<EmojiPickerList />);

    // Should find at least one category header
    const headers = container.querySelectorAll('[data-type="header"]');
    expect(headers.length).toBeGreaterThan(0);
  });

  test('renders EmojiSearchResults when search is not empty', () => {
    store.set(testSearchAtom, 'grinning');
    const { container } = renderWithProviders(<EmojiPickerList />);

    // Should find exactly one "Search results" header
    const headers = container.querySelectorAll('[data-type="header"]');
    expect(headers.length).toBe(1);
    expect(headers[0].textContent).toInclude('Search results');
  });

  test('renders empty state when no search results found', () => {
    store.set(testSearchAtom, 'xyznotfound');
    store.set(testFilteredEmojisAtom, []);
    const { container } = renderWithProviders(<EmojiPickerList />);

    // Should find the empty state message
    expect(container.textContent).toInclude('No emojis found');
  });

  test('respects hideStickyHeader prop', () => {
    store.set(testSearchAtom, '');
    const { container } = renderWithProviders(<EmojiPickerList hideStickyHeader />);

    // Headers should not have sticky positioning
    const headers = container.querySelectorAll('[data-type="header"]');
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
