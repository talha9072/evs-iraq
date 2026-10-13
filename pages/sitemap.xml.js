import { getServicesTree } from "@/lib/services";
import { getCarBrandsTree } from "@/lib/car-brands";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/locale";

/**
 * The sitemap, built from the same trees the pages are built from.
 *
 * IT LISTS ONLY ROUTES THAT EXIST. The UAE version of this file also emitted
 * blog posts, workshops, warranties and the contact page; none of those are
 * routes on evsiraq.com yet, and a sitemap that points at 404s is worse than no
 * sitemap at all — it spends crawl budget proving the site is incomplete.
 *
 * Every URL is emitted once per published locale with `hreflang` alternates, so
 * Google is told the English and Arabic pages are the same page rather than
 * being left to guess from near-identical copy.
 */

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://evsiraq.com").replace(/\/$/, "");

const href = (locale, path) => {
  const clean = path.replace(/^\/+/, "");
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  /* THE HOME PAGE KEEPS ITS TRAILING SLASH. localePath() returns "/" for an
     empty path, so every page canonical and hreflang reads
     https://evsiraq.com/ - and this returned it without the slash, so the
     sitemap and the page disagreed about the home URL. The only such
     disagreement on the site. */
  return `${SITE}${prefix}${clean ? `/${clean}` : prefix ? "" : "/"}`;
};

/** The fixed routes this deployment serves. */
const STATIC_PATHS = ["", "about", "services", "ev-car-brands", "frequently-asked-questions", "contact", "our-network", "franchise", "privacy-policy"];

function urlEntry(path, changefreq, priority) {
  const alternates = LOCALES.map(
    (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${href(l, path)}"/>`
  )
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${href(DEFAULT_LOCALE, path)}"/>`)
    .join("\n");

  return LOCALES.map(
    (locale) => `  <url>
    <loc>${href(locale, path)}</loc>
${alternates}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  ).join("\n");
}

export async function getServerSideProps({ res }) {
  const paths = [...STATIC_PATHS];

  /* Services: each category and every leaf under it. The tree comes back as
     { hero, categories }, with leaves hanging off each category's `children`. */
  const services = await getServicesTree(DEFAULT_LOCALE);
  for (const category of services?.categories || []) {
    if (category.path) paths.push(category.path);
    for (const leaf of category.children || []) {
      if (leaf.path) paths.push(leaf.path);
    }
  }

  /* Brands: every marque and every model under it, as { hub, brands }.

     THE SHORT FORM, NOT /ev-car-brands/<slug>. Both resolve — next.config
     rewrites the bare path — but the pages canonicalise to the short one, so
     listing the long one tells Google to crawl 208 URLs it will then be told
     to ignore. On a domain with no crawl history that is the whole budget
     spent proving a point. */
  const brands = await getCarBrandsTree(DEFAULT_LOCALE);
  for (const brand of brands?.brands || []) {
    if (brand.path) paths.push(brand.path);
    for (const model of brand.children || brand.models || []) {
      if (model.path) paths.push(model.path);
    }
  }

  const unique = [...new Set(paths)];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${unique
  .map((p) => urlEntry(p, p === "" ? "weekly" : "monthly", p === "" ? "1.0" : p.includes("/") ? "0.6" : "0.8"))
  .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.write(body);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
