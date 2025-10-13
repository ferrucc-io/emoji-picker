import React from 'react';
import { useEmojiPicker } from './EmojiPickerContext';
import { EmojiPickerContent } from './EmojiPickerContent';
import { EmojiPickerContentWithCustom } from './EmojiPickerContentWithCustom';

export function EmojiPickerSmartContent() {
  const { customSections } = useEmojiPicker();

  if (customSections && customSections.length > 0) {
    return <EmojiPickerContentWithCustom />;
  }

  return <EmojiPickerContent />;
}