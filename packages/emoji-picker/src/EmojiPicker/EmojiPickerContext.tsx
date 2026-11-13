import React, { createContext, useContext, useMemo } from 'react';
import { DEFAULT_MAX_UNICODE_VERSION } from '../constants';
import type {
  CustomSection,
  CustomEmoji,
  EmojiLocaleData,
  EmojiMetadata,
  EmojiPickerLabels,
  HeaderRendererProps,
} from '../types/emoji';

interface EmojiPickerContextType {
  emojisPerRow: number;
  emojiSize: number;
  maxUnicodeVersion: number;
  onEmojiSelect: (emoji: string) => void;
  customSections: CustomSection[];
  frequentlyUsedEmojis: (string | CustomEmoji)[];
  renderHeader?: (props: HeaderRendererProps) => React.ReactNode;
  labels?: EmojiPickerLabels;
  localeData?: EmojiLocaleData;
  englishSearchFallback?: boolean;
  filterEmoji?: (emoji: EmojiMetadata) => boolean;
  categories?: string[];
}

const EmojiPickerContext = createContext<EmojiPickerContextType | null>(null);

const useEmojiPicker = () => {
  const context = useContext(EmojiPickerContext);
  if (!context) {
    throw new Error('useEmojiPicker must be used within an EmojiPickerProvider');
  }
  return context;
};

const useOptionalEmojiPicker = () => useContext(EmojiPickerContext);

interface EmojiPickerProviderProps {
  children: React.ReactNode;
  emojisPerRow?: number;
  emojiSize?: number;
  maxUnicodeVersion: number;
  onEmojiSelect?: (emoji: string) => void;
  customSections?: CustomSection[];
  frequentlyUsedEmojis?: (string | CustomEmoji)[];
  renderHeader?: (props: HeaderRendererProps) => React.ReactNode;
  labels?: EmojiPickerLabels;
  localeData?: EmojiLocaleData;
  englishSearchFallback?: boolean;
  filterEmoji?: (emoji: EmojiMetadata) => boolean;
  categories?: string[];
}

export function EmojiPickerProvider({
  children,
  emojisPerRow = 8,
  emojiSize = 32,
  maxUnicodeVersion = DEFAULT_MAX_UNICODE_VERSION,
  onEmojiSelect = () => {},
  customSections = [],
  frequentlyUsedEmojis = [],
  renderHeader,
  labels,
  localeData,
  englishSearchFallback,
  filterEmoji,
  categories,
}: EmojiPickerProviderProps) {
  const value = useMemo(
    () => ({
      emojisPerRow,
      emojiSize,
      maxUnicodeVersion,
      onEmojiSelect,
      customSections,
      frequentlyUsedEmojis,
      renderHeader,
      labels,
      localeData,
      englishSearchFallback,
      filterEmoji,
      categories,
    }),
    [
      emojisPerRow,
      emojiSize,
      maxUnicodeVersion,
      onEmojiSelect,
      customSections,
      frequentlyUsedEmojis,
      renderHeader,
      labels,
      localeData,
      englishSearchFallback,
      filterEmoji,
      categories,
    ]
  );

  return <EmojiPickerContext.Provider value={value}>{children}</EmojiPickerContext.Provider>;
}

export { useEmojiPicker, useOptionalEmojiPicker };
