function isEditableControl(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName;
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
    return true;
  }

  return (
    target.isContentEditable ||
    target.contentEditable === 'true' ||
    target.getAttribute('contenteditable') === 'true' ||
    target.getAttribute('contenteditable') === ''
  );
}

function isTextEditableControl(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName;
  if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
    return true;
  }

  return (
    target.isContentEditable ||
    target.contentEditable === 'true' ||
    target.getAttribute('contenteditable') === 'true' ||
    target.getAttribute('contenteditable') === ''
  );
}

export function shouldIgnoreKeyboardEvent(
  e: KeyboardEvent,
  rootElement?: HTMLElement | null
): boolean {
  const target = e.target;

  // Ignore all keys when focus is inside an editable control outside the picker root
  if (
    rootElement &&
    target instanceof Node &&
    target !== document &&
    target !== document.body &&
    target !== document.documentElement &&
    !rootElement.contains(target) &&
    isEditableControl(target)
  ) {
    return true;
  }

  // Never hijack Spacebar inside text fields (e.g. typing "thumbs up" in EmojiPicker.Input)
  if (e.key === ' ' && isTextEditableControl(target)) {
    return true;
  }

  return false;
}
