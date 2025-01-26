import { EmojiPicker } from '@ferrucc-io/emoji-picker';

export function SlackPickerExample() {
  return (
    <div className="rounded-[8px] border border-zinc-300 dark:border-zinc-600 overflow-hidden shadow-sm flex flex-col items-center">
      <EmojiPicker 
        className="font-['Lato'] w-[380px] border-none"
        emojisPerRow={9}
        emojiSize={36}
      >
        <EmojiPicker.Header className="w-full px-4 pt-4">
          <EmojiPicker.Input 
            placeholder="Search all emoji" 
            className="h-[36px] bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 w-full rounded-[8px] text-[15px] focus:shadow-[0_0_0_1px_#1d9bd1,0_0_0_6px_rgba(29,155,209,0.3)] dark:focus:shadow-[0_0_0_1px_#1d9bd1,0_0_0_6px_rgba(29,155,209,0.3)] focus:border-transparent focus:outline-none mb-1"
            hideIcon
          />
        </EmojiPicker.Header>
        <EmojiPicker.Group className="px-1">
          <EmojiPicker.List containerHeight={320} />          
        </EmojiPicker.Group>
        <EmojiPicker.Preview className="px-4">
          {({ previewedEmoji }) => (
            <>
              {previewedEmoji ? 
                <EmojiPicker.Content />
                :
                <button className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded px-2.5 py-1 transition-colors">
                  Add Emoji
                </button>
              }
              <EmojiPicker.SkinTone />
            </>
          )}
        </EmojiPicker.Preview>
      </EmojiPicker>
    </div>
  );
} 