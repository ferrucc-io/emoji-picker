import React from 'react';
import { useEmojiPicker } from './EmojiPickerContext';
import { cn } from '../utils/cn';

import type { EmojiMetadata } from '../types/emoji';
interface EmojiPickerPreviewProps {
  children: (props: { previewedEmoji: EmojiMetadata | null }) => React.ReactNode;
  className?: string;
}

export function EmojiPickerPreview({ children, className }: EmojiPickerPreviewProps) {
  const { hoveredEmoji, emojiSize } = useEmojiPicker();
  const containerHeight = Math.max(emojiSize * 1.1, 44); // Minimum height of 44px for better UX

  return (
    <div className={cn("flex items-center border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2", className)}>
      <div className="flex items-center justify-between w-full" style={{ height: `${containerHeight}px` }}>
        {children({ previewedEmoji: hoveredEmoji })}
      </div>
    </div>
  );
} 