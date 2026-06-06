import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import App from "./App";
import { ComparisonArticle } from "./articles/ComparisonArticle";
import { Seo } from "./seo/Seo";
import { buildComparisonJsonLd, comparisonMeta } from "./seo/comparisonMeta";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: App,
});

function ComparisonPage() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-zinc-950">
      <Seo
        title={comparisonMeta.title}
        description={comparisonMeta.description}
        canonical={comparisonMeta.url}
        ogType="article"
        jsonLd={buildComparisonJsonLd()}
      />
      <ComparisonArticle />
    </div>
  );
}

const comparisonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: comparisonMeta.path,
  component: ComparisonPage,
});

const routeTree = rootRoute.addChildren([indexRoute, comparisonRoute]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
