import React from 'react';
import { atom, createStore, Provider } from 'jotai';
import { describe, expect, mock, test } from 'bun:test';
import { render } from '@testing-library/react';
import { EmojiSearchResults } from '../EmojiSearchResults';
import { EmojiPickerProvider } from '../EmojiPickerProvider';

import type { EmojiMetadata } from '../../types/emoji';

// Mock data
const mockFilteredEmojis: EmojiMetadata[] = [
  {
    emoji: '😀',
    name: 'grinning face',
    group: 'Smileys & Emotion',
    htmlCode: ['&#128512;'],
    unicode: ['U+1F600']
  },
  {
    emoji: '😃',
    name: 'grinning face with big eyes',
    group: 'Smileys & Emotion',
    htmlCode: ['&#128515;'],
    unicode: ['U+1F603']
  }
];

// Create writable test atoms
const testFilteredEmojisAtom = atom<EmojiMetadata[]>(mockFilteredEmojis);

// Mock the filteredEmojisAtom module
mock.module('../atoms', () => ({
  filteredEmojisAtom: testFilteredEmojisAtom
}));

const renderWithProviders = (component: React.ReactNode) => {
  const store = createStore();
  store.set(testFilteredEmojisAtom, mockFilteredEmojis);
  
  return render(
    <Provider store={store}>
      <EmojiPickerProvider
        containerHeight={300}
        emojisPerRow={8}
        emojiSize={32}
        hideStickyHeader={false}
      >
        {component}
      </EmojiPickerProvider>
    </Provider>
  );
};

describe('EmojiSearchResults', () => {
  test('renders search results header', () => {
    const { container } = renderWithProviders(<EmojiSearchResults />);
    const headers = container.querySelectorAll('[data-testid="emoji-section-header"]');
    expect(headers.length).toBe(1);
  });

  test('renders filtered emojis in grid layout', () => {
    const { container } = renderWithProviders(<EmojiSearchResults />);
    const emojiButtons = container.querySelectorAll('[data-testid="emoji-button"]');
    expect(emojiButtons.length).toBe(mockFilteredEmojis.length);
  });

  test('respects emojisPerRow from context', () => {
    const { container } = renderWithProviders(<EmojiSearchResults />);
    const emojiGrid = container.querySelector('[data-testid="emoji-grid"]');
    expect(emojiGrid).toBeDefined();
    expect(emojiGrid?.getAttribute('style')).toContain('grid-template-columns: repeat(8, 1fr)');
  });

  test('respects containerHeight prop', () => {
    const { container } = renderWithProviders(<EmojiSearchResults />);
    const virtualList = container.querySelector('[data-testid="virtual-list"]');
    expect(virtualList).toBeDefined();
    expect(virtualList?.getAttribute('style')).toContain('height: 300px');
  });

  test('handles hideStickyHeader prop', () => {
    const store = createStore();
    store.set(testFilteredEmojisAtom, mockFilteredEmojis);
    
    const { container } = render(
      <Provider store={store}>
        <EmojiPickerProvider
          containerHeight={300}
          emojisPerRow={8}
          emojiSize={32}
          hideStickyHeader={true}
        >
          <EmojiSearchResults />
        </EmojiPickerProvider>
      </Provider>
    );

    const header = container.querySelector('[data-testid="emoji-section-header"]');
    expect(header?.getAttribute('style')).toContain('position: static');
  });

  test('renders with keyboard navigation support', () => {
    const { container } = renderWithProviders(<EmojiSearchResults />);
    const emojiButtons = container.querySelectorAll('[data-testid="emoji-button"]');
    emojiButtons.forEach(button => {
      expect(button.getAttribute('tabIndex')).toBe('0');
    });
  });

  test('renders virtualized list correctly', () => {
    const { container } = renderWithProviders(<EmojiSearchResults />);
    const virtualList = container.querySelector('[data-testid="virtual-list"]');
    expect(virtualList).toBeDefined();

    const virtualItems = container.querySelectorAll('[data-testid="virtual-item"]');
    expect(virtualItems.length).toBeGreaterThan(0);
  });
}); 
