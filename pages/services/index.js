import BranchesSection from "@/components/modern/BranchesSection";
import ReviewsSection from "@/components/modern/ReviewsSection";
import ServicesHub from "@/components/services/ServicesHub";
import SeoHead from "@/components/services/SeoHead";
import { getServicesHub } from "@/lib/services";
import { HUB_SEO, hubJsonLd } from "@/components/services/hubSeo";
import { localePath } from "@/components/services/SeoHead";

// The page shell stays static; the hero, the showcase panels and the All
// Services grid come from the platform DB via ServicesHub, which the Arabic
// page renders too. Adding a category row adds a panel and a grid card in
// every language with no code change and no deploy.
//
// The <head> used to hardcode evsuae.com in seven places - canonical,
// hreflang, og:url, og:image - so a Qatar build would have told Google it
// was the UAE site. SeoHead derives all of it from the branch row.
//
// Branches stays a plain prop component, untouched.

export default function Services({ categories, branch, cities, locations, reviews, sections }) {
  return (
    <>
      <SeoHead
        locale="en"
        branch={branch}
        cities={cities}
        path="services"
        {...HUB_SEO.en}
        jsonLd={hubJsonLd({
          cities,
          categories,
          branch,
          locale: "en",
          canonical: `${branch.site_url}${localePath("en", "services")}`,
          ...HUB_SEO.en,
        })}
      />

      <ServicesHub
        locale="en"
        categories={categories}
        branch={branch}
        cities={cities}
      />
      <BranchesSection
        locale="en"
        branch={branch}
        locations={locations}
        sections={sections}
        limit={6}
      />

      <ReviewsSection
        locale="en"
        branch={branch}
        reviews={reviews}
        sections={sections}
      />
    </>
  );
}

export async function getStaticProps() {
  const tree = await getServicesHub("en");

  return {
    props: {
      categories: tree?.categories ?? [],
      branch: tree?.branch ?? null,
      cities: tree?.cities ?? [],
      locations: tree?.locations ?? [],
      reviews: tree?.reviews ?? [],
      sections: tree?.sections ?? null,
      noHeader: false,
      noFooter: false,
      // /js/blog.js used to be loaded here, and this page has no
      // #blog-container - so the script hit its own guard and re-scheduled
      // itself every 300ms, forever, doing nothing. The blog grid is React
      // now; the script is gone.
    },
    // A database edit appears within five minutes, with no webhook to set
    // up or keep working. At 60s this regenerated up to 1440 times a day;
    // five minutes is 12x cheaper and still fast enough to edit against.
    revalidate: 2592000,
  };
}
