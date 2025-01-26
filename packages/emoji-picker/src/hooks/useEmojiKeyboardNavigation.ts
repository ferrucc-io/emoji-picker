import { useCallback, useEffect } from 'react';
import { useEmojiPicker } from '../EmojiPicker/EmojiPickerContext';

import type { EmojiMetadata } from '../types/emoji';
type Row = { type: 'header'; content: string } | { type: 'emojis'; content: EmojiMetadata[] };

interface UseEmojiKeyboardNavigationProps {
  rows: Row[];
  virtualizer: {
    scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' }) => void;
  };
}

export function useEmojiKeyboardNavigation({ rows, virtualizer }: UseEmojiKeyboardNavigationProps) {
  const {
    selectedRow,
    selectedColumn,
    setSelectedPosition,
    setHoveredEmoji,
    setSelectedEmoji,
    search,
  } = useEmojiPicker();

  // Find next/previous emoji row
  const findNextEmojiRow = useCallback(
    (currentRow: number, direction: 'up' | 'down'): number => {
      let nextRow = currentRow;

      while (true) {
        nextRow = direction === 'up' ? nextRow - 1 : nextRow + 1;

        // Check bounds
        if (nextRow < 0 || nextRow >= rows.length) {
          return currentRow;
        }

        // Found next emoji row
        if (rows[nextRow].type === 'emojis') {
          return nextRow;
        }
      }
    },
    [rows]
  );

  // Find first emoji row
  const findFirstEmojiRow = useCallback((): number => {
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].type === 'emojis') {
        return i;
      }
    }
    return -1;
  }, [rows]);

  // Focus first emoji when search query changes and there are results
  useEffect(() => {
    if (search.trim() && rows.length > 0) {
      const firstRow = findFirstEmojiRow();
      if (firstRow !== -1) {
        setSelectedPosition(firstRow, 0);
        const firstRowData = rows[firstRow];
        if (firstRowData?.type === 'emojis' && firstRowData.content[0]) {
          setHoveredEmoji(firstRowData.content[0]);
          virtualizer.scrollToIndex(firstRow, { align: 'center' });
        }
      }
    }
  }, [search, rows, findFirstEmojiRow, setSelectedPosition, setHoveredEmoji, virtualizer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!rows.length) return;

      // If no emoji is selected and arrow keys are pressed, select the first emoji
      if (selectedRow === -1 || selectedColumn === -1) {
        if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          const firstRow = findFirstEmojiRow();
          if (firstRow !== -1) {
            e.preventDefault();
            setSelectedPosition(firstRow, 0);
            const firstRowData = rows[firstRow];
            if (firstRowData?.type === 'emojis' && firstRowData.content[0]) {
              setHoveredEmoji(firstRowData.content[0]);
              virtualizer.scrollToIndex(firstRow, { align: 'center' });
            }
          }
          return;
        }
        return;
      }

      const currentRow = rows[selectedRow];
      if (!currentRow || currentRow.type !== 'emojis') return;

      let newRow = selectedRow;
      let newColumn = selectedColumn;

      switch (e.key) {
        case 'ArrowLeft':
          if (newColumn > 0) {
            newColumn--;
          } else {
            // Move to end of previous row if possible
            const prevRow = findNextEmojiRow(newRow, 'up');
            if (prevRow !== newRow) {
              newRow = prevRow;
              const prevRowEmojis = (rows[prevRow] as { type: 'emojis'; content: EmojiMetadata[] })
                .content;
              newColumn = prevRowEmojis.length - 1;
            }
          }
          break;

        case 'ArrowRight':
          if (newColumn < currentRow.content.length - 1) {
            newColumn++;
          } else {
            // Move to start of next row if possible
            const nextRow = findNextEmojiRow(newRow, 'down');
            if (nextRow !== newRow) {
              newRow = nextRow;
              newColumn = 0;
            }
          }
          break;

        case 'ArrowUp':
          const prevRow = findNextEmojiRow(newRow, 'up');
          if (prevRow !== newRow) {
            newRow = prevRow;
            const prevRowEmojis = (rows[prevRow] as { type: 'emojis'; content: EmojiMetadata[] })
              .content;
            newColumn = Math.min(newColumn, prevRowEmojis.length - 1);
          }
          break;

        case 'ArrowDown':
          const nextRow = findNextEmojiRow(newRow, 'down');
          if (nextRow !== newRow) {
            newRow = nextRow;
            const nextRowEmojis = (rows[nextRow] as { type: 'emojis'; content: EmojiMetadata[] })
              .content;
            newColumn = Math.min(newColumn, nextRowEmojis.length - 1);
          }
          break;

        case 'Enter':
        case ' ':
          if (currentRow.content[newColumn]) {
            setSelectedEmoji(currentRow.content[newColumn].emoji);
          }
          break;

        default:
          return;
      }

      if (newRow !== selectedRow || newColumn !== selectedColumn) {
        e.preventDefault();
        setSelectedPosition(newRow, newColumn);
        const newRowData = rows[newRow];
        if (newRowData?.type === 'emojis' && newRowData.content[newColumn]) {
          setHoveredEmoji(newRowData.content[newColumn]);
          virtualizer.scrollToIndex(newRow, { align: 'center' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    rows,
    selectedRow,
    selectedColumn,
    findFirstEmojiRow,
    findNextEmojiRow,
    setSelectedPosition,
    setHoveredEmoji,
    setSelectedEmoji,
    virtualizer,
  ]);
}
