import React from 'react';

interface EmojiPickerHeaderProps {
  content: string;
  emojiSize: number;
}

export function EmojiPickerHeader({ content, emojiSize }: EmojiPickerHeaderProps) {
  const textSize = emojiSize > 32 ? 'text-sm' : 'text-xs';

  return (
    <div className="relative bg-white/90 dark:bg-zinc-950/90 supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:dark:bg-zinc-950/50 supports-[backdrop-filter]:backdrop-blur-sm">
      <div className={`${textSize} font-medium text-zinc-500 dark:text-zinc-400 px-3 py-1.5`}>
        {content}
      </div>
    </div>
  );
} 