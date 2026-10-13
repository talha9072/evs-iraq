import { resolved } from "@/lib/static-data";
import {
  getBranchContext,
  getLocations,
  getReviews,
  interpolateDeep,
  branchTokens,
  contentLocale,
} from "@/lib/branches";
import { getSections } from "@/lib/sections";
import { cached } from "@/lib/cache";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * Reads the services tree out of the platform DB and shapes it for the
 * page templates.
 *
 * One RPC call returns every row - hero, hierarchy_1 and hierarchy_2 -
 * with its copy already joined. The tree is small enough that fetching
 * all of it beats one query per level, and it means each page costs
 * exactly one round trip regardless of depth.
 */

// DEFAULT_LOCALE comes from lib/locale.js - it decides both the URL prefix
// rule and the copy fallback, so the two must never disagree.

/**
 * Which branch this deployment is. Rows tagged `only_for` are hidden from
 * every branch not listed - and so is everything beneath them.
 *
 * Unset means no filtering, which is the right default while EVS UAE is
 * the only site. Each branch deployment sets NEXT_PUBLIC_BRANCH to its own
 * slug ('uae', 'oman', 'iraq', ...) in its environment.
 */
const BRANCH = process.env.NEXT_PUBLIC_BRANCH || null;

/**
 * Flat rows -> { hero, categories: [{ ...category, children: [...] }] }.
 * Names follow services.type: 'hero', 'hierarchy_1' (the showcase panels)
 * and 'hierarchy_2' (the individual services listed under each panel).
 * Ordering comes from the query (sort_order), so adding a row with a
 * sort_order between two existing ones drops the new panel straight into
 * place with no code change.
 */
function buildTree(rows) {
  const byId = new Map(rows.map((row) => [row.id, { ...row, children: [] }]));

  let hero = null;
  const categories = [];

  for (const node of byId.values()) {
    if (node.type === "hero") {
      hero = node;
      continue;
    }

    const parent = byId.get(node.parentId);
    if (!parent) continue;

    parent.children.push(node);
    if (node.type === "hierarchy_1") categories.push(node);
  }

  return { hero, categories };
}

/**
 * Returns { hero, categories, branch, cities, locations, reviews }, or null when the
 * platform DB is unreachable or empty - callers decide whether that is fatal.
 *
 * branch, cities and locations come back so a page can hand them to
 * CategoryHead and the branches block without fetching them again.
 */
export async function getServicesTree(locale = DEFAULT_LOCALE) {
  // Cached because every page of a locale gets a byte-identical tree - this
  // function takes nothing but the locale, and the branch is fixed per
  // deployment. Before this, all 38 English pages fetched the same 124 KB.
  //
  // The key carries the branch as well as the locale. Today BRANCH is read
  // once at module load, so it cannot vary inside a process and the branch part
  // is always the same string - it is in the key for the day the branch becomes
  // an argument, so that change cannot quietly start serving one country's tree
  // to another. The locale part is doing the real work right now.
  //
  // getBranchContext and getLocations DO take an explicit slug, and they key on
  // it, so two branches in one process already stay separate - proved by
  // scripts/verify/cache-correctness.mjs.
  return cached(`tree:${BRANCH ?? "all"}:${locale}`, () =>
    loadServicesTree(locale)
  );
}

async function loadServicesTree(locale = DEFAULT_LOCALE) {
    // Deliberately OUTSIDE the try: an unknown NEXT_PUBLIC_BRANCH, or a
  // branches table that is not there yet, must fail the build. Swallowing it
  // renders a page with zero panels and a 200 status, which looks like a
  // content problem and hides a configuration one.
  const { branch, cities } = await getBranchContext(locale, BRANCH);

  // Tokens in the language the copy actually came back in. A no-op today -
  // service_content has all 37 rows in every locale - but the same rule the
  // car-brand tree needs, and the one that keeps the next language from
  // shipping "support across ওমান" inside an English sentence.
  /*
   * TOGETHER, not one after the other. `contentLocale` asks which locales this table
   * actually has rows for, and the RPC asks for the rows - neither feeds the other,
   * and the tokens are only needed once both have answered. Awaiting them in
   * sequence cost one whole round trip, which is ~300ms from here and the reason
   * `resolve_services` showed up as the long pole in the /xpeng waterfall.
   */
  const copyLocale = contentLocale("service_content", locale);
  const result = { data: resolved("services", copyLocale), error: null };
  const tokens = branchTokens(branch, cities, copyLocale);

  try {
    const { data, error } = result;

    if (error) {
      console.error("[getServicesTree] rpc failed", error);
      return null;
    }

    if (!data?.length) {
      console.warn("[getServicesTree] no services rows");
      return null;
    }

    const rows = data.map((row) => ({
      id: row.id,
      parentId: row.parent_id,
      type: row.type,
      slug: row.slug,
      // services.path is 'services/battery-electrical/pdu-repair'. The URL
      // is that, prefixed with the locale unless it is the default one -
      // without the prefix an Arabic page links every card to the English
      // version of the page.
      href:
        locale === DEFAULT_LOCALE ? `/${row.path}` : `/${locale}/${row.path}`,
      path: row.path,
      iconUrl: row.icon_url,
      sortOrder: row.sort_order,
      ...interpolateDeep(row.content || {}, tokens),
    }));

    // The two branch-owned blocks, reusing the branch row already fetched.
    // Run together: neither depends on the other, and a category page waits
    // on both before it can render.
    const [locations, reviews, sections] = await Promise.all([
      getLocations(locale, branch),
      getReviews(locale, branch),
      // The words for Our Branches and Customer Reviews, which every category and
      // service page renders. One query for the whole tree, like the rest of this.
      getSections(locale),
    ]);

    return { ...buildTree(rows), branch, cities, locations, reviews, sections };
  } catch (error) {
    console.error("[getServicesTree] unexpected error", error);
    return null;
  }
}

/**
 * Everything a category page needs, from the one tree fetch:
 *
 *   category   the panel's own copy, plus `children` for its service list
 *   categories all five, for the "Electric Vehicle Services" block that
 *              sits at the bottom of every category page
 *
 * Returns null when the slug is not a published category, which is how the
 * route turns an unknown /services/xyz into a 404 rather than a blank page.
 */
/**
 * Keep only the named fields - see the long note in lib/car-brands.js for why the
 * leaf pages trim, and how the byte-for-byte markup diff makes tightening safe.
 *
 * /services/programming shipped 209 KB of HTML, 159 KB of it __NEXT_DATA__, and the
 * bulk was `categories` - all five, with every child service's copy, FAQs and meta
 * tags - to render one list of links at the foot of the page.
 */
const pick = (source, fields) => {
  if (!source) return source;
  const out = {};
  for (const f of fields) if (source[f] !== undefined) out[f] = source[f];
  return out;
};

/** Every field the `categories` LIST is read for. The page's own category is passed
 *  separately and in full. */
const CATEGORY_FIELDS = [
  "id", "slug", "href", "path", "iconUrl", "name",
  "card_description", "hero_description", "showcase_tagline",
  // `showcase_cta_label` is the card's own "View all X services" wording. The
  // list is read for it now that CategoryGrid renders the image mosaic rather
  // than a compact row - without it those cards had no visible way in.
  "showcase_bg_url", "showcase_cta_label", "hero_subtitle",
];

/** The /services row, for the breadcrumb. */
const HUB_FIELDS = ["id", "slug", "name", "path", "href"];

export async function getCategoryPage(slug, locale = DEFAULT_LOCALE) {
  const tree = await getServicesTree(locale);
  if (!tree) return null;

  const category = tree.categories.find((c) => c.slug === slug);
  if (!category) return null;

  return {
    category,
    categories: (tree.categories ?? []).map((c) => pick(c, CATEGORY_FIELDS)),
    branch: tree.branch,
    cities: tree.cities,
    locations: tree.locations,
    reviews: tree.reviews,
    sections: tree.sections,
  };
}

/**
 * Everything a leaf service page needs, from the same one tree fetch.
 *
 *   service    the leaf's own copy - hero, about, benefits, faqs, meta
 *   category   its parent, for the badge/subtitle and the breadcrumb
 *   hub        the /services row, so the breadcrumb starts at the top
 *
 * Returns null when either slug is wrong, which is how the route turns an
 * unknown /services/xyz/abc into a 404 instead of a blank page. It also
 * returns null when the service exists but sits under a DIFFERENT category:
 * /services/insurance/pdu-repair must not quietly render the battery page at
 * a URL that contradicts the breadcrumb and the canonical.
 */
export async function getServicePage(
  categorySlug,
  serviceSlug,
  locale = DEFAULT_LOCALE
) {
  const tree = await getServicesTree(locale);
  if (!tree) return null;

  const category = tree.categories.find((c) => c.slug === categorySlug);
  if (!category) return null;

  const service = (category.children || []).find((s) => s.slug === serviceSlug);
  if (!service) return null;

  /*
   * ISI CATEGORY KI DOOSRI SERVICES - andar ke link ke liye.
   *
   * Ek leaf service tak sirf ek raasta tha: uski apni category. 68 leaf
   * safhon par teen se kam andar ke link the, aur jis safhe tak ek hi
   * raasta jata ho use Google kam ahem samajhta hai.
   *
   * Khirki ghoomti hai - har service alag paros dikhati hai - warna wahi
   * pehli chand services har jagah se link paatin aur baqi wahin rehtin.
   * Wahi tareeqa jo brand aur model safhon par lagaya gaya.
   */
  const others = (category.children || []).filter((s) => s.slug !== serviceSlug);
  const start = (category.children || []).findIndex((s) => s.slug === serviceSlug);
  const siblings = others.length
    ? Array.from({ length: Math.min(6, others.length) }, (_, i) => others[(start + i) % others.length])
        .map((s) => ({ slug: s.slug, name: s.list_title || s.name, href: s.href }))
    : [];

  return {
    service,
    category,
    siblings,
    categories: (tree.categories ?? []).map((c) => pick(c, CATEGORY_FIELDS)),
    hub: pick(tree.hero, HUB_FIELDS),
    branch: tree.branch,
    cities: tree.cities,
    locations: tree.locations,
    reviews: tree.reviews,
    sections: tree.sections,
  };
}

/**
 * /services — the hub, which renders five showcase panels and, inside each, a link
 * list of that category's services.
 *
 * A DEDICATED LOADER rather than slimming `getServicesTree`, because the two callers
 * want opposite things: this page needs five panels and 32 link labels, while
 * `getCategoryPage` and `getServicePage` need one category's copy in full. Trimming
 * the shared tree would have quietly emptied the leaf pages.
 *
 * `/services` shipped 132 KB and its Bengali twin 286 KB, almost all of it the
 * children's `about`, `benefits`, `faqs` and meta tags — for a list of names.
 */
export async function getServicesHub(locale = DEFAULT_LOCALE) {
  const tree = await getServicesTree(locale);
  if (!tree) return null;

  // Same trap as the brands hub: `buildTree` gives the hero row a `children` array
  // holding all five categories in full. The hero's own copy is what this page
  // renders; its children are already below, slimmed.
  const { children: _categoriesUnderHero, ...hero } = tree.hero ?? {};

  return {
    hero,
    categories: (tree.categories ?? []).map((c) => ({
      ...pick(c, [
        "id", "slug", "href", "path", "name",
        "showcase_bg_url", "showcase_cta_label", "showcase_tagline",
        // hubSeo builds its CollectionPage graph from this.
        "card_description",
      ]),
      // The link list only ever prints a name behind an href.
      children: (c.children ?? []).map((leaf) => pick(leaf, ["id", "href", "name"])),
    })),
    branch: tree.branch,
    cities: tree.cities,
    locations: tree.locations,
    reviews: tree.reviews,
    sections: tree.sections,
  };
}
