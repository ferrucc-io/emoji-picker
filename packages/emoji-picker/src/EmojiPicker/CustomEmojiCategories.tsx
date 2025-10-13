import emojiData from 'unicode-emoji-json/data-by-group.json';
import React, { useMemo, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { EmojiPickerListHeader } from './EmojiPickerListHeader';
import { useEmojiPicker } from './EmojiPickerContext';
import { EmojiPickerButton } from './EmojiPickerButton';
import { CustomEmojiButton } from './CustomEmojiButton';
import { filterSupportedEmojis } from '../utils/supportedEmojis';
import { applySkinTone } from '../utils/applySkinTone';
import { useVirtualizedList } from '../hooks/useVirtualizedList';
import { useCustomEmojiKeyboardNavigation } from '../hooks/useCustomEmojiKeyboardNavigation';
import { skinToneAtom } from '../atoms/emoji';
import { isCustomEmoji } from '../types/emoji';

import type { EmojiGroup, EmojiMetadata } from '../utils/supportedEmojis';
import type { CustomEmoji } from '../types/emoji';

type Row =
  | { type: 'header'; content: string }
  | { type: 'emojis'; content: EmojiMetadata[] }
  | { type: 'custom-emojis'; content: (EmojiMetadata | CustomEmoji)[] };

interface CustomEmojiCategoriesProps {
  hideStickyHeader?: boolean;
  containerHeight?: number;
}

const emojiCategories = filterSupportedEmojis(emojiData as EmojiGroup[]);

export function CustomEmojiCategories({
  hideStickyHeader = false,
  containerHeight = 364,
}: CustomEmojiCategoriesProps) {
  const { emojisPerRow, emojiSize, customSections, frequentlyUsedEmojis, renderHeader } =
    useEmojiPicker();
  const skinTone = useAtomValue(skinToneAtom);

  const parentRef = useRef<HTMLDivElement>(null);

  const rows = useMemo<Row[]>(() => {
    const allRows: Row[] = [];

    if (frequentlyUsedEmojis.length > 0) {
      allRows.push({
        type: 'header',
        content: 'Frequently Used',
      });

      const frequentEmojis: (EmojiMetadata | CustomEmoji)[] = frequentlyUsedEmojis.map((emoji) => {
        if (typeof emoji === 'string') {
          return {
            emoji,
            name: `frequently-used-${emoji}`,
            slug: `frequently-used-${emoji}`,
            skin_tone_support: false,
          } as EmojiMetadata;
        } else {
          return emoji;
        }
      });

      for (let i = 0; i < frequentEmojis.length; i += emojisPerRow) {
        const emojis = frequentEmojis.slice(i, i + emojisPerRow);
        const processedEmojis = emojis.map((emoji) =>
          isCustomEmoji(emoji) ? emoji : applySkinTone(emoji, skinTone)
        );

        allRows.push({
          type: 'custom-emojis',
          content: processedEmojis,
        });
      }
    }

    const sortedCustomSections = [...customSections].sort(
      (a, b) => (a.priority || 999) - (b.priority || 999)
    );

    for (const section of sortedCustomSections) {
      allRows.push({
        type: 'header',
        content: section.name,
      });

      for (let i = 0; i < section.emojis.length; i += emojisPerRow) {
        const emojis = section.emojis.slice(i, i + emojisPerRow);
        const processedEmojis = emojis.map((emoji) =>
          isCustomEmoji(emoji) ? emoji : applySkinTone(emoji, skinTone)
        );

        allRows.push({
          type: 'custom-emojis',
          content: processedEmojis,
        });
      }
    }

    emojiCategories.forEach((category) => {
      allRows.push({
        type: 'header',
        content: category.category,
      });

      for (let i = 0; i < category.emojis.length; i += emojisPerRow) {
        allRows.push({
          type: 'emojis',
          content: category.emojis
            .slice(i, i + emojisPerRow)
            .map((emoji) => applySkinTone(emoji, skinTone)),
        });
      }
    });

    return allRows;
  }, [emojisPerRow, skinTone, customSections, frequentlyUsedEmojis]);

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
                renderHeader ? (
                  renderHeader({
                    content: row.content,
                    emojiSize,
                    isSticky: isActiveSticky(virtualRow.index),
                    sectionId: row.content.toLowerCase().replace(/\s+/g, '-'),
                  })
                ) : (
                  <EmojiPickerListHeader content={row.content} emojiSize={emojiSize} />
                )
              ) : (
                <div
                  className={`grid grid-cols-${emojisPerRow} px-2`}
                  style={{ gridTemplateColumns: `repeat(${emojisPerRow}, minmax(0, 1fr))` }}
                >
                  {row.type === 'custom-emojis'
                    ? row.content.map((emojiData, index) =>
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
                      )
                    : row.content.map((emojiData, index) => (
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
