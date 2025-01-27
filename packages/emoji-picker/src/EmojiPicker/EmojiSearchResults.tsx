import { useMemo, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { EmojiPickerListHeader } from './EmojiPickerListHeader';
import { useEmojiPicker } from './EmojiPickerContext';
import { EmojiPickerButton } from './EmojiPickerButton';
import { useVirtualizedList } from '../hooks/useVirtualizedList';
import { useEmojiKeyboardNavigation } from '../hooks/useEmojiKeyboardNavigation';
import { filteredEmojisAtom } from '../atoms/emoji';

import type { EmojiMetadata } from '../types/emoji';
type Row = { type: 'header'; content: string } | { type: 'emojis'; content: EmojiMetadata[] };

interface EmojiSearchResultsProps {
  hideStickyHeader?: boolean;
  containerHeight?: number;
}

export function EmojiSearchResults({
  hideStickyHeader = false,
  containerHeight = 364,
}: EmojiSearchResultsProps) {
  const { emojisPerRow, emojiSize } = useEmojiPicker();

  const filteredEmojis = useAtomValue(filteredEmojisAtom);

  const parentRef = useRef<HTMLDivElement>(null);

  // Create rows from search results
  const rows = useMemo<Row[]>(() => {
    const searchResults = filteredEmojis.flatMap((category) => category.emojis);
    const rows: Row[] = [];

    // Add single "Search results" header
    rows.push({
      type: 'header',
      content: 'Search results',
    });

    // Add emoji rows
    for (let i = 0; i < searchResults.length; i += emojisPerRow) {
      rows.push({
        type: 'emojis',
        content: searchResults.slice(i, i + emojisPerRow),
      });
    }

    return rows;
  }, [filteredEmojis, emojisPerRow]);

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

  useEmojiKeyboardNavigation({ rows, virtualizer });

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
                <EmojiPickerListHeader content={row.content} emojiSize={emojiSize} />
              ) : (
                <div
                  className={`grid grid-cols-${emojisPerRow} px-2`}
                  style={{ gridTemplateColumns: `repeat(${emojisPerRow}, minmax(0, 1fr))` }}
                >
                  {row.content.map((emojiData, index) => (
                    <EmojiPickerButton
                      key={index}
                      emoji={emojiData}
                      rowIndex={virtualRow.index}
                      columnIndex={index}
                      size={emojiSize}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
