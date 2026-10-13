import SeoHead from "@/components/services/SeoHead";
import NotFound from "@/components/errors/NotFound";
import { notFoundProps } from "@/lib/receipt-pages";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * The not-found page, for every path that does not exist.
 *
 * Next serves ONE of these for every miss, so the locale cannot be known when it is
 * built - `_app.js` works it out on the client and passes it back in as `locale`.
 * That is why `copy` is a MAP of every published language rather than one row: see
 * lib/receipt-pages.js.
 *
 * WHAT WAS WRONG BEFORE ANY OF THIS. Its exported component was called `About` - a
 * copy-paste - the head named evsuae.com in six places and "Dubai" in three, and the
 * only way off the page was `href="https://evsuae.com/"`. On the Qatar site, the 404
 * page's one escape route left the country.
 *
 * `pages/ar/404/index.js` is gone with 0074. It was a real ROUTE, so /ar/404 answered
 * 200 with "الصفحة غير موجودة" - a soft 404 - while genuinely missing paths correctly
 * answered 404. One not-found page is the whole design; a second one was a bug.
 */
export default function NotFoundPage({ locale = DEFAULT_LOCALE, page, copy = {} }) {
  const t = copy[locale] ?? copy[String(locale).split("-")[0]] ?? copy.en ?? {};
  const branch = page?.branch;

  return (
    <>
      {branch && (
        <SeoHead
          locale={locale}
          branch={branch}
          cities={page.cities}
          path="404"
          title={t.title}
          description={t.description}
          // No keywords, no JSON-LD: this page is noindex, so the only tags worth
          // having are the ones a person sees in a shared link.
          noindex
        />
      )}
      <NotFound locale={locale} copy={copy} />
    </>
  );
}

export const getStaticProps = () => notFoundProps();
