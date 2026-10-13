import HomePage from "@/components/homepage/HomePage";
import { localeHomeProps } from "@/lib/home-page";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/locale";

/**
 * /{locale} — the home page in every language except the unprefixed one.
 *
 * ---------------------------------------------------------------------------
 * WHY IT LIVES AT /{locale}/home AND IS REACHED BY A REWRITE
 * ---------------------------------------------------------------------------
 * There used to be one FILE per language — pages/ar/index.js, pages/ar-IQ,
 * pages/bn — each three lines around `localeHomeProps`. The reason given was
 * real: `pages/[locale]/index.js` is a ONE-SEGMENT dynamic route, and one of
 * those also matches /rox and /evs-qatar in the client router and hydrates the
 * wrong component over them. Next.js also allows a single dynamic name per
 * level, so `[locale]` at the root is why the car brands live under
 * /ev-car-brands and are rewritten to / — see next.config.mjs.
 *
 * But a file per language means adding Chinese is a code change in this
 * repository, and the admin panel can add a language in a second. Every other
 * translated page already avoids that: /{locale}/about, /{locale}/services and
 * the rest are TWO segments deep, which cannot swallow a one-segment path, and
 * they are generated from NEXT_PUBLIC_LOCALES.
 *
 * So the home page joins them. It sits two segments deep like its siblings,
 * and next.config rewrites /{locale} onto it for exactly the locales this
 * deployment publishes — an explicit alternation, so /tesla and /evs-dubai are
 * never mistaken for a language.
 *
 * The result: a country that adds Chinese in the panel gets /zh with no file
 * written here and nothing to remember.
 */
export default HomePage;

export async function getStaticPaths() {
  return {
    // The unprefixed language answers on `/`, so it must not also answer on
    // its own prefix — the same guard `localeHomeProps` makes at the data
    // layer, made again here so the page is never generated at all.
    paths: LOCALES.filter((locale) => locale !== DEFAULT_LOCALE).map((locale) => ({
      params: { locale },
    })),
    // Anything that is not a published locale is a 404 rather than a build of
    // an empty page.
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  return localeHomeProps(params.locale);
}
