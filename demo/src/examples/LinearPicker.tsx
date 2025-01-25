import { ClearIcon, SearchIcon } from '../../../src/EmojiPicker/icons';
import { EmojiPicker, EmojiPickerGroup, EmojiPickerInput, EmojiPickerList } from '../../../src';

export function LinearPicker() {
  return (
    <EmojiPicker>
      <EmojiPickerInput 
        wrapperClassName="px-2 pt-1.5"
        placeholder="Search emoji" 
        startIcon={<SearchIcon />}
  endIcon={<ClearIcon />}   
      />
      <EmojiPickerGroup>
        <EmojiPickerList hideStickyHeader />
      </EmojiPickerGroup>
    </EmojiPicker>
  );
} 