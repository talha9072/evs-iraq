import AboutPage from "@/components/about/AboutPage";
import { aboutProps } from "@/lib/about-page";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * /about - the unprefixed locale.
 *
 * Was 300 lines of JSX beside a 315-line Arabic twin. The two turned out to be the
 * same page written twice - four sections, three tabs, the same feather icons, 21
 * visible strings mapping 1:1 - so both are one component now, and every word is a
 * row in `about_page` / `about_tabs`.
 */
export default AboutPage;

export async function getStaticProps() {
  return aboutProps(DEFAULT_LOCALE);
}
