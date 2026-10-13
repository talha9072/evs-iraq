import SeoHead from "@/components/services/SeoHead";
import NetworkGrid from "@/components/launch/NetworkGrid";
import { getBranchContext } from "@/lib/branches";
import { networkJsonLd } from "@/lib/launch-seo";
import { DEFAULT_LOCALE } from "@/lib/locale";

export default function NetworkRoute({ locale, branch, cities }) {
  return (
    <>
      <SeoHead
        locale={locale}
        branch={branch}
        cities={cities}
        path="our-network"
        title="The EVS Network | EV Service Centres Across the Gulf"
        description="EVS runs specialist electric-vehicle workshops in the UAE, Saudi Arabia, Qatar and Oman, with Bahrain and Iraq opening soon. Every country, every site."
        jsonLd={networkJsonLd(locale)}
      />
      <NetworkGrid locale={locale} />
    </>
  );
}

export async function getStaticProps() {
  const { branch, cities } = await getBranchContext(DEFAULT_LOCALE);
  return { props: { locale: DEFAULT_LOCALE, branch, cities } };
}
