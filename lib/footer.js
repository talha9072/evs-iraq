/**
 * Everything in the footer that differs per country, from the database.
 *
 * WHAT THIS REPLACES. `Footer.js` and `FooterAr.js` printed the UAE's phone,
 * mailbox, social accounts, five UAE workshops and the UAE's opening hours on
 * every deployment. The worst of those was the hours: `branches.opening_hours`
 * has always known that Qatar runs Sun-Thu 08:00-19:00 and closes Friday AND
 * Saturday, while evsqtr.com's footer printed the UAE's Sat-Thu split shift.
 *
 * WHAT STAYS IN CODE. The column headings, the copyright line, the "Website
 * crafted by" credit and the six Quick Links. None of them grow when a workshop
 * or a service is added.
 *
 * ONE FETCH, NOT TWO. This is served by `pages/api/nav/[locale].js` alongside the header's
 * menus, because the header and footer are rendered by the same `_app.js` on the
 * same page and there is no reason to pay for two round trips or two caches.
 */
import { getServicesTree } from "@/lib/services";
import { getBranchContext, getLocations, CURRENT_BRANCH } from "@/lib/branches";
import { resolved } from "@/lib/static-data";
import { DEFAULT_LOCALE } from "@/lib/locale";
import { cached } from "@/lib/cache";
import network from "@/data/network.json";

/**
 * The one entry in "EVS Network" that is not a deployment of this platform.
 *
 * evsworldwide.com is the group site, not a country, so it has no `branches`
 * row to come from and is written in here. It is always first.
 *
 * Saudi Arabia used to be written in beside it, for the same reason
 * `evs-riyadh` is an exception in lib/nav.js: it had no `branches` row. It has
 * one now - published, with `site_url` and `country_code` - so it arrives from
 * the query like every other country, and the hand-written entry that used to
 * sit at the end of this column has been removed. Keeping both printed
 * "EVS Saudi Arabia" twice in every footer.
 */
const NETWORK_FIRST = {
  href: "https://evsworldwide.com",
  // Latin "EVS" plus the Arabic word, which is what the Arabic footer prints.
  label: { en: "EVS Worldwide", ar: "EVS العالمية", bn: "ইভিএস ওয়ার্ল্ডওয়াইড" },
};

/** "EVS" in each script, for building a site's name from its country. */
const BRAND = { en: "EVS", ar: "إي في إس", bn: "ইভিএস" };

/**
 * A branch's name in one language - "EVS Qatar", "إي في إس قطر".
 *
 * `branches.name` is plain text and English only, so the localised form is built
 * from `country_name`, which is a locale map. For English that reproduces `name`
 * exactly; scripts/verify/footer.mjs asserts it for every sibling.
 *
 * Exported because the home page's og:site_name and Organization graph want the
 * same string the footer's network column does.
 */
export function siteName(branch, locale = DEFAULT_LOCALE) {
  return `${pick(BRAND, locale)} ${pick(branch.country_name, locale)}`;
}

/** The social accounts the footer shows, in the order it shows them. */
const SOCIAL_ORDER = ["facebook", "tiktok", "linkedin", "instagram"];

const pick = (map, locale) =>
  map?.[locale] ?? map?.[String(locale).split("-")[0]] ?? map?.en ?? null;

const hrefFor = (path, locale) =>
  locale === DEFAULT_LOCALE ? `/${path}` : `/${locale}/${path}`;

/** Published branches other than this one, for the EVS Network column. */
async function siblingBranches() {
  return cached("footer:siblings", async () => {
    /* From data/network.json rather than a `branches` query — the same list
       /our-network renders, so the footer and that page can never disagree
       about which countries EVS is in.

       Only countries with a live site appear: a footer link to a country that
       has no site yet is a dead end, and the three "planned" markets have
       nothing to point at. They are still listed on /our-network, where the
       status badge explains them. */
    return network.countries
      .filter((country) => country.url && country.status === "open")
      .map((country) => ({
        slug: country.slug,
        site_url: country.url,
        country_code: country.code?.toUpperCase() ?? null,
        country_name: country.name,
        name: `EVS ${country.name.en}`,
      }));
  });
}

/**
 * The footer's per-country content for one locale.
 *
 * Cached per branch and locale, like the nav.
 */
export async function getFooter(locale = DEFAULT_LOCALE) {
  return cached(`footer:${CURRENT_BRANCH}:${locale}`, () => loadFooter(locale));
}

async function loadFooter(locale) {
  const [{ branch }, services, siblings] = await Promise.all([
    getBranchContext(locale),
    getServicesTree(locale),
    siblingBranches(),
  ]);

  if (!services?.categories?.length) {
    throw new Error(`[getFooter] no service categories for ${locale}`);
  }

  const locations = await getLocations(locale, branch);
  const hours = branch.opening_hours ?? {};

  return {
    branchName: branch.name,

    // ISO 3166-1 alpha-2, for the header's flag. Every country's flag is in
    // public/img/flags keyed on this code, so onboarding a country is a
    // `branches` row and nothing else - there is no list in code to extend.
    countryCode: branch.country_code ?? null,

    // tel: gets the E.164 number, the text gets the way the country writes it.
    // Oman and Qatar had no display form until 0061; falling back to E.164 is
    // ugly but honest, and better than printing the UAE's.
    phone: branch.support_phone ?? null,
    phoneDisplay: branch.support_phone_display || branch.support_phone || null,
    email: branch.support_email ?? null,

    // Digits only, which is what wa.me wants. The floating WhatsApp button in
    // _app.js and the header's contact block both read this; both used to have
    // Dubai's mobile written into them on every country.
    whatsapp: branch.whatsapp_number
      ? branch.whatsapp_number.replace(/[^\d]/g, "")
      : null,

    social: SOCIAL_ORDER.map((key) => ({
      key,
      href: branch.social_links?.[key] ?? null,
    })).filter((item) => item.href),

    // The footer lists the ordinary workshops only - no Express, and no Riyadh.
    // That is how all three live footers read, and it is why this filters on
    // `variant` where the header's Branches menu does not.
    locations: locations
      .filter((row) => row.page_path && row.variant !== "express")
      .slice()
      .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999))
      .map((row) => ({
        href: hrefFor(row.page_path, locale),
        label: pick(row.name, locale) ?? row.slug,
      })),

    services: services.categories.map((category) => ({
      href: category.href,
      label: category.name,
    })),

    /* `code` IS THE FLAG, and it is null on exactly one entry - Worldwide is
       the group site, not a country, so the footer draws a globe there. Every
       other entry, Saudi Arabia included, comes from the query and carries its
       own `country_code`; the order is the `sort_order` the query asked for. */
    network: [
      { href: NETWORK_FIRST.href, label: pick(NETWORK_FIRST.label, locale), code: null },
      ...siblings
        .filter((sibling) => sibling.slug !== CURRENT_BRANCH)
        .map((sibling) => ({
          href: sibling.site_url,
          label: siteName(sibling, locale),
          code: sibling.country_code ?? null,
        })),
    ],

    // Four separate strings, not one sentence: the English footer puts the day
    // in `.opening-day`, which is `width:100px; display:inline-block`, and that
    // is what lines the two rows up. Added by 0061; `label`/`closed` are the
    // older single-string form and are not used here.
    hours: {
      day: pick(hours.day, locale),
      time: pick(hours.time, locale),
      closedDay: pick(hours.closed_day, locale),
      closedNote: pick(hours.closed_note, locale),
    },
  };
}
