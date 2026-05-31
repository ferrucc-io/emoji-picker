import { useEffect } from "react";

export interface SeoProps {
  title: string;
  description: string;
  canonical: string;
  /** Open Graph type, e.g. "website" or "article". */
  ogType?: string;
  /** JSON-LD objects to inject as <script type="application/ld+json">. */
  jsonLd?: unknown[];
}

function upsertMeta(
  attr: "name" | "property",
  key: string,
  content: string,
): void {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Client-side <head> manager for a route. The static, prerendered HTML already
 * carries these tags for non-JS crawlers; this keeps them correct during SPA
 * navigation between routes.
 */
export function Seo({
  title,
  description,
  canonical,
  ogType = "article",
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    document.title = title;
    upsertMeta("name", "description", description);
    upsertCanonical(canonical);

    upsertMeta("property", "og:type", ogType);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);

    const scriptId = "route-jsonld";
    document.getElementById(scriptId)?.remove();
    if (jsonLd && jsonLd.length > 0) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [title, description, canonical, ogType, jsonLd]);

  return null;
}
