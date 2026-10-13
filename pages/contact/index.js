import SeoHead from "@/components/services/SeoHead";
import LaunchContact from "@/components/launch/LaunchContact";
import { getBranchContext } from "@/lib/branches";
import { contactJsonLd } from "@/lib/launch-seo";
import { DEFAULT_LOCALE } from "@/lib/locale";

export default function ContactRoute({ locale, branch, cities }) {
  return (
    <>
      <SeoHead
        locale={locale}
        branch={branch}
        cities={cities}
        path="contact"
        title="Contact EVS Iraq | EV Service Opening in Baghdad"
        description="EVS is opening a specialist EV and hybrid service centre in Baghdad. No phone line yet - leave your details and we will email you the day it opens."
        jsonLd={contactJsonLd(locale)}
      />
      <LaunchContact locale={locale} />
    </>
  );
}

export async function getStaticProps() {
  const { branch, cities } = await getBranchContext(DEFAULT_LOCALE);
  return { props: { locale: DEFAULT_LOCALE, branch, cities } };
}
