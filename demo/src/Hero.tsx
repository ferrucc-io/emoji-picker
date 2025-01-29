interface HeroProps {
  selectedEmoji: string;
}

export const Hero = ({ selectedEmoji }: HeroProps) => {
  return (
    <div className="flex items-start gap-4">
      <div className="flex items-center justify-center min-w-[60px] w-[60px] h-[60px]">
        <span className="text-6xl leading-none text-zinc-900 dark:text-zinc-50">{selectedEmoji}</span>
      </div>
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Emoji Picker
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-300 text-left">
          A fast, composable, unstyled emoji picker made with Tailwind &
          React
        </p>
      </div>
    </div>
  );
}
