import ServiceHead from "@/components/services/ServiceHead";
import ServicePage from "@/components/services/ServicePage";
import { getServicePage, getServicesTree } from "@/lib/services";
import { LOCALES, DEFAULT_LOCALE, isRtl } from "@/lib/locale";

/**
 * Leaf service pages for every language except English:
 *   /ar/services/programming/custom-region-coding
 *   /ar-IQ/services/battery-electrical/pdu-repair
 *   /bn/services/insurance/direct-billing
 *
 * English keeps its own unprefixed route. The 32 hand-written Arabic files
 * this replaces were plain mirrors of the English ones - same blocks, same
 * order, only the prop names differed - so there is nothing to preserve by
 * keeping them.
 *
 * The `dir="rtl"` wrapper is the same one the category route applies: the
 * legacy stylesheet expects it, and it is what makes the flex rows lay out
 * from the right.
 */
export default function LocaleServiceLeaf({
  siblings,
  locale,
  service,
  category,
  categories,
  hub,
  branch,
  cities,
  locations,
  reviews, sections
}) {
  const body = (
    <ServicePage
      locale={locale}
      service={service}
      category={category}
        siblings={siblings}
      categories={categories}
      branch={branch}
      cities={cities}
      locations={locations}
      reviews={reviews}
    sections={sections} />
  );

  return (
    <>
      <ServiceHead
        locale={locale}
        service={service}
        category={category}
        hub={hub}
        branch={branch}
        cities={cities}
      />
      {isRtl(locale) ? (
        <div dir="rtl" className="arabic-page">
          {body}
        </div>
      ) : (
        body
      )}
    </>
  );
}

export async function getStaticPaths() {
  const locales = LOCALES.filter((l) => l !== DEFAULT_LOCALE);
  const paths = [];

  // Per locale, because `only_for` can hide a service from one branch and the
  // tree is resolved per language - so the path list is not simply the English
  // one repeated.
  for (const locale of locales) {
    const tree = await getServicesTree(locale);
    for (const category of tree?.categories ?? []) {
      for (const service of category.children ?? []) {
        paths.push({
          params: { locale, category: category.slug, service: service.slug },
        });
      }
    }
  }

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  if (!LOCALES.includes(params.locale) || params.locale === DEFAULT_LOCALE) {
    return { notFound: true };
  }

  const data = await getServicePage(
    params.category,
    params.service,
    params.locale
  );

  if (!data) return { notFound: true };

  return {
    props: {
      locale: params.locale,
      service: data.service,
      siblings: data.siblings ?? [],
      category: data.category,
      categories: data.categories,
      hub: data.hub,
      branch: data.branch,
      cities: data.cities,
      locations: data.locations,
      reviews: data.reviews,
      sections: data.sections,
      useScrollContainer: false,
    },
    revalidate: 2592000,
  };
}
