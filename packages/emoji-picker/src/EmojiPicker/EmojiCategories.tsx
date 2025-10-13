import emojiData from 'unicode-emoji-json/data-by-group.json';
import React, { useMemo, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { EmojiPickerListHeader } from './EmojiPickerListHeader';
import { useEmojiPicker } from './EmojiPickerContext';
import { EmojiPickerButton } from './EmojiPickerButton';
import { filterSupportedEmojis } from '../utils/supportedEmojis';
import { applySkinTone } from '../utils/applySkinTone';
import { useVirtualizedList } from '../hooks/useVirtualizedList';
import { useEmojiKeyboardNavigation } from '../hooks/useEmojiKeyboardNavigation';
import { skinToneAtom } from '../atoms/emoji';
import { CustomEmojiCategories } from './CustomEmojiCategories';

import type { EmojiGroup, EmojiMetadata } from '../utils/supportedEmojis';
type Row = { type: 'header'; content: string } | { type: 'emojis'; content: EmojiMetadata[] };

interface EmojiCategoriesProps {
  hideStickyHeader?: boolean;
  containerHeight?: number;
}

const emojiCategories = filterSupportedEmojis(emojiData as EmojiGroup[]);

function EmojiCategoriesBase({
  hideStickyHeader = false,
  containerHeight = 364,
}: EmojiCategoriesProps) {
  const { emojisPerRow, emojiSize, customSections, frequentlyUsedEmojis, renderHeader } = useEmojiPicker();
  const skinTone = useAtomValue(skinToneAtom);

  if (customSections.length > 0 || frequentlyUsedEmojis.length > 0) {
    return (
      <CustomEmojiCategories
        hideStickyHeader={hideStickyHeader}
        containerHeight={containerHeight}
      />
    );
  }

  const parentRef = useRef<HTMLDivElement>(null);

  const rows = useMemo<Row[]>(() => {
    return emojiCategories.flatMap((category) => {
      const rows: Row[] = [];

      rows.push({
        type: 'header',
        content: category.category,
      });

      for (let i = 0; i < category.emojis.length; i += emojisPerRow) {
        rows.push({
          type: 'emojis',
          content: category.emojis
            .slice(i, i + emojisPerRow)
            .map((emoji) => applySkinTone(emoji, skinTone)),
        });
      }
      return rows;
    });
  }, [emojisPerRow, skinTone]);

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
                renderHeader ? (
                  renderHeader({
                    content: row.content,
                    emojiSize,
                    isSticky: isActiveSticky(virtualRow.index),
                    sectionId: row.content.toLowerCase().replace(/\s+/g, '-')
                  })
                ) : (
                  <EmojiPickerListHeader content={row.content} emojiSize={emojiSize} />
                )
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

export const EmojiCategories = React.memo(EmojiCategoriesBase);
