import React, { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { EmojiSearchResults } from './EmojiSearchResults';
import { EmojiPickerListHeader } from './EmojiPickerListHeader';
import { EmojiPickerEmpty, EmojiPickerEmptyIcon, EmojiPickerEmptyText } from './EmojiPickerEmpty';
import { useEmojiPicker } from './EmojiPickerContext';
import { EmojiCategories } from './EmojiCategories';
import { resolveLabel, searchCuratedEmojis } from '../utils/emojiData';
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
  const {
    emojiSize,
    customSections,
    labels,
    localeData,
    englishSearchFallback,
    filterEmoji,
    categories,
  } = useEmojiPicker();
  const search = useAtomValue(searchAtom);
  const atomFilteredEmojis = useAtomValue(filteredEmojisAtom);

  const useCuratedSearch = Boolean(
    labels || localeData || filterEmoji || categories || englishSearchFallback !== undefined
  );

  const filteredEmojis = useMemo(() => {
    if (!useCuratedSearch) {
      return atomFilteredEmojis;
    }
    return searchCuratedEmojis(search, {
      localeData,
      englishSearchFallback,
      filterEmoji,
      categories,
    });
  }, [
    useCuratedSearch,
    atomFilteredEmojis,
    search,
    localeData,
    englishSearchFallback,
    filterEmoji,
    categories,
  ]);

  const searchResultsHeader = resolveLabel(
    'searchResultsHeader',
    'Search results',
    labels,
    localeData
  );

  const hasResults =
    filteredEmojis.length > 0 || searchCustomEmojis(search, customSections).length > 0;

  const content = search.trim() ? (
    !hasResults ? (
      <div className="flex flex-col items-start justify-start h-full">
        <EmojiPickerListHeader emojiSize={emojiSize} content={searchResultsHeader} />
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
