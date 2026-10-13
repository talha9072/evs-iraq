import { staticBranch, staticCities, bakedLocale } from "@/lib/static-data";

/**
 * Branch, cities and tokens — from baked JSON rather than the platform database.
 *
 * This is the pre-launch Iraq site. The helpers below — `localised`,
 * `branchTokens`, `areaList`, `interpolate` — are copied verbatim from
 * EVS-Production/lib/branches.js so that a sentence rendered here and the same
 * sentence rendered on evsuae.com resolve their tokens identically. If that
 * file changes, this one has to be reconciled by hand; that is the cost of not
 * carrying a database.
 *
 * WHAT IS DELIBERATELY ABSENT: `support_phone`, `support_email` and the
 * locations list are null and empty on purpose. There is no Iraq workshop
 * yet. Publishing a placeholder address or number is how a Google Business
 * Profile gets suspended on the day you finally claim the real one — and it
 * misleads anyone who tries to call.
 */

export const CURRENT_BRANCH = "iraq";

/** 'ar-IQ' -> 'ar' -> 'en'. Rows carry jsonb maps, not strings. */
export function localised(map, locale) {
  if (!map) return null;
  if (typeof map === "string") return map;
  return map[locale] ?? map[String(locale).split("-")[0]] ?? map.en ?? null;
}

/**
 * Like localised, but with NO fall back to English.
 *
 * `country_name_the` only ever carries an English entry — "the UAE" — because
 * the article is an English grammar problem. Iraq takes no article, so the
 * value is null here and callers use the plain localised name.
 */
function localisedStrict(map, locale) {
  if (!map) return null;
  return map[locale] ?? map[String(locale).split("-")[0]] ?? null;
}

function areaList(cities, locale) {
  const names = cities.map((c) => localised(c.name, locale)).filter(Boolean);
  if (names.length < 2) return names[0] || "";

  const base = String(locale).split("-")[0];
  const head = names.slice(0, -1);
  const last = names[names.length - 1];

  // Arabic uses ، as its comma, and و is a prefix that attaches to the word
  // it joins - "دبي، أبوظبي والشارقة", not "... و الشارقة".
  if (base === "ar") return `${head.join("، ")} و${last}`;

  const and = base === "bn" ? "এবং" : "and";
  return `${head.join(", ")} ${and} ${last}`;
}

/**
 * Everything a page needs about where it is.
 *
 * Kept async because every call site was written against a database and this
 * is the only thing that differs between the two codebases.
 */
export async function getBranchContext(locale = "en", slug = CURRENT_BRANCH) {
  const branch = staticBranch();

  if (slug && slug !== branch.slug) {
    throw new Error(
      `[getBranchContext] this deployment serves "${branch.slug}", asked for "${slug}"`
    );
  }

  const cities = staticCities();
  return { branch, cities, tokens: branchTokens(branch, cities, locale) };
}

/**
 * Workshops. Empty, and that is the correct answer today.
 *
 * Returning [] rather than inventing a location keeps every consumer honest:
 * the branches section renders nothing and no LocalBusiness schema is emitted,
 * so the site never claims premises it does not have.
 */
export async function getLocations() {
  return [];
}

/** Reviews. None — the Baghdad workshop has not opened. */
export async function getReviews() {
  return [];
}

/** No sibling deployments to advertise from a single-country build. */
export async function activeDeployments() {
  return [];
}

/** A map link needs coordinates, and there are none to give. */
export function coordsLink() {
  return null;
}

/** The {{token}} values every page interpolates into its copy. */
export function branchTokens(branch, cities = [], locale = "en") {
  const primary = cities.find((c) => c.is_primary) ?? cities[0] ?? null;

  return {
    city: primary ? localised(primary.name, locale) : null,
    country: localised(branch.country_name, locale),
    country_the:
      localisedStrict(branch.country_name_the, locale) ??
      localised(branch.country_name, locale),
    country_code: branch.country_code,
    branch_name: branch.name,
    site_url: branch.site_url,
    phone: branch.support_phone,
    phone_display: branch.support_phone_display || branch.support_phone,
    email: branch.support_email,
    whatsapp: branch.whatsapp_number,
    areas: areaList(cities, locale),
  };
}

/** Which locale a table's copy actually came back in. */
export function contentLocale(table, locale = "en") {
  return bakedLocale(table, locale);
}

export function cityNames(cities = [], locale = "en") {
  return cities.map((c) => localised(c.name, locale)).filter(Boolean);
}

export function interpolate(value, tokens) {
  if (typeof value !== "string") return value;

  return value.replace(/\{\{(\w+)\}\}/g, (match, key) =>
    key in tokens && tokens[key] != null ? tokens[key] : match
  );
}

export function interpolateDeep(value, tokens) {
  if (Array.isArray(value)) return value.map((v) => interpolateDeep(v, tokens));

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, interpolateDeep(v, tokens)])
    );
  }

  return interpolate(value, tokens);
}
