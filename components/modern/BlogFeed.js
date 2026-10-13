import Reveal from "@/components/modern/Reveal";
import { ArrowRight } from "@/components/chrome/icons";
import { assetUrl } from "@/lib/images";
// NOT from lib/blog-posts - this component renders in the browser, and that
// module reaches for the Supabase client. Same rule lib/home-page.js states.
import { localePath } from "@/lib/locale";

/**
 * The latest posts on the home page.
 *
 * WHERE THE DATA COMES FROM. Rows, server-rendered. `lib/home-page.js` asks
 * `getBlogPage(locale, 1)` inside the same Promise.all as everything else on
 * this page, so the cards are in the HTML before any JavaScript runs.
 *
 * WHAT THIS REPLACES, TWICE OVER. The legacy page rendered three empty divs and
 * let `public/js/blog.js` fetch `/blogs.xml` after load and write Bootstrap
 * markup into them with innerHTML. The first version of this component kept that
 * shape - it did its own fetch of the same XML in a useEffect - because the
 * script's classes (`col-xl-3`, `box-overlay`, `line-icon-Arrow-OutRight`) do
 * not resolve on a redesigned page, so porting the fetch was the only way to
 * keep the section at all.
 *
 * Both are gone. The feed was one file of UAE posts, so evsqtr.com and
 * evsoman.com showed Dubai's articles; it was uncached and measured 1.0-1.7s;
 * and until it answered there was nothing here for a crawler to read. The rows
 * are filtered by `countries` in SQL, so each country gets its own.
 *
 * NO `hasBlogFeed(locale)` GUARD ANY MORE. That was a hand-kept map of which
 * locales owned an XML file, and /bn was absent from it. The component renders
 * nothing when `posts` is empty, which is the same outcome decided by the data
 * instead of by a list someone has to remember to update.
 *
 * NOT PAGINATED, deliberately. The old block paged four at a time on the home
 * page, which is a lot of interaction for a teaser. This shows the newest four
 * and links to /blog, where the pager belongs.
 */
export default function BlogFeed({ locale = "en", heading, ctaLabel, posts = [] }) {
  // Nothing to tease - the honest version of this page ends after the reviews.
  if (!posts.length) return null;

  const dateFormat = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  /* The printed date is per-locale, so it is formatted here rather than taken
     from the row's dd/mm/yyyy string - that format exists for the legacy grid.
     `published_at` is the raw value, and it is what <time> needs to be
     machine-readable. */
  const printed = (post) => {
    const d = new Date(post.published_at);
    return Number.isNaN(d.getTime()) ? { label: post.date, iso: undefined } : {
      label: dateFormat.format(d),
      iso: d.toISOString().slice(0, 10),
    };
  };

  return (
    <section className="evs-shell evs-section">
      <Reveal className="mb-12 flex flex-col gap-5 md:mb-16 md:flex-row md:items-end md:justify-between">
        <h2 className="text-display-3">
          {heading}
          <span className="text-brand-500">.</span>
        </h2>
        <a
          href={localePath(locale, "blog")}
          className="evs-btn evs-btn-secondary self-start md:self-auto"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </a>
      </Reveal>

      <Reveal stagger={70} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post) => {
          const date = printed(post);
          /* Four across from 1024px, two from 640, one below - the grid above.
             Without `sizes` the browser assumes 100vw and takes the widest
             candidate, which handed a ~300px card the 768w rendition. */
          const src = (w) => assetUrl(post.image, { w });

          return (
            <a
              key={post.slug}
              href={post.href}
              className="evs-card evs-card-interactive group flex flex-col overflow-hidden"
            >
              <div className="relative aspect-[3/2] overflow-hidden bg-surface-elevated">
                {post.image && (
                  <img
                    src={src(640)}
                    srcSet={`${src(320)} 320w, ${src(500)} 500w, ${src(768)} 768w`}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <time
                  dateTime={date.iso}
                  className="text-eyebrow font-semibold tracking-[0.14em] text-content-muted uppercase"
                >
                  {date.label}
                </time>
                <h3 className="text-subheading leading-snug text-content transition-colors duration-200 group-hover:text-brand-500">
                  {post.title}
                </h3>
              </div>
            </a>
          );
        })}
      </Reveal>
    </section>
  );
}
