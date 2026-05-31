import { comparisonFaqs } from "../seo/comparisonMeta";

const link =
  "text-blue-600 dark:text-blue-400 hover:underline underline-offset-2";
const h2 =
  "text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mt-12 mb-4 scroll-mt-20";
const p = "text-[15px] leading-7 text-zinc-700 dark:text-zinc-300 mb-4";
const codeBlock =
  "block w-full overflow-x-auto rounded-lg bg-zinc-900 text-zinc-100 dark:bg-black/60 p-4 text-[13px] leading-6 font-mono my-4";

/**
 * Pure, presentational comparison article. Contains no hooks or browser APIs
 * so it can be rendered to static HTML at build time (see scripts/prerender.ts)
 * as well as mounted by the SPA router.
 */
export function ComparisonArticle() {
  return (
    <article className="font-['Lato'] w-full max-w-2xl mx-auto px-4 pb-24 pt-8">
      <nav
        aria-label="Breadcrumb"
        className="text-sm text-zinc-500 dark:text-zinc-400 mb-6"
      >
        <a href="/" className={link}>
          Home
        </a>
        <span className="mx-2">/</span>
        <span className="text-zinc-700 dark:text-zinc-300">
          emoji-picker vs Frimousse
        </span>
      </nav>

      <header>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
          @ferrucc-io/emoji-picker vs Frimousse: choosing a React emoji picker
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
          A practical, side-by-side comparison of two modern, composable React
          emoji pickers.
        </p>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 italic border-l-2 border-zinc-200 dark:border-zinc-800 pl-3 mb-8">
          Disclosure: this comparison is written by{" "}
          <a
            href="https://x.com/0xferruccio"
            className={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ferruccio Balestreri
          </a>
          , the maintainer of{" "}
          <a
            href="https://github.com/ferrucc-io/emoji-picker"
            className={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            @ferrucc-io/emoji-picker
          </a>
          . It's an honest look at the trade-offs, including where Frimousse
          fits, but I'll be upfront that, for most apps, I think shipping the
          emoji data beats depending on a CDN at runtime.
        </p>
      </header>

      <p className={p}>
        Both{" "}
        <a
          href="https://github.com/ferrucc-io/emoji-picker"
          className={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          @ferrucc-io/emoji-picker
        </a>{" "}
        and{" "}
        <a
          href="https://github.com/liveblocks/frimousse"
          className={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Frimousse
        </a>{" "}
        (by Liveblocks) are lightweight, composable, accessible emoji pickers
        for React. They both render a virtualized list, support keyboard
        navigation and screen readers, and automatically hide emojis a user's
        device can't display. If you've outgrown a heavier, all-in-one picker
        and want something you can fully restyle, either is a strong choice. The
        differences are in <strong>philosophy</strong>: how they're styled,
        where their emoji data comes from, and how much they include out of the
        box.
      </p>

      <h2 className={h2}>TL;DR</h2>
      <div className="overflow-x-auto my-4">
        <table className="w-full text-left text-[14px] border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="py-2 pr-4 font-semibold text-zinc-900 dark:text-zinc-50">
                &nbsp;
              </th>
              <th className="py-2 pr-4 font-semibold text-zinc-900 dark:text-zinc-50">
                @ferrucc-io/emoji-picker
              </th>
              <th className="py-2 font-semibold text-zinc-900 dark:text-zinc-50">
                Frimousse
              </th>
            </tr>
          </thead>
          <tbody className="text-zinc-700 dark:text-zinc-300">
            {[
              [
                "Styling",
                "Tailwind CSS, minimally styled",
                "Headless / unstyled, any CSS",
              ],
              [
                "Emoji data",
                "Bundled, instant & deterministic",
                "Fetched from a third-party CDN at runtime",
              ],
              [
                "Works offline",
                "Yes, always",
                "No, needs a network request first",
              ],
              [
                "Loading state",
                "None; emojis render immediately",
                "Loading / Empty states while it fetches",
              ],
              [
                "Runtime trust surface",
                "Self-contained, no external origin",
                "Trusts a third-party CDN at runtime",
              ],
              ["Dependencies", "Tailwind CSS as a peer", "Zero dependencies"],
              [
                "Batteries",
                "Preview, skin tones, color hover",
                "Minimal primitives, you compose",
              ],
              [
                "Initial bundle",
                "Larger (includes emoji data)",
                "Smaller, tree-shakable",
              ],
              [
                "Emoji freshness",
                "Pinned to the version you ship",
                "Always current via CDN",
              ],
              ["React support", "React ≥0.14", "React 18 & 19"],
              ["License", "MIT", "MIT"],
            ].map(([feature, a, b]) => (
              <tr
                key={feature}
                className="border-b border-zinc-100 dark:border-zinc-900 align-top"
              >
                <td className="py-2 pr-4 font-medium text-zinc-900 dark:text-zinc-100">
                  {feature}
                </td>
                <td className="py-2 pr-4">{a}</td>
                <td className="py-2">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className={h2}>Styling: Tailwind-first vs fully headless</h2>
      <p className={p}>
        <strong>@ferrucc-io/emoji-picker</strong> is built around Tailwind CSS.
        Every part ships minimally styled, and you customize it by passing
        Tailwind utility classes to the compound components. The README shows
        Linear- and Slack-style pickers built purely by changing classes. The
        trade-off is that you add the package to your Tailwind content sources,
        so Tailwind is effectively a requirement.
      </p>
      <p className={p}>
        <strong>Frimousse</strong> goes a step further and ships completely
        unstyled. Each part exposes <code>[frimousse-*]</code> data attributes,
        and you bring whatever styling layer you like: Tailwind, CSS-in-JS, or
        plain CSS. This makes it framework-agnostic on the styling side and a
        natural fit if you're <em>not</em> on Tailwind, or if you want to drop
        it into a design system like shadcn/ui.
      </p>
      <p className={p}>
        In short: if Tailwind is already your styling language, emoji-picker
        gives you a head start with sensible defaults; if you want zero styling
        assumptions, Frimousse is the more neutral primitive.
      </p>

      <h2 className={h2}>Emoji data: bundled vs fetched from a CDN</h2>
      <p className={p}>
        This is the most consequential difference between the two.
      </p>
      <p className={p}>
        <strong>@ferrucc-io/emoji-picker</strong> bundles its emoji dataset with
        the component. There is no network request and no loading state. The
        picker works fully offline and renders instantly, every time, for every
        user. Because the data is local, nothing leaves your app: there's no
        third-party request for a corporate firewall, a strict{" "}
        <abbr title="Content-Security-Policy">CSP</abbr>, or a privacy and ad
        blocker to break, and nothing that can slow down or fail when a user
        first opens the picker. Its <code>maxUnicodeVersion</code> prop (Unicode
        16.0 by default) lets you cap which emoji are shown so nothing renders
        as a “tofu” box on older systems.
      </p>
      <p className={p}>
        <strong>Frimousse</strong> takes the opposite approach: the emoji data
        isn't in the package at all. The first time a user opens the picker,
        Frimousse has to <strong>fetch the dataset</strong> (based on{" "}
        <a
          href="https://emojibase.dev/"
          className={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Emojibase
        </a>
        ) from a third-party CDN before it can show anything. That keeps the
        initial JavaScript bundle small and the emoji set current, but it turns
        opening an emoji picker into a network operation. Until that request
        resolves, the user stares at the <code>Loading</code> or{" "}
        <code>Empty</code> state you're required to render. And that request can
        fail or stall outright: on a flaky connection, fully offline, behind a
        locked-down corporate network or strict{" "}
        <abbr title="Content-Security-Policy">CSP</abbr>, or with privacy and
        ad-blocking extensions, the fetch may never complete and the picker can
        come up empty. You're also betting on an external service's uptime and
        reachability, and you don't control when the underlying data changes
        beneath you.
      </p>
      <p className={p}>
        <strong>There's a security dimension to this, too.</strong> Loading data
        from a third-party CDN at runtime adds an external entry point to your
        application's attack surface: every user session reaches out to an
        origin you don't own or control. If that CDN is ever compromised,
        hijacked, or has its content tampered with, it can serve whatever it
        wants back to your users, on your domain, under your app's name, and you
        are trusting it not to. This is not hypothetical. Supply-chain attacks
        on previously-trusted CDNs are a recurring, real-world problem; the{" "}
        <a
          href="https://en.wikipedia.org/wiki/Polyfill.io"
          className={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Polyfill.io incident
        </a>{" "}
        saw a widely-used CDN start pushing malicious payloads to hundreds of
        thousands of sites overnight. You can defend against it with Subresource
        Integrity, a strict CSP, or by self-hosting the data, but that is extra
        security work you take on and have to keep maintaining. Bundling the
        emoji data removes the third party from the equation entirely: there is
        no external origin to trust, no extra endpoint for an attacker to
        target, and the data you audit at install time is exactly the data your
        users receive.
      </p>
      <p className={p}>
        For something as small and ubiquitous as an emoji picker, paying a
        network round-trip, inheriting an external point of failure, and opening
        a new attack surface whenever the cache isn't warm is a real, recurring
        cost. <strong>@ferrucc-io/emoji-picker sidesteps all of it:</strong> the
        emojis are already there, so the picker is instant, works offline, and
        behaves identically for every user regardless of network conditions, CSP
        or privacy tooling. The trade-off is a larger package and bumping a
        dependency to refresh emoji, a predictable, one-time cost most apps will
        happily take over a permanent runtime dependency on a CDN. Unless a few
        kilobytes of bundle are genuinely your tightest constraint, shipping the
        data is the safer default.
      </p>

      <h2 className={h2}>API &amp; composition</h2>
      <p className={p}>
        Both use a compound-component pattern. emoji-picker leans
        batteries-included with parts like <code>Header</code>,{" "}
        <code>Preview</code>, <code>SkinTone</code> and <code>Content</code>:
      </p>
      <pre className={codeBlock}>
        <code>{`import { EmojiPicker } from "@ferrucc-io/emoji-picker";

<EmojiPicker onEmojiSelect={handleEmojiSelect}>
  <EmojiPicker.Header>
    <EmojiPicker.Input placeholder="Search emoji" />
  </EmojiPicker.Header>
  <EmojiPicker.Group>
    <EmojiPicker.List />
  </EmojiPicker.Group>
</EmojiPicker>`}</code>
      </pre>
      <p className={p}>
        Frimousse exposes a leaner set of primitives (<code>Root</code>,{" "}
        <code>Search</code>, <code>Viewport</code>, <code>List</code>) plus the
        async <code>Loading</code> and <code>Empty</code> slots:
      </p>
      <pre className={codeBlock}>
        <code>{`import { EmojiPicker } from "frimousse";

<EmojiPicker.Root>
  <EmojiPicker.Search />
  <EmojiPicker.Viewport>
    <EmojiPicker.Loading>Loading…</EmojiPicker.Loading>
    <EmojiPicker.Empty>No emoji found.</EmojiPicker.Empty>
    <EmojiPicker.List />
  </EmojiPicker.Viewport>
</EmojiPicker.Root>`}</code>
      </pre>
      <p className={p}>
        The practical takeaway: emoji-picker gives you more finished pieces (a
        built-in preview row, skin-tone selector, and dominant-color hover
        feedback) so you assemble less; Frimousse gives you fewer, smaller
        primitives so you compose more, with nothing to override.
      </p>

      <h2 className={h2}>Dependencies, bundle size &amp; performance</h2>
      <p className={p}>
        Frimousse markets itself as dependency-free, tree-shakable, and
        virtualized with minimal re-renders, and because it loads emoji data
        lazily its initial footprint is small. emoji-picker is also virtualized
        and self-contained at runtime (no CDN), but it ships the emoji dataset,
        so its footprint is larger by design and it lists Tailwind as a peer.
      </p>
      <p className={p}>
        Both render only the visible rows of emoji, so scrolling performance is
        comparable. The bundle-size question really comes back to the data
        decision above: you either pay for the dataset once in your bundle
        (emoji-picker) or pay for it over and over as a runtime network fetch
        plus an external point of failure (Frimousse). A smaller bundle that
        can't render until a CDN responds isn't free; it just moves the cost
        somewhere the user feels it.
      </p>

      <h2 className={h2}>Ecosystem &amp; framework support</h2>
      <p className={p}>
        Frimousse targets React 18 and 19 and documents integrations such as a
        shadcn/ui registry component and pairing with popover libraries. It's
        maintained by Liveblocks. @ferrucc-io/emoji-picker supports a very wide
        React peer range, is used in production by teams like June, Langfuse and
        Typefully, and is maintained by{" "}
        <a
          href="https://x.com/0xferruccio"
          className={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ferruccio Balestreri
        </a>
        . Neither ships a popover, so you pair either with{" "}
        <a
          href="https://www.radix-ui.com/primitives/docs/components/popover"
          className={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Radix UI
        </a>
        ,{" "}
        <a
          href="https://base-ui.com/components/react-popover"
          className={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Base UI
        </a>
        ,{" "}
        <a
          href="https://headlessui.com/react/popover"
          className={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Headless UI
        </a>{" "}
        or React Aria.
      </p>

      <h2 className={h2}>When to choose which</h2>
      <div className="grid md:grid-cols-2 gap-4 my-4">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
            Choose @ferrucc-io/emoji-picker if…
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-[14px] text-zinc-700 dark:text-zinc-300">
            <li>You already use Tailwind CSS.</li>
            <li>You want offline support and zero network requests.</li>
            <li>You want instant render with no loading flash.</li>
            <li>
              You want built-in previews, skin-tone selection and color hover.
            </li>
            <li>You want to pin the exact emoji set you ship.</li>
            <li>
              You'd rather not add a third-party CDN to your security attack
              surface.
            </li>
          </ul>
        </div>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
            Choose Frimousse if…
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-[14px] text-zinc-700 dark:text-zinc-300">
            <li>You want zero dependencies and no Tailwind requirement.</li>
            <li>You want the smallest possible initial bundle.</li>
            <li>You want always-current emoji without shipping updates.</li>
            <li>You style with non-Tailwind CSS or a design system.</li>
            <li>You use shadcn/ui and want a registry component.</li>
          </ul>
        </div>
      </div>

      <h2 className={h2}>Installation</h2>
      <pre className={codeBlock}>
        <code>{`# Tailwind-styled, bundled emoji data
npm i @ferrucc-io/emoji-picker

# Headless, CDN-loaded emoji data
npm i frimousse`}</code>
      </pre>

      <h2 className={h2}>Frequently asked questions</h2>
      <div className="space-y-6 my-4">
        {comparisonFaqs.map((faq) => (
          <div key={faq.question}>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              {faq.question}
            </h3>
            <p className="mt-2 text-[15px] leading-7 text-zinc-600 dark:text-zinc-300">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
        <a href="/" className={link}>
          ← Try @ferrucc-io/emoji-picker
        </a>
        <a
          href="https://github.com/ferrucc-io/emoji-picker"
          className={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          emoji-picker on GitHub
        </a>
        <a
          href="https://github.com/liveblocks/frimousse"
          className={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Frimousse on GitHub
        </a>
      </div>
    </article>
  );
}
