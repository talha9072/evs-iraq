/**
 * Which routes have been redesigned.
 *
 * THE PROBLEM THIS SOLVES. Tailwind and the legacy Crafto stack cannot share a
 * page. They collide on class names that mean different things in each —
 * `.container`, `.btn`, `.border`, `.rounded`, `.block`, `.flex`, `.hidden`,
 * `.text-center` and several dozen more are defined by Bootstrap inside
 * `vendors.min.css` and by Tailwind at build time. Whichever loads last wins,
 * and the answer differs per property. Prefixing every Tailwind class (`tw:`)
 * would avoid it at the cost of putting a prefix on every class in every new
 * component, permanently.
 *
 * So the two never coexist. A route is either legacy or redesigned:
 *
 *   legacy      1.2 MB of Crafto CSS + jQuery + main.js.  Untouched.
 *   redesigned  Tailwind only. No Bootstrap, no Crafto, no jQuery, no
 *               icon fonts, no Swiper. Roughly 25 KB of CSS instead of 1215 KB.
 *
 * `_document.js` reads this to decide which stylesheets to emit, and `_app.js`
 * reads it to decide which header and footer to render and whether to load the
 * legacy scripts. Both are given the ROUTE PATTERN, not the URL — that is what
 * Next hands them, and it is locale-independent by construction:
 * `/[locale]/about` covers /ar/about, /ar-IQ/about and /bn/about in one entry.
 *
 * ADDING A ROUTE. Redesign the page, then add its pattern here. Nothing else
 * moves. Removing an entry rolls the page back to legacy, which is the escape
 * hatch if a redesign has to be reverted in a hurry.
 *
 * The home page is the one exception to the pattern rule: `/ar` is its own file
 * rather than `/[locale]`, because a one-segment dynamic route also matches
 * /rox and /evs-qatar in the client router. See pages/ar/index.js.
 */
export const MODERN_ROUTES = new Set([
  /*
   * Home. `/[locale]/home` covers every prefixed language at once.
   *
   * THIS LIST IS KEYED ON THE ROUTE PATTERN, not the URL, and that is the whole
   * hazard of this change. `/ar` was a pattern while pages/ar/index.js existed;
   * the moment that file went, the entry matched nothing, `isModernRoute`
   * answered false, and the Arabic home page rendered a redesigned layout under
   * 1.2 MB of legacy Crafto CSS. It looked broken because it was two designs at
   * once. Removing a page file and updating this list are one change.
   */
  "/",
  "/[locale]/home",

  // About
  "/about",
  "/[locale]/about",

  // FAQs
  "/frequently-asked-questions",
  "/[locale]/frequently-asked-questions",

  // Branches directory
  "/branches",
  "/[locale]/branches",

  // Workshop pages. A one-segment dynamic route, so it also matches /rox and
  // /evs-qatar in the client router - which is why the home page needs its own
  // per-locale file and this one does not.
  "/locations/[slug]",
  "/[locale]/locations/[slug]",

  // Services — hub, the five categories, the 26 individual services
  "/services",
  "/[locale]/services",
  "/services/[category]",
  "/[locale]/services/[category]",
  "/services/[category]/[service]",
  "/[locale]/services/[category]/[service]",

  // EV car brands — hub, 6 brands, 20 models. The pretty URLs (/tesla,
  // /tesla/model-3) are fallback rewrites in next.config.mjs; these are the
  // route patterns Next reports, which is what this set is matched against.
  "/ev-car-brands",
  "/[locale]/ev-car-brands",
  "/ev-car-brands/[brand]",
  "/[locale]/ev-car-brands/[brand]",
  "/ev-car-brands/[brand]/[model]",
  "/[locale]/ev-car-brands/[brand]/[model]",

  // (`/ar-IQ` and `/bn` used to need entries of their own, because each had its
  // own page file. One pattern at the top now covers every language there will
  // ever be.)

  // Receipt and legal pages
  "/thank-you",
  "/[locale]/thank-you",
  "/privacy-policy",
  "/[locale]/privacy-policy",
  "/404",
  "/500",

  // Contact and franchise. Both carry a Netlify form: every `name`, the hidden
  // `form-name` and the `bot-field` honeypot are functional and unchanged - only
  // the styling moved.
  "/our-network",
  "/[locale]/our-network",
  "/contact",
  "/[locale]/contact",
  "/franchise",
  "/[locale]/franchise",

  // Extended warranties
  "/extended-warranties",
  "/[locale]/extended-warranties",

  // Blog - the listing and the 188 posts. These were the last high-traffic
  // routes on the legacy stack, which meant a reader who clicked an article
  // from the home page watched the header and footer change around them.
  "/blog",
  "/[locale]/blog",
  "/blog/[slug]",
  "/[locale]/blog/[slug]",
  // The numbered listing pages. WITHOUT THESE ENTRIES /blog/page/2 would render
  // as a LEGACY route - 1.2 MB of Crafto CSS, jQuery, the old header and footer
  // - while /blog beside it rendered as a redesigned one. `isModernRoute` is
  // matched on the route PATTERN, and a new pattern is a new entry.
  "/blog/page/[page]",
  "/[locale]/blog/page/[page]",

  // Roadside assistance. `/ar/sos` is its own file for the same reason the
  // Arabic home page is - see the note at the foot of this comment block.
  "/sos",
  "/ar/sos",

  // The living styleguide. Development only - pages/design-system.js returns
  // notFound in production, so this entry never matters to a real build.
  "/design-system",
]);

/**
 * True when this route pattern renders with the new design system.
 *
 * Defensive about a missing argument on purpose: an unknown route falls back to
 * LEGACY, so a routing change can never accidentally strip a page's stylesheets
 * and serve it unstyled. The failure mode is "looks old", not "looks broken".
 */
export function isModernRoute(pathname) {
  return typeof pathname === "string" && MODERN_ROUTES.has(pathname);
}
