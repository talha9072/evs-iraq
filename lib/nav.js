/**
 * The header's three dropdowns, from the database.
 *
 * WHAT THIS REPLACES. Services, EV Car Brands and Branches were written out by
 * hand in `Header.js` and again in `HeaderAr.js` - twice more each, because
 * every menu exists a second time inside the hamburger. Four copies of the same
 * list per language. The cost was not the duplication, it was that the lists
 * belonged to the UAE: every country's site offered the ten UAE workshops, so
 * Qatar's menu pointed at nine pages that do not exist on Qatar's site, and
 * adding a workshop meant editing eight places instead of inserting a row.
 *
 * All three lists are already rows: `services` (5 categories), `car_brands`
 * (6 brands, 20 models) and `locations` (this branch's workshops). Nothing new
 * had to be stored.
 *
 * WHAT STAYS IN CODE. The top-level labels - Home, Services, Warranty, Roadside
 * Assistance, EV Car Brands, Branches, About EVS, FAQs - are one-off UI strings,
 * not catalogue data. They do not grow when a brand is added, so they stay in
 * the component, per the rule the rest of this project follows.
 *
 * WHO CALLS THIS. `pages/api/nav/[locale].js` only. The header is rendered by `_app.js`,
 * and Pages Router gives `_app` no way to fetch - so rather than thread a `nav`
 * prop through all forty-two pages, the header asks the API route for it. See
 * `components/nav/useNav.js` for what that costs and why it is acceptable here.
 */
import { getServicesTree } from "@/lib/services";
import { getCarBrandsTree } from "@/lib/car-brands";
import { getBranchContext, getLocations, CURRENT_BRANCH } from "@/lib/branches";
import { DEFAULT_LOCALE } from "@/lib/locale";
import { cached } from "@/lib/cache";

/**
 * THE BRANCHES MENU IS `locations`, AND NOTHING ELSE.
 *
 * It used to carry one exception: `evs-riyadh`, kept because the hardcoded UAE
 * menu had listed it. Riyadh is in Saudi Arabia. It has no `locations` row
 * precisely because it is not a workshop of this branch - its page is a
 * hand-written link to evsksa.com - so putting it under "Branches" told a UAE
 * visitor that EVS has a branch in another country.
 *
 * Saudi Arabia belongs where the footer already puts it: the EVS Network column,
 * beside EVS Worldwide, built from `branches` plus the two declared non-platform
 * sites in lib/footer.js.
 */

/** One locale out of a jsonb map, falling back the way the rest of the app does. */
const pick = (map, locale) =>
  map?.[locale] ?? map?.[String(locale).split("-")[0]] ?? map?.en ?? null;

/**
 * A stored path -> a URL in this locale.
 *
 * `locations.page_path` is bare ('evs-dubai'), the same way `services.path` and
 * `car_brands.path` are, so one rule covers all three.
 */
const hrefFor = (path, locale) =>
  locale === DEFAULT_LOCALE ? `/${path}` : `/${locale}/${path}`;

/**
 * Everything the header's dropdowns need, for one locale of this branch.
 *
 *   {
 *     services: [{ href, label }],
 *     brands:   [{ href, label, models: [{ href, label }] }],
 *     branches: [{ href, label, express }],
 *   }
 *
 * Cached per branch and locale. The key carries the branch for the same reason
 * the tree keys do: the day a process serves two branches, one country's menu
 * must not be handed to another.
 */
export async function getNav(locale = DEFAULT_LOCALE) {
  return cached(`nav:${CURRENT_BRANCH}:${locale}`, () => loadNav(locale));
}

/**
 * THROWS rather than returning empty lists.
 *
 * A header whose dropdowns are empty still renders and still returns 200, so it
 * reads as a content problem. That is exactly how the `page_path` mistake stayed
 * invisible: a failed read became `[]`, `cached()` remembered it, and /branches
 * served a hero with nothing under it. The header is on every page of the site,
 * so a nav that could not be read has to be loud.
 */
async function loadNav(locale) {
  const [services, brands, { branch }] = await Promise.all([
    getServicesTree(locale),
    getCarBrandsTree(locale),
    getBranchContext(locale),
  ]);

  if (!services?.categories?.length) {
    throw new Error(`[getNav] no service categories for ${locale}`);
  }
  if (!brands?.brands?.length) {
    throw new Error(`[getNav] no car brands for ${locale}`);
  }

  // Already fetched by the trees above; this is the cached copy, not a query.
  const locations = await getLocations(locale, branch);

  return {
    services: services.categories.map((category) => ({
      href: category.href,
      label: category.name,
      // The category's glyph, for the mega menu. Every one of the five has one.
      icon: category.iconUrl ?? null,
    })),

    // `models`, not `children` - the car-brand tree names it that way, and a
    // wrong guess here does not crash, it renders every brand with no models
    // under it.
    //
    // A TO Z, IN THE MENU ONLY. The tree arrives in `sort_order`, which is an
    // editorial ranking - it decides which brand leads /ev-car-brands, and that
    // is right for a page a reader browses. A menu is not browsed, it is
    // searched: someone opening it already knows which brand they want, and
    // alphabetical is the only order that lets them find it without reading
    // every entry. The hub keeps `sort_order`.
    //
    // COPIED BEFORE SORTING, and that matters: `brands.brands` is the CACHED
    // tree, shared with the hub and all 26 brand pages, and `sort()` mutates in
    // place. Sorting it directly would silently reorder those pages too - the
    // first request would leave them in `sort_order` and every one after it in
    // alphabetical, which is the kind of bug that only shows up in production.
    //
    // `localeCompare` with the resolved locale rather than `<`: the Arabic menu
    // holds Arabic brand names, and code-point order is not alphabetical order
    // in any script. `numeric` keeps a hypothetical "BYD 10" after "BYD 9".
    brands: [...brands.brands]
      .sort((a, b) =>
        String(a.name ?? "").localeCompare(String(b.name ?? ""), locale, {
          sensitivity: "base",
          numeric: true,
        })
      )
      .map((brand) => ({
        href: brand.href,
        label: brand.name,
        // Only so the submenu can carry a unique id/aria-labelledby. The
        // hardcoded menu numbered them evOne..evFive by hand and reused
        // "evTwoDropdownMenuLink" for two different brands.
        slug: brand.slug,
        // NULL on all six rows today. Carried anyway so the menu renders a
        // mark the moment one is uploaded, with no code change - see
        // SiteHeader.
        logo: brand.logoUrl ?? null,
        // The brand's own hero photograph, for the mega menu's preview pane.
        // One string per brand, and it is a path rather than an <img>: the menu
        // wraps it in assetUrl() so the CDN resizes it to the ~240px it is
        // actually shown at. Falls back to nothing, which the pane handles -
        // HUAWEI and HUMMER had no photo until 0100 and could have none again.
        image: brand.hero_bg_url ?? null,
        models: (brand.models ?? []).map((model) => ({
          href: model.href,
          label: model.name,
        })),
      })),

    branches: navBranches(locations, locale),
  };
}

/**
 * The Branches menu: this branch's workshops, standard ones before the Express
 * ones. Nothing else - see the note at the top of this file about Riyadh.
 *
 * `name` is the label, NOT `card_title`. `card_title` is the locality the
 * /branches cards print UNDER the name - "Birkat Al Awamer" for Doha, "Rusail Car
 * Market" for Muscat - so using it would put an area where the menu wants the
 * workshop. `name` is the city ("EVS Doha") since 0062; it named the country on
 * those two rows before.
 *
 * A workshop with no `page_path` is left out: Oman's and Qatar's had no page of
 * their own until 0054, and a menu item is a link or it is nothing.
 *
 * Order is `variant` then `sort_order`, which is the order the data declares.
 * The old hardcoded UAE menu had an order of its own; `sort_order` is what a new
 * row will obey, so it wins.
 */
function navBranches(locations, locale) {
  const rank = (row) => (row.variant === "express" ? 1 : 0);

  const workshops = locations
    .filter((row) => row.page_path)
    .slice()
    .sort(
      (a, b) =>
        rank(a) - rank(b) || (a.sort_order ?? 999) - (b.sort_order ?? 999)
    )
    .map((row) => ({
      href: hrefFor(row.page_path, locale),
      // The area is a fallback only, so a menu item is never blank.
      label: pick(row.name, locale) ?? pick(row.card_title, locale) ?? row.slug,
      // Litho styles `li.express` differently. Carried as data so the component
      // does not have to know what a variant is.
      express: row.variant === "express",
    }));

  // Ordinary workshops first, Express after - the sort above already did it,
  // and there is nothing to splice in between any more.
  return workshops;
}
