import emojiData from 'unicode-emoji-json/data-by-group.json';
import { atom } from 'jotai';
import { processEmojiData, searchEmojis } from '../utils/emojiSearch';
import { isEmojiFullySupported } from '../utils/emojiSupport';

import type { EmojiMetadata, SkinTone } from '../types/emoji';

export const hoveredEmojiAtom = atom<EmojiMetadata | null>(null);
export const selectedEmojiAtom = atom<string | null>(null);
export const selectedPositionAtom = atom<{ row: number; column: number } | null>(null);
export const searchAtom = atom<string>('');
export const skinToneAtom = atom<SkinTone>('default');

// Create separate atoms for different concerns to avoid unnecessary re-renders
export const skinToneOnlyAtom = atom((get) => get(skinToneAtom));

export const isEmojiSelectedAtom = (rowIndex: number, columnIndex: number) =>
  atom((get) => {
    const selectedPos = get(selectedPositionAtom);
    return selectedPos?.row === rowIndex && selectedPos?.column === columnIndex;
  });

const processedEmojiData = processEmojiData(emojiData);
const defaultEmojis = Object.entries(emojiData).map(([category, group]) => ({
  category,
  emojis: (group as any).emojis
    .filter((emoji: any) => isEmojiFullySupported(emoji))
    .map((emoji: any) => ({
      emoji: emoji.emoji,
      name: emoji.name,
      slug: emoji.slug,
      skin_tone_support: emoji.skin_tone_support,
      skin_tone_support_unicode_version: emoji.skin_tone_support_unicode_version,
    })),
}));

// Derived atom for filtered emojis with memoization
export const filteredEmojisAtom = atom((get) => {
  const search = get(searchAtom);

  if (!search.trim()) {
    return defaultEmojis;
  }

  return searchEmojis(search, processedEmojiData).map((group) => ({
    category: group.category,
    emojis: group.emojis,
  }));
});

export const combinedEmojiStateAtom = atom((get) => ({
  hoveredEmoji: get(hoveredEmojiAtom),
  selectedEmoji: get(selectedEmojiAtom),
  skinTone: get(skinToneAtom),
}));
