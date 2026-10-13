import BrandHead from "@/components/car-brands/BrandHead";
import BrandPage from "@/components/car-brands/BrandPage";
import { getModelPage, getCarBrandsTree } from "@/lib/car-brands";

/**
 * A model page: /tesla/model-3. Same rewrite arrangement as the brand route.
 *
 * Models are the only car-brand pages that carry StatsCounter — the one block
 * that differs between the two levels, which is why `showStats` is a flag
 * rather than a second template.
 */
export default function Model({ page, siblings, brand, hub, serviceCategories, branch, cities, locations, reviews, sections }) {
  return (
    <>
      <BrandHead locale="en" page={page} brand={brand} hub={hub} branch={branch} cities={cities} />
      <BrandPage
        locale="en"
        page={page}
        brand={brand}
        siblings={siblings}
        hub={hub}
        serviceCategories={serviceCategories}
        showStats
        branch={branch}
        cities={cities}
        locations={locations}
        reviews={reviews}
      sections={sections} />
    </>
  );
}

/*
 * `blocking`, not `false`. The path list here is frozen at build time, so a
 * brand added to `car_brands` afterwards had no page at all and answered 404 -
 * measured on Qatar staging, where 15 of the 21 brands in the table 404'd
 * because only 6 existed when that build ran. `revalidate` could not help: it
 * refreshes pages that already exist, it does not create new ones.
 *
 * A slug that is not a real brand still 404s - `getStaticProps` returns
 * `notFound` - it just costs one render to find that out. Same reasoning, and
 * the same wording, as pages/blog/[slug].js.
 */
export async function getStaticPaths() {
  const tree = await getCarBrandsTree("en");
  const paths = (tree?.brands ?? []).flatMap((b) =>
    (b.models ?? []).map((m) => ({ params: { brand: b.slug, model: m.slug } }))
  );
  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const data = await getModelPage(params.brand, params.model, "en");
  if (!data) return { notFound: true };

  return {
    props: {
      page: data.page,
      brand: data.brand,
      siblings: data.siblings ?? [],
      hub: data.hub,
      serviceCategories: data.serviceCategories,
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
