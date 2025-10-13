import React, { createContext, useContext, useMemo } from 'react';
import { DEFAULT_MAX_UNICODE_VERSION } from '../constants';
import type { CustomSection, CustomEmoji } from '../types/emoji';

interface EmojiPickerContextType {
  emojisPerRow: number;
  emojiSize: number;
  maxUnicodeVersion: number;
  onEmojiSelect: (emoji: string) => void;
  customSections: CustomSection[];
  frequentlyUsedEmojis: (string | CustomEmoji)[];
}

const EmojiPickerContext = createContext<EmojiPickerContextType | null>(null);

const useEmojiPicker = () => {
  const context = useContext(EmojiPickerContext);
  if (!context) {
    throw new Error('useEmojiPicker must be used within an EmojiPickerProvider');
  }
  return context;
};

interface EmojiPickerProviderProps {
  children: React.ReactNode;
  emojisPerRow?: number;
  emojiSize?: number;
  maxUnicodeVersion: number;
  onEmojiSelect: (emoji: string) => void;
  customSections?: CustomSection[];
  frequentlyUsedEmojis?: (string | CustomEmoji)[];
}

export function EmojiPickerProvider({
  children,
  emojisPerRow = 8,
  emojiSize = 32,
  maxUnicodeVersion = DEFAULT_MAX_UNICODE_VERSION,
  onEmojiSelect = () => {},
  customSections = [],
  frequentlyUsedEmojis = [],
}: EmojiPickerProviderProps) {
  const value = useMemo(
    () => ({
      emojisPerRow,
      emojiSize,
      maxUnicodeVersion,
      onEmojiSelect,
      customSections,
      frequentlyUsedEmojis,
    }),
    [emojisPerRow, emojiSize, maxUnicodeVersion, onEmojiSelect, customSections, frequentlyUsedEmojis]
  );

  return <EmojiPickerContext.Provider value={value}>{children}</EmojiPickerContext.Provider>;
}

export { useEmojiPicker };
