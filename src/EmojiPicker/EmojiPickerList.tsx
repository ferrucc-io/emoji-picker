import { EmojiSearchResults } from './EmojiSearchResults';
import { EmojiPickerEmpty, EmojiPickerEmptyIcon, EmojiPickerEmptyText } from './EmojiPickerEmpty';
import { useEmojiPicker } from './EmojiPickerContext';
import { EmojiCategories } from './EmojiCategories';

type EmojiDataItem = {
  emoji: string;
  skin_tone_support: boolean;
  skin_tone_support_unicode_version?: string;
  name: string;
  slug: string;
  unicode_version: string;
  emoji_version: string;
};

type EmojiMetadata = {
  emoji: string;
  name: string;
  slug: string;
};

type Row = 
  | { type: 'header'; content: string }
  | { type: 'emojis'; content: EmojiMetadata[] };



interface EmojiPickerListProps {
  hideStickyHeader?: boolean;
  containerHeight?: number;
}

export function EmojiPickerList({ 
  hideStickyHeader = false,
  containerHeight = 364
}: EmojiPickerListProps) {
  const { search, filteredEmojis, emojiSize } = useEmojiPicker();

  if (search.trim()) {
    if (filteredEmojis.length === 0) {
      return (
        <div className="flex flex-col items-start justify-start h-full pt-1">
          <div className={`${emojiSize > 32 ? 'text-sm' : 'text-xs'} font-medium text-zinc-500 dark:text-zinc-400 px-3 py-1.5`}>
            Search results
          </div>
          <EmojiPickerEmpty>
            <EmojiPickerEmptyIcon />
            <EmojiPickerEmptyText />
          </EmojiPickerEmpty>
        </div>
      );
    }

    return (
      <EmojiSearchResults 
        hideStickyHeader={hideStickyHeader}
        containerHeight={containerHeight}
      />
    );
  }

  return (
    <EmojiCategories 
      hideStickyHeader={hideStickyHeader}
      containerHeight={containerHeight}
    />
  );
} 