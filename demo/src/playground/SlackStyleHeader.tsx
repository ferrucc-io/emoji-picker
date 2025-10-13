import React from 'react';
import type { HeaderRendererProps } from '@ferrucc-io/emoji-picker/dist/types/emoji';

export function SlackStyleHeader({ content, isSticky }: HeaderRendererProps) {
  return (
    <div
      className={`
        relative
        ${isSticky ? 'bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm' : 'bg-transparent'}
      `}
    >
      <div
        className="dark:text-zinc-300 text-[13px] font-bold font-['Lato'] text-[#1D1C1D] px-3 py-[3.25px]"
        data-testid="emoji-picker-list-header"
      >
        {content}
      </div>
    </div>
  );
}