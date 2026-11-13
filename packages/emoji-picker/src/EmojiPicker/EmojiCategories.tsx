import emojiData from 'unicode-emoji-json/data-by-group.json';
import React, { useMemo, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { SectionHeader } from './SectionHeader';
import { useEmojiPicker } from './EmojiPickerContext';
import { EmojiPickerButton } from './EmojiPickerButton';
import { CustomEmojiCategories } from './CustomEmojiCategories';
import { filterSupportedEmojis } from '../utils/supportedEmojis';
import { applySkinTone } from '../utils/applySkinTone';
import { useVirtualizedList } from '../hooks/useVirtualizedList';
import { useEmojiKeyboardNavigation } from '../hooks/useEmojiKeyboardNavigation';
import { useCategorySync } from '../hooks/useCategorySync';
import { toCategoryId } from '../atoms/categories';
import { skinToneAtom } from '../atoms/emoji';

import type { EmojiGroup, EmojiMetadata } from '../utils/supportedEmojis';
import type { CategoryNavItem } from '../types/emoji';
import type { CategoryOffset } from '../hooks/useCategorySync';

type Row = { type: 'header'; content: string } | { type: 'emojis'; content: EmojiMetadata[] };

const HEADER_ROW_HEIGHT = 32;

interface EmojiCategoriesProps {
  hideStickyHeader?: boolean;
  containerHeight?: number;
}

function EmojiCategoriesBase(props: EmojiCategoriesProps) {
  const { customSections, frequentlyUsedEmojis } = useEmojiPicker();

  // Delegate before mounting any hooks: StandardEmojiCategories registers its
  // own document-level keyboard navigation, which would compete with the one
  // inside CustomEmojiCategories.
  if (customSections.length > 0 || frequentlyUsedEmojis.length > 0) {
    return <CustomEmojiCategories {...props} />;
  }

  return <StandardEmojiCategories {...props} />;
}

function StandardEmojiCategories({
  hideStickyHeader = false,
  containerHeight = 364,
}: EmojiCategoriesProps) {
  const { emojisPerRow, emojiSize } = useEmojiPicker();
  const skinTone = useAtomValue(skinToneAtom);

  const parentRef = useRef<HTMLDivElement>(null);

  const emojiCategories = useMemo(() => filterSupportedEmojis(emojiData as EmojiGroup[]), []);

  const { rows, categories, categoryOffsets } = useMemo(() => {
    const allRows: Row[] = [];
    const navCategories: CategoryNavItem[] = [];
    const offsets: CategoryOffset[] = [];
    let currentOffset = 0;

    for (const category of emojiCategories) {
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
    }

    return {
      rows: allRows,
      categories: navCategories,
      categoryOffsets: offsets,
    };
  }, [emojiCategories, emojisPerRow, emojiSize, skinTone]);

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
