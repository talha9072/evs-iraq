import Head from "next/head";
import SiteTags from "@/components/common/SiteTags";
import FaqPage from "@/components/faqs/FaqPage";
import { getFaqs, faqPageJsonLd } from "@/lib/faqs";
import { getPage } from "@/lib/pages";
import { DEFAULT_LOCALE } from "@/lib/locale";
import { hreflangAlternates } from "@/lib/hreflang";

/**
 * /frequently-asked-questions.
 *
 * The page's own copy - title, description, keywords, H1 - comes from
 * page_content next to /branches, so it merges through resolve_pages and a
 * country can override any of it. The questions come from resolve_faqs.
 */

export default function Faqs({ page, faqs, locale = DEFAULT_LOCALE }) {
  if (!page) return null;

  const site = page.branch.site_url.replace(/\/$/, "");
  const url = `${site}/frequently-asked-questions`;

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
        {/* The legacy page hardcoded
            https://evsuae.com/.netlify/images?url=/img/graph-img.webp - so an
            Oman build would have shared the UAE's card image from the UAE's
            domain. Built from this branch's site_url instead. */}
        <meta
          property="og:image"
          content={`${site}/img/graph-img.webp`}
        />

        {/* THE FOUR TAGS THIS PAGE WAS MISSING. Because it writes its own head
            instead of going through SeoHead, it never inherited the robots
            directives or the Twitter card — so it was the one indexable page on
            the site with no snippet or image preview policy, and the only one
            that shared as a bare link. */}
        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large"
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={page.meta_title} />
        <meta name="twitter:description" content={page.meta_description} />
        <meta
          name="twitter:image"
          content={`${site}/img/graph-img.webp`}
        />

        {/* THE CROSS-DOMAIN CLUSTER - see lib/hreflang.js. This page writes its
            own head, so it asks for the alternates rather than inheriting them
            from SeoHead; what it must not do is keep a hand-written `en`/`ar`
            pair, because one member declaring a different set is how a cluster
            gets dropped. */}
        {hreflangAlternates({ path: "frequently-asked-questions", branch: page.branch }).map((alt) => (
          <link key={alt.hrefLang} rel="alternate" hrefLang={alt.hrefLang} href={alt.href} />
        ))}

        {/* Generated from the same rows the accordion renders, so the markup and
            the visible answers cannot disagree - on live Qatar they do. */}
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

export async function getStaticProps() {
  const [page, faqs] = await Promise.all([
    getPage("frequently-asked-questions", DEFAULT_LOCALE),
    getFaqs(DEFAULT_LOCALE),
  ]);

  if (!page) return { notFound: true };

  return {
    props: {
      page,
      faqs,
      locale: DEFAULT_LOCALE,
      // The legacy page set this; dropping it auto-scrolls to the foot, which is
      // the bug /branches shipped with.
      useScrollContainer: false,
    },
    revalidate: 2592000,
  };
}
