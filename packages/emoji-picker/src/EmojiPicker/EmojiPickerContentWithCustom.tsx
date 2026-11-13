import React from 'react';
import { useEmojiPicker } from './EmojiPickerContext';
import { useActiveEmoji } from '../hooks/useEmojiPickerHooks';

export function EmojiPickerContentWithCustom() {
  const { emojiSize } = useEmojiPicker();
  const activeEmoji = useActiveEmoji();

  if (!activeEmoji) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 min-w-0 flex-1">
      <span className="flex-shrink-0" style={{ fontSize: `${Math.floor(emojiSize * 1.1)}px` }}>
        {activeEmoji.isCustom && activeEmoji.imageUrl ? (
          <img
            src={activeEmoji.imageUrl}
            alt={activeEmoji.name}
            className="object-contain"
            style={{
              width: `${Math.floor(emojiSize * 1.1)}px`,
              height: `${Math.floor(emojiSize * 1.1)}px`,
            }}
          />
        ) : (
          activeEmoji.emoji
        )}
      </span>
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
          {activeEmoji.name}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
          :{activeEmoji.slug}:
        </span>
      </div>
    </div>
  );
}
