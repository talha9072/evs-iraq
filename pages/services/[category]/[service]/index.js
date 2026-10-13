import ServiceHead from "@/components/services/ServiceHead";
import ServicePage from "@/components/services/ServicePage";
import { getServicePage, getServicesTree } from "@/lib/services";

/**
 * English leaf service pages:
 *   /services/programming/custom-region-coding
 *   /services/battery-electrical/pdu-repair
 *   ...
 *
 * One file for all 32, and for any service added later. The 32 hand-written
 * folders it replaces are deleted only once a parity diff against them passes.
 */
export default function ServiceLeaf({
  service,
  siblings,
  category,
  categories,
  hub,
  branch,
  cities,
  locations,
  reviews, sections
}) {
  return (
    <>
      <ServiceHead
        locale="en"
        service={service}
        category={category}
        hub={hub}
        branch={branch}
        cities={cities}
      />
      <ServicePage
        locale="en"
        service={service}
        siblings={siblings}
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

  // Built from the tree rather than from the paths themselves: the category
  // slug in the URL has to be the service's ACTUAL parent, so a service can
  // only ever be reached at one address.
  const paths = (tree?.categories ?? []).flatMap((c) =>
    (c.children ?? []).map((s) => ({
      params: { category: c.slug, service: s.slug },
    }))
  );

  /*
   * `fallback: false` - AUR ISI LIYE NAI SERVICE KE BAAD REDEPLOY LAZMI HAI.
   *
   * Brand safhe `fallback: "blocking"` par hain, is liye DB me naya brand
   * daalte hi uska safha pehli request par khud ban jata hai. Services aise
   * nahi: yahan sirf woh raaste chalte hain jo build ke waqt is list me the.
   * Naya service DB me maujood hone ke bawajood 404 deta rahega jab tak site
   * dobara build na ho.
   *
   * Yeh pehli baar `charger-installation` aur `mobile-service` ke saath saamne
   * aaya - dono platform DB me daale gaye, brand safhe teen mulkon par khud
   * aa gaye, magar ye do tab tak nahi aaye jab tak har site dobara deploy na
   * hui. Rakha waise hi hai: `false` ka matlab hai ke ghalat pata 404 deta hai
   * na ke khaali safha banata hai, aur woh behtar hai.
   */
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const data = await getServicePage(params.category, params.service, "en");

  if (!data) return { notFound: true };

  return {
    props: {
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
