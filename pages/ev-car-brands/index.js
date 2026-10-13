import BrandHead from "@/components/car-brands/BrandHead";
import BrandsHub from "@/components/car-brands/BrandsHub";
import { getBrandsHub } from "@/lib/car-brands";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * /ev-car-brands - the unprefixed locale.
 *
 * Was 517 lines of markup written straight into this file, beside a 551-line
 * [locale] twin that was the same page with the copy translated in place. Both
 * are components/car-brands/BrandsHub now, over the same rows.
 */
export default function EVBrands({ hub, brands, branch, cities, locations, reviews, sections }) {
  return (
    <>
      <BrandHead locale={DEFAULT_LOCALE} page={hub} brands={brands} branch={branch} cities={cities} />
      <BrandsHub
        locale={DEFAULT_LOCALE}
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

export async function getStaticProps() {
  const data = await getBrandsHub("en");
  if (!data) return { notFound: true };

  return {
    props: { ...data },
    revalidate: 2592000,
  };
}
