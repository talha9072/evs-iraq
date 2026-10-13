import SeoHead from "@/components/services/SeoHead";
import ThankYouMessage from "@/components/contact/ThankYouMessage";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * The form receipt, head and body, for every language.
 *
 * It replaces `pages/thank-you/index.js` and `pages/ar/thank-you/index.js`, which
 * were already the same six lines of JSX around the same `ThankYouMessage` - the
 * Arabic one differing only in a hardcoded `LOCALE = "ar"`. Both are routes over
 * this now, so a third language costs a four-line file rather than a copy.
 *
 * `noindex`: a form receipt has nothing for a search engine, and the page this
 * replaced did not say so.
 */
export default function ThankYouPage({ page, copy, locale = DEFAULT_LOCALE }) {
  if (!page) return null;

  const { branch, cities } = page;

  return (
    <>
      <SeoHead
        locale={locale}
        branch={branch}
        cities={cities}
        path="thank-you"
        title={page.meta_title}
        description={page.meta_description}
        noindex
      />
      <ThankYouMessage locale={locale} copy={copy} />
    </>
  );
}
