import React, { useMemo } from 'react';
import { useAtom } from 'jotai';
import { useEmojiPicker } from './EmojiPickerContext';
import { hoveredEmojiAtom } from '../atoms/emoji';
import { isCustomEmoji } from '../types/emoji';
import type { CustomEmoji } from '../types/emoji';

export function EmojiPickerContentWithCustom() {
  const { emojiSize, customSections, frequentlyUsedEmojis } = useEmojiPicker();
  const [hoveredEmoji] = useAtom(hoveredEmojiAtom);

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

  if (!hoveredEmoji) {
    return null;
  }

  const isHoveringShortcode =
    hoveredEmoji.emoji.startsWith(':') && hoveredEmoji.emoji.endsWith(':');
  const customEmojiData = isHoveringShortcode
    ? customEmojiByName.get(hoveredEmoji.emoji.slice(1, -1))
    : undefined;

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
          hoveredEmoji.emoji
        )}
      </span>
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
          {hoveredEmoji.name}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
          :{hoveredEmoji.slug}:
        </span>
      </div>
    </div>
  );
}
