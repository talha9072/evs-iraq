import SeoHead from "@/components/services/SeoHead";
import NetworkGrid from "@/components/launch/NetworkGrid";
import { getBranchContext } from "@/lib/branches";
import { networkJsonLd } from "@/lib/launch-seo";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/locale";

export default function NetworkRoute({ locale, branch, cities }) {
  return (
    <>
      <SeoHead
        locale={locale}
        branch={branch}
        cities={cities}
        path="our-network"
        title="شبكة إي في إس | مراكز خدمة السيارات الكهربائية في الخليج"
        description="تدير إي في إس ورشاً متخصصة للسيارات الكهربائية في الإمارات والسعودية وقطر وعُمان، والبحرين والعراق قريباً. كل الدول وكل المواقع."
        jsonLd={networkJsonLd(locale)}
      />
      <NetworkGrid locale={locale} />
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
  const { branch, cities } = await getBranchContext(params.locale);
  return { props: { locale: params.locale, branch, cities } };
}
