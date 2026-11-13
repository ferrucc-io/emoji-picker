import React from 'react';
import { useAtomValue } from 'jotai';
import { hoveredEmojiAtom } from '../atoms/emoji';

const srOnlyStyle: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export function ActiveEmojiAnnouncer() {
  const hoveredEmoji = useAtomValue(hoveredEmojiAtom);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      role="status"
      data-testid="emoji-picker-live-announcer"
      style={srOnlyStyle}
    >
      {hoveredEmoji ? hoveredEmoji.name : ''}
    </div>
  );
}
