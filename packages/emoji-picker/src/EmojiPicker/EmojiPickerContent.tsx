import React from 'react';
import { useAtom } from 'jotai';
import { useEmojiPicker } from './EmojiPickerContext';
import { hoveredEmojiAtom } from '../atoms/emoji';

export function EmojiPickerContent() {
  const { emojiSize } = useEmojiPicker();
  const [hoveredEmoji] = useAtom(hoveredEmojiAtom);

  if (!hoveredEmoji) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <span style={{ fontSize: `${Math.floor(emojiSize * 1.1)}px` }}>{hoveredEmoji.emoji}</span>
      <div className="flex flex-col justify-center">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {hoveredEmoji.name}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">:{hoveredEmoji.slug}:</span>
      </div>
    </div>
  );
}
