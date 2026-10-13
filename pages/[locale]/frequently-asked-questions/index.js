import Head from "next/head";
import SiteTags from "@/components/common/SiteTags";
import FaqPage from "@/components/faqs/FaqPage";
import { getFaqs, faqPageJsonLd } from "@/lib/faqs";
import { getPage } from "@/lib/pages";
import { LOCALES, DEFAULT_LOCALE, isRtl } from "@/lib/locale";
import { hreflangAlternates } from "@/lib/hreflang";

/**
 * /ar/frequently-asked-questions, /bn/frequently-asked-questions.
 *
 * Same resolver and same component as the unprefixed route; only the locale and
 * the canonical differ.
 */

export default function LocaleFaqs({ page, faqs, locale }) {
  if (!page) return null;

  const site = page.branch.site_url.replace(/\/$/, "");
  const url = `${site}/${locale}/frequently-asked-questions`;

  return (
    <>
      {/* This page writes its own <head> rather than going through SeoHead, so
          it renders the four site-wide tags itself - otherwise _app.js's
          UAE-hardcoded fallback is what a crawler sees. */}
      <SiteTags locale={locale} branch={page.branch} cities={page.cities ?? []} />

      <Head>
        <title>{page.meta_title}</title>
        <meta name="description" content={page.meta_description} />
        {page.meta_keywords && <meta name="keywords" content={page.meta_keywords} />}
        <link rel="canonical" href={url} />
        <meta property="og:title" content={page.meta_title} />
        <meta property="og:description" content={page.meta_description} />
        <meta property="og:url" content={url} />
        {/* From this branch's domain, not the UAE's - see the English route. */}
        <meta
          property="og:image"
          content={`${site}/img/graph-img.webp`}
        />

        <meta name="robots" content="index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={page.meta_title} />
        <meta name="twitter:description" content={page.meta_description} />
        <meta name="twitter:image" content={`${site}/img/graph-img.webp`} />

        {/* THE CROSS-DOMAIN CLUSTER - see lib/hreflang.js. This page writes its
            own head, so it asks for the alternates rather than inheriting them
            from SeoHead; what it must not do is keep a hand-written `en`/`ar`
            pair, because one member declaring a different set is how a cluster
            gets dropped. */}
        {hreflangAlternates({ path: "frequently-asked-questions", branch: page.branch }).map((alt) => (
          <link key={alt.hrefLang} rel="alternate" hrefLang={alt.hrefLang} href={alt.href} />
        ))}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqPageJsonLd(faqs, { url })),
          }}
        />
      </Head>

      <FaqPage page={page} faqs={faqs} locale={locale} />
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: LOCALES.filter((l) => l !== DEFAULT_LOCALE).map((locale) => ({
      params: { locale },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const { locale } = params;
  if (!LOCALES.includes(locale) || locale === DEFAULT_LOCALE) {
    return { notFound: true };
  }

  const [page, faqs] = await Promise.all([
    getPage("frequently-asked-questions", locale),
    getFaqs(locale),
  ]);

  if (!page) return { notFound: true };

  return {
    props: {
      page,
      faqs,
      locale,
      useScrollContainer: false,
      ...(isRtl(locale) ? { useArabicHeader: true } : {}),
    },
    revalidate: 2592000,
  };
}
