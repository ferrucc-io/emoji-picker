import React, { useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useEmojiPicker } from './EmojiPickerContext';
import { applySkinTone } from '../utils/applySkinTone';
import { hoveredEmojiAtom, skinToneAtom } from '../atoms/emoji';
import { isCustomEmoji } from '../types/emoji';
import type { CustomEmoji } from '../types/emoji';

export function EmojiPickerContentWithCustom() {
  const { emojiSize, customSections, frequentlyUsedEmojis } = useEmojiPicker();
  const [hoveredEmoji] = useAtom(hoveredEmojiAtom);
  const skinTone = useAtomValue(skinToneAtom);

  const customEmojiByName = useMemo(() => {
    const map = new Map<string, CustomEmoji>();
    for (const emoji of [
      ...customSections.flatMap((section) => section.emojis),
      ...frequentlyUsedEmojis,
    ]) {
      if (typeof emoji !== 'string' && isCustomEmoji(emoji)) {
        map.set(emoji.name, emoji);
      }
    }
    return map;
  }, [customSections, frequentlyUsedEmojis]);

  const isHoveringShortcode =
    !!hoveredEmoji && hoveredEmoji.emoji.startsWith(':') && hoveredEmoji.emoji.endsWith(':');
  const customEmojiData =
    hoveredEmoji && isHoveringShortcode
      ? customEmojiByName.get(hoveredEmoji.emoji.slice(1, -1))
      : undefined;

  const previewEmoji = useMemo(() => {
    if (!hoveredEmoji) {
      return null;
    }
    if (customEmojiData || isHoveringShortcode) {
      return hoveredEmoji;
    }
    return applySkinTone(hoveredEmoji, skinTone);
  }, [hoveredEmoji, customEmojiData, isHoveringShortcode, skinTone]);

  if (!previewEmoji) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 min-w-0 flex-1">
      <span className="flex-shrink-0" style={{ fontSize: `${Math.floor(emojiSize * 1.1)}px` }}>
        {customEmojiData ? (
          <img
            src={customEmojiData.imageUrl}
            alt={customEmojiData.name}
            className="object-contain"
            style={{
              width: `${Math.floor(emojiSize * 1.1)}px`,
              height: `${Math.floor(emojiSize * 1.1)}px`,
            }}
          />
        ) : (
          previewEmoji.emoji
        )}
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
