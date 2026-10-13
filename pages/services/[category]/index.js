import CategoryHead from "@/components/services/CategoryHead";
import CategoryPage from "@/components/services/CategoryPage";
import { getCategoryPage, getServicesTree } from "@/lib/services";

/**
 * English category pages: /services/programming, /services/mechanical, ...
 *
 * One file for all five, and for any category added later. The five
 * hand-written folders it replaces are deleted only once a parity diff
 * against them passes.
 */
export default function ServiceCategory({ category, categories, branch, cities, locations, reviews, sections }) {
  return (
    <>
      <CategoryHead locale="en" category={category} branch={branch} cities={cities} />
      <CategoryPage
        locale="en"
        category={category}
        categories={categories}
        branch={branch}
        cities={cities}
        locations={locations}
        reviews={reviews}
      sections={sections} />
    </>
  );
}

export async function getStaticPaths() {
  const tree = await getServicesTree("en");

  return {
    paths: (tree?.categories ?? []).map((c) => ({ params: { category: c.slug } })),
    // A category added to the database after this build should 404 until the
    // next one rather than render a page with no copy in it.
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const data = await getCategoryPage(params.category, "en");

  // Not a published category - 404 rather than an empty shell.
  if (!data) return { notFound: true };

  return {
    props: {
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
