import { EmojiPicker, EmojiPickerGroup, EmojiPickerList } from '@ferrucc-io/emoji-picker';

export function DefaultPicker() {
  
  const handleEmojiSelect = (emoji: string) => {
    console.log('Selected emoji:', emoji);
  };

  return (
    <EmojiPicker onEmojiSelect={handleEmojiSelect}>
      <EmojiPicker.Header >
        <EmojiPicker.Input
          autoFocus
          placeholder="Search emoji"
        />
      </EmojiPicker.Header>
      <EmojiPickerGroup>
        <EmojiPickerList />
      </EmojiPickerGroup>
    </EmojiPicker>
  );
} 