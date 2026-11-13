import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { getEmojiDetails } from '../utils/getEmojiDetails';
import { isEmojiFullySupported } from '../utils/emojiSupport';
import { applySkinTone } from '../utils/applySkinTone';
import { cn } from '../utils/cn';

import type {
  CustomEmoji,
  CustomSection,
  EmojiDetails,
  EmojiLocaleData,
  SkinTone,
} from '../types/emoji';

export interface EmojiProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  emoji: string;
  skinTone?: SkinTone;
  size?: number | string;
  customEmojis?: CustomEmoji[];
  customSections?: CustomSection[];
  localeData?: EmojiLocaleData;
  fallback?: React.ReactNode | ((emoji: string, details?: EmojiDetails) => React.ReactNode);
  checkSupport?: boolean;
}

const PICTOGRAPHIC_REGEX = /\p{Extended_Pictographic}/u;

export const Emoji = forwardRef<HTMLSpanElement, EmojiProps>(
  (
    {
      emoji,
      skinTone,
      size,
      customEmojis,
      customSections,
      localeData,
      fallback,
      checkSupport = false,
      className,
      style,
      'aria-label': ariaLabelProp,
      ...restProps
    },
    ref
  ) => {
    const details = useMemo(
      () =>
        getEmojiDetails(emoji, {
          customEmojis,
          customSections,
          localeData,
        }),
      [emoji, customEmojis, customSections, localeData]
    );

    const [imageError, setImageError] = useState(false);
    const [isSupported, setIsSupported] = useState(true);

    useEffect(() => {
      setImageError(false);
    }, [details?.imageUrl, emoji]);

    const renderedEmoji = useMemo(() => {
      if (!details || details.isCustom) {
        return emoji;
      }

      if (skinTone !== undefined && details.skinToneSupport) {
        return applySkinTone(
          {
            emoji: details.baseEmoji,
            name: details.name,
            slug: details.slug,
            skin_tone_support: details.skinToneSupport,
          },
          skinTone
        ).emoji;
      }

      return details.emoji;
    }, [details, emoji, skinTone]);

    useEffect(() => {
      if (!checkSupport || details?.isCustom) {
        setIsSupported(true);
        return;
      }

      if (details) {
        setIsSupported(
          isEmojiFullySupported(
            {
              emoji: renderedEmoji,
              name: details.name,
              slug: details.slug,
              unicode_version: details.unicodeVersion,
              emoji_version: details.emojiVersion,
              skin_tone_support: details.skinToneSupport,
            },
            renderedEmoji
          )
        );
      } else {
        setIsSupported(isEmojiFullySupported({ emoji: renderedEmoji }, renderedEmoji));
      }
    }, [checkSupport, details, renderedEmoji]);

    const resolvedSize = typeof size === 'number' ? `${size}px` : size;
    const accessibleLabel = ariaLabelProp ?? details?.name ?? emoji;

    const renderFallbackNode = () => {
      if (fallback !== undefined) {
        return <>{typeof fallback === 'function' ? fallback(emoji, details) : fallback}</>;
      }

      return (
        <span
          {...restProps}
          ref={ref}
          role="img"
          aria-label={accessibleLabel}
          className={className}
          style={{
            ...(resolvedSize ? { fontSize: resolvedSize, lineHeight: 1 } : {}),
            ...style,
          }}
        >
          {details?.shortcode ?? emoji}
        </span>
      );
    };

    // Unknown shortcode / non-pictographic string
    if (!details && (!emoji || !PICTOGRAPHIC_REGEX.test(emoji))) {
      return renderFallbackNode();
    }

    // Custom emoji image
    if (details?.isCustom && details.imageUrl) {
      if (imageError) {
        return renderFallbackNode();
      }

      const numericSize = typeof size === 'number' ? size : undefined;

      return (
        <span
          {...restProps}
          ref={ref}
          role="img"
          aria-label={accessibleLabel}
          className={cn('inline-flex items-center justify-center align-middle', className)}
          style={{
            ...(resolvedSize ? { width: resolvedSize, height: resolvedSize } : {}),
            ...style,
          }}
        >
          <img
            src={details.imageUrl}
            alt={details.name}
            width={numericSize}
            height={numericSize}
            className="object-contain inline-block"
            style={
              resolvedSize
                ? { width: resolvedSize, height: resolvedSize }
                : { width: '1em', height: '1em' }
            }
            onError={() => setImageError(true)}
          />
        </span>
      );
    }

    // Unsupported Unicode emoji detected on client after hydration
    if (checkSupport && !isSupported) {
      return renderFallbackNode();
    }

    return (
      <span
        {...restProps}
        ref={ref}
        role="img"
        aria-label={accessibleLabel}
        className={className}
        style={{
          ...(resolvedSize ? { fontSize: resolvedSize, lineHeight: 1 } : {}),
          ...style,
        }}
      >
        {renderedEmoji}
      </span>
    );
  }
);

Emoji.displayName = 'Emoji';
