import PrivacyPage from "@/components/legal/PrivacyPage";
import { privacyProps } from "@/lib/privacy-page";
import { DEFAULT_LOCALE } from "@/lib/locale";

/** /privacy-policy - the unprefixed locale. Everything else is in lib/privacy-page.js. */
export default PrivacyPage;

export const getStaticProps = () => privacyProps(DEFAULT_LOCALE);
