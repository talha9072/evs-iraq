import BrandHead from "@/components/car-brands/BrandHead";
import BrandPage from "@/components/car-brands/BrandPage";
import { getBrandPage, getCarBrandsTree } from "@/lib/car-brands";

/**
 * A brand page. The public URL is /tesla, NOT /ev-car-brands/tesla — a
 * next.config afterFiles rewrite maps one onto the other, because
 * pages/[brand]/index.js is impossible while pages/[locale]/ exists. See the
 * comment on `rewrites` in next.config.mjs.
 *
 * The canonical comes from the row's own path, so it reads /tesla.
 */
export default function Brand({ page, hub, models, siblings, serviceCategories, branch, cities, locations, reviews, sections }) {
  return (
    <>
      <BrandHead locale="en" page={page} hub={hub} branch={branch} cities={cities} />
      <BrandPage
        locale="en"
        page={page}
        hub={hub}
        serviceCategories={serviceCategories}
        models={models}
        siblings={siblings}
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
  return {
    paths: (tree?.brands ?? []).map((b) => ({ params: { brand: b.slug } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const data = await getBrandPage(params.brand, "en");
  if (!data) return { notFound: true };

  return {
    props: {
      page: data.page,
      hub: data.hub,
      models: data.models,
      siblings: data.siblings ?? [],
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
