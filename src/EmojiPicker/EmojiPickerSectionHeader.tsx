import React from 'react';

interface EmojiPickerHeaderProps {
  content: string;
  transform: string;
  emojiSize: number;
}

export function EmojiPickerSectionHeader({ content, transform, emojiSize }: EmojiPickerHeaderProps) {

  const textSize = emojiSize > 32 ? 'text-sm' : 'text-xs';

  return (
    <div className="sticky top-0 z-20 transition-transform duration-75"
         style={{ transform }}>
      <div className="absolute inset-0 bg-linear-to-t from-white/40 to-white dark:bg-linear-to-t dark:from-zinc-900/40 dark:to-zinc-900 backdrop-blur-sm" />
      <div className={`${textSize} relative overflow-hidden`} style={{ height: `28px` }}>
        <div className="font-medium text-zinc-500 dark:text-zinc-400 px-3 py-1.5">
          {content}
        </div>
      </div>
    </div>
  );
} 