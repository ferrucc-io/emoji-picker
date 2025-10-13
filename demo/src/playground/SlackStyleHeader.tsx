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
        style={{
          fontFamily: 'Slack-Lato, Slack-Fractions, appleLogo, sans-serif',
          fontSize: '13px',
          fontWeight: 700,
          lineHeight: '26px',
          letterSpacing: 'normal',
          userSelect: 'none',
          WebkitFontSmoothing: 'antialiased',
          color: 'rgb(29, 28, 29)',
          paddingLeft: '12px',
          paddingRight: '12px',
          paddingTop: '2px',
          paddingBottom: '2px',
        }}
        className="dark:text-zinc-300"
        data-testid="emoji-picker-list-header"
      >
        {content}
      </div>
    </div>
  );
}