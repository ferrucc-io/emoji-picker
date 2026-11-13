import React from 'react';
import { useAtomValue } from 'jotai';
import { useEmojiPicker } from './EmojiPickerContext';
import { applySkinTone } from '../utils/applySkinTone';
import { hoveredEmojiAtom, skinToneAtom } from '../atoms/emoji';

export function EmojiPickerContent() {
  const { emojiSize } = useEmojiPicker();
  const hoveredEmoji = useAtomValue(hoveredEmojiAtom);
  const skinTone = useAtomValue(skinToneAtom);

  if (!hoveredEmoji) {
    return null;
  }

  const displayedEmoji = hoveredEmoji.skin_tone_support
    ? applySkinTone(hoveredEmoji, skinTone)
    : hoveredEmoji;

  return (
    <div className="flex items-center gap-4 min-w-0 flex-1">
      <span className="flex-shrink-0" style={{ fontSize: `${Math.floor(emojiSize * 1.1)}px` }}>
        {displayedEmoji.emoji}
      </span>
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
          {displayedEmoji.name}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
          :{displayedEmoji.slug}:
        </span>
      </div>
    </div>
  );
}
