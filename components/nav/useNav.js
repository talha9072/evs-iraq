import { useEffect, useState } from "react";

/**
 * The header's dropdown lists, fetched from /api/nav.
 *
 * WHY A FETCH AND NOT PROPS. The header is rendered once, by `_app.js`, and
 * Pages Router gives `_app` no way to fetch. The alternative was a `nav` prop
 * threaded through all forty-two pages' getStaticProps; this keeps the change
 * inside the header.
 *
 * WHAT IT COSTS. The menus are not in the served HTML - they appear a moment
 * after the page does. Two things make that acceptable here rather than an SEO
 * regression: every URL in these menus is also linked from the page body (the
 * /branches cards, the services hub, the brand hub) and from `sitemap.xml`, so
 * nothing becomes uncrawlable; and the dropdowns start closed, so a reader
 * cannot see them fill in. If the menus ever need to be in the HTML, the fix is
 * to pass `nav` down from getStaticProps - the shape here is already the shape
 * that would arrive.
 *
 * ONE FETCH PER LOCALE PER TAB. The cache is module scope, so a client-side
 * route change reuses the answer instead of asking again, and two headers
 * mounting at once share one request rather than firing two.
 */

/** locale -> nav. Populated only in the browser; on the server this stays empty. */
const cache = new Map();

/** locale -> in-flight promise, so concurrent callers share one request. */
const inFlight = new Map();

function load(locale) {
  if (cache.has(locale)) return Promise.resolve(cache.get(locale));
  if (inFlight.has(locale)) return inFlight.get(locale);

  /* THE LOCALE IS A PATH SEGMENT, NOT A QUERY PARAMETER, and that is the fix
     for a menu that came back in the wrong language on the live sites. Asking
     `/api/nav?locale=ar` returned the English body - see the note at the top of
     pages/api/nav/[locale].js for the measurement. A shared cache keys on the
     URL, so `/api/nav/en` and `/api/nav/ar` can no longer collapse into one
     entry, and the language cannot be dropped on the way in either. */
  const promise = fetch(`/api/nav/${encodeURIComponent(locale)}`)
    .then((res) => {
      if (!res.ok) throw new Error(`/api/nav ${res.status}`);
      return res.json();
    })
    .then((nav) => {
      cache.set(locale, nav);
      inFlight.delete(locale);
      return nav;
    })
    .catch((error) => {
      // Not cached: a failed menu should be retried on the next page, not
      // remembered for the life of the tab.
      inFlight.delete(locale);
      console.error("[useNav]", error.message);
      return null;
    });

  inFlight.set(locale, promise);
  return promise;
}

/**
 * What the header and footer render before the answer arrives.
 *
 * `footer` is an object rather than null so the footer can read
 * `nav.footer.hours.day` without guarding every level. Its lists are empty, so
 * those blocks render nothing for the moment before the fetch resolves - the
 * footer is a snap-section at the very bottom of `.scroll-container`, so a
 * reader cannot be looking at it that early, and a shift outside the viewport
 * costs nothing.
 */
const EMPTY = {
  services: [],
  brands: [],
  branches: [],
  footer: {
    branchName: null,
    // The header's flag reads this. Null here rather than absent, so the shape
    // before the fetch matches the shape after it.
    countryCode: null,
    phone: null,
    phoneDisplay: null,
    email: null,
    whatsapp: null,
    social: [],
    locations: [],
    services: [],
    network: [],
    hours: {},
  },
};

export default function useNav(locale) {
  // The initial value has to be what the server rendered, or React reports a
  // hydration mismatch. On the server `cache` is always empty, so on the first
  // client render it is empty too; a later client-side navigation finds it
  // filled and skips the flash.
  const [nav, setNav] = useState(() => cache.get(locale) ?? EMPTY);

  useEffect(() => {
    let alive = true;
    load(locale).then((value) => {
      if (alive && value) setNav(value);
    });
    return () => {
      alive = false;
    };
  }, [locale]);

  return nav;
}
