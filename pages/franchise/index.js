import SeoHead from "@/components/services/SeoHead";
import FranchisePitch from "@/components/launch/FranchisePitch";
import { getBranchContext } from "@/lib/branches";
import { franchiseJsonLd } from "@/lib/launch-seo";
import { DEFAULT_LOCALE } from "@/lib/locale";

export default function FranchiseRoute({ locale, branch, cities }) {
  return (
    <>
      <SeoHead
        locale={locale}
        branch={branch}
        cities={cities}
        path="franchise"
        title="EV Workshop Franchise in Iraq | EVS Franchise"
        description="Run a specialist EV and hybrid workshop in Iraq. An open territory: imported cars with no dealer network, extreme heat on the batteries, and almost no independent high-voltage capability."
        jsonLd={franchiseJsonLd(locale)}
      />
      <FranchisePitch locale={locale} />
    </>
  );
}

export async function getStaticProps() {
  const { branch, cities } = await getBranchContext(DEFAULT_LOCALE);
  return { props: { locale: DEFAULT_LOCALE, branch, cities } };
}
