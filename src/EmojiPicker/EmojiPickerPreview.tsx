import React from 'react';
import { EmojiPickerSkinTone } from './EmojiPickerSkinTone';
import { useEmojiPicker } from './EmojiPickerContext';

export function EmojiPickerPreview() {
  const { hoveredEmoji, emojiSize } = useEmojiPicker();
  const containerHeight = Math.max(emojiSize * 1.1, 44); // Minimum height of 44px for better UX

  return (
    <div className="flex items-center border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2">
      <div className="flex items-center justify-between w-full" style={{ height: `${containerHeight}px` }}>
        <div className="flex-1">
          {hoveredEmoji ? (
            <div className="flex items-center gap-4">
              <span style={{ fontSize: `${Math.floor(emojiSize * 1.1)}px` }}>{hoveredEmoji.emoji}</span>
              <div className="flex flex-col justify-center">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {hoveredEmoji.name}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  :{hoveredEmoji.slug}:
                </span>
              </div>
            </div>
          ) : (
            <button className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded px-3 py-1.5 transition-colors">
              Add Emoji
            </button>
          )}
        </div>
        <EmojiPickerSkinTone />
      </div>
    </div>
  );
} 