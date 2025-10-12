import React, { createContext, useContext, useMemo } from 'react';

interface EmojiPickerContextType {
  emojisPerRow: number;
  emojiSize: number;
  maxUnicodeVersion: number;
  onEmojiSelect: (emoji: string) => void;
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
}

export function EmojiPickerProvider({
  children,
  emojisPerRow = 8,
  emojiSize = 32,
  maxUnicodeVersion = 17.0,
  onEmojiSelect = () => {},
}: EmojiPickerProviderProps) {
  const value = useMemo(
    () => ({
      emojisPerRow,
      emojiSize,
      maxUnicodeVersion,
      onEmojiSelect,
    }),
    [emojisPerRow, emojiSize, maxUnicodeVersion, onEmojiSelect]
  );

  return <EmojiPickerContext.Provider value={value}>{children}</EmojiPickerContext.Provider>;
}

export { useEmojiPicker };
