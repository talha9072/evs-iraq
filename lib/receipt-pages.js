import { getPage } from "@/lib/pages";
import { LOCALES } from "@/lib/locale";

/**
 * The two smallest pages on the site - the form receipt and the not-found page.
 *
 * They share this module because they share a shape: a heading, a line of prose and
 * a button home, all in `page_content` (0074). What they do NOT share is how they
 * are routed, and that difference is the whole reason the 404 loader looks odd.
 */

/**
 * `page_content` columns -> what the components render.
 *
 * The head strings are in here too, not just the body: the 404's `<title>` is
 * locale-dependent and `_app.js` re-renders it on the client once it knows the
 * language, so the map has to carry them as well.
 */
const shape = (page) => ({
  title: page.meta_title ?? null,
  description: page.meta_description ?? null,
  heading: page.h1 ?? null,
  /*
   * `?? null` ON EVERY FIELD, and it is not defensive noise. The resolver builds its
   * document with `jsonb_strip_nulls`, so a NULL column does not arrive as null - the
   * KEY IS ABSENT, and reading it gives `undefined`. Next refuses to serialize that:
   *
   *   Error serializing `.copy.en.subheading` returned from `getStaticProps` in "/404"
   *
   * The 404 row is the one that has no `lead`, so it is the one that found this.
   */
  subheading: page.lead ?? null,
  body: page.body ?? null,
  back: page.labels?.back ?? null,
});

/**
 * /thank-you and /{locale}/thank-you.
 *
 * A route per locale, so one row is enough. Both forms redirect here on success -
 * `/${locale}/thank-you` - and until 0074 the prefixed route did not exist, so a
 * Bengali submission landed on a 404.
 */
export async function thankYouProps(locale) {
  const page = await getPage("thank-you", locale);
  if (!page) return { notFound: true };

  return {
    props: {
      page,
      copy: shape(page),
      locale,
      useScrollContainer: false,
    },
    revalidate: 2592000,
  };
}

/**
 * The not-found page, and it needs EVERY locale's copy at once.
 *
 * Next builds ONE static not-found document and serves it for every missing path, so
 * the locale cannot be known at build time - `_app.js` reads it from `asPath` on the
 * client and passes it back in. Fetching only the default locale would leave the page
 * stuck in English however the visitor arrived, so this reads one row per published
 * language and hands over a map.
 *
 * It is three queries on a page nobody plans to visit, which is cheap: `lib/cache.js`
 * collapses them during a build, and the result is one static file.
 */
export async function notFoundProps() {
  const pages = await Promise.all(LOCALES.map((locale) => getPage("not-found", locale)));

  const copy = {};
  LOCALES.forEach((locale, i) => {
    if (pages[i]) copy[locale] = shape(pages[i]);
  });

  /*
   * IT NEVER RETURNS notFound, and not only because Next forbids it here - "The /404
   * page can not return notFound in getStaticProps". This is the page a visitor gets
   * when everything else has already gone wrong, so taking the whole build down
   * because its copy row is missing is the wrong failure mode. It renders with
   * whatever it has and says so in the build log; `crawl.mjs` asserts the words are
   * actually on the page, which is where a missing row should surface.
   */
  const page = pages[0];
  if (!page) {
    console.error(
      "[notFoundProps] no page_content row for 'not-found' - the 404 page will render without copy. Run 0074."
    );
  }

  return {
    props: {
      page: page ?? null,
      copy,
      // _app.js renders the default locale on the server AND on the first client
      // render, then switches once mounted - see the note there.
      isErrorPage: true,
      useScrollContainer: false,
    },
    revalidate: 2592000,
  };
}
