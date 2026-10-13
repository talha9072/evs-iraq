/**
 * The prefixed locales, as a regex alternation for the rewrites below.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS RATHER THAN `ar|ar-IQ|bn` WRITTEN OUT
 * ---------------------------------------------------------------------------
 * That is what it was, and it was a trap of the worst kind: silent, and only
 * for a language nobody had added yet. A deployment that publishes French gets
 * `/fr/tesla` matched by the GENERIC `/:brand/:model` rule instead — brand
 * "fr", model "tesla" — which asks for `/ev-car-brands/fr/tesla` and 404s. The
 * long form `/fr/ev-car-brands/tesla` keeps working, so the page is fine and
 * only the pretty URL is gone, with nothing anywhere saying so.
 *
 * `lib/locale.js` reads the same variable to build `LOCALES`, and this follows
 * its rules exactly — including the fallback, so a build with the variable
 * missing behaves the way the rest of the app does rather than losing every
 * prefixed URL.
 *
 * NOT IMPORTED FROM `lib/locale.js`, though the duplication is unwelcome: this
 * file is loaded by Next before any path alias exists, and a relative import of
 * a module that pulls in the rest of the app would run app code to configure
 * the app. The rule is small and the comment above each half names the other.
 *
 * The FIRST entry is dropped, not `en` specifically. English is unprefixed
 * because it is first — see DEFAULT_LOCALE — so a country leading with its own
 * language gets the right answer here without this line changing.
 */
const PREFIXED_LOCALES = (() => {
  const raw = process.env.NEXT_PUBLIC_LOCALES;

  const list = raw
    ? raw.split(",").map((code) => code.trim()).filter(Boolean)
    : [];

  // The same guard readLocales() applies, for the same reason: a malformed
  // value must not quietly disable every non-default page.
  const locales = list.length && list.includes("en") ? list : ["en", "ar"];

  return locales
    .slice(1)
    // Locale codes are letters and hyphens, but this is going into a regex and
    // an unexpected value should be dropped rather than escape into one.
    .filter((code) => /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/.test(code))
    .join("|");
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },

  /**
   * REDIRECTS THAT ARE ONLY TRUE ON ONE COUNTRY.
   *
   * `public/_redirects` is the right home for almost everything — but it is ONE
   * file shipped to all three sites, so every rule in it has to be true on all
   * three. Blog posts are not: they carry a `countries` column, and evsuae.com
   * publishes 192 of them where Oman has 10 and Qatar 16.
   *
   * That difference bit immediately. Two renamed-slug redirects were added to
   * `_redirects` pointing at `/blog/dubai-heat-ev-battery-life-protection`,
   * which is a UAE-only post — so on Oman and Qatar they were a 301 into a 404,
   * the exact fault the rest of that file had just been cleaned of.
   *
   * So a per-country rule belongs here, where NEXT_PUBLIC_BRANCH is known at
   * build time and the rule simply is not emitted anywhere it would not work.
   *
   * WHERE TO PUT A NEW REDIRECT: `_redirects` if the destination exists on
   * every country — a service page, a car brand, a standard page. Here if it
   * does not — anything under /blog, or a workshop.
   */
  async redirects() {
    const BRANCH = process.env.NEXT_PUBLIC_BRANCH || null;

    /*
     * `dubai-heat-ev-battery` shows why this has to be per-country rather than
     * one rule. The slug was edited in the panel, so the old URL 404s — but the
     * post it now points at is UAE-only, and on the previous site that same post
     * was published on evsoman.com. So Google holds the old URL for BOTH sites
     * and each needs a different answer: UAE has somewhere exact to send it,
     * Oman does not and gets the listing.
     *
     * Qatar carries the same rule as Oman. If Google never held that URL there
     * the rule simply never fires, and `/blog` exists on all three, so it cannot
     * become the redirect-into-404 this whole arrangement exists to prevent.
     */
    const OLD_HEAT_POST = [
      ["/blog/dubai-heat-ev-battery", "/blog"],
      ["/ar/blog/dubai-heat-ev-battery", "/ar/blog"],
    ];

    /*
     * evsksa.com KE PURANE URL, jis din woh domain is platform par aayega.
     *
     * Google ke paas us site ke 239 URL pehle se hain. Jo bhi map na ho woh
     * us din 404 ban jayega, aur har 404 ek safha hai jiski saari ranking
     * sifar ho jayegi. Neeche 239 me se har ek ka ghar hai.
     *
     * TEEN CHEEZEIN UNKE YAHAN ALAG HAIN:
     *   /en/...             English wahan prefix par thi, hamare yahan root par
     *   /vehicles-brands/x  brand hamare yahan seedha /x par hain
     *   /branches/dubai     unki site UAE/Qatar/Oman ke branch bhi ginwati hai
     *
     * Yahan hone ki wajah wahi hai jo `dubai-heat-ev-battery` ki thi:
     * `public/_redirects` EK file hai jo teenon site par jaati hai, aur
     * `/lucid` sirf Saudi build me banta hai. Wahi rule Oman par 301 se
     * seedha 404 hota - theek woh galti jo us file me ho chuki hai.
     *
     * TARTEEB MAAYNE RAKHTI HAI. Next pehla match leta hai, is liye khaas
     * rule aam rule se pehle hain: warna `/en/:path+` pehle match kar ke
     * /en/services/battery ko /services/battery bhej deta, jo hai hi nahi.
     *
     * Har destination chala kar dekha gaya - 239 me se 239 apne safhe par
     * 200 detay hain, cross-domain ke gyarah bhi.
     */
    const saudi = [
      /* ---- KHAAS RULE PEHLE. */
      ["/en/book", "/contact"],
      ["/ar/book", "/ar/contact"],

      ["/en/services/battery", "/services/battery-electrical"],
      ["/ar/services/battery", "/ar/services/battery-electrical"],
      ["/en/services/warranty", "/extended-warranties"],
      ["/ar/services/warranty", "/ar/extended-warranties"],
      ["/en/services/charger-installation", "/services/battery-electrical/charger-installation"],
      ["/ar/services/charger-installation", "/ar/services/battery-electrical/charger-installation"],
      ["/en/services/mobile-service", "/services/mechanical/mobile-service"],
      ["/ar/services/mobile-service", "/ar/services/mechanical/mobile-service"],

      /* Do brand ke slug unke yahan alag the. */
      ["/en/vehicles-brands/mercedes", "/mercedes-benz"],
      ["/ar/vehicles-brands/mercedes", "/ar/mercedes-benz"],
      ["/en/vehicles-brands/bmw-i", "/bmw"],
      ["/ar/vehicles-brands/bmw-i", "/ar/bmw"],

      /* Ek post ka slug badalna para: UAE ka ek post pehle se usi slug par
         tha, aur evs_blogs_* me slug poori table par unique hai. */
      ["/en/blog/ev-software-updates-importance", "/blog/ev-software-updates-ecu-programming"],
      ["/ar/blog/ev-software-updates-importance", "/ar/blog/ev-software-updates-ecu-programming"],

      /* Riyadh ke do branch. */
      ["/en/branches/riyadh", "/evs-riyadh"],
      ["/ar/branches/riyadh", "/ar/evs-riyadh"],
      ["/en/branches/riyadh-branch-2", "/evs-riyadh-al-areja"],
      ["/ar/branches/riyadh-branch-2", "/ar/evs-riyadh-al-areja"],

      /* Baqi branch doosre mulk ke hain, is liye doosre domain par. Saudi ki
         site par /evs-dubai na hai na hona chahiye. */
      ["/en/branches/dubai", "https://evsuae.com/evs-dubai"],
      ["/ar/branches/dubai", "https://evsuae.com/evs-dubai"],
      ["/en/branches/abu-dhabi", "https://evsuae.com/evs-abu-dhabi"],
      ["/ar/branches/abu-dhabi", "https://evsuae.com/evs-abu-dhabi"],
      ["/en/branches/sharjah", "https://evsuae.com/evs-sharjah"],
      ["/ar/branches/sharjah", "https://evsuae.com/evs-sharjah"],
      ["/en/branches/ajman", "https://evsuae.com/evs-ajman"],
      ["/ar/branches/ajman", "https://evsuae.com/evs-ajman"],
      ["/en/branches/al-ain", "https://evsuae.com/evs-alain"],
      ["/ar/branches/al-ain", "https://evsuae.com/evs-alain"],
      ["/en/branches/express-abu-dhabi-mushrif", "https://evsuae.com/evs-abu-dhabi-al-mushrif"],
      ["/ar/branches/express-abu-dhabi-mushrif", "https://evsuae.com/evs-abu-dhabi-al-mushrif"],
      ["/en/branches/express-dubai-barsha", "https://evsuae.com/evs-dubai-al-barsha"],
      ["/ar/branches/express-dubai-barsha", "https://evsuae.com/evs-dubai-al-barsha"],
      ["/en/branches/express-dubai-twar", "https://evsuae.com/evs-dubai-al-twar-2"],
      ["/ar/branches/express-dubai-twar", "https://evsuae.com/evs-dubai-al-twar-2"],
      ["/en/branches/express-sharjah-muwafjah", "https://evsuae.com/evs-sharjah-al-muwafjah"],
      ["/ar/branches/express-sharjah-muwafjah", "https://evsuae.com/evs-sharjah-al-muwafjah"],
      ["/en/branches/qatar", "https://evsqtr.com/evs-qatar"],
      ["/ar/branches/qatar", "https://evsqtr.com/evs-qatar"],
      ["/en/branches/oman", "https://evsoman.com/evs-oman"],
      ["/ar/branches/oman", "https://evsoman.com/evs-oman"],

      /* Blog ki category listing hamare yahan hai hi nahi - 57 aise URL the. */
      ["/en/blog/category/:slug*", "/blog"],
      ["/ar/blog/category/:slug*", "/ar/blog"],

      /* Brand hub aur brand safhe. Renamed brand upar nikal chuke hain. */
      ["/en/vehicles-brands", "/ev-car-brands"],
      ["/ar/vehicles-brands", "/ar/ev-car-brands"],
      ["/en/vehicles-brands/:brand", "/:brand"],
      ["/ar/vehicles-brands/:brand", "/ar/:brand"],

      /* ---- AAM RULE AAKHIR ME. Baqi har English URL ka sirf prefix hatna
         hai. `:path+` hai `:path*` nahi - `*` khaali se bhi match karta hai,
         to /en ka destination khaali string ban jata tha: 308 bina Location,
         aur browser wahin atak jata. Test me yehi ek URL toota tha. */
      ["/en/:path+", "/:path+"],
      ["/en", "/"],
    ];

    const perBranch = {
      uae: [
        ["/blog/dubai-heat-ev-battery", "/blog/dubai-heat-ev-battery-life-protection"],
        ["/ar/blog/dubai-heat-ev-battery", "/ar/blog/dubai-heat-ev-battery-life-protection"],
      ],
      oman: OLD_HEAT_POST,
      qatar: OLD_HEAT_POST,
      saudi,
    };

    return (perBranch[BRANCH] || []).map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
  /**
   * Car brands live at the ROOT — /tesla, /tesla/model-3 — not under the hub,
   * which is at /ev-car-brands. Verified against production: /ev-car-brands/avatr
   * is a 404 and /avatr is a 200.
   *
   * A file at pages/[brand]/index.js cannot express that. pages/[locale]/
   * already claims the root dynamic segment, and Next.js allows only one name
   * per level — adding [brand] alongside it 500s every page in the app, which
   * is what happened when it was tried.
   *
   * So the pages live under pages/ev-car-brands/[brand]/ and these rewrites map
   * the public URLs onto them.
   *
   * `fallback`, NOT `afterFiles`. The three buckets run at different points:
   *
   *   beforeFiles  before everything
   *   afterFiles   after pages/public files, but BEFORE dynamic routes
   *   fallback     after dynamic routes too, just before the 404
   *
   * `afterFiles` was tried first and broke its own pages: /ev-car-brands/tesla
   * is served by a DYNAMIC route, so the rewrite fired ahead of it, matched
   * `/:brand/:model` with brand="ev-car-brands", and asked for
   * /ev-car-brands/ev-car-brands/tesla — a 404. /ar/ev-car-brands went the same
   * way. `fallback` only fires when nothing at all matched, which is the actual
   * requirement.
   *
   * No list of brand slugs is needed either way: an unknown /foo reaches
   * getStaticPaths, which does not generate it, and 404s correctly.
   *
   * A ONE-SEGMENT DYNAMIC ROUTE DOES NOT BREAK THIS, contrary to what this
   * comment claimed while there was no pages/[locale]/index.js. There is one now -
   * the home page in Arabic, Iraqi Arabic and Bengali - and /tesla still resolves:
   * `fallback` rewrites are consulted whenever the request would otherwise 404,
   * and a dynamic route whose getStaticPaths does not list the param is exactly
   * that. Checked on a production build across all 26 brand URLs, all 11 workshop
   * URLs and their Arabic twins.
   *
   * The URL the visitor and Googlebot see is /tesla. Rewrites do not redirect,
   * and the canonical is built from the row's own path, so nothing leaks
   * /ev-car-brands/tesla.
   */
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        /*
         * ---- THE HOME PAGE IN EACH LANGUAGE, first of all.
         *
         * `/ar` used to be a file, pages/ar/index.js, and one more per language
         * after it — so adding a language in the admin panel meant writing a
         * file here. The page now lives two segments deep at /{locale}/home,
         * where a dynamic route cannot swallow /rox or /evs-qatar, and this maps
         * the public URL onto it.
         *
         * FIRST in the list, because `/:brand` below also matches `/ar` and
         * would ask for /ev-car-brands/ar.
         *
         * Omitted entirely on a single-language deployment, like the other
         * prefixed rules — `/:locale()` is not a pattern.
         */
        ...(PREFIXED_LOCALES
          ? [{ source: `/:locale(${PREFIXED_LOCALES})`, destination: "/:locale/home" }]
          : []),

        // ---- WORKSHOP PAGES, and they must come before the brand rules.
        //
        // /evs-dubai also matches `/:brand` below, which would ask for
        // /ev-car-brands/evs-dubai and 404. It works today only because a real
        // file at pages/evs-dubai/index.js matches ahead of every fallback; the
        // moment those files are deleted the whole set of workshop URLs breaks.
        //
        // Keyed on the `evs-` prefix, which separates the two sets cleanly: all
        // eleven workshop slugs start with it and no brand slug does (rox,
        // zeekr, avatr, byd, tesla, xpeng). An unknown /evs-foo still 404s
        // correctly, because getStaticPaths does not generate it.
        //
        // /evs-riyadh keeps its hand-written file and so never reaches here -
        // files match before fallbacks. See lib/locations.js for why it was left
        // behind.
        //
        // The locale-prefixed rules are omitted entirely when a deployment
        // publishes one language: `/:locale()/...` is not a pattern, and a site
        // with no prefixed URLs has nothing for them to match.
        ...(PREFIXED_LOCALES
          ? [
              {
                source: `/:locale(${PREFIXED_LOCALES})/:loc(evs-[a-z0-9-]+)`,
                destination: "/:locale/locations/:loc",
              },
            ]
          : []),
        { source: "/:loc(evs-[a-z0-9-]+)", destination: "/locations/:loc" },

        // ORDER MATTERS, and the locale-prefixed rules must come first.
        // `/:brand/:model` also matches /ar/tesla - brand "ar", model "tesla" -
        // so with the generic rules first, every Arabic brand page rewrote to
        // /ev-car-brands/ar/tesla and 404'd. Rewrites are tried in order and the
        // first match wins.
        ...(PREFIXED_LOCALES
          ? [
              {
                source: `/:locale(${PREFIXED_LOCALES})/:brand/:model`,
                destination: "/:locale/ev-car-brands/:brand/:model",
              },
              {
                source: `/:locale(${PREFIXED_LOCALES})/:brand`,
                destination: "/:locale/ev-car-brands/:brand",
              },
            ]
          : []),
        { source: "/:brand/:model", destination: "/ev-car-brands/:brand/:model" },
        { source: "/:brand", destination: "/ev-car-brands/:brand" },
      ],
    };
  },

  // Pages are served by the Next.js runtime, where Netlify's public/_headers
  // does not apply. Set them here so HTML responses keep the same protection
  // that static assets get from _headers.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;