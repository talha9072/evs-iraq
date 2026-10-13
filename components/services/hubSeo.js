import { branchTokens, interpolate } from "@/lib/branches";

/**
 * The /services hub's own title, description and keywords, per language.
 *
 * In code, not in the database, for the same reason its hero is: there is
 * exactly one hub per language and no "add another hub". Category pages keep
 * theirs in service_content because those grow with the catalogue.
 *
 * {{country}} rather than a baked-in "UAE" - these strings ship to
 * evsoman.com and evsqtr.com too, and the token resolves per locale, so the
 * Arabic build says الإمارات and not "UAE".
 *
 * Adding a language: one entry here, one in ServicesHub's COPY, and its
 * service_content rows.
 */
// The English and Arabic strings are the live ones, with place names swapped
// for tokens and nothing else touched - this is not a rewrite of anyone's SEO
// copy. Note the Arabic title names the CITY where the English names the
// COUNTRY; both are preserved as they are.
//
// "in the UAE" keeps its article via {{country_the}}, which the branch
// supplies as "the UAE" for a country whose English name takes one and plain
// "Qatar" / "Oman" for those that do not. Without it, tokenising would have
// produced "in the Qatar".
export const HUB_SEO = {
  en: {
    title: "EV Services in {{country_the}} | Repair, Battery, Body & Software",
    description:
      "Trusted EV care since 2020. EVS operates expert electric vehicle service centers across {{country_the}} – {{areas}}.",
    keywords:
      "EV service centre {{country}}, electric vehicle servicing {{city}}, EV repair services {{country}}, EV maintenance {{country}}, electric car workshop {{city}}, EVS {{country}} services",
  },

  ar: {
    title: "خدمات المركبات الكهربائية في {{city}} | صيانة وإصلاحات",
    description:
      "تقدم إي في إس {{country}} خدمات متميزة للمركبات الكهربائية في {{city}}، تشمل الصيانة، الإصلاحات، الحلول البرمجية، وتشخيص البطاريات بفريق معتمد.",
    keywords:
      "خدمات المركبات الكهربائية, صيانة المركبات الكهربائية {{city}}, إصلاحات المركبات الكهربائية, تشخيص السيارات الكهربائية, تشخيص بطاريات المركبات الكهربائية, حلول برمجية للمركبات الكهربائية, مركز خدمات المركبات الكهربائية {{city}}, خدمات إي في إس {{country}}",
  },

  // Bengali has no live page to port from, so this is new copy modelled on
  // the English one. Worth a native reader's eye before it goes out.
  bn: {
    title: "{{country}}ে ইলেকট্রিক গাড়ির সার্ভিস | মেরামত, ব্যাটারি, বডি ও সফটওয়্যার",
    description:
      "২০২০ সাল থেকে নির্ভরযোগ্য ইভি সেবা। {{areas}} জুড়ে বিশেষজ্ঞ ইলেকট্রিক গাড়ি সার্ভিস সেন্টার।",
    keywords:
      "ইভি সার্ভিস {{country}}, ইলেকট্রিক গাড়ি সার্ভিসিং {{city}}, ইভি মেরামত {{country}}",
  },
};

// Iraq speaks Arabic; it inherits the Arabic strings and overrides nothing
// yet, the same way its service_content rows inherit from 'ar'.
HUB_SEO["ar-IQ"] = HUB_SEO.ar;

/**
 * CollectionPage graph for the hub, built from the categories actually on
 * the page.
 *
 * The Arabic hub carried a hand-written version listing ten services that no
 * longer matched the catalogue - "تحويل المركبات لمواصفات الخليج", "تركيب
 * وصيانة الشواحن السريعة" and others that are not among the five categories.
 * Deriving it means it cannot go stale, and every language gets one instead
 * of only Arabic having any.
 */
export function hubJsonLd({
  categories = [],
  branch,
  cities = [],
  locale,
  canonical,
  title,
  description,
}) {
  // Tokens are filled here as well as in SeoHead: the graph is assembled
  // outside it, so a raw "{{country}}" would otherwise ship inside the
  // structured data while the visible <title> read correctly.
  const tokens = branchTokens(branch, cities, locale);
  const fill = (s) => interpolate(s, tokens);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: fill(title),
    description: fill(description),
    url: canonical,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: branch.name,
      url: branch.site_url,
    },
    mainEntity: categories.map((c) => ({
      "@type": "Service",
      name: c.name,
      description: c.card_description || c.showcase_tagline || undefined,
      url: `${branch.site_url}${c.href}`,
    })),
  };
}
