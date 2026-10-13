import PrivacyPage from "@/components/legal/PrivacyPage";
import { privacyProps } from "@/lib/privacy-page";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/locale";

/**
 * /{locale}/privacy-policy - every language except the unprefixed one.
 *
 * A dynamic segment is safe HERE, unlike the bare `/[locale]` home route that had to
 * be split into named files: this pattern carries a literal second segment, so it
 * cannot match a one-segment vanity URL like /rox. See lib/home-page.js.
 */
export default PrivacyPage;

export async function getStaticPaths() {
  return {
    paths: LOCALES.filter((l) => l !== DEFAULT_LOCALE).map((locale) => ({ params: { locale } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  return privacyProps(params.locale);
}
