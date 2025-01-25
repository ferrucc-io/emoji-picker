import React from 'react';

export interface EmojiPickerGroupProps {
  children: React.ReactNode;
  title?: string;
}

export function EmojiPickerGroup({ children }: EmojiPickerGroupProps) {
  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="absolute inset-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
} 