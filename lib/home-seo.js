/**
 * The home page's structured data, and the four site-wide tags, per country.
 *
 * The COPY used to live here too - title, description and keywords per language,
 * as {{token}} templates. It is `home_page` now, along with the whole body: the
 * page had 25 visible strings written in JSX, so keeping three of them in lib/
 * while the h1 came from a row would have split one page across two places.
 *
 * What stays is the part that is not copy at all - a graph assembled from the
 * branch row, the locations and the footer's network. See lib/home-page.js.
 *
 * `{{country_the}}` is "the UAE" and plain "Qatar" - only the exceptions store an
 * article. `{{areas}}` is the city list, already joined with the right "and" for
 * the language. `{{city}}` is the primary city.
 */
import { LOCALES, DEFAULT_LOCALE, localePath } from "@/lib/locale";
import { branchTokens, cityNames } from "@/lib/branches";
import { siteName } from "@/lib/footer";

/**
 * Organization + WebSite, in one `@graph`.
 *
 * Live emits them as two separate script tags. One graph is the same thing to a
 * consumer and lets this replace `_app.js`'s site-wide Organization block by key,
 * which is what stops the page carrying two Organization entities - one of them
 * the UAE's - on every country.
 *
 * `sameAs` is the branch's own accounts plus the sister sites, both of which the
 * footer already assembles from `social_links` and `branches`. evsksa.com is in
 * that list because the footer shows it; it is a separate operator, which is why
 * `_app.js`'s old hand-written list left it out. Kept out here too.
 */
export function homeJsonLd({ locale, branch, cities, network = [], social = [] }) {
  const tokens = branchTokens(branch, cities, locale);
  const url = `${branch.site_url}${localePath(locale, "")}`;

  const sisters = network
    .map((site) => site.href)
    .filter((href) => href && !href.includes("evsksa.com"));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${branch.site_url}/#organization`,
        name: siteName(branch, locale),
        alternateName: "Electric Vehicle Services",
        url: `${branch.site_url}/`,
        logo: `${branch.site_url}/img/EVS-logo.svg`,
        /* NO `foundingDate` HERE. It was "2020", which is the EVS group's year
           and would date an entity named "EVS Iraq" to a time it had never
           traded in Iraq. The group's history belongs on the group's
           Organization node, not this one. */
        address: {
          "@type": "PostalAddress",
          addressCountry: branch.country_code,
        },
        areaServed: { "@type": "Country", name: tokens.country },
        sameAs: [...sisters, ...social.map((account) => account.href)],
        /*
         * OMITTED WHEN NULL, NOT EMITTED AS NULL.
         *
         * `support_phone` and `support_email` are deliberately null before
         * opening (see lib/branches.js) - and this spread them into the graph
         * anyway, publishing `"telephone": null`, `"email": null` and a
         * ContactPoint whose only identifying property was null. schema.org
         * expects Text, so null is not a weaker answer than absent: it is an
         * invalid one, and a ContactPoint carrying nothing else is a contact
         * method asserted and then left blank. An absent property says "not
         * stated", which is the truth.
         */
        ...(branch.support_phone ? { telephone: branch.support_phone } : {}),
        ...(branch.support_email ? { email: branch.support_email } : {}),
        ...(branch.support_phone
          ? {
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  telephone: branch.support_phone,
                  contactType: "customer service",
                  areaServed: branch.country_code,
                  // The languages this deployment publishes, not a fixed pair.
                  availableLanguage: LOCALES.map((code) => LANGUAGE[code] ?? code),
                },
              ],
            }
          : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${branch.site_url}/#website`,
        name: siteName(branch, locale),
        url,
        inLanguage: locale,
        publisher: { "@id": `${branch.site_url}/#organization` },
      },
    ],
  };
}

/** schema.org wants language names, and LOCALES holds codes. */
const LANGUAGE = {
  en: "English",
  ar: "Arabic",
  "ar-IQ": "Arabic",
  bn: "Bengali",
};

/**
 * The four site-wide tags `_app.js` hardcodes to the UAE, built from the branch.
 *
 * Returned as data rather than JSX so both home pages use one source and the
 * keys - which is what makes next/head replace `_app.js`'s copies - cannot drift.
 */
export function siteTags({ locale, branch, cities }) {
  // geo.* is metadata about a place, not copy for a reader, so it stays in the
  // default locale in every language - which is also what live emitted on both
  // the English and the Arabic home page.
  const geo = branchTokens(branch, cities, DEFAULT_LOCALE);

  return {
    siteName: siteName(branch, locale),
    geoRegion: branch.country_code,
    // The primary city, so Qatar's page does not claim Dubai.
    geoPlacename: geo.city ?? cityNames(cities, DEFAULT_LOCALE),
    // Was `${lang}_AE` for every country. The territory is the branch's now, so
    // Qatar announces ar_QA.
    ogLocale: `${locale.split("-")[0]}_${branch.country_code}`,
  };
}
