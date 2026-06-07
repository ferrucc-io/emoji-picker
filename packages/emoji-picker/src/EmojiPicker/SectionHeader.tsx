import React from 'react';
import { EmojiPickerListHeader } from './EmojiPickerListHeader';
import { useEmojiPicker } from './EmojiPickerContext';

const slugify = (content: string) => content.toLowerCase().replace(/\s+/g, '-');

interface SectionHeaderProps {
  content: string;
  emojiSize: number;
  isSticky: boolean;
}

export function SectionHeader({ content, emojiSize, isSticky }: SectionHeaderProps) {
  const { renderHeader } = useEmojiPicker();

  if (renderHeader) {
    return <>{renderHeader({ content, emojiSize, isSticky, sectionId: slugify(content) })}</>;
  }

  return <EmojiPickerListHeader content={content} emojiSize={emojiSize} />;
}
