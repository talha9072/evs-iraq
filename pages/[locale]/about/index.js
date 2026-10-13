import AboutPage from "@/components/about/AboutPage";
import { aboutProps } from "@/lib/about-page";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/locale";

/**
 * /{locale}/about - every language except the unprefixed one.
 *
 * Replaces `pages/ar/about/index.js` rather than sitting beside it, so /ar/about,
 * /ar-IQ/about and /bn/about are one component over one set of rows. /bn/about has
 * never existed before this.
 *
 * TWO SEGMENTS DEEP, so unlike `pages/[locale]/index.js` this route cannot swallow
 * /tesla or /evs-dubai - those are one-segment paths and never reach it. Same shape
 * as `[locale]/branches`.
 */
export default AboutPage;

export async function getStaticPaths() {
  return {
    paths: LOCALES.filter((locale) => locale !== DEFAULT_LOCALE).map((locale) => ({
      params: { locale },
    })),
    // Anything that is not a published locale is a 404 rather than a build of an
    // empty page.
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  if (params.locale === DEFAULT_LOCALE) return { notFound: true };

  return aboutProps(params.locale);
}
