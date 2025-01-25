import React from 'react';
import { EmojiPickerList } from './EmojiPickerList';
import { EmojiPickerInput } from './EmojiPickerInput';

export interface EmojiPickerGroupProps {
  children: React.ReactNode;
  title?: string;
}

export function EmojiPickerGroup({ children }: EmojiPickerGroupProps) {
  // Split children into input and list components
  const childrenArray = React.Children.toArray(children);
  const inputComponent = childrenArray.find(child => 
    React.isValidElement(child) && child.type === EmojiPickerInput
  );
  const listComponent = childrenArray.find(child => 
    React.isValidElement(child) && child.type === EmojiPickerList
  );

  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="absolute inset-0 overflow-y-auto">
        {inputComponent}
        {listComponent}
      </div>
    </div>
  );
} 