import { EmojiPicker } from '@ferrucc-io/emoji-picker';

interface DefaultPickerExampleProps {
  onEmojiSelect: (emoji: string) => void;
}

export function DefaultPickerExample({ onEmojiSelect }: DefaultPickerExampleProps) {
  return (
    <EmojiPicker
      className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden"
      onEmojiSelect={onEmojiSelect}
      emojisPerRow={12}
      emojiSize={28}
    >
      <EmojiPicker.Header>
        <EmojiPicker.Input autoFocus={true} placeholder="Search emoji" />
      </EmojiPicker.Header>
      <EmojiPicker.Group>
        <EmojiPicker.List containerHeight={400} />
      </EmojiPicker.Group>
    </EmojiPicker>
  );
}
