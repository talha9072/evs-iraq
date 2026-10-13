import SeoHead, { localePath } from "@/components/services/SeoHead";
import { branchTokens, cityNames } from "@/lib/branches";

/**
 * <head> for a car-brand page: hub, brand or model.
 *
 * Reuses SeoHead, so canonical, hreflang, og and twitter all come from the
 * branch row exactly as they do on the services pages - one place that knows
 * the site's identity, so a Qatar deployment cannot announce itself as the UAE.
 *
 * The graph differs by level:
 *   hub     CollectionPage listing the five brands
 *   brand   Service + BreadcrumbList
 *   model   Service + BreadcrumbList, one level deeper
 *
 * `Service` rather than `Product`: the page sells servicing for a car, it does
 * not sell the car. Saying otherwise would invite Google to ask for a price and
 * an availability that do not exist.
 */

const HUB_NAME = {
  en: "Car Brands",
  ar: "ماركات السيارات",
  bn: "গাড়ির ব্র্যান্ড",
};

const hubName = (locale) =>
  HUB_NAME[locale] ?? HUB_NAME[String(locale).split("-")[0]] ?? HUB_NAME.en;

export default function BrandHead({
  locale,
  page,
  brand,
  hub,
  brands = [],
  branch,
  cities = [],
}) {
  const countryName = branchTokens(branch, cities, locale).country;
  const url = (path) => `${branch.site_url}${localePath(locale, path)}`;

  const title = page.meta_title || page.name;
  const description = page.meta_description || page.hero_description || "";

  const isHub = page.type === "hero";

  const graphs = [];

  if (isHub) {
    graphs.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: url(page.path),
      hasPart: brands.map((b) => ({
        "@type": "Service",
        name: b.name,
        url: url(b.path),
      })),
    });
  } else {
    graphs.push({
      "@context": "https://schema.org",
      "@type": "Service",
      name: page.name,
      description,
      // a model's category is its brand; a brand's is the hub
      category: brand ? brand.name : hubName(locale),
      provider: {
        "@type": "Organization",
        name: branch.name,
        url: branch.site_url,
      },
      areaServed: cityNames(cities, locale).map((place) => ({
        "@type": "Place",
        name: `${place}, ${countryName}`,
      })),
      url: url(page.path),
    });

    // Built from the rows, not by splitting the path: a renamed slug cannot
    // leave the trail pointing at a URL that no longer exists. The hub's label
    // comes from HUB_NAME because its own row carries the site's copy, and the
    // trail reads better with a word than with "ev-car-brands".
    const trail = [
      hub && { name: hubName(locale), path: hub.path },
      brand && { name: brand.name, path: brand.path },
      { name: page.name, path: page.path },
    ].filter((step) => step && step.name);

    graphs.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: trail.map((step, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: step.name,
        item: url(step.path),
      })),
    });
  }

  /*
   * FAQPage - un sawalon ka schema jo safha pehle se dikha raha hai.
   *
   * Yeh markup safhe par tha hi nahi, jabke har brand safhe par FAQs
   * chhapti hain. 326 me se sirf do safhon par FAQPage tha. Google isi
   * markup se SERP me sawal-jawab dikhata hai, aur bina iske woh mauqa
   * poora zaya jaata hai.
   *
   * `lib/faqs.js` ka builder `answer_html` maangta hai kyunki wahan jawab
   * HTML hote hain; yahan wale saada matn hain, is liye graph seedha banaya
   * ja raha hai - wahi rows jo accordion dikhata hai, taake markup aur
   * nazar aane wala matn kabhi alag na hon.
   */
  if (page.faqs?.length) {
    graphs.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${url(page.path)}#faq`,
      mainEntity: page.faqs
        .filter((f) => f.question && f.answer)
        .map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
    });
  }

  return (
    <SeoHead
      locale={locale}
      branch={branch}
      cities={cities}
      path={page.path}
      title={title}
      description={description}
      keywords={page.meta_keywords}
      jsonLd={graphs.length === 1 ? graphs[0] : graphs}
    />
  );
}
