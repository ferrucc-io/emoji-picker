import emojiData from 'unicode-emoji-json/data-by-group.json';
import React, { useMemo, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { SectionHeader } from './SectionHeader';
import { useEmojiPicker } from './EmojiPickerContext';
import { EmojiPickerButton } from './EmojiPickerButton';
import { CustomEmojiButton } from './CustomEmojiButton';
import { filterSupportedEmojis } from '../utils/supportedEmojis';
import { resolveUnicodeEmojiMetadata } from '../utils/emojiMetadata';
import { applySkinTone } from '../utils/applySkinTone';
import { useVirtualizedList } from '../hooks/useVirtualizedList';
import { useCustomEmojiKeyboardNavigation } from '../hooks/useCustomEmojiKeyboardNavigation';
import { useCategorySync } from '../hooks/useCategorySync';
import { sortCustomSectionsByPriority } from '../utils/emojiSearch';
import { toCategoryId } from '../atoms/categories';
import { skinToneAtom } from '../atoms/emoji';
import { isCustomEmoji } from '../types/emoji';

import type { EmojiGroup, EmojiMetadata } from '../utils/supportedEmojis';
import type { CategoryNavItem, CustomEmoji } from '../types/emoji';
import type { CategoryOffset } from '../hooks/useCategorySync';

type Row =
  | { type: 'header'; content: string }
  | { type: 'emojis'; content: EmojiMetadata[] }
  | { type: 'custom-emojis'; content: (EmojiMetadata | CustomEmoji)[] };

const HEADER_ROW_HEIGHT = 32;

interface CustomEmojiCategoriesProps {
  hideStickyHeader?: boolean;
  containerHeight?: number;
}

export function CustomEmojiCategories({
  hideStickyHeader = false,
  containerHeight = 364,
}: CustomEmojiCategoriesProps) {
  const { emojisPerRow, emojiSize, customSections, frequentlyUsedEmojis } = useEmojiPicker();
  const skinTone = useAtomValue(skinToneAtom);

  const parentRef = useRef<HTMLDivElement>(null);

  const emojiCategories = useMemo(() => filterSupportedEmojis(emojiData as EmojiGroup[]), []);

  const customEmojiByShortcode = useMemo(() => {
    const map = new Map<string, CustomEmoji>();
    for (const section of customSections) {
      for (const item of section.emojis) {
        if (isCustomEmoji(item)) {
          map.set(`:${item.name}:`, item);
        }
      }
    }
    return map;
  }, [customSections]);

  const { rows, categories, categoryOffsets } = useMemo(() => {
    const allRows: Row[] = [];
    const navCategories: CategoryNavItem[] = [];
    const offsets: CategoryOffset[] = [];
    let currentOffset = 0;

    if (frequentlyUsedEmojis.length > 0) {
      const rowIndex = allRows.length;
      navCategories.push({
        id: 'frequently-used',
        name: 'Frequently Used',
        rowIndex,
      });
      offsets.push({
        id: 'frequently-used',
        rowIndex,
        offsetTop: currentOffset,
      });

      allRows.push({
        type: 'header',
        content: 'Frequently Used',
      });
      currentOffset += HEADER_ROW_HEIGHT;

      const frequentEmojis: (EmojiMetadata | CustomEmoji)[] = frequentlyUsedEmojis.map((emoji) => {
        if (typeof emoji === 'string') {
          const matchedCustom = customEmojiByShortcode.get(emoji);
          if (matchedCustom) {
            return matchedCustom;
          }
          return resolveUnicodeEmojiMetadata(emoji);
        }
        return emoji;
      });

      for (let i = 0; i < frequentEmojis.length; i += emojisPerRow) {
        const emojis = frequentEmojis.slice(i, i + emojisPerRow);
        const processedEmojis = emojis.map((emoji) =>
          isCustomEmoji(emoji)
            ? emoji
            : skinTone === 'default'
              ? emoji
              : applySkinTone(emoji, skinTone)
        );

        allRows.push({
          type: 'custom-emojis',
          content: processedEmojis,
        });
        currentOffset += emojiSize;
      }
    }

    const sortedCustomSections = sortCustomSectionsByPriority(customSections);

    for (const section of sortedCustomSections) {
      const rowIndex = allRows.length;
      navCategories.push({
        id: section.id,
        name: section.name,
        rowIndex,
        isCustom: true,
        icon: section.icon,
      });
      offsets.push({
        id: section.id,
        rowIndex,
        offsetTop: currentOffset,
      });

      allRows.push({
        type: 'header',
        content: section.name,
      });
      currentOffset += HEADER_ROW_HEIGHT;

      for (let i = 0; i < section.emojis.length; i += emojisPerRow) {
        const emojis = section.emojis.slice(i, i + emojisPerRow);
        const processedEmojis = emojis.map((emoji) =>
          isCustomEmoji(emoji) ? emoji : applySkinTone(emoji, skinTone)
        );

        allRows.push({
          type: 'custom-emojis',
          content: processedEmojis,
        });
        currentOffset += emojiSize;
      }
    }

    emojiCategories.forEach((category) => {
      const id = toCategoryId(category.category);
      const rowIndex = allRows.length;
      navCategories.push({
        id,
        name: category.category,
        rowIndex,
      });
      offsets.push({
        id,
        rowIndex,
        offsetTop: currentOffset,
      });

      allRows.push({
        type: 'header',
        content: category.category,
      });
      currentOffset += HEADER_ROW_HEIGHT;

      for (let i = 0; i < category.emojis.length; i += emojisPerRow) {
        allRows.push({
          type: 'emojis',
          content: category.emojis
            .slice(i, i + emojisPerRow)
            .map((emoji) => applySkinTone(emoji, skinTone)),
        });
        currentOffset += emojiSize;
      }
    });

    return {
      rows: allRows,
      categories: navCategories,
      categoryOffsets: offsets,
    };
  }, [
    emojiCategories,
    emojisPerRow,
    emojiSize,
    skinTone,
    customSections,
    frequentlyUsedEmojis,
    customEmojiByShortcode,
  ]);

  const { virtualizer, isSticky, isActiveSticky } = useVirtualizedList({
    rows,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const row = rows[index];
      return row?.type === 'header' ? HEADER_ROW_HEIGHT : emojiSize;
    },
    isHeader: (row: Row) => row.type === 'header',
    hideStickyHeader,
  });

  useCategorySync({
    categories,
    categoryOffsets,
    scrollElementRef: parentRef,
    virtualizer,
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
          if (!row) {
            return null;
          }

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
