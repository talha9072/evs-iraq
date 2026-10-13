import { getPageTable } from "@/lib/pages";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * The words and images for the three sections that appear on more than one page.
 *
 * `BranchesList`, `StatsCounter` and `ReviewsList` are rendered by eleven routes -
 * the home page, /about, /services, /ev-car-brands, the 26 model pages,
 * /extended-warranties, /evs-riyadh. Their headings, button labels and the two
 * counter FIGURES were `const` tables inside those three components, which meant
 * Oman and Qatar published "+200 Experienced Staff" and "21452 Happy Customers" as
 * their own on every one of those pages. No token fixes that: they are facts about
 * a country, so they are rows with branch overrides now (`0065`).
 *
 * ONE shared table rather than a copy in each page's own table. `home_page` owns
 * what only the home page shows - its hero, its panels, its marquee. A section that
 * eleven routes render is not the home page's to own, and duplicating it per page
 * is the drift this migration series exists to remove.
 *
 * Same machinery as every other page: `resolve_page_content`'s nine-layer merge, the
 * same `{{token}}` interpolation - which is what fills `{{country_the}}` in the
 * first counter - and the same cache.
 */
export function getSections(locale = DEFAULT_LOCALE) {
  return getPageTable("section_content", locale);
}
