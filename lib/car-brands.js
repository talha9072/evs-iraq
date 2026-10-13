import { resolved } from "@/lib/static-data";
import {
  getBranchContext,
  getLocations,
  getReviews,
  interpolateDeep,
  branchTokens,
  contentLocale,
} from "@/lib/branches";
import { getServicesTree } from "@/lib/services";
import { getSections } from "@/lib/sections";
import { DEFAULT_LOCALE } from "@/lib/locale";
import { cached } from "@/lib/cache";

/**
 * The car-brand tree, read the same way the services tree is.
 *
 * Deliberately a separate module from lib/services.js rather than a generic
 * one: the two trees share a shape, not a query, and the useful difference -
 * that a brand page also needs the five SERVICE categories for its cards - is
 * an explicit call here rather than a hidden coupling.
 */

const BRANCH = process.env.NEXT_PUBLIC_BRANCH || null;

/**
 * Flat rows -> { hub, brands: [{ ...brand, models: [...] }] }.
 *
 * Paths are NOT built by concatenating parents here: the database already holds
 * the real path, and brands sit at /tesla rather than /ev-car-brands/tesla. So
 * href comes from row.path, which is the one thing that knows the truth.
 */
function buildTree(rows, locale) {
  const byId = new Map(rows.map((row) => [row.id, { ...row, models: [] }]));

  let hub = null;
  const brands = [];

  for (const node of byId.values()) {
    if (node.type === "hero") {
      hub = node;
      continue;
    }

    const parent = byId.get(node.parentId);
    if (!parent) continue;

    parent.models.push(node);
    if (node.type === "hierarchy_1") brands.push(node);
  }

  return { hub, brands };
}

async function loadCarBrandsTree(locale = DEFAULT_LOCALE) {
    // Outside the try on purpose: an unknown NEXT_PUBLIC_BRANCH must fail the
  // build, not quietly ship another country's details.
  const { branch, cities } = await getBranchContext(locale, BRANCH);

  // Tokens in the language the COPY actually came back in, not the language
  // that was asked for. car_brand_content has no `bn` rows, so a Bengali build
  // gets English sentences - and the {{country}} inside them has to be English
  // too, or the sentence carries two languages at once. See contentLocale().
  /* Together, not in sequence - see the same note in lib/services.js. Neither of
     these feeds the other, and the tokens want both. */
  const copyLocale = contentLocale("car_brand_content", locale);
  const result = { data: resolved("car_brands", copyLocale), error: null };
  const tokens = branchTokens(branch, cities, copyLocale);

  try {
    const { data, error } = result;

    if (error) {
      console.error("[getCarBrandsTree] rpc failed", error.message);
      return null;
    }

    const rows = (data ?? []).map((row) => ({
      id: row.id,
      parentId: row.parent_id,
      type: row.type,
      slug: row.slug,
      path: row.path,
      href: locale === DEFAULT_LOCALE ? `/${row.path}` : `/${locale}/${row.path}`,
      logoUrl: row.logo_url,
      sortOrder: row.sort_order,
      ...interpolateDeep(row.content || {}, tokens),
    }));

    const [locations, reviews, services, sections] = await Promise.all([
      getLocations(locale, branch),
      getReviews(locale, branch),
      // The five service categories, for the cards every brand and model page
      // shows. Read from the services tree rather than duplicated - they are
      // identical on all 24 pages.
      getServicesTree(locale),
      // The words for Our Branches, the counters and Customer Reviews. Fetched
      // here rather than in each of the three routes below, for the same reason
      // the categories are: one query serves the hub, the brand pages and the
      // model pages.
      getSections(locale),
    ]);

    return {
      ...buildTree(rows, locale),
      serviceCategories: services?.categories ?? [],
      branch,
      cities,
      locations,
      reviews,
      sections,
    };
  } catch (error) {
    console.error("[getCarBrandsTree] unexpected error", error);
    return null;
  }
}

/** Cached per locale, for the same reason the services tree is: every page of
 *  a locale receives a byte-identical tree. */
export async function getCarBrandsTree(locale = DEFAULT_LOCALE) {
  return cached(`brands:${BRANCH ?? "all"}:${locale}`, () =>
    loadCarBrandsTree(locale)
  );
}

/** /ev-car-brands — the hub's own copy plus its five showcase panels. */
export async function getBrandsHub(locale = DEFAULT_LOCALE) {
  const tree = await getCarBrandsTree(locale);
  if (!tree?.hub) return null;

  /*
   * `buildTree` hangs children off every node, so the HUB carries a `models` array
   * that is all five brands with their full copy - 76 KB of the Arabic page's 137 KB,
   * for a row whose own six fields are a heading and a background image. The hub's
   * own copy stays whole; only its children go.
   */
  const { models: _brandsUnderHub, ...hub } = tree.hub;

  return {
    hub,
    // The hub prints one showcase panel per brand and nothing else - no models, no
    // FAQs, no meta tags. It shipped 177 KB, and 261 KB in Arabic, to render five.
    brands: (tree.brands ?? []).map((b) =>
      pick(b, [
        "id", "slug", "href", "path", "name",
        "showcase_bg_url", "showcase_cta_label", "showcase_tagline",
        // XPeng has no showcase_bg_url - it is the one brand of the six that
        // never got a panel image - so its card rendered as a flat dark
        // rectangle among five photographs. It DOES have a hero image, and the
        // hub card falls back to it. One more string per brand against a card
        // that visibly did not belong.
        "hero_bg_url",
      ])
    ),
    branch: tree.branch,
    cities: tree.cities,
    locations: tree.locations,
    reviews: tree.reviews,
    sections: tree.sections,
  };
}

/** /tesla — a brand, and the models under it for its own listing. */
/**
 * Keep only the named fields. Missing ones are simply absent, which is what makes
 * this safe to tighten: a field that turns out to be needed shows up as a diff in the
 * rendered markup, not as a silent `undefined` nobody notices.
 */
const pick = (source, fields) => {
  if (!source) return source;
  const out = {};
  for (const f of fields) if (source[f] !== undefined) out[f] = source[f];
  return out;
};

/**
 * WHY THE LEAF PAGES TRIM THEIR PROPS.
 *
 * `getCarBrandsTree` resolves everything - every brand, every model, every service
 * category, with all their copy, FAQs and meta tags - because one query is cheaper
 * than twelve. That is right for the FETCH and wrong for the PROPS: Next serialises
 * whatever a page returns into `__NEXT_DATA__`, and the browser then downloads and
 * parses all of it before hydrating.
 *
 * Measured on the live staging site, before this:
 *
 *   /xpeng          272 KB of HTML, 231 KB (84%) of it __NEXT_DATA__
 *   /tesla/model-3  274 KB, 238 KB (86%)
 *
 * and inside that, `serviceCategories` was 123 KB and `hub` 83 KB - to render a list
 * of five links and one breadcrumb. 206 KB of copy the page never puts on screen.
 * Next's own build output had been saying so: "data for page ... is 582 kB which
 * exceeds the threshold of 128 kB".
 *
 * The field lists below are every field its consumers actually read, found by
 * grepping them rather than by guessing - and the guarantee is the byte-for-byte
 * markup diff in scripts/verify/props.mjs, which fails if a page renders one
 * character differently.
 *
 * NOTE this does NOT make the site fetch less. It makes the page SHIP less.
 */
const CATEGORY_FIELDS = [
  "id", "slug", "href", "path", "iconUrl", "name",
  "card_description", "hero_description", "showcase_tagline",
  // The image and the "View all X services" wording. CategoryGrid renders the
  // image mosaic now rather than a compact row, and without these two a brand
  // page's cards came out as flat panels with no picture and no way in - the
  // same block looking different from the one on /services/<category>.
  "showcase_bg_url", "showcase_cta_label",
];

/** Brand pages use the hub for one breadcrumb link. */
const HUB_FIELDS = ["id", "slug", "name", "path", "href"];

/** A model page names its parent brand and reuses its showcase panel. */
const BRAND_FIELDS = [
  "id", "slug", "href", "path", "name",
  "showcase_bg_url", "showcase_cta_label", "showcase_tagline",
];

export async function getBrandPage(brandSlug, locale = DEFAULT_LOCALE) {
  const tree = await getCarBrandsTree(locale);
  if (!tree) return null;

  const brand = tree.brands.find((b) => b.slug === brandSlug);
  if (!brand) return null;

  /*
   * DOOSRE BRANDS - andar ke link ke liye, aur har brand ko ALAG set.
   *
   * Pehle har brand ka safha sirf hub se jurha tha: 104 safhon me se 242 par
   * teen se kam andar ke link the. Andar ke link hi Google ko batate hain ke
   * kaun sa safha ahem hai, aur jis safhe tak sirf ek raasta jata ho use
   * Google kam ahem samajhta hai.
   *
   * KHIRKI GHOOMTI HAI, ek hi aath brands har jagah nahi. Agar har safha
   * wahi pehle aath dikhata to woh aath aur mazboot hote aur baqi chhabbis
   * wahin ke wahin rehte. Shuruaat brand ki apni jagah se hoti hai, is liye
   * har brand alag paros dikhata hai aur link poore set me barabar bant
   * jaate hain - aur wahi brand hamesha wahi paros dikhata hai, is liye
   * dobara build karne par safha nahi badalta.
   */
  const others = tree.brands.filter((b) => b.slug !== brandSlug);
  const start = tree.brands.findIndex((b) => b.slug === brandSlug);
  const siblings = Array.from({ length: Math.min(8, others.length) }, (_, i) =>
    others[(start + i) % others.length]
  ).map((b) => ({
    slug: b.slug,
    name: b.name,
    href: b.href,
    image: b.showcase_bg_url || b.hero_bg_url || null,
  }));

  return {
    page: brand,
    hub: pick(tree.hub, HUB_FIELDS),
    models: brand.models,
    siblings,
    serviceCategories: (tree.serviceCategories ?? []).map((c) => pick(c, CATEGORY_FIELDS)),
    branch: tree.branch,
    cities: tree.cities,
    locations: tree.locations,
    reviews: tree.reviews,
    sections: tree.sections,
  };
}

/**
 * /tesla/model-3 — a model.
 *
 * Returns null when the model exists but under a DIFFERENT brand, so
 * /byd/model-3 cannot render Tesla's page at a URL that contradicts its own
 * canonical and breadcrumb.
 */
export async function getModelPage(brandSlug, modelSlug, locale = DEFAULT_LOCALE) {
  const tree = await getCarBrandsTree(locale);
  if (!tree) return null;

  const brand = tree.brands.find((b) => b.slug === brandSlug);
  if (!brand) return null;

  const model = brand.models.find((m) => m.slug === modelSlug);
  if (!model) return null;

  /*
   * MODEL SAFHE KE BHAI-BAND.
   *
   * Model safhe tak sirf ek raasta tha - uske apne brand ka safha - aur 138
   * model safhon par teen se kam andar ke link the. Pehle isi brand ke doosre
   * model, phir zaroorat pade to doosre brands, taake ek model wale brand ka
   * safha bhi tanha na rahe.
   *
   * Khirki yahan bhi ghoomti hai, brand safhon ki tarah: sab model wahi
   * pehle chand nahi dikhate, warna link barabar nahi bantay.
   */
  const sameBrand = brand.models.filter((m) => m.slug !== modelSlug);
  const start = brand.models.findIndex((m) => m.slug === modelSlug);
  const rotated = sameBrand.length
    ? Array.from({ length: sameBrand.length }, (_, i) => sameBrand[(start + i) % sameBrand.length])
    : [];
  /*
   * Bharti ke liye DOOSRE BRANDS KE MODEL, khud brands nahi.
   *
   * Pehle yahan brands bharay ja rahe the, aur natija maap me nazar aaya:
   * jin brands ke sirf ek ya do model hain - AITO, Denza, iCAR, Yangwang -
   * unke model safhon ko sirf apne brand se link milta tha, ek ya do. Woh
   * safhe brands ki taraf link bhej rahe the magar unki taraf koi nahi aa
   * raha tha.
   *
   * Model se model jorhne se yeh dono taraf chalta hai: har model doosre
   * models ko link deta hai aur unse leta bhi hai.
   */
  const allModels = tree.brands.flatMap((b) =>
    (b.models || []).filter((m) => m.slug !== modelSlug).map((m) => ({ ...m, brandSlug: b.slug }))
  );
  const fillStart = allModels.findIndex((m) => m.brandSlug === brandSlug);
  const seen = new Set(rotated.map((m) => m.slug));
  const fill = [];
  for (let i = 0; i < allModels.length && fill.length < Math.max(0, 8 - rotated.length); i++) {
    const m = allModels[(Math.max(0, fillStart) + i) % allModels.length];
    if (seen.has(m.slug)) continue;
    seen.add(m.slug);
    fill.push(m);
  }
  const siblings = [
    ...rotated.map((m) => ({ slug: m.slug, name: m.name, href: m.href })),
    ...fill.map((m) => ({ slug: m.slug, name: m.name, href: m.href })),
  ].slice(0, 8);

  return {
    page: model,
    brand: pick(brand, BRAND_FIELDS),
    siblings,
    hub: pick(tree.hub, HUB_FIELDS),
    serviceCategories: (tree.serviceCategories ?? []).map((c) => pick(c, CATEGORY_FIELDS)),
    branch: tree.branch,
    cities: tree.cities,
    locations: tree.locations,
    reviews: tree.reviews,
    sections: tree.sections,
  };
}
