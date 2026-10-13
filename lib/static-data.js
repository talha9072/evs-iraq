/**
 * The data source for this site: baked JSON, not a database.
 *
 * evsiraq.com is a pre-launch site. There is no branch row to read, no workshop
 * to describe and no contact route to publish, so wiring it to the platform
 * database would mean maintaining an unpublished branch there purely to render
 * a site that says "opening soon".
 *
 * Instead the content was resolved ONCE, at bake time, by the platform's own
 * Postgres resolvers (resolve_services, resolve_car_brands, resolve_faqs,
 * resolve_page_content, resolve_page_rows, resolve_pages) and written to
 * `data/resolved/`. Those resolvers implement the branch-override and locale
 * fallback layers; running them here rather than reimplementing them means the
 * two codebases cannot drift.
 *
 * WHAT CAME ACROSS IS TOKENISED, NOT UAE-SPECIFIC. The source copy contains
 * {{city}}, {{country}} and {{areas}} rather than "Dubai" and "the UAE" — a
 * check at bake time found zero hardcoded UAE references outside one FAQ, which
 * was rewritten. So the same words serve Iraq correctly once the tokens in
 * `data/site.json` are supplied.
 *
 * WHEN BAHRAIN OPENS this file is what gets deleted: add the branch to the
 * platform database, point the deployment at EVS-Production, and the site reads
 * live rows like every other country.
 */
import site from "@/data/site.json";

import homePage from "@/data/resolved/home_page.json";
import aboutPage from "@/data/resolved/about_page.json";
import sectionContent from "@/data/resolved/section_content.json";
import homePanels from "@/data/resolved/home_panels.json";
import aboutTabs from "@/data/resolved/about_tabs.json";
import privacySections from "@/data/resolved/privacy_sections.json";
import pagesData from "@/data/resolved/pages.json";
import servicesData from "@/data/resolved/services.json";
import carBrandsData from "@/data/resolved/car_brands.json";
import faqsData from "@/data/resolved/faqs.json";

const TABLES = {
  home_page: homePage,
  about_page: aboutPage,
  section_content: sectionContent,
  home_panels: homePanels,
  about_tabs: aboutTabs,
  privacy_sections: privacySections,
  pages: pagesData,
  services: servicesData,
  car_brands: carBrandsData,
  faqs: faqsData,
};

/** Every table was baked for these two, and only these two. */
export const BAKED_LOCALES = ["en", "ar"];

/**
 * `contentLocale` is asked about the CONTENT table — "car_brand_content" —
 * while the baked bundle is keyed by the tree it belongs to, "car_brands".
 *
 * Without this map the lookup missed, `bakedLocale` fell through to its "en"
 * default, and every Arabic brand and service page rendered English copy under
 * an Arabic URL. It looked like a translation gap rather than a lookup bug,
 * which is exactly why it is spelled out here.
 */
const CONTENT_TABLE_ALIASES = {
  car_brand_content: "car_brands",
  service_content: "services",
  faq_content: "faqs",
  page_content: "pages",
};

const resolveTableName = (table) => CONTENT_TABLE_ALIASES[table] ?? table;

/**
 * The resolved rows for one table in one locale.
 *
 * Falls back to English rather than returning nothing: a locale with no row of
 * its own should render the English sentence, which is what the SQL resolver
 * does and what `contentLocale` exists to report.
 */
/** [locale, its base language, English] - the order the SQL resolver walks. */
const chain = (locale) => [locale, String(locale).split("-")[0], "en"];

export function resolved(table, locale = "en") {
  const bundle = TABLES[resolveTableName(table)];
  if (!bundle) return null;
  /* THE BASE-LANGUAGE STEP MATTERS: ar-IQ has only the words Iraq says
     differently and inherits the rest from ar. Without it the fallback went
     straight to English - and did so for the copy and the {{city}} tokens
     separately, producing half-translated sentences. */
  for (const code of chain(locale)) if (bundle[code]) return bundle[code];
  return null;
}

/** Which locale a table's copy actually came back in. */
export function bakedLocale(table, locale = "en") {
  const bundle = TABLES[resolveTableName(table)];
  if (!bundle) return "en";
  for (const code of chain(locale)) if (bundle[code]) return code;
  return "en";
}

export const siteData = site;

/** The branch row, in the shape `branchTokens` and the chrome expect. */
export function staticBranch() {
  return site.branch;
}

/** Cities, already sorted, in the shape the token builder expects. */
export function staticCities() {
  return [...site.cities].sort((a, b) => a.sort_order - b.sort_order);
}

/** True while the site is pre-launch. Drives the launch notice. */
export const COMING_SOON = site.branch.coming_soon === true;
