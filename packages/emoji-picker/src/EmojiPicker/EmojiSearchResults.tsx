import { useMemo, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { SectionHeader } from './SectionHeader';
import { useEmojiPicker } from './EmojiPickerContext';
import { EmojiPickerButton } from './EmojiPickerButton';
import { CustomEmojiButton } from './CustomEmojiButton';
import { useVirtualizedList } from '../hooks/useVirtualizedList';
import { useCustomEmojiKeyboardNavigation } from '../hooks/useCustomEmojiKeyboardNavigation';
import { searchCustomEmojis } from '../utils/emojiSearch';
import { filteredEmojisAtom, searchAtom } from '../atoms/emoji';
import { isCustomEmoji } from '../types/emoji';

import type { CustomEmoji, EmojiMetadata } from '../types/emoji';
type Row =
  | { type: 'header'; content: string }
  | { type: 'emojis' | 'custom-emojis'; content: (EmojiMetadata | CustomEmoji)[] };

interface EmojiSearchResultsProps {
  hideStickyHeader?: boolean;
  containerHeight?: number;
}

export function EmojiSearchResults({
  hideStickyHeader = false,
  containerHeight = 364,
}: EmojiSearchResultsProps) {
  const { emojisPerRow, emojiSize, customSections } = useEmojiPicker();

  const search = useAtomValue(searchAtom);
  const filteredEmojis = useAtomValue(filteredEmojisAtom);

  const parentRef = useRef<HTMLDivElement>(null);

  // Create rows from search results
  const rows = useMemo<Row[]>(() => {
    // Custom emoji matches come first, flowing into the same rows as standard results
    const searchResults: (EmojiMetadata | CustomEmoji)[] = [
      ...searchCustomEmojis(search, customSections),
      ...filteredEmojis.flatMap((category) => category.emojis),
    ];
    const rows: Row[] = [];

    // Add single "Search results" header
    rows.push({
      type: 'header',
      content: 'Search results',
    });

    for (let i = 0; i < searchResults.length; i += emojisPerRow) {
      const content = searchResults.slice(i, i + emojisPerRow);
      rows.push({
        type: content.some(isCustomEmoji) ? 'custom-emojis' : 'emojis',
        content,
      });
    }

    return rows;
  }, [search, customSections, filteredEmojis, emojisPerRow]);

  const { virtualizer, isSticky, isActiveSticky } = useVirtualizedList({
    rows,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const row = rows[index];
      return row?.type === 'header' ? 32 : emojiSize;
    },
    isHeader: (row: Row) => row.type === 'header',
    hideStickyHeader,
  });

  useCustomEmojiKeyboardNavigation({ rows, virtualizer });

  return (
    <div
      ref={parentRef}
      className="overflow-y-auto relative outline-none"
      style={{
        height: `${containerHeight}px`,
      }}
      tabIndex={0}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];

          return (
            <div
              key={virtualRow.index}
              data-type={row.type}
              style={{
                ...(isSticky(virtualRow.index)
                  ? {
                      zIndex: 1,
                    }
                  : {}),
                ...(isActiveSticky(virtualRow.index)
                  ? {
                      position: 'sticky',
                    }
                  : {
                      position: 'absolute',
                      transform: `translateY(${virtualRow.start}px)`,
                    }),
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
              }}
            >
              {row.type === 'header' ? (
                <SectionHeader
                  content={row.content}
                  emojiSize={emojiSize}
                  isSticky={isActiveSticky(virtualRow.index)}
                />
              ) : (
                <div
                  className={`grid grid-cols-${emojisPerRow} px-2`}
                  style={{ gridTemplateColumns: `repeat(${emojisPerRow}, minmax(0, 1fr))` }}
                >
                  {row.content.map((emojiData, index) =>
                    isCustomEmoji(emojiData) ? (
                      <CustomEmojiButton
                        key={emojiData.id}
                        emoji={emojiData}
                        rowIndex={virtualRow.index}
                        columnIndex={index}
                        size={emojiSize}
                      />
                    ) : (
                      <EmojiPickerButton
                        key={index}
                        emoji={emojiData}
                        rowIndex={virtualRow.index}
                        columnIndex={index}
                        size={emojiSize}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
