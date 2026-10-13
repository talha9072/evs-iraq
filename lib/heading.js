import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * Put the country in a page heading without putting it in the nav.
 *
 * The service name — "Battery & Electrical" — is one string used in four
 * places: the H1, the menu, the breadcrumb and the card. Appending the country
 * to the row would have given the header a dropdown reading "Battery &
 * Electrical in Iraq", which is why this is applied at the heading only.
 *
 * Idempotent: a title that already names the country is returned untouched, so
 * the brand pages (whose suffix was baked in) do not end up saying it twice.
 */
const IN_COUNTRY = {
  en: (title, country) => `${title} in ${country}`,
  ar: (title, country) => `${title} في ${country}`,
};

export function withCountry(title, tokens = {}, locale = DEFAULT_LOCALE) {
  const country = tokens.country;
  if (!title || !country) return title;
  if (String(title).includes(country)) return title;

  const build = IN_COUNTRY[String(locale).split("-")[0]] ?? IN_COUNTRY.en;
  return build(title, country);
}
