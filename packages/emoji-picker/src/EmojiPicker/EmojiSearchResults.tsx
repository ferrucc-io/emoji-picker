import { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { EmojiPickerSectionHeader } from './EmojiPickerSectionHeader';
import { useEmojiPicker } from './EmojiPickerContext';
import { EmojiPickerButton } from './EmojiPickerButton';
import { useEmojiKeyboardNavigation } from '../hooks/useEmojiKeyboardNavigation';

import type { EmojiMetadata } from '../types/emoji';

type Row = 
  | { type: 'header'; content: string }
  | { type: 'emojis'; content: EmojiMetadata[] };

interface EmojiSearchResultsProps {
  hideStickyHeader?: boolean;
  containerHeight?: number;
}

export function EmojiSearchResults({ 
  hideStickyHeader = false,
  containerHeight = 364
}: EmojiSearchResultsProps) {
  const { 
    filteredEmojis,
    selectedRow,
    selectedColumn,
    emojisPerRow,
    emojiSize
  } = useEmojiPicker();
  const parentRef = useRef<HTMLDivElement>(null);

  // Create rows from search results
  const rows = useMemo<Row[]>(() => {
    const searchResults = filteredEmojis.flatMap(category => category.emojis);
    const rows: Row[] = [];

    // Add single "Search results" header
    rows.push({
      type: 'header',
      content: 'Search results'
    });

    // Add emoji rows
    for (let i = 0; i < searchResults.length; i += emojisPerRow) {
      rows.push({
        type: 'emojis',
        content: searchResults.slice(i, i + emojisPerRow)
      });
    }

    return rows;
  }, [filteredEmojis, emojisPerRow]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => emojiSize,
    overscan: 3,
    paddingEnd: 8,
  });

  // Add keyboard navigation
  useEmojiKeyboardNavigation({ rows, virtualizer });

  const stickyHeader = useMemo(() => {
    const visibleItems = virtualizer.getVirtualItems();
    if (!visibleItems.length) return null;

    const scrollTop = parentRef.current?.scrollTop ?? 0;
    let currentHeader = null;
    
    let currentHeaderIndex = -1;
    let nextHeaderIndex = -1;
    
    for (let i = 0; i < rows.length; i++) {
      if (rows[i]?.type === 'header') {
        if (i <= visibleItems[0].index) {
          currentHeaderIndex = i;
        } else {
          nextHeaderIndex = i;
          break;
        }
      }
    }
    
    if (currentHeaderIndex !== -1) {
      // Get the next header's virtual item if it exists
      const nextHeaderItem = nextHeaderIndex !== -1 ? 
        virtualizer.getVirtualItems().find(item => item.index === nextHeaderIndex) : null;
      
      const distanceToNext = nextHeaderItem
        ? nextHeaderItem.start - scrollTop
        : Infinity;
      
      if (distanceToNext <= (emojiSize * 2)) {
        const slideUp = distanceToNext <= emojiSize ? 1 : 0
        currentHeader = {
          content: (rows[currentHeaderIndex] as { type: 'header'; content: string }).content,
          transform: `translateY(-${emojiSize * slideUp}px)`,
          index: currentHeaderIndex
        };
      } else {
        currentHeader = {
          content: (rows[currentHeaderIndex] as { type: 'header'; content: string }).content,
          transform: 'translateY(0)',
          index: currentHeaderIndex
        };
      }
    }
    
    return currentHeader;
  }, [virtualizer.getVirtualItems(), rows, parentRef.current?.scrollTop]);

  return (
    <div 
      ref={parentRef} 
      className="overflow-y-auto relative outline-none"
      style={{
        height: `${containerHeight}px`,
      }}
      tabIndex={0}
    >
      {!hideStickyHeader && stickyHeader && (
        <EmojiPickerSectionHeader
          content={stickyHeader.content}
          transform={stickyHeader.transform}
          emojiSize={emojiSize}
        />
      )}
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
          marginTop: hideStickyHeader ? 4 : -emojiSize,
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          const isSelectedRow = virtualRow.index === selectedRow;
          return (
            <div
              key={virtualRow.index}
              data-type={row.type}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {row.type === 'header' ? (
                <div className={`${emojiSize > 32 ? 'text-sm' : 'text-xs'} font-medium text-zinc-500 dark:text-zinc-400 px-3 py-1.5`}>
                  {row.content}
                </div>
              ) : (
                <div className={`grid grid-cols-${emojisPerRow} px-2`} style={{ gridTemplateColumns: `repeat(${emojisPerRow}, minmax(0, 1fr))` }}>
                  {row.content.map((emojiData, index) => (
                    <EmojiPickerButton 
                      key={index} 
                      emoji={emojiData}
                      isSelected={isSelectedRow && index === selectedColumn}
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