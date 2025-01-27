import React, { Profiler, ProfilerOnRenderCallback } from 'react';
import { useAtomValue } from 'jotai';
import { EmojiSearchResults } from './EmojiSearchResults';
import { EmojiPickerEmpty, EmojiPickerEmptyIcon, EmojiPickerEmptyText } from './EmojiPickerEmpty';
import { useEmojiPicker } from './EmojiPickerContext';
import { EmojiCategories } from './EmojiCategories';
import { filteredEmojisAtom, searchAtom } from '../atoms/emoji';

interface EmojiPickerListProps {
  hideStickyHeader?: boolean;
  containerHeight?: number;
}

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  console.log(`[${id}] ${phase}:`, {
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
  });
};

function EmojiPickerListBase({
  hideStickyHeader = false,
  containerHeight = 364,
}: EmojiPickerListProps) {
  const { emojiSize } = useEmojiPicker();
  const search = useAtomValue(searchAtom);
  const filteredEmojis = useAtomValue(filteredEmojisAtom);

  const content = search.trim() ? (
    filteredEmojis.length === 0 ? (
      <div className="flex flex-col items-start justify-start h-full pt-1">
        <div
          className={`${emojiSize > 32 ? 'text-sm' : 'text-xs'} font-medium text-zinc-500 dark:text-zinc-400 px-3 py-1.5`}
        >
          Search results
        </div>
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

  return (
    <Profiler id="EmojiPickerList" onRender={onRenderCallback}>
      {content}
    </Profiler>
  );
}

function propsAreEqual(prevProps: EmojiPickerListProps, nextProps: EmojiPickerListProps) {
  return (
    prevProps.hideStickyHeader === nextProps.hideStickyHeader &&
    prevProps.containerHeight === nextProps.containerHeight
  );
}

export const EmojiPickerList = React.memo(EmojiPickerListBase, propsAreEqual);
