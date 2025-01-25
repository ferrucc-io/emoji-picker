import { ClearIcon, SearchIcon } from '../../../src/EmojiPicker/icons';
import { EmojiPicker, EmojiPickerGroup, EmojiPickerInput, EmojiPickerList } from '../../../src';

export function DefaultPicker() {
  const handleEmojiSelect = (emoji: string) => {
    console.log('Selected emoji:', emoji);
  };

  return (
    <EmojiPicker onEmojiSelect={handleEmojiSelect}>
      <EmojiPickerInput 
        placeholder="Search emoji" 
        className="w-full h-[28px]"
        startIcon={<SearchIcon />}
        endIcon={<ClearIcon />}
      />
      <EmojiPickerGroup>
        <EmojiPickerList />
      </EmojiPickerGroup>
    </EmojiPicker>
  );
} 