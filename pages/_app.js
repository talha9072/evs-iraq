// pages/_app.js

/* `useState` went with the effect below - `useSyncExternalStore` needs neither. */
import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import Head from "next/head";

/* The design system. Reaches every route because pages-router global CSS has to
   live here - see the long note at the top of the file for how it is kept from
   touching the legacy pages (no preflight, cascade layers, :where() scoping). */
import "@/styles/app.css";

// ===== Shared Header / Footer =====
import Header from "../components/Header";
import Footer from "../components/Footer";
import HeaderAr from "../components/HeaderAr";
import FooterAr from "../components/FooterAr";
import SiteHeader from "@/components/chrome/SiteHeader";
import ComingSoonBar from "@/components/launch/ComingSoonBar";
import SiteFooter from "@/components/chrome/SiteFooter";
import SiteCta from "@/components/chrome/SiteCta";
import { Whatsapp } from "@/components/chrome/icons";
import useNav from "@/components/nav/useNav";
import { isModernRoute } from "@/lib/design";

import {
  LOCALES,
  DEFAULT_LOCALE,
  switchLocaleHref,
  localeFromPath,
  isRtl,
} from "@/lib/locale";

/**
 * The GTM container for THIS deployment. Read once at module scope: Next inlines
 * NEXT_PUBLIC_* at build time, so this is a literal in the bundle, not a lookup.
 * Trimmed because a trailing space pasted into Netlify would otherwise ship a
 * container ID that silently matches nothing.
 */
const GTM_ID = (process.env.NEXT_PUBLIC_GTM_ID || "").trim();

/**
 * THIS deployment's country, for the fallback head tags below.
 *
 * Read at module scope for the same reason GTM_ID is: NEXT_PUBLIC_* is inlined
 * at build time, so this is a literal in the bundle rather than a lookup - and
 * `_app.js` has no way to fetch the branch row that would otherwise answer it.
 *
 * Uppercased because a region subtag is uppercase by convention and the
 * variable is written lowercase ("ae"). Empty when unset, and the tags below
 * are then not rendered at all - which is the point: no tag beats another
 * country's.
 */
const COUNTRY = (process.env.NEXT_PUBLIC_COUNTRY_CODE || "").trim().toUpperCase();

/**
 * A `subscribe` for a value that never changes after hydration - see the note
 * on `hydrated` below. Declared once at module scope rather than inline,
 * because a new function identity on every render makes React re-subscribe on
 * every render, which is the cost this hook was chosen to avoid.
 */
const subscribeNever = () => () => {};

export default function App({ Component, pageProps }) {
  const router = useRouter();

  /* =====================================================
     🌍 LOCALE
  =====================================================
     From asPath, not pathname. pathname is the ROUTE PATTERN, so a page
     served by pages/[locale]/services/[category] reports
     "/[locale]/services/[category]" - which does not start with "/ar", so
     /ar/services/insurance rendered with the English header and without
     ar.css. asPath is the URL the visitor actually asked for.

     THE 404 IS THE EXCEPTION. Next renders ONE static not-found page for every
     missing path, so on the server there is no URL to read - `asPath` is "/404"
     - while on the client it is the address the visitor actually typed. For
     /ar/anything that means English chrome server-side and Arabic chrome after
     hydration: a mismatch React is entitled to shout about, and one that only
     became real when the header and footer started rendering locale-dependent
     content.

     So an error page renders the default locale on the server AND on the first
     client render - which match - and switches once mounted. A page says it is
     an error page with `isErrorPage` in its props.

     `useSyncExternalStore` RATHER THAN setState IN AN EFFECT, which is what
     this was: a `mountedLocale` state that an effect filled in on mount. The
     behaviour was right and the mechanism was not - React's compiler lint flags
     it as "calling setState synchronously within an effect can trigger
     cascading renders", and it is correct to: the page rendered, the effect
     ran, the state changed, the page rendered again, every time.

     "Has this component hydrated yet?" is the exact question
     `useSyncExternalStore` exists to answer. The server snapshot is `false` and
     React deliberately uses it for the first client render too, so server and
     client agree - which is the whole point - and it flips to `true` afterwards
     with no state, no effect and no second render of our making.

     `subscribe` returns a no-op unsubscriber because nothing ever changes: the
     value goes false -> true once, at hydration, and React drives that itself. */
  const isErrorPage = pageProps?.isErrorPage === true;
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false);

  const locale =
    isErrorPage && !hydrated ? DEFAULT_LOCALE : localeFromPath(router.asPath);
  const rtl = isRtl(locale);
  // ar and ar-IQ share the Arabic layout and copy; bn is a different script
  // but still left-to-right, so it uses the English chrome.
  const isArabic = locale.startsWith("ar");

  /* =====================================================
     🎨 WHICH DESIGN SYSTEM THIS ROUTE USES
  =====================================================
     `router.pathname` is the ROUTE PATTERN - "/[locale]/about", not "/ar/about"
     - so one entry in lib/design.js covers every language of a page. The same
     value is read independently by _document.js, which uses it to decide
     whether to emit the legacy stylesheets at all.

     A redesigned route gets: Tailwind, the new header and footer, no Bootstrap,
     no Crafto, no jQuery, no Swiper, no icon fonts. */
  const modern = isModernRoute(router.pathname);

  /* =====================================================
     🌍 HTML + BODY DIRECTION (RTL / LTR)
  ===================================================== */
  useEffect(() => {
    document.documentElement.setAttribute("lang", locale);
    document.body.setAttribute("dir", rtl ? "rtl" : "ltr");
    document.body.classList.toggle("rtl", rtl);
    document.body.classList.toggle("ltr", !rtl);

    /* The hook every scoped rule in styles/app.css hangs off. Set on the body
       rather than baked into _document because a client-side route change from
       a legacy page to a redesigned one has to flip it without a reload. */
    if (modern) document.body.setAttribute("data-design", "modern");
    else document.body.removeAttribute("data-design");
  }, [locale, rtl, modern]);

  /* =====================================================
     🔁 GLOBAL LEGACY JS RE-INITIALIZATION
  ===================================================== */
  useEffect(() => {
    const reInitLegacy = () => {
      if (typeof window === "undefined") return;
      if (window.__LEGACY_REINIT_RUNNING__) return;

      window.__LEGACY_REINIT_RUNNING__ = true;

      if (window.litho && typeof window.litho.init === "function") {
        window.litho.init();
      }

      window.dispatchEvent(new Event("resize"));

      setTimeout(() => {
        window.__LEGACY_REINIT_RUNNING__ = false;
      }, 300);
    };

    setTimeout(reInitLegacy, 400);
    router.events.on("routeChangeComplete", reInitLegacy);

    return () => {
      router.events.off("routeChangeComplete", reInitLegacy);
    };
  }, [router.events]);

 /* =====================================================
     🔁 LANGUAGE SWITCHER
  =====================================================
     Switching language keeps the visitor on the page they were reading -
     /services <-> /ar/services - rather than sending them home.

     This works because a page's slug lives in `services.path`, which has
     no locale, so the URL is identical in every language and switching is
     only ever about the prefix.

     Two ways to mark a switcher control:
       .english-converter / .arabic-converter   (the existing header)
       [data-locale="bn"]                       (anything new)

     The data-locale form is what a third language should use - it needs
     no change here at all, only an entry in LOCALES.

     NOTE the header nests these: on the English site the "AR" label is a
     .arabic-converter *inside* an <a class="english-converter">. So the
     nearest marker has to win - checking english before arabic would read
     every AR click as "switch to English", which is a no-op on an English
     page. One closest() call with a combined selector does exactly that. */
  useEffect(() => {
    const handleClick = (e) => {
      const marker = e.target.closest(
        "[data-locale], .english-converter, .arabic-converter"
      );

      if (!marker) return;

      const target =
        marker.dataset.locale ||
        (marker.classList.contains("arabic-converter") && "ar") ||
        (marker.classList.contains("english-converter") && "en");

      if (!target || !LOCALES.includes(target)) return;

      e.preventDefault();

      const href = switchLocaleHref(window.location.pathname, target);

      // already there - don't reload the page for nothing
      if (href === window.location.pathname) return;

      window.location.href = href + window.location.search + window.location.hash;
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  /* =====================================================
     🔑 PAGE-LEVEL CONTROLS
  ===================================================== */
  const showHeader = pageProps?.noHeader !== true;
  const showFooter = pageProps?.noFooter !== true;

  const forceArabicHeader = pageProps?.useArabicHeader === true;
  const forceEnglishHeader = pageProps?.useEnglishHeader === true;

  const useArabicLayout =
    forceArabicHeader || (isArabic && !forceEnglishHeader);

  /**
   * The floating WhatsApp button's number.
   *
   * `useNav` is already called by the header and the footer, and it dedupes per
   * locale in module scope, so this is the same answer rather than a third
   * request.
   */
  const chrome = useNav(locale);
  const waLink = chrome.footer.whatsapp
    ? `https://wa.me/${chrome.footer.whatsapp}`
    : undefined;

  /* A redesigned page has no jQuery, no Crafto main.js and no Swiper - its
     behaviour is React and CSS. Loading them anyway would cost 400 KB and would
     let main.js bind to markup it does not understand. */
  const loadLegacy = !modern && pageProps?.noLegacy !== true;

  /* `.scroll-container` is a Crafto construct (height: 100dvh; overflow-y: auto)
     that exists to drive the theme's scroll effects, and it is the reason
     `data-anime` blocks never reveal on some pages. Redesigned pages scroll the
     window like a normal document. */
  const useScrollContainer = !modern && pageProps?.useScrollContainer !== false;

  /* Page-level extra assets — all of them legacy by definition. Every one
     (/js/blog.js, /js/warranty.js) writes Bootstrap and Crafto class names into
     the DOM with innerHTML, so on a redesigned page they would produce unstyled
     markup at best. /js/blog.js is worse: it re-runs itself on a 300 ms timer
     until it finds `#blog-container`, an element the redesigned home page does
     not have, so it would spin for the life of the tab. The home page's feed is
     rendered by components/modern/BlogFeed.js instead. */
  const extraScripts = modern ? [] : pageProps?.extraScripts || [];
  const extraCSS = modern ? [] : pageProps?.extraCSS || [];

  /* =====================================================
     🧱 SHARED PAGE CONTENT
  ===================================================== */
  const PageContent = (
    <>
      {/* The header's and footer's links are relative now, so both have to be
          told which language they are rendering into - that is what puts /ar or
          /bn in front of every path. `locale` is the one read off asPath above,
          and it also selects which language of the database content they ask
          /api/nav for. */}
      {/* Stated once, on every page, above everything else — see the note in
          components/launch/ComingSoonBar.js for why it is not dismissible. */}
      {showHeader && <ComingSoonBar locale={locale} />}
      {showHeader &&
        (modern ? (
          /* One header for every language. The RTL/LTR difference is logical
             properties and `dir`, not a second file - which is what let the two
             legacy headers drift apart in the first place. */
          <SiteHeader locale={locale} rtl={rtl} />
        ) : useArabicLayout ? (
          <HeaderAr locale={locale} />
        ) : (
          <Header locale={locale} />
        ))}
      {/* An error page cannot know its own locale server-side, so it is told -
          with the same deferred value the chrome uses, which keeps the page body
          and the chrome in one language at every stage of hydration. */}
      <Component {...pageProps} {...(isErrorPage ? { locale } : {})} />
      {/* The closing CTA, on every redesigned page. Gated on `showFooter` with
          the footer it belongs to, so the pages that deliberately have no chrome
          do not grow one. Legacy routes are untouched. */}
      {showFooter && modern && <SiteCta locale={locale} />}

      {showFooter &&
        (modern ? (
          <SiteFooter locale={locale} rtl={rtl} />
        ) : useArabicLayout ? (
          <FooterAr locale={locale} />
        ) : (
          <Footer locale={locale} />
        ))}
    </>
  );

  return (
    <>
      {/* ===== SITE-WIDE SEO — FALLBACK ONLY =====
          Every page that renders `SeoHead` emits the same four tags from its
          branch row under the SAME next/head keys, and the page's Head is
          processed after this one, so the page's values win - measured with a
          probe value, not assumed. This block is what is left when a page does
          neither.

          IT USED TO BE THE UAE'S, HARDCODED. `geo.region AE`, `geo.placename
          Dubai`, `og:site_name EVS UAE` and an `_AE` territory on every route of
          every country. Nothing leaked, because every page overrode all four -
          but a fallback whose job is to catch the page that forgot cannot itself
          be another country's data. The first page added without SeoHead would
          have shipped Dubai to Oman, silently and correctly-looking.

          SO: WHAT THE ENVIRONMENT KNOWS IS DERIVED, AND THE REST IS DROPPED.
          `NEXT_PUBLIC_COUNTRY_CODE` is per deployment and inlined at build time,
          exactly like NEXT_PUBLIC_GTM_ID beside it, so the country half is right
          on every site without a fetch. The site NAME and the primary CITY have
          no environment variable and live only in `branches` - so they are gone
          rather than guessed. An absent tag is a gap somebody can see; a wrong
          one looks like an answer. */}

      {/* THERE IS NO ORGANIZATION GRAPH HERE ANY MORE. There used to be, with
          evsuae.com, +971600500387 and `areaServed: United Arab Emirates`
          written into it, on every route of every country. An Organization is a
          site-wide entity that belongs once, and the home page emits it from the
          branch row (lib/home-seo.js). A wrong one on forty routes is worse than
          none - the same reasoning as the four tags above. */}
      <Head>
        {/* og:locale wants language_TERRITORY. Both halves come from this
            deployment now: the language from the URL, the territory from the
            environment - so bn on a Bangladesh build is `bn_BD`, not `bn_AE`. */}
        {COUNTRY && (
          <meta
            property="og:locale"
            content={`${locale.split("-")[0]}_${COUNTRY}`}
            key="og-locale"
          />
        )}
        {COUNTRY && <meta name="geo.region" content={COUNTRY} key="geo-region" />}
      </Head>

      {/* ===== GOOGLE TAG MANAGER =====
          The container ID comes from the environment, not from this file, because
          each country is its own deployment with its own GTM property: UAE's
          GTM-NT2KKJB was written in here, so every site built from this repo -
          evsoman.com, evsqtr.com - would have reported its traffic into Dubai's
          container. Same class of bug as the WhatsApp number that used to be
          hard-coded here.

          NOT the database, deliberately. `_app.js` cannot fetch, so a database
          value could only arrive through /api/nav - one client round trip AFTER
          hydration - and a pageview that fires that late is a pageview that a
          bounced visitor never sends. A GTM container ID is set once when a
          country launches and never edited, which is exactly what an environment
          variable is for: inlined at build time, so this fires on the same tick
          it always did.

          NO ID, NO SCRIPT. A missing variable renders nothing rather than falling
          back to a default container - untracked is recoverable, another
          country's analytics polluted with your traffic is not. Set
          NEXT_PUBLIC_GTM_ID per site in Netlify. */}
      {GTM_ID && (
        <Script id="gtm-script" strategy="afterInteractive">
          {`
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${GTM_ID}');
`}
        </Script>
      )}

      {/* ===== MINIFIED LEGACY JS ===== */}
      {loadLegacy && (
        <>
          <Script src="/js/jquery.min.js" strategy="beforeInteractive" />
          <Script src="/js/vendors.min.js" strategy="beforeInteractive" />
          {/* Splitting is in vendors.js but was dropped when vendors.min.js
              was built - 19 references in the unminified bundle, 0 in the
              minified one. main.js calls Splitting() on scroll regardless, so
              every page threw "Splitting is not defined". Loading the 3.7 KB
              standalone build is cheaper than shipping the 1.2 MB unminified
              vendors bundle to fix it. */}
          <Script src="/js/vendors/splitting.min.js" strategy="beforeInteractive" />
          <Script src="/js/main.js" strategy="afterInteractive" />
        </>
      )}

      {/* ===== PAGE-LEVEL EXTRA JS ===== */}
      {extraScripts.map((src) => (
        <Script key={src} src={src} strategy="afterInteractive" />
      ))}

      {/* ===== PAGE-LEVEL EXTRA CSS ===== */}
      {extraCSS.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}

      {/* ===== RTL CSS =====
          ar.css exists to patch Crafto's physical spacing utilities and to swap
          the font variables. A redesigned page uses logical properties
          throughout and picks its Arabic face in styles/app.css, so loading this
          would only reintroduce the `!important` font overrides it fixes. */}
      {isArabic && !modern && <link rel="stylesheet" href="/ar/css/ar.css" />}

      {/* ===== PAGE LAYOUT ===== */}
      {useScrollContainer ? (
        <div className="scroll-container">{PageContent}</div>
      ) : (
        PageContent
      )}

      {/* ✅ WHATSAPP BUTTON
        Dubai's mobile was written in here, so the floating button on
        evsqatar.com messaged the UAE. `chrome.footer.whatsapp` is the branch's
        own line - see lib/footer.js. No href until it arrives, rather than a
        wrong one. */}
    {/* `.whatsapp-button` is a legacy class. On a redesigned page it resolves to
        nothing, so the button is rebuilt with utilities - same position, same
        link, sized for a comfortable touch target and inset from the safe area. */}
    {modern ? (
      waLink && (
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat with us on WhatsApp"
          /* EVS green, not WhatsApp's #25D366. The button is ours and it sits on
             every page, so it reads as a brand element rather than a third-party
             badge. The glyph is masked to the dark ink so it takes its contrast
             from the same token pair as every other primary button (9.8 : 1). */
          className="fixed bottom-5 end-5 z-40 grid h-13 w-13 place-items-center rounded-full bg-brand-500 shadow-lg transition-[transform,background-color] duration-200 ease-out hover:scale-105 hover:bg-brand-400 focus-visible:scale-105"
          style={{ insetInlineEnd: "max(1.25rem, env(safe-area-inset-right))" }}
        >
          <Whatsapp className="h-7 w-7 text-content-inverse" />
        </a>
      )
    ) : (
      <a href={waLink} className="whatsapp-button" target="_blank" rel="noreferrer"
      >
        <img
          src="/img/whatsapp.svg"
          alt="WhatsApp"
          width="48"
          height="48"
          loading="lazy"
        />
      </a>
    )}

    </>
  );
}
