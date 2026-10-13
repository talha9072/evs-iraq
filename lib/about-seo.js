/**
 * The About page's structured data, per country.
 *
 * The title, description and keywords used to live here as {{token}} templates.
 * They are `about_page` rows since 0070, along with the whole visible page: the
 * page had 21 strings written in JSX, so keeping three of them in lib/ while the
 * h1 came from a row would have split one page across two places.
 *
 * What stays is the part that is not copy - a graph assembled from the branch row.
 * The old one named evsuae.com and carried `contact@evsuae.com`, an address that
 * appears nowhere else on the site and is not `branches.support_email`.
 */
import { branchTokens } from "@/lib/branches";
import { siteName } from "@/lib/footer";
import { localePath } from "@/lib/locale";


/**
 * AboutPage wrapping an AutomotiveBusiness, which is what the page emitted - but
 * built from the branch row.
 *
 * The old graph's `email` was `contact@evsuae.com`, an address that appears
 * nowhere else in the site and is not `branches.support_email`. Using the stored
 * one means it cannot be a different mailbox from the one the footer prints.
 *
 * `sameAs` was Instagram and LinkedIn only, hand-picked; it is the branch's whole
 * `social_links` set now, which is the same list the footer renders.
 */
export function aboutJsonLd({ locale, branch, cities, social = [] }) {
  const tokens = branchTokens(branch, cities, locale);
  const name = siteName(branch, locale);
  const url = `${branch.site_url}${localePath(locale, "about")}`;

  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name,
    description: tokens.country
      ? `Electric Vehicle Services ${tokens.country} - our mission, expertise in EV maintenance, and commitment to sustainable transportation across ${tokens.country_the}.`
      : undefined,
    url,
    inLanguage: locale,
    mainEntity: {
      /*
       * `Organization`, NOT `AutomotiveBusiness`.
       *
       * AutomotiveBusiness is a LocalBusiness subtype, and declaring it asserts
       * a physical place of business - the one thing this site must not claim.
       * It was doing so with a PostalAddress holding nothing but a country
       * code, which is also below Google's own bar for the type (it wants
       * streetAddress and addressLocality), so the node was simultaneously a
       * false claim and an invalid one.
       *
       * The whole reason there is no phone number, no address and no opening
       * hours anywhere on this site is to keep a Business Profile clean for the
       * day the real premises are claimed. A LocalBusiness node in the markup
       * undoes that quietly. Organization is the honest type for a company with
       * no premises in this country yet, and it is what every other page here
       * already uses - see lib/launch-seo.js.
       *
       * Switch back to AutomotiveBusiness when there is an address to put in
       * it, and not before.
       */
      "@type": "Organization",
      name,
      url: `${branch.site_url}/`,
      logo: `${branch.site_url}/img/EVS-logo.svg`,
      description: `Electric Vehicle Services ${tokens.country} will provide advanced maintenance, repair and upgrade services for electric vehicles across ${tokens.country_the}.`,
      areaServed: { "@type": "Country", name: tokens.country },
      /* Omitted rather than emitted as null - see the note in lib/home-seo.js. */
      ...(branch.support_phone ? { telephone: branch.support_phone } : {}),
      ...(branch.support_email ? { email: branch.support_email } : {}),
      ...(social.length
        ? { sameAs: social.map((account) => account.href).filter(Boolean) }
        : {}),
    },
  };
}
