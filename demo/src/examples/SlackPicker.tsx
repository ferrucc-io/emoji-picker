import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerGroup,
  EmojiPickerList,
  EmojiPickerPreview,
  EmojiPickerSkinTone,
} from '@ferrucc-io/emoji-picker';

export function SlackPicker() {
  return (
    <div className="rounded-[8px] border border-zinc-300 dark:border-zinc-600 overflow-hidden shadow-sm font-['Lato'] pt-1">
      <EmojiPicker 
        className="w-[280px]"
        emojisPerRow={9}
        emojiSize={36}
      >
        <EmojiPicker.Header className="w-full">
          <EmojiPicker.Input 
            placeholder="Search all emoji" 
            className="h-[36px] bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 w-full rounded-[8px] text-[15px] focus:shadow-[0_0_0_1px_#1d9bd1,0_0_0_6px_rgba(29,155,209,0.3)] focus:border-transparent focus:outline-none mb-1"
            hideIcon
          />
        </EmojiPicker.Header>
        <EmojiPickerGroup>
          <EmojiPickerList containerHeight={320} />          
        </EmojiPickerGroup>
        <EmojiPickerPreview>
          {({ previewedEmoji }) => (
            <>
              {previewedEmoji ? 
                <EmojiPickerContent />
                :
                <button className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded px-2.5 py-1 transition-colors">
                  Add Emoji
                </button>
              }
              <EmojiPickerSkinTone />
            </>
          )}
        </EmojiPickerPreview>
      </EmojiPicker>
    </div>
  );
} 