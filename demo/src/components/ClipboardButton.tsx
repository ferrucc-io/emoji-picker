
import { useState } from 'react';

type ClipboardButtonVariant = "surface" | "code";

interface ClipboardButtonProps {
  text: string;
  /**
   * "surface" (default): theme-aware chip for normal light/dark surfaces.
   * "code": glass styling tuned for the always-dark Prism code block.
   */
  variant?: ClipboardButtonVariant;
}

const VARIANT_CLASSES: Record<ClipboardButtonVariant, { idle: string; copied: string }> = {
  surface: {
    idle: "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 ring-zinc-200 dark:ring-zinc-700",
    copied: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-500/30",
  },
  code: {
    idle: "bg-white/5 text-zinc-400 ring-white/10 hover:bg-white/10 hover:text-zinc-200 backdrop-blur-sm",
    copied: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30 backdrop-blur-sm",
  },
};

export const ClipboardButton = ({ text, variant = "surface" }: ClipboardButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const iconProps = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const classes = VARIANT_CLASSES[variant];

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className={`absolute right-2 top-2 text-xs px-2 py-1 rounded-md ring-1 transition-colors
        ${copied ? classes.copied : classes.idle}`}
    >
      {/* Both icons are stacked so they can crossfade/scale into one another */}
      <span className="relative block h-3 w-3">
        {/* Copy icon */}
        <svg
          {...iconProps}
          aria-hidden="true"
          className={`lucide lucide-copy absolute inset-0 h-3 w-3 transition-all duration-200 ease-out
            ${copied ? "scale-50 opacity-0" : "scale-100 opacity-100"}`}
        >
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>

        {/* Check icon */}
        <svg
          {...iconProps}
          aria-hidden="true"
          className={`lucide lucide-check absolute inset-0 h-3 w-3 transition-all duration-200 ease-out
            ${copied ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
    </button>
  );
};
