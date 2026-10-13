import ServicesHub from "@/components/services/ServicesHub";
import SeoHead, { localePath } from "@/components/services/SeoHead";
import BranchesSection from "@/components/modern/BranchesSection";
import ReviewsSection from "@/components/modern/ReviewsSection";
import { getServicesHub } from "@/lib/services";
import { HUB_SEO, hubJsonLd } from "@/components/services/hubSeo";
import { LOCALES, isRtl } from "@/lib/locale";

/**
 * /{locale}/services for every prefixed language: ar, ar-IQ, bn.
 *
 * English lives at /services, unprefixed, because those URLs are indexed - that
 * is the only page file left.
 *
 * Arabic used to have pages/ar/services/index.js too, 61 lines whose body was
 * this one with "ar" written in place of `locale`. The RTL wrapper below is
 * character-for-character what that file had, so it was deleted and "ar" came out
 * of the list: one file, three languages.
 *
 * Adding a language: one LOCALES entry, one COPY entry in ServicesHub, one
 * HUB_SEO entry, and its service_content rows. No new file.
 *
 * The <head> and the hero copy both used to hardcode a UAE domain and the
 * word "UAE"; SeoHead and {{country}} take both from the branch row.
 */
const HANDLED_BY_OWN_FILE = ["en"];

export default function LocaleServices({ locale, categories, branch, cities, locations, reviews, sections }) {
  const rtl = isRtl(locale);
  const seo = HUB_SEO[locale] || HUB_SEO.en;

  const body = (
    <>
      <ServicesHub
        locale={locale}
        categories={categories}
        branch={branch}
        cities={cities}
      />
      <BranchesSection
        locale={locale}
        branch={branch}
        locations={locations}
        sections={sections}
        limit={6}
      />

      <ReviewsSection
        locale={locale}
        branch={branch}
        reviews={reviews}
        sections={sections}
      />
    </>
  );

  return (
    <>
      <SeoHead
        locale={locale}
        branch={branch}
        cities={cities}
        path="services"
        {...seo}
        jsonLd={hubJsonLd({
          categories,
          branch,
          cities,
          locale,
          canonical: `${branch.site_url}${localePath(locale, "services")}`,
          ...seo,
        })}
      />

      {rtl ? (
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
  return {
    paths: LOCALES.filter((l) => !HANDLED_BY_OWN_FILE.includes(l)).map((locale) => ({
      params: { locale },
    })),
    // Anything that is not a published locale is a 404, not a build of an
    // empty page - /byd/services must not resolve here.
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const tree = await getServicesHub(params.locale);

  return {
    props: {
      locale: params.locale,
      categories: tree?.categories ?? [],
      branch: tree?.branch ?? null,
      cities: tree?.cities ?? [],
      locations: tree?.locations ?? [],
      reviews: tree?.reviews ?? [],
      sections: tree?.sections ?? null,
    },
    // See the note in pages/services/index.js.
    revalidate: 2592000,
  };
}
