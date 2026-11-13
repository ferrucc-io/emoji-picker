import React from 'react';
import { useAtomValue } from 'jotai';
import { EmojiSearchResults } from './EmojiSearchResults';
import { EmojiPickerListHeader } from './EmojiPickerListHeader';
import {
  EmojiPickerEmptyLayout,
  EmojiPickerEmptyIcon,
  EmojiPickerEmptyText,
} from './EmojiPickerEmpty';
import { useEmojiPicker } from './EmojiPickerContext';
import { EmojiCategories } from './EmojiCategories';
import { searchCustomEmojis } from '../utils/emojiSearch';
import { filteredEmojisAtom, searchAtom } from '../atoms/emoji';

export interface EmojiPickerListProps {
  hideStickyHeader?: boolean;
  containerHeight?: number;
  emptyState?: React.ReactNode | ((props: { search: string }) => React.ReactNode);
}

function EmojiPickerListBase({
  hideStickyHeader = false,
  containerHeight = 364,
  emptyState,
}: EmojiPickerListProps) {
  const { emojiSize, customSections, hasCustomEmpty } = useEmojiPicker();
  const search = useAtomValue(searchAtom);
  const filteredEmojis = useAtomValue(filteredEmojisAtom);

  const hasResults =
    filteredEmojis.length > 0 || searchCustomEmojis(search, customSections).length > 0;

  if (search.trim()) {
    if (!hasResults) {
      if (emptyState !== undefined) {
        return (
          <div className="flex flex-col items-start justify-start h-full">
            <EmojiPickerListHeader emojiSize={emojiSize} content="Search results" />
            <EmojiPickerEmptyLayout>
              {typeof emptyState === 'function' ? emptyState({ search }) : emptyState}
            </EmojiPickerEmptyLayout>
          </div>
        );
      }

      if (hasCustomEmpty) {
        return null;
      }

      return (
        <div className="flex flex-col items-start justify-start h-full">
          <EmojiPickerListHeader emojiSize={emojiSize} content="Search results" />
          <EmojiPickerEmptyLayout>
            <EmojiPickerEmptyIcon />
            <EmojiPickerEmptyText />
          </EmojiPickerEmptyLayout>
        </div>
      );
    }

    return (
      <EmojiSearchResults hideStickyHeader={hideStickyHeader} containerHeight={containerHeight} />
    );
  }

  return <EmojiCategories hideStickyHeader={hideStickyHeader} containerHeight={containerHeight} />;
}

function propsAreEqual(prevProps: EmojiPickerListProps, nextProps: EmojiPickerListProps) {
  return (
    prevProps.hideStickyHeader === nextProps.hideStickyHeader &&
    prevProps.containerHeight === nextProps.containerHeight &&
    prevProps.emptyState === nextProps.emptyState
  );
}

export const EmojiPickerList = React.memo(EmojiPickerListBase, propsAreEqual);
