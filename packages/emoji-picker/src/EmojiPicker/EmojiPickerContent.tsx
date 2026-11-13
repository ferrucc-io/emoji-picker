import React, { useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useEmojiPicker } from './EmojiPickerContext';
import { applySkinTone } from '../utils/applySkinTone';
import { hoveredEmojiAtom, skinToneAtom } from '../atoms/emoji';

export function EmojiPickerContent() {
  const { emojiSize } = useEmojiPicker();
  const [hoveredEmoji] = useAtom(hoveredEmojiAtom);
  const skinTone = useAtomValue(skinToneAtom);

  const previewEmoji = useMemo(
    () => (hoveredEmoji ? applySkinTone(hoveredEmoji, skinTone) : null),
    [hoveredEmoji, skinTone]
  );

  if (!previewEmoji) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 min-w-0 flex-1">
      <span className="flex-shrink-0" style={{ fontSize: `${Math.floor(emojiSize * 1.1)}px` }}>
        {previewEmoji.emoji}
      </span>
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
          {previewEmoji.name}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
          :{previewEmoji.slug}:
        </span>
      </div>
    </div>
  );
}
