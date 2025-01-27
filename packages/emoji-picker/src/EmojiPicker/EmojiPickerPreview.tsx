import React, { useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useEmojiPicker } from './EmojiPickerContext';
import { cn } from '../utils/cn';
import { applySkinTone } from '../utils/applySkinTone';
import { hoveredEmojiAtom, skinToneAtom } from '../atoms/emoji';

import type { EmojiMetadata } from '../types/emoji';
interface EmojiPickerPreviewProps {
  children: (props: { previewedEmoji: EmojiMetadata | null }) => React.ReactNode;
  className?: string;
}

export const EmojiPickerPreview = React.memo(function EmojiPickerPreview({
  children,
  className,
}: EmojiPickerPreviewProps) {
  const { emojiSize } = useEmojiPicker();
  const [hoveredEmoji] = useAtom(hoveredEmojiAtom);
  const skinTone = useAtomValue(skinToneAtom);

  const previewedEmoji = useMemo(
    () => (hoveredEmoji ? applySkinTone(hoveredEmoji, skinTone) : null),
    [hoveredEmoji, skinTone]
  );

  const containerHeight = Math.max(emojiSize * 1.1, 44); // Minimum height of 44px for better UX

  return (
    <div
      className={cn(
        'flex items-center border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2',
        className
      )}
    >
      <div
        className="flex items-center justify-between w-full"
        style={{ height: `${containerHeight}px` }}
      >
        {children({ previewedEmoji })}
      </div>
    </div>
  );
});
