interface EmojiDataItem {
  emoji: string;
  name: string;
  unicode_version: string;
  emoji_version: string;
  skin_tone_support: boolean;
  skin_tone_support_unicode_version?: string;
  slug?: string;
}

interface SkinToneData {
  emoji: string;
  skin_tone_support: boolean;
  skin_tone_support_unicode_version?: string;
  unicode_version?: string;
}

export const isCompatibleSkinTone = (emoji: SkinToneData, maxVersion: number = 15.0): boolean => {
  // First check if the emoji itself is from a compatible version
  if (emoji.unicode_version) {
    const version = parseFloat(emoji.unicode_version);
    if (isNaN(version) || version > maxVersion) {
      return false;
    }
  }

  if (!emoji.skin_tone_support) {
    return false;
  }

  if (emoji.skin_tone_support_unicode_version) {
    const skinToneVersion = parseFloat(emoji.skin_tone_support_unicode_version);
    return !isNaN(skinToneVersion) && skinToneVersion <= maxVersion;
  }

  return true;
};

export const isCompatibleEmoji = (emoji: EmojiDataItem, maxVersion: number = 15.0): { isCompatible: boolean; supportsSkinTone: boolean } => {
  const version = parseFloat(emoji.unicode_version);
  if (isNaN(version) || version > maxVersion) {
    return { isCompatible: false, supportsSkinTone: false };
  }

  return { 
    isCompatible: true, 
    supportsSkinTone: isCompatibleSkinTone({ ...emoji }, maxVersion)
  };
}; 