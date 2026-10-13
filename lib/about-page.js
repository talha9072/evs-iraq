import { getPageTable, getPageRows } from "@/lib/pages";
import { getLocations, getReviews } from "@/lib/branches";
import { getFooter } from "@/lib/footer";
import { getSections } from "@/lib/sections";
import { LOCALES } from "@/lib/locale";

/**
 * Everything the About page needs, shared by its two routes.
 *
 * `pages/about/index.js` serves the unprefixed locale and
 * `pages/[locale]/about/index.js` serves the rest - the same split as /branches, and
 * safe here because that route is TWO segments deep. The one-segment `[locale]` route
 * is the one that has to be careful about the brand rewrites; `/ar/about` collides
 * with nothing.
 *
 * WHY IT IS NOT IN AboutPage.js. That component is rendered in the browser too, so
 * anything it imports is bundled for the client. This module reaches for the Supabase
 * client - the same reason `lib/features.js` reads its env var directly instead of
 * importing `lib/branches`.
 */
export async function aboutProps(locale) {
  // A locale this deployment does not publish is a 404, not an empty build.
  if (!LOCALES.includes(locale)) return { notFound: true };

  const page = await getPageTable("about_page", locale);

  // Null when `about_page` has no published row for this locale. A page with no
  // words on it behind a 200 is the failure mode this project keeps closing.
  if (!page) return { notFound: true };

  const [tabs, locations, reviews, footer, sections] = await Promise.all([
    // The three tabs, one row each since 0070, ordered by the resolver's sort_order.
    getPageRows("about_tabs", locale),
    getLocations(locale, page.branch),
    getReviews(locale, page.branch),
    // Only for the graph's sameAs - the footer already assembles the accounts.
    getFooter(locale),
    getSections(locale),
  ]);

  return {
    props: {
      page,
      locale,
      tabs,
      locations,
      reviews,
      sections,
      social: footer.social,
      // The Litho scroll container fights this page the way it fights /branches:
      // it snaps sections and jumps to the bottom, leaving the hero as an empty
      // band. The page this replaces opted out and so does this one.
      useScrollContainer: false,
    },
    // Same hour as every other database-driven route. In practice an edit is live in
    // seconds via the revalidate webhook; the hour is the backstop.
    revalidate: 2592000,
  };
}
