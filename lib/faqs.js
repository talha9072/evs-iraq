import { resolved } from "@/lib/static-data";
import { getBranchContext, interpolateDeep, branchTokens } from "@/lib/branches";
import { DEFAULT_LOCALE } from "@/lib/locale";
import { cached } from "@/lib/cache";

/**
 * The FAQ list - /frequently-asked-questions.
 *
 * Reads `resolve_faqs` (0055, 0097): the ten questions this branch asks, each
 * merged en -> base -> exact locale, and within each the master answer, then any
 * region this country belongs to, then its own override.
 * Only one answer is overridden today - "Where is EVS located?", which lists
 * five workshops in the UAE and describes a single one in Oman and Qatar.
 */

const BRANCH = process.env.NEXT_PUBLIC_BRANCH || null;

export function getFaqs(locale = DEFAULT_LOCALE) {
  return cached(`faqs:${BRANCH ?? "all"}:${locale}`, () => loadFaqs(locale));
}

async function loadFaqs(locale) {
    const { branch, cities } = await getBranchContext(locale, BRANCH);
  const { data, error } = { data: resolved("faqs", locale), error: null };

  // Loud, not silent: an empty list renders a heading with no questions under
  // it behind a 200, which is the failure mode 0054's loaders were fixed for.
  if (error) {
    throw new Error(`[getFaqs] rpc failed: ${error.message}`);
  }

  const tokens = {
    ...branchTokens(branch, cities, locale),
    ...localeTokens(locale),
  };

  return (data ?? []).map((row) => interpolateDeep(row, tokens));
}

/**
 * `locale_prefix` - "" for the unprefixed locale, "/ar" otherwise.
 *
 * The answers carry links to workshop, brand and service pages, and those paths
 * are stored WITHOUT a language in them:
 *
 *   <a href="{{locale_prefix}}/evs-dubai">
 *
 * The hand-written Arabic file wrote /ar/evs-dubai into the sentence instead,
 * which is why the same answer could not be shared between languages and why a
 * third language would have needed its own copy of all ten.
 *
 * Built from DEFAULT_LOCALE rather than a literal "en", because which locale
 * goes unprefixed comes from NEXT_PUBLIC_LOCALES.
 */
function localeTokens(locale) {
  return {
    locale_prefix: locale === DEFAULT_LOCALE ? "" : `/${locale}`,
  };
}

/**
 * schema.org FAQPage, built from the same rows the accordion renders.
 *
 * The hand-written pages carried this by hand, which meant the markup and the
 * visible questions could disagree - and on Qatar they did: its answer to
 * "Where is EVS located?" gives Oman's address.
 *
 * `answer_html` goes in as HTML because that is what schema.org's acceptedAnswer
 * allows, and stripping the links would publish a different answer than the page
 * shows.
 */
export function faqPageJsonLd(faqs, { url }) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: faqs
      .filter((f) => f.question && f.answer_html)
      .map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer_html },
      })),
  };
}
