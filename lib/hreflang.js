import { LOCALES, DEFAULT_LOCALE, localePath } from "@/lib/locale";

/**
 * The hreflang set for a page - across the three country sites, where the page
 * genuinely exists on all three.
 *
 * WHAT WAS WRONG. Every page on every site declared three alternates, all of
 * them pointing at itself:
 *
 *     evsuae.com/services    en → evsuae.com/services   ar → evsuae.com/ar/services
 *     evsoman.com/services   en → evsoman.com/services  ar → evsoman.com/ar/services
 *     evsqtr.com/services    en → evsqtr.com/services   ar → evsqtr.com/ar/services
 *
 * Three domains, 138 near-identical English pages between them, and three plain
 * `en` declarations - nothing anywhere saying which site is for which country.
 * A search engine given that has no basis to serve the Omani page to an Omani
 * searcher, and the likeliest outcome is that the oldest and highest-authority
 * domain absorbs impressions that belong to the other two.
 *
 * `en-OM` says what `en` cannot. The country code is already on the branch row,
 * so this is derived rather than configured.
 *
 * ---------------------------------------------------------------------------
 * TWO THINGS MAKE THIS FRAGILE, AND BOTH ARE HANDLED HERE
 * ---------------------------------------------------------------------------
 *
 * 1. IT HAS TO BE RECIPROCAL. Every URL in a cluster must declare every other
 *    one, or the search engine discards the ENTIRE cluster - silently, with no
 *    error anywhere. That works here because all three sites are this codebase:
 *    each one builds the same set from the same `branches` rows, so they agree
 *    by construction rather than by anyone remembering to.
 *
 *    `scripts/verify/hreflang.mjs` fetches all three live sites and asserts it,
 *    because "agree by construction" is a claim worth checking.
 *
 * 2. THE PAGE HAS TO EXIST ON ALL THREE. Measured against the three live
 *    sitemaps:
 *
 *        on all three domains     276 URLs   (138 paths x 2 languages)
 *        only on evsuae.com       208        188 blog posts, 9 workshops, /sos
 *        only on evsoman.com       10          8 blog posts, 1 workshop
 *        only on evsqtr.com        16         14 blog posts, 1 workshop
 *
 *    Announcing `en-OM → evsoman.com/blog/some-uae-post` would announce a 404.
 *    `isShared()` below is what keeps those out.
 */

/**
 * Paths that belong to ONE country's site, so they are never clustered.
 *
 * A DENY-LIST, and the blast radius is what makes that the right shape. Getting
 * an entry wrong costs the annotation on those URLs alone - a search engine
 * drops a non-reciprocal cluster for the page it found it on, not for the site.
 * An allow-list would instead mean every page added from now on silently loses
 * its cluster until someone remembers this file, which is the more expensive
 * failure and the harder one to notice.
 *
 * Each entry is a fact about the DATA, not a preference:
 *
 *   blog/<slug>   a post is published to the countries its `countries` column
 *                 names (0077), and the three libraries barely overlap - 94
 *                 English posts on the UAE against 4 on Oman and 7 on Qatar.
 *                 `/blog` itself is NOT in here: the listing exists everywhere.
 *
 *   sos           UAE only. `hasSos()` in lib/features.js gates the route and
 *                 the other two 404 it.
 *
 *   evs-*         a workshop page - /evs-dubai, /evs-oman. Each belongs to one
 *                 country by definition. `locations/*` is the same page's
 *                 internal route, before next.config's rewrite.
 */
const BRANCH_SCOPED = [/^blog\/.+/, /^sos$/, /^evs-/, /^locations\//];

/** Is this page published by every country, or only by this one? */
export function isShared(path) {
  const clean = String(path ?? "").replace(/^\/+/, "");
  return !BRANCH_SCOPED.some((rule) => rule.test(clean));
}

/**
 * `[{ hrefLang, href }]` for one page - what SeoHead renders as
 * `<link rel="alternate">`.
 *
 * @param path      locale-less, no leading slash: "" | "services/mechanical"
 * @param branch    the branch row, carrying `country_code` and `siblings`
 * @param clustered false for a page that must stay on its own host - a
 *                  `noindex` page, or one this country alone publishes
 */
export function hreflangAlternates({ path, branch, clustered = true }) {
  const here = branch?.site_url?.replace(/\/$/, "") ?? "";

  /*
   * THE FALLBACK IS TODAY'S BEHAVIOUR, not an empty list.
   *
   * A page that is not shared still has an Arabic version on THIS site, and
   * that pairing was correct before this file existed. Reached by the workshop
   * pages, the blog posts, /sos, the 404 - and by any deployment whose branch
   * row somehow arrived without its siblings.
   */
  const sites = clustered && isShared(path) ? (branch?.siblings ?? []) : [];

  if (!sites.length) {
    return [
      ...LOCALES.map((code) => ({ hrefLang: code, href: `${here}${localePath(code, path)}` })),
      { hrefLang: "x-default", href: `${here}${localePath(DEFAULT_LOCALE, path)}` },
    ];
  }

  const alternates = [];

  for (const site of sites) {
    const origin = site.site_url.replace(/\/$/, "");
    const country = String(site.country_code ?? "").toUpperCase();

    for (const code of LOCALES) {
      /*
       * `<language>-<REGION>`, and the language half is the BASE.
       *
       * `ar-IQ` is a regional variant of Arabic in LOCALES - Iraq's own
       * wording - so its base is `ar` and pairing it with a region gives
       * `ar-IQ-IQ`, which is not a language tag at all. Splitting on the dash
       * keeps every entry to the two-subtag form a search engine parses.
       */
      const language = String(code).split("-")[0];

      alternates.push({
        hrefLang: country ? `${language}-${country}` : language,
        href: `${origin}${localePath(code, path)}`,
      });
    }
  }

  /*
   * x-default IS THE LOWEST sort_order, which is the UAE - the original site
   * and the one with the deepest catalogue. Read from the row rather than
   * written here, so the day the group reorders itself this follows.
   */
  const primary = sites[0];
  alternates.push({
    hrefLang: "x-default",
    href: `${primary.site_url.replace(/\/$/, "")}${localePath(DEFAULT_LOCALE, path)}`,
  });

  return alternates;
}
