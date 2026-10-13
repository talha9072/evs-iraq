import SeoHead from "@/components/services/SeoHead";
import Reveal from "@/components/modern/Reveal";
import { assetUrl } from "@/lib/images";
import { isRtl, localePath } from "@/lib/locale";
import { BLOG_SEO } from "@/lib/static-seo";
import { ChevronLeft, ChevronRight } from "@/components/chrome/icons";

/**
 * /blog and /<locale>/blog - the post listing, for every language.
 *
 * REDESIGNED - Tailwind, no Crafto. That is the point of this pass: the blog was
 * one of the last routes still on the legacy stack, so it rendered the OLD
 * header and footer while every other page rendered the new ones. A reader who
 * clicked into an article watched the whole site change around them. See
 * lib/design.js for why the two stacks cannot share a page.
 *
 * The `LAYOUT.ltr` / `LAYOUT.rtl` class table is gone with it. Every difference
 * it encoded - `fw-700` against `fw-500`, `d-inline-block`, `text-center` - was
 * a physical property that logical CSS handles on its own.
 *
 * ONE COMPONENT, NOT TWO. There were two: pages/blog/index.js at 158 lines and
 * pages/ar/blog/index.js at 263, each with its own hand-written heading, its own
 * copy of the empty-grid markup and its own BlogGrid12 that fetched the whole of
 * /blogs.xml in the browser. Comparing them, the only real differences were the
 * words and two RTL class pairs, which is the same finding HomePage.js records
 * about the five files it replaced.
 *
 * THE GRID IS SERVER-RENDERED. Twelve rows arrive as props; the page buttons ask
 * /api/blog-posts for twelve more. Before this, the browser downloaded all 82
 * posts to show twelve, behind a spinner, and Googlebot saw an empty div.
 */

const FALLBACK = {
  readMore: "Continue reading",
  readMoreAria: "Read more about {title}",
  prevPage: "Previous page",
  nextPage: "Next page",
};

function Card({ post, copy }) {
  const src = (w) => assetUrl(post.image, { w });

  /*
   * WITHOUT `sizes` A BROWSER ASSUMES 100vw and picks the widest candidate in
   * the srcset - so a card 297px across was handed the 768w rendition on every
   * desktop. This describes the grid instead: four across from 1200px, three
   * from 992, two from 576, one below.
   */
  const sizes =
    "(min-width: 1200px) 25vw, (min-width: 992px) 33vw, (min-width: 576px) 50vw, 100vw";

  return (
    <a href={post.href} className="evs-card evs-card-interactive group flex flex-col overflow-hidden">
      <div className="relative aspect-[3/2] overflow-hidden bg-surface-elevated">
        <img
          loading="lazy"
          src={src(640)}
          srcSet={`${src(320)} 320w, ${src(500)} 500w, ${src(768)} 768w`}
          sizes={sizes}
          alt={post.title || ""}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="evs-scrim-soft absolute inset-0" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <span className="text-eyebrow font-semibold tracking-[0.14em] text-brand-500 uppercase tabular-nums">
          {post.date}
        </span>
        <h2 className="mt-3 text-subheading leading-snug text-content transition-colors duration-200 group-hover:text-brand-500">
          {post.title}
        </h2>
        {/* `mt-auto` so the prompt sits on the same line on every card in a row,
            whatever the title's length. */}
        <span className="mt-auto pt-5 text-sm font-semibold text-content-secondary">
          {copy.readMore}
        </span>
      </div>
    </a>
  );
}

/**
 * One page control.
 *
 * AN ANCHOR, NOT A BUTTON, AND THAT IS THE WHOLE POINT OF THIS PASS.
 *
 * It was a `<button onClick>` that fetched /api/blog-posts and swapped the
 * twelve cards out without changing the URL. So seven of the blog's eight pages
 * had no address, and eighty-two of the ninety-four English posts had no link
 * anywhere in any page's HTML - see the note on `blogListProps`.
 *
 * `href` also gives back the three things a button never had: the page can be
 * bookmarked, opened in a new tab, and reached with the browser's Back button.
 *
 * NO `next/link`, deliberately - this codebase does not use it anywhere, and a
 * plain anchor is what every other link on the site already is.
 *
 * `href === null` is the disabled state: Previous on page one, Next on the last.
 * A `<span>` rather than a dead `<a>`, because an anchor with no href is not a
 * link to a screen reader either - which is exactly what we want to say.
 */
function PageLink({ children, href, active, label }) {
  const className = `grid h-11 min-w-11 place-items-center rounded-sm border px-3 text-sm font-semibold tabular-nums transition-colors duration-200 ${
    active
      ? "border-brand-500 bg-brand-500 text-content-inverse"
      : "border-line text-content hover:border-brand-500 hover:text-brand-500"
  }`;

  if (!href) {
    return (
      <span aria-hidden="true" className={`${className} pointer-events-none opacity-30`}>
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={className}
    >
      {children}
    </a>
  );
}

export default function BlogListPage({ locale, branch, cities, sections, list }) {
  if (!branch) return null;

  /*
   * THE PAGE IS A PROP NOW, NOT STATE.
   *
   * `list` is the page the URL asked for, rendered by the server - so there is
   * no state here, no fetch, no loading flag and no `/api/blog-posts` call from
   * this component at all. The endpoint stays for the home page's four-card
   * feed; the listing does not need it any more.
   *
   * That also retires the bug this page was reported for. The query-string form
   * of that endpoint was served from one CDN cache entry for every locale and
   * every page, so clicking "02" re-rendered the twelve rows it already had.
   * A URL cannot be collapsed that way.
   */
  const page = list.page ?? 1;
  const totalPages = list.totalPages ?? 1;

  const rtl = isRtl(locale);
  const base = String(locale).split("-")[0];
  const seo = BLOG_SEO[locale] ?? BLOG_SEO[base] ?? BLOG_SEO.en;
  const copy = { ...FALLBACK, ...(sections?.blog ?? {}) };
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  /**
   * Page one is `/blog`, the rest are `/blog/page/<n>` - and in Arabic the same
   * shape behind the prefix. `localePath` is the one place that knows the
   * unprefixed language has no prefix, so the two forms cannot drift.
   */
  const path = (n) => (n <= 1 ? "blog" : `blog/page/${n}`);
  const href = (n) => localePath(locale, path(n));

  return (
    <>
      {/*
        THE PATH IS THIS PAGE'S OWN, not "blog" on all eight of them.
        SeoHead builds the canonical and every hreflang from it, so a fixed
        "blog" would have had page five telling Google it was page one - eight
        URLs collapsing into one, which is the opposite of what these pages were
        added for.

        THE TITLE CARRIES THE NUMBER for the same reason: eight pages under one
        title is eight duplicate titles, and the audit counted duplicate titles
        as its own finding. The suffix is appended rather than stored, because a
        page number is not copy anyone edits - and it is skipped on page one, so
        /blog's title is untouched.
      */}
      <SeoHead
        locale={locale}
        branch={branch}
        cities={cities}
        path={path(page)}
        title={page > 1 ? `${seo.title} - ${seo.pageLabel} ${page}` : seo.title}
        description={seo.description}
        keywords={seo.keywords}
      />

      {/* `dir` only - no `arabic-page` wrapper. That was a Crafto hook and it
          resolves to nothing on a redesigned page; direction is what actually
          matters and every logical property here follows it. */}
      <div dir={rtl ? "rtl" : undefined}>
        <section className="evs-shell pt-32 pb-12 md:pt-40 md:pb-16">
          <Reveal className="max-w-3xl">
            <h1 className="text-display-2 uppercase">{seo.h1}</h1>
            <p className="mt-5 max-w-xl text-lead text-content-secondary">{seo.h2}</p>
          </Reveal>
        </section>

        <section className="evs-shell pb-20 md:pb-28">
          <Reveal
            stagger={60}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {list.posts.map((post) => (
              <Card key={post.slug} post={post} copy={copy} />
            ))}
          </Reveal>

          {totalPages > 1 && (
            <nav
              aria-label={seo.h1}
              className="mt-14 flex flex-wrap items-center justify-center gap-2"
            >
              <PageLink href={page > 1 ? href(page - 1) : null} label={copy.prevPage}>
                <ChevronLeft className="h-4 w-4 rtl:-scale-x-100" />
              </PageLink>

              {pages.map((n) => (
                <PageLink key={n} href={href(n)} active={n === page}>
                  {String(n).padStart(2, "0")}
                </PageLink>
              ))}

              <PageLink href={page < totalPages ? href(page + 1) : null} label={copy.nextPage}>
                <ChevronRight className="h-4 w-4 rtl:-scale-x-100" />
              </PageLink>
            </nav>
          )}
        </section>
      </div>
    </>
  );
}
