import SeoHead, { localePath } from "@/components/services/SeoHead";
import { hubName } from "@/components/services/ServiceHead";
import { branchTokens, cityNames } from "@/lib/branches";

/**
 * A category page's <head>: everything SeoHead already does, plus the
 * Service graph that only this template needs.
 *
 * Three stored strings do the work - meta_title, meta_description,
 * meta_keywords. The rest is derived: canonical and hreflang from the branch
 * row, makesOffer from the category's own child rows, areaServed from the
 * branch's cities. So a new category needs no SEO work beyond those three,
 * and a new country needs none at all.
 */
export default function CategoryHead({ locale, category, branch, cities = [] }) {
  const countryName = branchTokens(branch, cities, locale).country;

  const title = category.meta_title || category.name;
  const description = category.meta_description || category.hero_description || "";

  const url = (path) => `${branch.site_url}${localePath(locale, path)}`;

  const serviceGraph = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: category.name,
    description,
    provider: {
      "@type": "Organization",
      name: branch.name,
      url: branch.site_url,
    },
    areaServed: cityNames(cities, locale).map((place) => ({
      "@type": "Place",
      name: `${place}, ${countryName}`,
    })),
    // the services actually offered under this category, straight from the
    // rows that render the list block - and using the same label the list
    // shows, so the structured data matches the visible page
    makesOffer: (category.children || []).map((child) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: child.list_title || child.name },
    })),
    // same helper the canonical uses, so the two can never disagree about
    // whether this locale carries a URL prefix
    url: url(category.path),
  };

  /*
   * BreadcrumbList - /services se is category tak.
   *
   * ServiceHead (leaf) yeh pehle se nikalta tha aur wahan likha tha ke "the
   * hub and category pages did not need one at two levels". Woh faisla
   * ghalat tha: /services/battery-electrical bhi do darje neeche hai, aur
   * SERP me trail usi tarah dikhti hai. Paanch category safhe - is site ke
   * sab se ahem safhon me se - bilkul khaali ja rahe the.
   *
   * Hub ka path category ke apne path se banta hai, hardcode nahi: slug
   * badle to trail apne aap sahi rahegi.
   */
  const hubPath = String(category.path || "").replace(/\/[^/]+$/, "");
  const trail = [
    hubPath && hubPath !== category.path && { name: hubName(locale), path: hubPath },
    { name: category.name, path: category.path },
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

  const graphs = [serviceGraph, breadcrumbs];

  /*
   * FAQPage - wahi sawal jo CategoryPage neeche accordion me dikhata hai.
   *
   * Matn safhe par pehle se maujood hai; sirf markup nahi tha. Is liye
   * yahan kuch naya likha nahi ja raha - jo padha ja sakta hai wahi machine
   * ko bhi bataya ja raha hai.
   *
   * IMAANDARI SE: Google ne Aug 2023 me FAQ rich results ko sarkari aur
   * sehat ki maroof sites tak mehdood kar diya tha, to SERP me sawal-jawab
   * ka dropdown aane ki tawaqqo nahi. Faida yeh hai ke safhe ka mazmoon
   * structured shakl me parha jata hai.
   */
  if (category.faqs?.length) {
    graphs.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${url(category.path)}#faq`,
      mainEntity: category.faqs
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
      path={category.path}
      title={title}
      description={description}
      keywords={category.meta_keywords}
      jsonLd={graphs}
    />
  );
}
