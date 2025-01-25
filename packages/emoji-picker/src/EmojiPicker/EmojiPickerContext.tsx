import emojiData from 'unicode-emoji-json/data-by-group.json';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { processEmojiData, searchEmojis } from '../utils/emojiSearch';
import { isCompatibleEmoji } from '../utils/emojiFilters';
import { applySkinTone } from '../utils/applySkinTone';

import type { EmojiMetadata, SkinTone } from '../types/emoji';

interface EmojiDataRaw {
  name: string;
  slug: string;
  unicode_version: string;
  emoji_version: string;
  skin_tone_support: boolean;
  skin_tone_support_unicode_version?: string;
}

interface EmojiDataItem {
  emoji: string;
  skin_tone_support: boolean;
  skin_tone_support_unicode_version?: string;
  name: string;
  slug: string;
  unicode_version: string;
  emoji_version: string;
}

interface EmojiGroupData {
  name: string;
  slug: string;
  emojis: EmojiDataItem[];
}

export type EmojiData = {
  emoji: string;
  name: string;
  group: string;
  skin_tone_support: boolean;
  skin_tone_support_unicode_version?: string;
};

interface EmojiPickerContextType {
  search: string;
  setSearch: (search: string) => void;
  hoveredEmoji: EmojiMetadata | null;
  setHoveredEmoji: (emoji: EmojiMetadata | null) => void;
  selectedEmoji: string | null;
  setSelectedEmoji: (emoji: string | null) => void;
  selectedRow: number;
  selectedColumn: number;
  setSelectedPosition: (row: number, column: number) => void;
  filteredEmojis: { category: string; emojis: EmojiMetadata[] }[];
  onEmojiSelect?: (emoji: string) => void;
  emojisPerRow: number;
  emojiSize: number;
  maxUnicodeVersion: number;
  skinTone: SkinTone;
  setSkinTone: (tone: SkinTone) => void;
}

const EmojiPickerContext = createContext<EmojiPickerContextType | null>(null);

export function useEmojiPicker() {
  const context = useContext(EmojiPickerContext);
  if (!context) {
    throw new Error('useEmojiPicker must be used within an EmojiPickerProvider');
  }
  return context;
}

const processedEmojiData = processEmojiData(emojiData);

interface EmojiPickerProviderProps {
  children: React.ReactNode;
  onEmojiSelect?: (emoji: string) => void;
  emojisPerRow?: number;
  emojiSize?: number;
  maxUnicodeVersion: number;
}

export function EmojiPickerProvider({
  children,
  onEmojiSelect,
  emojisPerRow = 8,
  emojiSize = 32,
  maxUnicodeVersion = 15.0,
}: EmojiPickerProviderProps) {
  const [search, setSearch] = useState('');
  const [hoveredEmoji, setHoveredEmoji] = useState<EmojiMetadata | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState(-1);
  const [selectedColumn, setSelectedColumn] = useState(-1);
  const [skinTone, setSkinTone] = useState<SkinTone>('default');

  const setSelectedPosition = useCallback((row: number, column: number) => {
    setSelectedRow(row);
    setSelectedColumn(column);
  }, []);

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    onEmojiSelect?.(emoji);
  };

  const filteredEmojis = useMemo(() => {
    const processedEmojis = (emojiData as EmojiGroupData[]).map((group) => ({
      category: group.name,
      emojis: group.emojis
        .filter((emoji) => {
          const { isCompatible } = isCompatibleEmoji(emoji, maxUnicodeVersion);
          return isCompatible;
        })
        .map((emoji) => {
          const { supportsSkinTone } = isCompatibleEmoji(emoji, maxUnicodeVersion);
          const base: EmojiMetadata = {
            emoji: emoji.emoji,
            name: emoji.name,
            slug: emoji.slug,
            skin_tone_support: supportsSkinTone,
            skin_tone_support_unicode_version: emoji.skin_tone_support_unicode_version
          };
          return applySkinTone(base, skinTone);
        })
    }));

    if (!search.trim()) {
      return processedEmojis;
    }

    const searchResults = searchEmojis(search, processedEmojiData);
    if (searchResults.length === 0) {
      return [];
    }

    return searchResults.map(group => ({
      category: group.category,
      emojis: group.emojis.map(emoji => applySkinTone(emoji, skinTone))
    }));
  }, [search, skinTone]);

  const value = {
    search,
    setSearch,
    hoveredEmoji,
    setHoveredEmoji,
    selectedEmoji,
    setSelectedEmoji,
    selectedRow,
    selectedColumn,
    setSelectedPosition,
    filteredEmojis,
    onEmojiSelect,
    emojisPerRow,
    emojiSize,
    maxUnicodeVersion,
    skinTone,
    setSkinTone,
  };

  return (
    <EmojiPickerContext.Provider
      value={value}
    >
      {children}
    </EmojiPickerContext.Provider>
  );
} 