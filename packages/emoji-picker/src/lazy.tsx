import React, { Suspense, forwardRef, lazy } from 'react';
import type { ReactNode } from 'react';
import type {
  EmojiPicker as EmojiPickerComponent,
  EmojiPickerHeaderProps,
  EmojiPickerProps,
} from './EmojiPicker/EmojiPicker';
import type { EmojiPickerGroupProps } from './EmojiPicker/EmojiPickerGroup';
import type { EmojiPickerInputProps } from './EmojiPicker/EmojiPickerInput';
import type { EmojiPickerListProps } from './EmojiPicker/EmojiPickerList';
import type { EmojiPickerPreviewProps } from './EmojiPicker/EmojiPickerPreview';
import { isCustomEmoji } from './types/emoji';
import type { CustomEmoji, CustomSection, EmojiMetadata, HeaderRendererProps } from './types/emoji';

type EmojiPickerModule = {
  EmojiPicker: typeof EmojiPickerComponent;
};

let cachedModule: EmojiPickerModule | null = null;
let modulePromise: Promise<EmojiPickerModule> | null = null;

function loadEmojiPickerModule(): Promise<EmojiPickerModule> {
  if (!modulePromise) {
    modulePromise = import('./index').then((mod) => {
      cachedModule = mod;
      return mod;
    });
  }
  return modulePromise;
}

const LazyRoot = lazy(() => loadEmojiPickerModule().then((mod) => ({ default: mod.EmojiPicker })));

const LazyHeader = lazy(() =>
  loadEmojiPickerModule().then((mod) => ({ default: mod.EmojiPicker.Header }))
);

const LazyInput = lazy(() =>
  loadEmojiPickerModule().then((mod) => ({ default: mod.EmojiPicker.Input }))
);

const LazyGroup = lazy(() =>
  loadEmojiPickerModule().then((mod) => ({ default: mod.EmojiPicker.Group }))
);

const LazyList = lazy(() =>
  loadEmojiPickerModule().then((mod) => ({ default: mod.EmojiPicker.List }))
);

const LazyPreview = lazy(() =>
  loadEmojiPickerModule().then((mod) => ({ default: mod.EmojiPicker.Preview }))
);

const LazyContent = lazy(() =>
  loadEmojiPickerModule().then((mod) => ({ default: mod.EmojiPicker.Content }))
);

const LazySkinTone = lazy(() =>
  loadEmojiPickerModule().then((mod) => ({ default: mod.EmojiPicker.SkinTone }))
);

export interface LazyEmojiPickerProps extends EmojiPickerProps {
  fallback?: ReactNode;
}

function Header(props: EmojiPickerHeaderProps) {
  if (cachedModule) {
    const ResolvedHeader = cachedModule.EmojiPicker.Header;
    return <ResolvedHeader {...props} />;
  }
  return <LazyHeader {...props} />;
}

const Input = forwardRef<HTMLInputElement, EmojiPickerInputProps>(
  function EmojiPickerLazyInput(props, ref) {
    if (cachedModule) {
      const ResolvedInput = cachedModule.EmojiPicker.Input;
      return <ResolvedInput {...props} ref={ref} />;
    }
    return <LazyInput {...props} ref={ref} />;
  }
);

function Group(props: EmojiPickerGroupProps) {
  if (cachedModule) {
    const ResolvedGroup = cachedModule.EmojiPicker.Group;
    return <ResolvedGroup {...props} />;
  }
  return <LazyGroup {...props} />;
}

function List(props: EmojiPickerListProps) {
  if (cachedModule) {
    const ResolvedList = cachedModule.EmojiPicker.List;
    return <ResolvedList {...props} />;
  }
  return <LazyList {...props} />;
}

function Preview(props: EmojiPickerPreviewProps) {
  if (cachedModule) {
    const ResolvedPreview = cachedModule.EmojiPicker.Preview;
    return <ResolvedPreview {...props} />;
  }
  return <LazyPreview {...props} />;
}

function Content() {
  if (cachedModule) {
    const ResolvedContent = cachedModule.EmojiPicker.Content;
    return <ResolvedContent />;
  }
  return <LazyContent />;
}

function SkinTone() {
  if (cachedModule) {
    const ResolvedSkinTone = cachedModule.EmojiPicker.SkinTone;
    return <ResolvedSkinTone />;
  }
  return <LazySkinTone />;
}

export function EmojiPicker({ fallback = null, ...props }: LazyEmojiPickerProps) {
  return (
    <Suspense fallback={fallback}>
      <LazyRoot {...props} />
    </Suspense>
  );
}

EmojiPicker.Header = Header;
EmojiPicker.Input = Input;
EmojiPicker.Group = Group;
EmojiPicker.List = List;
EmojiPicker.Preview = Preview;
EmojiPicker.Content = Content;
EmojiPicker.SkinTone = SkinTone;

export const LazyEmojiPicker = EmojiPicker;

export { isCustomEmoji };
export type {
  CustomEmoji,
  CustomSection,
  EmojiMetadata,
  EmojiPickerHeaderProps,
  EmojiPickerInputProps,
  EmojiPickerGroupProps,
  EmojiPickerListProps,
  EmojiPickerPreviewProps,
  EmojiPickerProps,
  HeaderRendererProps,
};
