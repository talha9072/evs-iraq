import SeoHead, { localePath } from "@/components/services/SeoHead";
import { branchTokens, cityNames } from "@/lib/branches";

/**
 * A leaf service page's <head>.
 *
 * Same three stored strings as a category page - meta_title, meta_description,
 * meta_keywords - and everything else derived. Two things differ from
 * CategoryHead:
 *
 *   - the Service graph has no makesOffer, because a leaf offers nothing
 *     beneath it. It gains `category`, which is what schema.org calls
 *     serviceType, so a crawler can see that "PDU Repair" is a kind of
 *     "Battery & Electrical".
 *   - breadcrumbs. A leaf sits three levels deep - /services →
 *     /services/{category} → here - and that trail is worth publishing. The
 *     hub and category pages did not need one at two levels.
 */
/**
 * The /services hub's name, for the first breadcrumb step.
 *
 * In code, not in the database, because the hub itself is: its hero and SEO
 * strings are one decision per language rather than per row, so its
 * service_content row has no name to read.
 */
const HUB_NAME = {
  en: "Services",
  ar: "الخدمات",
  bn: "সার্ভিস",
};

/* Exported: CategoryHead ab apni trail bhi nikalta hai, aur do jagah ek hi
   naam ki do copies rakhna wahi drift hai jo pehle bhi ho chuki hai. */
export const hubName = (locale) =>
  HUB_NAME[locale] ?? HUB_NAME[String(locale).split("-")[0]] ?? HUB_NAME.en;

export default function ServiceHead({
  locale,
  service,
  category,
  hub,
  branch,
  cities = [],
}) {
  const countryName = branchTokens(branch, cities, locale).country;

  const title = service.meta_title || service.name;
  const description =
    service.meta_description || service.hero_description || "";

  const url = (path) => `${branch.site_url}${localePath(locale, path)}`;

  const serviceGraph = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description,
    category: category.name,
    provider: {
      "@type": "Organization",
      name: branch.name,
      url: branch.site_url,
    },
    areaServed: cityNames(cities, locale).map((place) => ({
      "@type": "Place",
      name: `${place}, ${countryName}`,
    })),
    url: url(service.path),
  };

  // Built from the rows themselves rather than by splitting the path, so a
  // renamed slug cannot leave the trail pointing at a URL that no longer
  // exists.
  //
  // The hub's label comes from HUB_NAME, not from its row: the /services hero
  // is the one page whose copy deliberately lives in code, so its
  // service_content row carries no name at all. Reading hub.name published a
  // breadcrumb whose first item was an empty string.
  const trail = [
    hub && { name: hubName(locale), path: hub.path },
    { name: category.name, path: category.path },
    { name: service.name, path: service.path },
  ].filter((step) => step && step.name);

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: url(step.path),
    })),
  };

  /*
   * FAQPage - wahi sawal jo safha neeche accordion me dikha raha hai.
   *
   * Service safhon par bhi yeh markup nahi tha. Google isi se SERP me
   * sawal-jawab dikhata hai; markup ke bagair woh jagah kisi aur ko milti
   * hai. Rows wahi hain jo accordion parhta hai, taake likha aur dikhaya
   * gaya kabhi alag na ho.
   */
  const graphs = [serviceGraph, breadcrumbs];
  if (service.faqs?.length) {
    graphs.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${url(service.path)}#faq`,
      mainEntity: service.faqs
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
      path={service.path}
      title={title}
      description={description}
      keywords={service.meta_keywords}
      jsonLd={graphs}
    />
  );
}
