import React from 'react';
import { useAtom } from 'jotai';
import { useEmojiPicker } from './EmojiPickerContext';
import { getLocalizedEmojiName } from '../utils/emojiData';
import { hoveredEmojiAtom } from '../atoms/emoji';

export function EmojiPickerContent() {
  const { emojiSize, localeData } = useEmojiPicker();
  const [hoveredEmoji] = useAtom(hoveredEmojiAtom);

  if (!hoveredEmoji) {
    return null;
  }

  const displayName = getLocalizedEmojiName(hoveredEmoji.emoji, hoveredEmoji.name, localeData);

  return (
    <div className="flex items-center gap-4 min-w-0 flex-1">
      <span className="flex-shrink-0" style={{ fontSize: `${Math.floor(emojiSize * 1.1)}px` }}>
        {hoveredEmoji.emoji}
      </span>
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
          {displayName}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
          :{hoveredEmoji.slug}:
        </span>
      </div>
    </div>
  );
}
