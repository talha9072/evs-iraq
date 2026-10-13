// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";
import { isModernRoute } from "@/lib/design";
import { DEFAULT_LOCALE, LOCALES, isRtl } from "@/lib/locale";

/**
 * `modern` comes from getInitialProps below, which is where the route pattern is
 * available. It decides one thing: whether this page gets the 1.2 MB legacy
 * stylesheet stack or nothing at all. See lib/design.js for why the two cannot
 * both be present.
 */
export default function Document({ modern = false, locale = DEFAULT_LOCALE }) {
  return (
    /* `lang` AND `dir`, SERVER-RENDERED. They were on neither.
     *
     * The only thing setting them was a useEffect in _app.js, which runs after
     * hydration - so the HTML that leaves the server, and the HTML every
     * crawler and every screen reader reads, was a bare `<html>`. Verified on
     * the deployed site and locally, English and Arabic alike:
     *
     *     curl evsqatarstage.netlify.app/ar | grep '<html'   ->   <html>
     *
     * Ahrefs reported it twice over - "HTML lang attribute missing" and
     * "Hreflang defined but HTML lang missing", 323 pages each, 646 of the
     * 1,308 issues on the site from this one absent attribute. The hreflang
     * block in _app.js was telling search engines that an Arabic version
     * exists while the Arabic page itself never said it was Arabic.
     *
     * It matters beyond the audit: `lang` is what picks the voice a screen
     * reader announces Arabic in, and what lets a browser hyphenate and spell-
     * check correctly. `dir` on the root is what makes the document RTL before
     * a single byte of JavaScript arrives.
     *
     * The effect in _app.js stays. A CLIENT-side route change from /about to
     * /ar/about does not re-render this document, so something still has to
     * flip both attributes; it now corrects a value that is already right on
     * first paint rather than supplying the only one there has ever been. */
    <Html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"}>
      <Head>
        {/* ===== AHREFS SITE VERIFICATION =====
            Proof of ownership for Ahrefs Site Audit / Webmaster Tools. It has
            to be in the HTML head of the site being verified, and it has to
            stay there - Ahrefs re-checks, so this is not a tag to remove once
            the tick appears.

            HARDCODED, unlike NEXT_PUBLIC_GTM_ID beside it in _app.js, and the
            difference is what the string does. A GTM container ID COLLECTS: the
            UAE's ID on evsoman.com would have posted Oman's traffic into
            Dubai's property, so it must follow the deployment. A verification
            token only PROVES, and it proves ownership of one specific property.
            Carried onto another country's domain it verifies nothing and leaks
            nothing - Ahrefs simply does not match it.

            So when each country gets its own Ahrefs project, this becomes
            NEXT_PUBLIC_AHREFS_VERIFICATION and follows the same rule as the
            others. Until then a literal is honest about there being one
            property, and cannot silently go missing because a Netlify variable
            was never set. */}
        <meta
          name="ahrefs-site-verification"
          content="5f668a8e8dd3645674a64131601ad733ae82f99feb6df70c025c135db655d7c3"
        />

        {/* ===== ICONS =====
            These were declared on exactly one page - pages/ar/about - so every
            other route on the site had no favicon and no manifest. Moved here
            when that page's hand-written <head> was replaced.

            favicon.svg is the EVS monogram lifted straight out of
            /img/EVS-logo.svg - same paths, same two brand colours, caption and
            (R) dropped - on a solid #0a0c0a ground. That is --color-ink-950,
            the site's own surface: the mark's grey half is only ~1.9:1 against
            a white tab strip and washes out, where on the dark ground it clears
            9:1. site.webmanifest carries the same colour so the PWA splash does
            not flash white behind it.

            Listed FIRST because every browser that understands an SVG icon
            prefers it and stops there; the PNG/ICO below are only reached by
            the ones that do not, and by clients that request /favicon.ico
            blindly without reading this head at all. */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* BOTH FACES ARE SELF-HOSTED NOW, so there are no preconnects here and
            no third-party stylesheet.

            What was here: two `preconnect` hints and a render-blocking
            `<link>` to fonts.googleapis.com. That link was on the critical path
            twice over - the browser could not paint until Google answered, and
            it could not even START fetching a font file until it had parsed the
            reply. Lighthouse reported the render-blocking chain; this is the
            half of it that could actually be removed.

            Urbanist's @font-face rules moved into styles/app.css, which every
            route already loads. It is a variable font, so the five weights the
            site uses come from one 27 KB file.

            BOTH ARE PRELOADED because both are used above the fold on the first
            paint: korolev-condensed sets the hero heading (the LCP element) and
            Urbanist sets everything else. `crossOrigin` is required even
            same-origin - a font request is CORS-mode, and without it the
            preload is discarded and fetched a second time. */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/korolev-condensed-medium.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/urbanist-latin.woff2"
          crossOrigin="anonymous"
        />

        {/* ===== BASE CSS — LEGACY ROUTES ONLY =====
            Five render-blocking stylesheets totalling 1215 KB, of which evs.css
            (19 KB) is the only one this project wrote. Redesigned routes emit
            none of them and ship Tailwind instead, which _app.js imports as a
            normal Next stylesheet — so it is hashed, versioned and bundled
            rather than hand-linked like these.

            The <link>s ABOVE this block stay on every route: the icons, the
            manifest, and the two typefaces. The fonts are unchanged by the
            redesign, so there is no reason to fetch them twice. */}
        {!modern && (
          <>
            <link rel="stylesheet" href="/css/vendors.min.css" />
            <link rel="stylesheet" href="/css/icon.min.css" />
            <link rel="stylesheet" href="/css/style.min.css" />
            <link rel="stylesheet" href="/css/responsive.min.css" />
            <link rel="stylesheet" href="/css/evs.css" />
          </>
        )}
      </Head>

      {/* THE ATTRIBUTE IS SERVER-RENDERED, and this is the white flash.

          Every base rule in styles/app.css is scoped `:where([data-design=
          "modern"])` - the body background, the font family, the whole reset -
          and the attribute was set ONLY by a useEffect in _app.js. So the order
          on a cold load was:

            1. HTML arrives, <body> has no attribute
            2. app.css arrives - and every scoped rule matches nothing
            3. the browser paints: white canvas, serif fallback, underlined
               links, default margins
            4. the JS bundle downloads, React hydrates, the effect runs
            5. the page finally looks like itself

          That is not a stylesheet race - both stylesheets are render-blocking
          and arrive before paint. It is a page whose BASE STYLING waited on
          JavaScript. Tailwind's utilities are unscoped, which is why the green
          button and the hero gradient were already correct in that first
          paint while the background and the type were not.

          `modern` is already known here - getInitialProps below computes it
          from the route pattern - so it costs nothing to emit. The effect in
          _app.js stays: a CLIENT-side route change between a legacy and a
          redesigned page still has to flip it without a reload. */}
      <body {...(modern ? { "data-design": "modern" } : {})}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

/**
 * `ctx.pathname` is the ROUTE PATTERN — "/[locale]/about", not "/ar/about" —
 * which is exactly what lib/design.js keys on, so one entry covers every locale.
 *
 * Adding getInitialProps to _document does NOT opt pages out of static
 * generation; that is App.getInitialProps. This runs once per page at build
 * time and the result is baked into the HTML.
 */
Document.getInitialProps = async (ctx) => {
  const initialProps = await ctx.defaultGetInitialProps(ctx);
  return {
    ...initialProps,
    modern: isModernRoute(ctx.pathname),
    locale: localeOf(ctx),
  };
};

/**
 * Which language this particular page is being rendered into.
 *
 * `ctx.pathname` is the route PATTERN - "/[locale]/about" - so it cannot answer
 * this; that is exactly why it works for `isModernRoute` and not here. Two
 * sources instead, in this order:
 *
 *   1. `ctx.query.locale`, the resolved param. Present when Next is rendering a
 *      `[locale]` route and the surest answer there is.
 *   2. The first segment of `ctx.asPath`, which covers the static-export pass
 *      where the query can be empty, and costs nothing when it is not.
 *
 * Anything that is not a language THIS deployment publishes falls back to the
 * unprefixed one - so `/services` is `en` and a stray `/fr/...` is `en` rather
 * than a lang attribute claiming French.
 */
function localeOf(ctx) {
  const fromQuery = ctx?.query?.locale;
  if (LOCALES.includes(fromQuery)) return fromQuery;

  const first = String(ctx?.asPath || "").split("?")[0].split("/").filter(Boolean)[0];
  return LOCALES.includes(first) ? first : DEFAULT_LOCALE;
}
