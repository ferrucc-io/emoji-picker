import { EmojiPicker } from "@ferrucc-io/emoji-picker";

export function DefaultPickerExample() {
  const handleEmojiSelect = (emoji: string) => {
    console.log("Selected emoji:", emoji);
  };

  return (
    <EmojiPicker
      className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden"
      onEmojiSelect={handleEmojiSelect}
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
