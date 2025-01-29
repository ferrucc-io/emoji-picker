export type VariantType = "default" | "linear" | "slack";

export interface PlaygroundProps {
  code: Record<VariantType, string>;
  onEmojiSelect: (emoji: string) => void;
}
