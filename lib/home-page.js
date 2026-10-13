import { getPageTable, getPageRows } from "@/lib/pages";
import { getLocations, getReviews } from "@/lib/branches";
import { getFooter } from "@/lib/footer";
import { getSections } from "@/lib/sections";
import { getServicesTree } from "@/lib/services";
import { getBlogPage } from "@/lib/blog-posts";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/locale";

/**
 * Everything the home page needs, shared by its two routes.
 *
 * `pages/index.js` serves the unprefixed locale and `pages/[locale]/index.js` serves
 * the rest. Both need the identical five queries, so they live here rather than in
 * two copies that drift.
 *
 * SERVER-RENDERED, NOT STATIC. This page was `getStaticProps` with `revalidate: 2592000`,
 * so a content edit took up to an hour to appear. The alternative was an on-demand
 * revalidation webhook - built, measured at five seconds end to end, and removed again
 * because it needed a Supabase integration installed, one webhook per table, a shared
 * secret on every deployment and a fan-out between countries.
 *
 * Reading the rows per request needs none of that and cannot be stale: what a visitor
 * gets is the row as it is now. The cost is real and worth stating - a page view is a
 * function invocation and five queries instead of a file from the CDN - and
 * `lib/cache.js` still collapses one render's concurrent reads, so it is five queries
 * per RENDER, not per component.
 *
 * WHY IT IS NOT IN HomePage.js. That component is rendered in the browser too, so
 * anything it imports is bundled for the client. This module reaches for the Supabase
 * client - the same reason `lib/features.js` reads its env var directly instead of
 * importing `lib/branches`.
 */
/**
 * The prefixed home pages - /ar, /bn, /ar-IQ - one thin route file each.
 *
 * THIS USED TO BE ONE `pages/[locale]/index.js`, WHICH WAS NICER AND WRONG.
 *
 * A single-segment dynamic route matches ANY one-segment URL. On the server that was
 * handled: `getStaticPaths` listed only the published locales, `fallback: false` made
 * /rox unmatched, and the fallback rewrite in next.config.mjs then sent it to
 * pages/ev-car-brands/[brand]. Verified at the time - every brand and workshop URL
 * answered 200 with the right HTML.
 *
 * THE CLIENT ROUTER HAS NO SUCH FILTER. It pattern-matches the URL against the route
 * table, and `/[locale]` matches `/rox` because nothing in the browser knows that
 * "rox" is not a locale. So the server sent BrandPage's HTML and its props, and
 * hydration rendered HomePage over them. Measured directly in a production build:
 *
 *   __NEXT_DATA__.page  /ev-car-brands/[brand]     <- the server was right
 *   router.pathname     /[locale]                  <- the client was not
 *
 * HomePage then read `page.branch` off a brand row, got undefined, and `branchTokens`
 * threw on `branch.country_name` - so all 26 brand and 11 workshop URLs painted
 * correctly and then went blank with "Application error: a client-side exception has
 * occurred". The two-segment vanity URLs (/rox/rox-01) were never affected: no
 * one-segment route can match them.
 *
 * Naming the locales removes the pattern, so there is nothing left for /rox to
 * collide with. It costs one four-line file per language, which is the trade the
 * comment on the old route already described.
 *
 * NOTHING ELSE IN `pages/[locale]/` CHANGES. /[locale]/about and the rest carry a
 * literal second segment, so they cannot swallow a one-segment URL. Only the bare
 * route was the problem, and `scripts/verify/crawl.mjs` now fails the build if a
 * one-segment dynamic route reappears.
 */
export async function localeHomeProps(locale) {
  /*
   * The unprefixed language must NOT also answer on its prefix, or `/` and `/bn`
   * would be the same page at two URLs. `pages/[locale]/index.js` guarded this with
   * `if (params.locale === DEFAULT_LOCALE) return notFound` and the guard was lost
   * when the route was split into named files.
   *
   * It cannot fire today, because `DEFAULT_LOCALE` is `en` on every deployment and
   * there is no `pages/en/`. It fires the moment one is configured the other way -
   * NEXT_PUBLIC_LOCALES=bn,en for Bangladesh - which is exactly the change §10 is
   * waiting on.
   */
  if (locale === DEFAULT_LOCALE) return { notFound: true };

  const result = await homeProps(locale);
  // homeProps is written for the server-rendered unprefixed route, so it carries no
  // revalidate of its own.
  return result.notFound ? result : { ...result, revalidate: 2592000 };
}

export async function homeProps(locale) {
  // A locale this deployment does not publish is a 404. With no getStaticPaths to
  // filter them first this is the ONLY guard - and it is what lets /tesla fall through
  // to the brand rewrite instead of rendering a home page for the "locale" tesla.
  if (!LOCALES.includes(locale)) return { notFound: true };

  const page = await getPageTable("home_page", locale);

  // Null when `home_page` has no published row for this locale. A page with no
  // words on it behind a 200 is the failure mode this project keeps closing.
  if (!page) return { notFound: true };

  const [locations, reviews, footer, sections, panels, tree, blog] = await Promise.all([
    getLocations(locale, page.branch),
    getReviews(locale, page.branch),
    // Only for the Organization graph's sameAs - the sister sites and the social
    // accounts, which the footer already assembles.
    getFooter(locale),
    // Our Branches, the counters and Customer Reviews - shared with ten other
    // routes, so one row rather than a copy in this page's table.
    getSections(locale),
    // The three showcase panels, one row each since 0066. Ordered by the resolver
    // on sort_order, so a fourth panel is an INSERT and nothing here changes.
    getPageRows("home_panels", locale),
    // The five service categories, for the block above the blog feed. The tree
    // is `cached()` per locale and every services route already asks for it, so
    // this is a map lookup rather than a sixth query on a warm process.
    getServicesTree(locale),
    // Page one of the blog grid, four rows, filtered to this branch in SQL.
    // In this Promise.all rather than after it: it depends on nothing above.
    getBlogPage(locale, 1),
  ]);

  /* Only the fields the cards print. The whole tree is ~124 KB and carries every
     leaf service's copy, FAQs and meta tags - shipping that inside
     __NEXT_DATA__ to render five links is the exact bloat lib/services.js
     already trims for the category pages. */
  /* The block's heading is the services hub's own row - `hero.name` is
     "Electric Vehicle Services" today - so it is editable in the database and
     already translated, rather than a string invented in JSX. */
  const servicesHeading = tree?.hero?.name ?? null;

  const services = (tree?.categories ?? []).map((c) => ({
    id: c.id,
    href: c.href,
    name: c.name,
    tagline: c.showcase_tagline ?? c.card_description ?? null,
    image: c.showcase_bg_url ?? null,
    icon: c.iconUrl ?? null,
    // The card's own "View all X services" wording, a row per category. The
    // trim did not carry it, so the home page's cards had no way in.
    ctaLabel: c.showcase_cta_label ?? null,
  }));

  return {
    props: {
      page,
      locale,
      panels,
      services,
      servicesHeading,
      locations,
      reviews,
      sections,
      network: footer.network,
      social: footer.social,
      blog,
      // public/js/blog.js is gone from this page. It fetched the whole of
      // /blogs.xml after load to show four cards; the grid is server-rendered
      // now and pages through /api/blog-posts. See lib/blog-posts.js.
      extraScripts: [],
    },
  };
}
