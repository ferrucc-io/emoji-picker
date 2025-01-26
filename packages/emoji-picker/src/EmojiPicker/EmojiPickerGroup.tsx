import React from 'react';

export interface EmojiPickerGroupProps {
  children: React.ReactNode;
  title?: string;
}

export function EmojiPickerGroup({ children }: EmojiPickerGroupProps) {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto overscroll-contain will-change-scroll">
        {children}
      </div>
    </div>
  );
} 