import BrandHead from "@/components/car-brands/BrandHead";
import BrandPage from "@/components/car-brands/BrandPage";
import { getBrandPage, getCarBrandsTree } from "@/lib/car-brands";
import { LOCALES, DEFAULT_LOCALE, isRtl } from "@/lib/locale";

/** /ar/tesla and friends. The rewrite in next.config maps the public URL here. */
export default function LocaleBrand({ locale, page, hub, models, siblings, serviceCategories, branch, cities, locations, reviews, sections }) {
  const body = (
    <BrandPage
      locale={locale}
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
  );

  return (
    <>
      <BrandHead locale={locale} page={page} hub={hub} branch={branch} cities={cities} />
      {isRtl(locale) ? <div dir="rtl" className="arabic-page">{body}</div> : body}
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
  const paths = [];
  for (const locale of LOCALES.filter((l) => l !== DEFAULT_LOCALE)) {
    const tree = await getCarBrandsTree(locale);
    for (const b of tree?.brands ?? []) paths.push({ params: { locale, brand: b.slug } });
  }
  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  if (!LOCALES.includes(params.locale) || params.locale === DEFAULT_LOCALE) {
    return { notFound: true };
  }

  const data = await getBrandPage(params.brand, params.locale);
  if (!data) return { notFound: true };

  return {
    props: {
      locale: params.locale,
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
