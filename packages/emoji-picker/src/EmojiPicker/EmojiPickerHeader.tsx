import React from 'react';

interface EmojiPickerHeaderProps {
  content: string;
  emojiSize: number;
}

export function EmojiPickerHeader({ content, emojiSize }: EmojiPickerHeaderProps) {
  const textSize = emojiSize > 32 ? 'text-sm' : 'text-xs';

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white dark:bg-zinc-950 backdrop-blur-sm opacity-95" />
      <div className={`${textSize} relative font-medium text-zinc-500 dark:text-zinc-400 px-3 py-1.5`}>
        {content}
      </div>
    </div>
  );
} 