interface Feature {
  icon: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: "🎨",
    title: "Unstyled & Composable",
    description: "Built with Tailwind CSS. Every component is minimally styled by default and fully customizable.",
  },
  {
    icon: "⚡️",
    title: "Fast & Lightweight",
    description: "Virtualized list for smooth scrolling. Only renders emojis in view. Doesn't require any external network requests.",
  },
  {
    icon: "🎯",
    title: "Accessible",
    description: "Full keyboard navigation support. ARIA labels and proper semantic markup.",
  },
  {
    icon: "🌈",
    title: "Dominant Color Hover",
    description: "Built-in dominant color hover for supported emojis.",
  },
];

export function Features() {
  return (
    <section className="w-full">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
        Features
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-zinc-50">
              {feature.icon} {feature.title}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-300">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
} 