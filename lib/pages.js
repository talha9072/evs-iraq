import { resolved } from "@/lib/static-data";
import {
  getBranchContext,
  getLocations,
  interpolateDeep,
  branchTokens,
} from "@/lib/branches";
import { toBranchCard } from "@/lib/branch-card";
import { DEFAULT_LOCALE } from "@/lib/locale";
import { cached } from "@/lib/cache";

/**
 * The one-off pages - /branches today, /about and /contact next.
 *
 * Reads `resolve_pages`, which merges nine layers: en -> base -> exact, and
 * within each of those the master row, then any region this country belongs to
 * (0096), then its own override. /branches is the page that needed it, because
 * the three countries say structurally different things:
 *
 *   uae    "EVS Service Centres Across the UAE"    plural, country-level
 *   oman   "EV Service Centre in Muscat, Oman"     singular, city + country
 *
 * No token turns one into the other, so Oman and Qatar carry an override and
 * everything they do NOT override - the WhatsApp label, the keywords - is
 * inherited from the master.
 */

const BRANCH = process.env.NEXT_PUBLIC_BRANCH || null;

/** Cached per locale and branch: one page of a build serves every request. */
export function getPage(slug, locale = DEFAULT_LOCALE) {
  return cached(`page:${BRANCH ?? "all"}:${locale}:${slug}`, () =>
    loadPage(slug, locale)
  );
}

/**
 * A page that has a TABLE of its own rather than a row in `page_content`.
 *
 * `home_page` is the first; `about_page` is next. Those two pages have shapes
 * nothing else shares - three showcase panels, a ten-item marquee - so bolting
 * their columns onto `page_content` would put seven permanently-NULL columns on
 * every /branches and /faq row.
 *
 * Everything else is the same machinery as `getPage`, deliberately: the same
 * nine-layer merge (`resolve_page_content` is `resolve_pages`' merge extracted so
 * it is not copied per table), the same `{{token}}` interpolation, the same cache.
 * The only difference is that a single-page table has no `slug` to look up.
 *
 * Returns null when the table has no published row for this locale, which the
 * route turns into a 404 rather than rendering a page with no words on it.
 */
export function getPageTable(table, locale = DEFAULT_LOCALE) {
  return cached(`page-table:${BRANCH ?? "all"}:${locale}:${table}`, () =>
    loadPageTable(table, locale)
  );
}

/**
 * A LIST of rows belonging to one page - `home_panels` is the first.
 *
 * The sibling of `getPageTable`: same six layers, same tokens, same cache, but for
 * a table with MANY rows per locale rather than one. The panels were a `panels`
 * jsonb column on `home_page` until 0066, which put them in the database without
 * making them editable - Supabase's table editor shows jsonb as one opaque blob, so
 * changing a single panel's photo meant hand-editing a nested array in three
 * languages. A list of things belongs in rows, the same as `locations` and
 * `reviews`.
 *
 * Ordered by the resolver, on the merged `sort_order`, so reordering the panels is
 * an edit to one integer.
 *
 * Returns [] rather than null when the table is empty: an empty list of panels is a
 * page with no panels, which is a legitimate thing to publish - unlike a page with
 * no words at all, which is what `getPageTable` returns null for.
 */
export function getPageRows(table, locale = DEFAULT_LOCALE) {
  return cached(`page-rows:${BRANCH ?? "all"}:${locale}:${table}`, () =>
    loadPageRows(table, locale)
  );
}

async function loadPageRows(table, locale) {
    const { branch, cities } = await getBranchContext(locale, BRANCH);

  try {
    const { data, error } = { data: resolved(table, locale), error: null };

    if (error) {
      console.error(`[getPageRows] ${table} rpc failed`, error.message);
      return [];
    }

    const tokens = branchTokens(branch, cities, locale);

    return (data ?? []).map((row) => ({
      slug: row.slug,
      ...interpolateDeep(row.content || {}, tokens),
    }));
  } catch (error) {
    console.error(`[getPageRows] ${table} unexpected error`, error);
    return [];
  }
}

async function loadPageTable(table, locale) {
    // Outside the try, like loadPage: an unknown NEXT_PUBLIC_BRANCH must fail the
  // build rather than render a page with no country in it behind a 200.
  const { branch, cities } = await getBranchContext(locale, BRANCH);

  try {
    const { data, error } = { data: resolved(table, locale), error: null };

    if (error) {
      console.error(`[getPageTable] ${table} rpc failed`, error.message);
      return null;
    }

    // The RPC returns `{}` for a table with no published rows, not null - an
    // empty object would spread into a page with every field undefined and a
    // 200, which is the failure mode this project keeps closing.
    if (!data || !Object.keys(data).length) {
      console.warn(`[getPageTable] ${table} has no published row for ${locale}`);
      return null;
    }

    const tokens = branchTokens(branch, cities, locale);

    return {
      ...interpolateDeep(data, tokens),
      branch,
      cities,
      tokens,
    };
  } catch (error) {
    console.error(`[getPageTable] ${table} unexpected error`, error);
    return null;
  }
}

async function loadPage(slug, locale) {
    // Outside the try on purpose, like the services tree: an unknown
  // NEXT_PUBLIC_BRANCH must fail the build rather than render a page with no
  // country in it behind a 200.
  const { branch, cities } = await getBranchContext(locale, BRANCH);

  try {
    const { data, error } = { data: resolved("pages", locale), error: null };

    if (error) {
      console.error("[getPage] rpc failed", error.message);
      return null;
    }

    const row = (data ?? []).find((r) => r.slug === slug);
    if (!row) return null;

    const tokens = branchTokens(branch, cities, locale);
    const locations = await getLocations(locale, branch);

    return {
      slug: row.slug,
      ...interpolateDeep(row.content || {}, tokens),
      branch,
      cities,
      // Grouped here rather than in the component: it is data shaping, and the
      // component should not have to know that group_order exists.
      groups: groupLocations(locations, locale),
      tokens,
    };
  } catch (error) {
    console.error("[getPage] unexpected error", error);
    return null;
  }
}

/**
 * Locations grouped into the sections the page renders.
 *
 * Grouped by `group_label`, ordered by `group_order`, because live does NOT
 * group strictly by city: "Ajman & Al Ain" is one heading over two cities, put
 * there to fill a three-column row. Deriving the heading from cities.name would
 * split it into two one-card sections and change the layout.
 *
 * A location with no group_label is dropped rather than rendered headless -
 * that state means nobody has decided where it belongs, and a card floating
 * above the first heading is worse than a missing one. It is also what keeps
 * Riyadh and Qatar off the UAE page without a special case.
 */
function groupLocations(locations, locale) {
  const pick = (map) =>
    map?.[locale] ?? map?.[String(locale).split("-")[0]] ?? map?.en ?? null;

  const byLabel = new Map();

  for (const l of locations) {
    const label = pick(l.group_label);
    if (!label) continue;

    if (!byLabel.has(label)) {
      byLabel.set(label, { label, order: l.group_order ?? 999, cards: [] });
    }

    /* The shape and the coordinate fallback both live in lib/branch-card.js
       now. They were written out here AND AGAIN, differently, inside
       components/modern/BranchesSection - which is how the home page ended up
       with a card of its own that knew nothing about Express bays or about
       0089's Google rating.

       `card_title` first is this page's own rule and stays a parameter: these
       cards sit under a city heading, so "EVS Dubai" three times under "Dubai"
       says nothing while the locality does. The home page has no grouping, so
       there the row's full name is the one that reads as a heading. */
    byLabel.get(label).cards.push(toBranchCard(l, locale, { titleFrom: "card_title" }));
  }

  return [...byLabel.values()].sort((a, b) => a.order - b.order);
}
