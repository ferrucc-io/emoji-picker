import { EmojiPicker } from '@ferrucc-io/emoji-picker';

export function LinearPickerExample() {
  return (
    <EmojiPicker
      className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden"
      emojisPerRow={12}
      emojiSize={28}
    >
      <EmojiPicker.Header className="pb-0">
        <EmojiPicker.Input 
          placeholder="Search emoji" 
          autoFocus={true}
        />
      </EmojiPicker.Header>
      <EmojiPicker.Group>
        <EmojiPicker.List 
          hideStickyHeader={true}
          containerHeight={400}
        />
      </EmojiPicker.Group>
    </EmojiPicker>
  );
} 