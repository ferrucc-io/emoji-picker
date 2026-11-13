import React from 'react';
import { cn } from '../utils/cn';

export interface EmojiPickerGroupProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function EmojiPickerGroup({ children, className }: EmojiPickerGroupProps) {
  return (
    <div data-slot="emoji-picker-group" className="flex-1 overflow-hidden">
      <div
        data-slot="emoji-picker-viewport"
        className={cn('h-full overflow-y-auto overscroll-contain will-change-scroll', className)}
      >
        {children}
      </div>
    </div>
  );
}
