import CategoryHead from "@/components/services/CategoryHead";
import CategoryPage from "@/components/services/CategoryPage";
import { getCategoryPage, getServicesTree } from "@/lib/services";
import { LOCALES, DEFAULT_LOCALE, isRtl } from "@/lib/locale";

/**
 * Category pages for every language except English:
 *   /ar/services/programming   /ar-IQ/services/programming
 *   /bn/services/programming   ...
 *
 * English keeps its own unprefixed route. Arabic no longer has hand-written
 * category files - unlike the hub, whose Arabic page carries a bespoke
 * <Head>, these five were plain mirrors, so there is nothing to preserve by
 * keeping them.
 *
 * locales x categories paths are generated from the database, so a new
 * category appears in every language at once.
 */
export default function LocaleServiceCategory({ locale, category, categories, branch, cities, locations, reviews, sections }) {
  const body = (
    <CategoryPage
        locale={locale}
        category={category}
        categories={categories}
        branch={branch}
        cities={cities}
        locations={locations}
        reviews={reviews}
      sections={sections} />
  );

  return (
    <>
      <CategoryHead locale={locale} category={category} branch={branch} cities={cities} />
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

  for (const locale of locales) {
    const tree = await getServicesTree(locale);
    for (const category of tree?.categories ?? []) {
      paths.push({ params: { locale, category: category.slug } });
    }
  }

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const data = await getCategoryPage(params.category, params.locale);

  if (!data) return { notFound: true };

  return {
    props: {
      locale: params.locale,
      category: data.category,
      categories: data.categories,
      branch: data.branch,
      cities: data.cities,
      locations: data.locations,
      reviews: data.reviews,
      sections: data.sections,
      useScrollContainer: false,
    },
    // See the note in pages/services/index.js.
    revalidate: 2592000,
  };
}
