import { getPage, getPageRows } from "@/lib/pages";

/**
 * Everything the privacy policy needs, shared by its two routes.
 *
 * `pages/privacy-policy/index.js` serves the unprefixed locale and
 * `pages/[locale]/privacy-policy/index.js` the rest. Both need the identical two
 * queries, so they live here rather than in two copies that drift - the same split
 * as `lib/home-page.js` and `lib/about-page.js`.
 *
 * The head comes from `page_content` through the generic `getPage`, and the body
 * from `privacy_sections` through `getPageRows`. Both already interpolate the branch
 * tokens, which is what fills `{{country}}` in the intro and the `tel:`/`mailto:`
 * links in section 7.
 */
export async function privacyProps(locale) {
  const [page, sections] = await Promise.all([
    getPage("privacy-policy", locale),
    getPageRows("privacy_sections", locale),
  ]);

  // Null when `page_content` has no published row for this locale. A legal page with
  // no words on it behind a 200 is the failure mode this project keeps closing.
  if (!page) return { notFound: true };

  return {
    props: {
      page,
      sections,
      locale,
      // The Litho scroll container snaps sections and jumps this page to its foot.
      // Both pages this replaces opted out, so this one does too.
      useScrollContainer: false,
    },
    revalidate: 2592000,
  };
}
