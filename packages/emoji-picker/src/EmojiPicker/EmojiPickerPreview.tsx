import React from 'react';
import { useEmojiPicker } from './EmojiPickerContext';

import type { EmojiMetadata } from '../types/emoji';

interface EmojiPickerPreviewProps {
  children: (props: { previewedEmoji: EmojiMetadata | null }) => React.ReactNode;
}

export function EmojiPickerPreview({ children }: EmojiPickerPreviewProps) {
  const { hoveredEmoji, emojiSize } = useEmojiPicker();
  const containerHeight = Math.max(emojiSize * 1.1, 44); // Minimum height of 44px for better UX

  return (
    <div className="flex items-center border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2">
      <div className="flex items-center justify-between w-full" style={{ height: `${containerHeight}px` }}>
        {children({ previewedEmoji: hoveredEmoji })}
      </div>
    </div>
  );
} 