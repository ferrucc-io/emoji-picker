import { atom, createStore, Provider } from 'jotai';
import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { renderHook, act } from '@testing-library/react';
import React, { useCallback, useRef } from 'react';

import type { EmojiMetadata } from '../../types/emoji';

// Create writable test atoms
const testSearchAtom = atom('');
const testSelectedPositionAtom = atom<{ row: number; column: number } | null>(null);
const testHoveredEmojiAtom = atom<EmojiMetadata | null>(null);
const testSelectedEmojiAtom = atom<string | null>(null);

mock.module('unicode-emoji-json/data-by-group.json', () => ({
  'Smileys & Emotion': {
    name: 'Smileys & Emotion',
    slug: 'smileys-emotion',
    emojis: [],
  },
}));

mock.module('../../atoms/emoji', () => ({
  searchAtom: testSearchAtom,
  selectedPositionAtom: testSelectedPositionAtom,
  hoveredEmojiAtom: testHoveredEmojiAtom,
  selectedEmojiAtom: testSelectedEmojiAtom,
  skinToneAtom: atom('default'),
  skinToneOnlyAtom: atom('default'),
  filteredEmojisAtom: atom([]),
}));

import { useEmojiKeyboardNavigation } from '../useEmojiKeyboardNavigation';

const emoji1: EmojiMetadata = {
  emoji: '😀',
  name: 'grinning face',
  slug: 'grinning-face',
  skin_tone_support: false,
};
const emoji2: EmojiMetadata = {
  emoji: '😃',
  name: 'grinning face with big eyes',
  slug: 'grinning-face-with-big-eyes',
  skin_tone_support: false,
};
const emoji3: EmojiMetadata = {
  emoji: '✋',
  name: 'raised hand',
  slug: 'raised-hand',
  skin_tone_support: true,
};
const emoji4: EmojiMetadata = {
  emoji: '👋',
  name: 'waving hand',
  slug: 'waving-hand',
  skin_tone_support: true,
};

type Row = { type: 'header'; content: string } | { type: 'emojis'; content: EmojiMetadata[] };

const mockRows: Row[] = [
  { type: 'header', content: 'Smileys & Emotion' },
  { type: 'emojis', content: [emoji1, emoji2] },
  { type: 'header', content: 'People & Body' },
  { type: 'emojis', content: [emoji3, emoji4] },
];

// Stable reference for onEmojiSelect to avoid infinite re-renders
const onEmojiSelectCalls: string[] = [];
const stableOnEmojiSelect = (emoji: string) => {
  onEmojiSelectCalls.push(emoji);
};

const mockScrollToIndex = mock(() => {});
const stableVirtualizer = { scrollToIndex: mockScrollToIndex };

describe('useEmojiKeyboardNavigation', () => {
  const store = createStore();

  // Create a stable wrapper component that memoizes the context value
  const StableWrapper = ({ children }: { children: React.ReactNode }) => {
    const { EmojiPickerProvider } = require('../../EmojiPicker/EmojiPickerContext');
    // Use a ref-based onEmojiSelect to keep it stable
    const onEmojiSelectRef = useRef(stableOnEmojiSelect);
    const stableCallback = useCallback((emoji: string) => {
      onEmojiSelectRef.current(emoji);
    }, []);

    return React.createElement(
      Provider,
      { store },
      React.createElement(
        EmojiPickerProvider,
        {
          emojisPerRow: 8,
          emojiSize: 32,
          maxUnicodeVersion: 16.0,
          onEmojiSelect: stableCallback,
        },
        children
      )
    );
  };

  beforeEach(() => {
    store.set(testSearchAtom, '');
    store.set(testSelectedPositionAtom, null);
    store.set(testHoveredEmojiAtom, null);
    store.set(testSelectedEmojiAtom, null);
    onEmojiSelectCalls.length = 0;
    mockScrollToIndex.mockClear();
  });

  const renderNavHook = (rows: Row[] = mockRows) => {
    return renderHook(
      () =>
        useEmojiKeyboardNavigation({
          rows,
          virtualizer: stableVirtualizer,
        }),
      { wrapper: StableWrapper }
    );
  };

  test('ArrowDown initializes selection at first emoji row', () => {
    renderNavHook();

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });

    const pos = store.get(testSelectedPositionAtom);
    expect(pos).toEqual({ row: 1, column: 0 });
    expect(store.get(testHoveredEmojiAtom)).toEqual(emoji1);
  });

  test('ArrowRight initializes selection at first emoji row', () => {
    renderNavHook();

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });

    const pos = store.get(testSelectedPositionAtom);
    expect(pos).toEqual({ row: 1, column: 0 });
  });

  test('ArrowDown navigates between emoji rows, skipping headers', () => {
    store.set(testSelectedPositionAtom, { row: 1, column: 0 });
    renderNavHook();

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });

    const pos = store.get(testSelectedPositionAtom);
    expect(pos).toEqual({ row: 3, column: 0 });
    expect(store.get(testHoveredEmojiAtom)).toEqual(emoji3);
  });

  test('ArrowUp navigates between emoji rows, skipping headers', () => {
    store.set(testSelectedPositionAtom, { row: 3, column: 0 });
    renderNavHook();

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    });

    const pos = store.get(testSelectedPositionAtom);
    expect(pos).toEqual({ row: 1, column: 0 });
    expect(store.get(testHoveredEmojiAtom)).toEqual(emoji1);
  });

  test('ArrowRight navigates within a row', () => {
    store.set(testSelectedPositionAtom, { row: 1, column: 0 });
    renderNavHook();

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });

    const pos = store.get(testSelectedPositionAtom);
    expect(pos).toEqual({ row: 1, column: 1 });
    expect(store.get(testHoveredEmojiAtom)).toEqual(emoji2);
  });

  test('ArrowLeft navigates within a row', () => {
    store.set(testSelectedPositionAtom, { row: 1, column: 1 });
    renderNavHook();

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    });

    const pos = store.get(testSelectedPositionAtom);
    expect(pos).toEqual({ row: 1, column: 0 });
    expect(store.get(testHoveredEmojiAtom)).toEqual(emoji1);
  });

  test('ArrowLeft at start of row wraps to end of previous row', () => {
    store.set(testSelectedPositionAtom, { row: 3, column: 0 });
    renderNavHook();

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    });

    const pos = store.get(testSelectedPositionAtom);
    expect(pos).toEqual({ row: 1, column: 1 });
    expect(store.get(testHoveredEmojiAtom)).toEqual(emoji2);
  });

  test('ArrowRight at end of row wraps to start of next row', () => {
    store.set(testSelectedPositionAtom, { row: 1, column: 1 });
    renderNavHook();

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });

    const pos = store.get(testSelectedPositionAtom);
    expect(pos).toEqual({ row: 3, column: 0 });
    expect(store.get(testHoveredEmojiAtom)).toEqual(emoji3);
  });

  test('column position is clamped when moving up/down to shorter row', () => {
    const rows: Row[] = [
      { type: 'emojis', content: [emoji1, emoji2, emoji3] },
      { type: 'emojis', content: [emoji4] },
    ];

    store.set(testSelectedPositionAtom, { row: 0, column: 2 });
    renderNavHook(rows);

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });

    const pos = store.get(testSelectedPositionAtom);
    expect(pos).toEqual({ row: 1, column: 0 });
  });

  test('Enter triggers onEmojiSelect with current emoji', () => {
    store.set(testSelectedPositionAtom, { row: 1, column: 0 });
    renderNavHook();

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });

    expect(onEmojiSelectCalls).toContain('😀');
    expect(store.get(testSelectedEmojiAtom)).toBe('😀');
  });

  test('Space triggers onEmojiSelect with current emoji', () => {
    store.set(testSelectedPositionAtom, { row: 1, column: 1 });
    renderNavHook();

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    });

    expect(onEmojiSelectCalls).toContain('😃');
    expect(store.get(testSelectedEmojiAtom)).toBe('😃');
  });

  test('scrollToIndex called on navigation', () => {
    renderNavHook();

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });

    expect(mockScrollToIndex).toHaveBeenCalled();
  });

  test('search change auto-selects first emoji', () => {
    renderNavHook();

    act(() => {
      store.set(testSearchAtom, 'grin');
    });

    const pos = store.get(testSelectedPositionAtom);
    expect(pos).toEqual({ row: 1, column: 0 });
  });
});
