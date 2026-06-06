import React from 'react';
import { useAtomValue } from 'jotai';
import { EmojiSearchResults } from './EmojiSearchResults';
import { EmojiPickerListHeader } from './EmojiPickerListHeader';
import { EmojiPickerEmpty, EmojiPickerEmptyIcon, EmojiPickerEmptyText } from './EmojiPickerEmpty';
import { useEmojiPicker } from './EmojiPickerContext';
import { EmojiCategories } from './EmojiCategories';
import { searchCustomEmojis } from '../utils/emojiSearch';
import { filteredEmojisAtom, searchAtom } from '../atoms/emoji';

export interface EmojiPickerListProps {
  hideStickyHeader?: boolean;
  containerHeight?: number;
}

function EmojiPickerListBase({
  hideStickyHeader = false,
  containerHeight = 364,
}: EmojiPickerListProps) {
  const { emojiSize, customSections } = useEmojiPicker();
  const search = useAtomValue(searchAtom);
  const filteredEmojis = useAtomValue(filteredEmojisAtom);

  const hasResults =
    filteredEmojis.length > 0 || searchCustomEmojis(search, customSections).length > 0;

  const content = search.trim() ? (
    !hasResults ? (
      <div className="flex flex-col items-start justify-start h-full">
        <EmojiPickerListHeader emojiSize={emojiSize} content="Search results" />
        <EmojiPickerEmpty>
          <EmojiPickerEmptyIcon />
          <EmojiPickerEmptyText />
        </EmojiPickerEmpty>
      </div>
    ) : (
      <EmojiSearchResults hideStickyHeader={hideStickyHeader} containerHeight={containerHeight} />
    )
  ) : (
    <EmojiCategories hideStickyHeader={hideStickyHeader} containerHeight={containerHeight} />
  );

  return content;
}

function propsAreEqual(prevProps: EmojiPickerListProps, nextProps: EmojiPickerListProps) {
  return (
    prevProps.hideStickyHeader === nextProps.hideStickyHeader &&
    prevProps.containerHeight === nextProps.containerHeight
  );
}

export const EmojiPickerList = React.memo(EmojiPickerListBase, propsAreEqual);
