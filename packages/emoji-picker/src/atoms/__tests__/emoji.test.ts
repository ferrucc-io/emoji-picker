import { getDefaultStore } from 'jotai';
import { beforeEach, describe, expect, test } from 'bun:test';
import {
  combinedEmojiStateAtom,
  filteredEmojisAtom,
  hoveredEmojiAtom,
  isEmojiSelectedAtom,
  searchAtom,
  selectedEmojiAtom,
  selectedPositionAtom,
  skinToneAtom,
  skinToneOnlyAtom,
} from '../emoji';

import type { EmojiMetadata } from '../../types/emoji';

describe('Emoji Atoms', () => {
  const store = getDefaultStore();

  // Reset store before each test
  beforeEach(() => {
    store.set(hoveredEmojiAtom, null);
    store.set(selectedEmojiAtom, null);
    store.set(selectedPositionAtom, null);
    store.set(searchAtom, '');
    store.set(skinToneAtom, 'default');
  });

  test('hoveredEmojiAtom updates correctly', () => {
    const testEmoji = {
      emoji: '😀',
      name: 'grinning face',
      slug: 'grinning-face',
      skin_tone_support: false,
    };

    store.set(hoveredEmojiAtom, testEmoji);
    expect(store.get(hoveredEmojiAtom)).toEqual(testEmoji);
  });

  test('selectedEmojiAtom updates correctly', () => {
    store.set(selectedEmojiAtom, '😀');
    expect(store.get(selectedEmojiAtom)).toBe('😀');
  });

  test('selectedPositionAtom updates correctly', () => {
    const position = { row: 1, column: 2 };
    store.set(selectedPositionAtom, position);
    expect(store.get(selectedPositionAtom)).toEqual(position);
  });

  test('searchAtom updates correctly', () => {
    store.set(searchAtom, 'smile');
    expect(store.get(searchAtom)).toBe('smile');
  });

  test('skinToneAtom updates correctly', () => {
    store.set(skinToneAtom, 'light');
    expect(store.get(skinToneAtom)).toBe('light');
  });

  test('isEmojiSelectedAtom returns correct state', () => {
    const position = { row: 1, column: 2 };
    store.set(selectedPositionAtom, position);

    // Test matching position
    const selectedAtom1 = isEmojiSelectedAtom(1, 2);
    expect(store.get(selectedAtom1)).toBe(true);

    // Test non-matching position
    const selectedAtom2 = isEmojiSelectedAtom(1, 3);
    expect(store.get(selectedAtom2)).toBe(false);
  });

  test('filteredEmojisAtom returns all emojis when search is empty', () => {
    store.set(searchAtom, '');
    const filtered = store.get(filteredEmojisAtom);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered[0]).toHaveProperty('category');
    expect(filtered[0]).toHaveProperty('emojis');
  });


  test('skinToneOnlyAtom reflects skinToneAtom value', () => {
    store.set(skinToneAtom, 'dark');
    expect(store.get(skinToneOnlyAtom)).toBe('dark');
  });

  test('combinedEmojiStateAtom combines multiple atom states', () => {
    const testEmoji = {
      emoji: '😀',
      name: 'grinning face',
      slug: 'grinning-face',
      skin_tone_support: false,
    };

    store.set(hoveredEmojiAtom, testEmoji);
    store.set(selectedEmojiAtom, '😀');
    store.set(skinToneAtom, 'light');

    expect(store.get(combinedEmojiStateAtom)).toEqual({
      hoveredEmoji: testEmoji,
      selectedEmoji: '😀',
      skinTone: 'light',
    });
  });
});
