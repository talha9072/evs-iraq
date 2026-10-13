import BrandHead from "@/components/car-brands/BrandHead";
import BrandsHub from "@/components/car-brands/BrandsHub";
import { getBrandsHub } from "@/lib/car-brands";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/locale";

/**
 * /{locale}/ev-car-brands for every prefixed language.
 *
 * The Arabic copy that used to be written into this file is a locale entry in
 * BrandsHub now, which is what lets ar, ar-IQ and bn share one component
 * without bn inheriting Arabic prose - see the note there.
 */
export default function LocaleEVBrands({ locale, hub, brands, branch, cities, locations, reviews, sections }) {
  return (
    <>
      <BrandHead locale={locale} page={hub} brands={brands} branch={branch} cities={cities} />
      <BrandsHub
        locale={locale}
        hub={hub}
        brands={brands}
        branch={branch}
        cities={cities}
        locations={locations}
        reviews={reviews}
        sections={sections}
      />
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: LOCALES.filter((l) => l !== DEFAULT_LOCALE).map((locale) => ({ params: { locale } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  if (!LOCALES.includes(params.locale) || params.locale === DEFAULT_LOCALE) {
    return { notFound: true };
  }

  const data = await getBrandsHub(params.locale);
  if (!data) return { notFound: true };

  return {
    props: { locale: params.locale, ...data },
    revalidate: 2592000,
  };
}
