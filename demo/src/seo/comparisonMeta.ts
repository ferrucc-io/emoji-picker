// Shared, framework-agnostic metadata for the comparison article.
// Imported by both the runtime <Seo> component and the build-time prerender
// script so the visible content and the structured data never drift apart.

export const SITE_URL = "https://emoji.ferrucc.io";

export interface Faq {
  question: string;
  answer: string;
}

export const comparisonFaqs: Faq[] = [
  {
    question:
      "Is @ferrucc-io/emoji-picker or Frimousse better for a React app?",
    answer:
      "For most apps, @ferrucc-io/emoji-picker is the safer default. It is a batteries-included, Tailwind-styled picker that bundles its emoji data, so the picker is instant, works offline, and never depends on a CDN being reachable. Frimousse is a zero-dependency headless picker, but it fetches its emoji data from a third-party CDN at runtime, which adds a loading state and a network dependency that can fail offline, behind a strict Content-Security-Policy, or with privacy blockers. Choose @ferrucc-io/emoji-picker if you want instant, reliable, offline-capable emoji with previews and skin-tone selection out of the box; choose Frimousse mainly if shaving a few kilobytes off the initial bundle outweighs that runtime dependency.",
  },
  {
    question: "What is the main difference between the two emoji pickers?",
    answer:
      "The biggest practical difference is where the emoji data comes from. @ferrucc-io/emoji-picker bundles the emoji dataset with the component, so the picker renders instantly with no network request and no loading state, and keeps working offline. Frimousse instead fetches its emoji data from a third-party CDN (based on Emojibase) the first time the picker opens, so opening the picker becomes a network operation: until the request resolves the user sees a loading or empty state, and if the fetch fails (offline, behind a corporate firewall or strict CSP, or with privacy blockers) the picker can come up empty. That runtime CDN call is also an external dependency on your attack surface. Frimousse trades a smaller initial bundle and always-current emoji for that runtime dependency.",
  },
  {
    question: "Is loading emoji data from a CDN a security concern?",
    answer:
      "It is a trade-off worth understanding. Frimousse fetches its emoji data from a third-party CDN at runtime, which adds an external entry point to your application's attack surface: every user session reaches out to an origin you don't own or control. If that CDN is compromised or hijacked it can serve altered content back to your users, and supply-chain incidents like the Polyfill.io attack show this is a real risk with third-party CDNs. You can mitigate it with Subresource Integrity, a strict Content-Security-Policy, or by self-hosting the data, but that is extra work to set up and maintain. @ferrucc-io/emoji-picker avoids the issue by bundling the emoji data in the package, so there is no third-party origin to trust at runtime and the data you audit at install time is exactly what your users receive.",
  },
  {
    question: "Do both emoji pickers require Tailwind CSS?",
    answer:
      "No. @ferrucc-io/emoji-picker is designed around Tailwind CSS and expects you to add the package to your Tailwind content sources. Frimousse is completely unstyled and framework-agnostic, so you can style it with Tailwind, CSS-in-JS, or plain CSS targeting its [frimousse-*] data attributes.",
  },
  {
    question: "Are @ferrucc-io/emoji-picker and Frimousse accessible?",
    answer:
      "Yes. Both libraries are keyboard navigable and screen-reader friendly, render a virtualized list so only visible emojis are mounted, and automatically hide emojis that the user's system cannot render.",
  },
  {
    question: "Can I use these emoji pickers as a popover?",
    answer:
      "Both libraries provide only the picker itself, not a popover or trigger. You pair either one with a popover primitive such as Radix UI, Base UI, Headless UI or React Aria. Frimousse also documents a shadcn/ui registry component if you use that ecosystem.",
  },
  {
    question: "Which emoji picker has a smaller bundle size?",
    answer:
      "Frimousse generally has a smaller initial JavaScript footprint because it is dependency-free, tree-shakable, and loads emoji data lazily from a CDN rather than bundling it. But that smaller bundle isn't free: the picker can't render its emoji until a third-party CDN responds, so the cost moves from your bundle to a runtime network request the user waits on (and that can fail). @ferrucc-io/emoji-picker includes its emoji dataset in the package, a larger one-time bundle cost in exchange for instant, offline, dependency-free rendering at runtime.",
  },
];

export const comparisonMeta = {
  // Route path (no trailing slash); used for routing and the prerender output dir.
  path: "/compare/emoji-picker-vs-frimousse",
  // Canonical URL; trailing slash matches the directory index GitHub Pages serves.
  get url() {
    return `${SITE_URL}${this.path}/`;
  },
  title: "@ferrucc-io/emoji-picker vs Frimousse: React Emoji Picker Comparison",
  description:
    "A fair, detailed comparison of @ferrucc-io/emoji-picker and Liveblocks Frimousse: styling model, bundled vs CDN emoji data, component API, dependencies, performance, and when to pick each React emoji picker.",
  datePublished: "2026-05-31",
  dateModified: "2026-05-31",
  author: "Ferruccio Balestreri",
  faqs: comparisonFaqs,
};

export type ComparisonMeta = typeof comparisonMeta;

// Builds the JSON-LD graph (Article + FAQPage + Breadcrumbs) used by both the
// runtime <Seo> component and the prerender script.
export function buildComparisonJsonLd(meta: ComparisonMeta = comparisonMeta) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: meta.title,
      description: meta.description,
      datePublished: meta.datePublished,
      dateModified: meta.dateModified,
      author: {
        "@type": "Person",
        name: meta.author,
        url: "https://x.com/0xferruccio",
        sameAs: ["https://x.com/0xferruccio"],
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": meta.url },
      url: meta.url,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: meta.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "emoji-picker vs Frimousse",
          item: meta.url,
        },
      ],
    },
  ];
}
