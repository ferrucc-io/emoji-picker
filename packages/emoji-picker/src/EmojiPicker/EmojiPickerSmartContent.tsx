import React from 'react';
import { useEmojiPicker } from './EmojiPickerContext';
import { EmojiPickerContent } from './EmojiPickerContent';
import { EmojiPickerContentWithCustom } from './EmojiPickerContentWithCustom';

export function EmojiPickerSmartContent() {
  const { customSections, frequentlyUsedEmojis } = useEmojiPicker();

  const hasCustomEmojis =
    (customSections && customSections.length > 0) ||
    frequentlyUsedEmojis.some((emoji) => typeof emoji !== 'string');

  if (hasCustomEmojis) {
    return <EmojiPickerContentWithCustom />;
  }

  return <EmojiPickerContent />;
}
