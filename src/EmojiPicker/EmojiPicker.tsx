import React from 'react';
import { EmojiPickerProvider } from './EmojiPickerContext';

export interface EmojiPickerProps {
  children: React.ReactNode;
  className?: string;
  onEmojiSelect?: (emoji: string) => void;
  emojisPerRow?: number;
  emojiSize?: number;
  maxUnicodeVersion?: number;
}

export function EmojiPicker({ 
  children, 
  className = '', 
  onEmojiSelect,
  emojisPerRow = 12,
  emojiSize = 28,
  maxUnicodeVersion = 15.0
}: EmojiPickerProps) {
  return (
    <EmojiPickerProvider 
      onEmojiSelect={onEmojiSelect}
      emojisPerRow={emojisPerRow}
      emojiSize={emojiSize}
      maxUnicodeVersion={maxUnicodeVersion}
    >
      <div 
        tabIndex={0}
        className={`flex flex-col bg-background border border-border/50 dark:border-zinc-800 rounded-lg shadow-lg w-[400px] h-[400px] overflow-hidden outline-none focus:ring-1 focus:ring-indigo-500 ${className}`}
      >
        {children}
      </div>
    </EmojiPickerProvider>
  );
} 