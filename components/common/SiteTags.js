import Head from "next/head";
import { siteTags } from "@/lib/home-seo";

/**
 * The four site-wide tags `_app.js` hardcodes to the UAE, rebuilt from the branch
 * row.
 *
 * `_app.js` emits `og:locale`, `og:site_name`, `geo.region` and `geo.placename`
 * on every route of every country, with `AE` and `Dubai` written into them. It
 * has no way to fetch, so it cannot know better; a page that DOES know sets
 * `ownsSiteSeo` in its props and `_app.js` steps aside, and this renders the
 * correct four instead.
 *
 * The keys are the same ones `_app.js` uses, so even where both were to render,
 * next/head would collapse them to one rather than duplicating the tag.
 *
 * Every page that builds its own head from the branch row uses this - both home
 * pages, both About pages, both 404 pages - so the set cannot drift. The pages
 * that do NOT (the other forty routes) still carry _app.js's UAE copies; that is
 * the remaining site-wide gap.
 */
export default function SiteTags({ locale, branch, cities }) {
  const tags = siteTags({ locale, branch, cities });

  return (
    <Head>
      <meta property="og:locale" content={tags.ogLocale} key="og-locale" />
      <meta property="og:site_name" content={tags.siteName} key="og-site" />
      <meta name="geo.region" content={tags.geoRegion} key="geo-region" />
      <meta name="geo.placename" content={tags.geoPlacename} key="geo-place" />
    </Head>
  );
}
