import SeoHead from "@/components/services/SeoHead";
import HomeSections from "@/components/launch/HomeSections";
import HeroVideo from "@/components/common/HeroVideo";
import Reveal from "@/components/modern/Reveal";
import BranchesSection from "@/components/modern/BranchesSection";
import StatsBand from "@/components/modern/StatsBand";
import ReviewsSection from "@/components/modern/ReviewsSection";
import { ArrowRight } from "@/components/chrome/icons";
import BlogFeed from "@/components/modern/BlogFeed";
import ServicesMosaic from "@/components/modern/ServicesMosaic";
import { DEFAULT_LOCALE, isRtl, localePath } from "@/lib/locale";
import { homeJsonLd } from "@/lib/home-seo";
import { assetUrl } from "@/lib/images";

/**
 * The two block buttons. Neither has a row - `home_page.blog_heading` is the
 * blog block's heading and the services heading is the hub's own row, and
 * nothing else on either block is editable. Kept in code for the same reason
 * FaqPage keeps its "Contact Us" prompt: it is page chrome, and inventing a
 * column for two words would be worse than this table.
 */
const ALL_SERVICES = { en: "All services", ar: "كل الخدمات", bn: "সব সেবা" };
const allServicesLabel = (locale) =>
  ALL_SERVICES[locale] ?? ALL_SERVICES[String(locale).split("-")[0]] ?? ALL_SERVICES.en;

/**
 * The services block's heading, WHEN THE DATABASE HAS NONE.
 *
 * `lib/home-page.js` reads it from the services hub's own row (`hero.name`),
 * which is where it belongs - but that row carries only structure in this
 * deployment, no content columns, so it comes back null. Without this the block
 * rendered its brand-green full stop and nothing else.
 *
 * The table dies on its own the day someone gives the hub row a name, or adds a
 * `home_page.services_heading` column: the prop already wins over it.
 */
const SERVICES_HEADING = { en: "What we do", ar: "ما نقدمه", bn: "আমরা যা করি" };
const servicesHeadingFor = (locale) =>
  SERVICES_HEADING[locale] ??
  SERVICES_HEADING[String(locale).split("-")[0]] ??
  SERVICES_HEADING.en;

const ALL_POSTS = { en: "All posts", ar: "كل المقالات", bn: "সব পোস্ট" };
const allPostsLabel = (locale) =>
  ALL_POSTS[locale] ?? ALL_POSTS[String(locale).split("-")[0]] ?? ALL_POSTS.en;

/**
 * The home page, head and body, for every language.
 *
 * REDESIGNED — Tailwind, no Crafto. See lib/design.js for how a redesigned route
 * drops the legacy stylesheets and scripts entirely.
 *
 * WHAT IS DELIBERATELY UNCHANGED. The client likes this page, so the two things
 * that make it what it is are kept exactly: the full-screen hero video, and the
 * scroll-snapped full-bleed image panels beneath it. Both typefaces are also
 * unchanged.
 *
 * WHAT CHANGED. The panels used to print dark-grey text straight onto a
 * photograph with no scrim, so legibility depended entirely on which image a row
 * happened to point at — and the copy was centred in a `col-md-8` with the
 * buttons pinned to the bottom of the viewport, which read as a slide deck. They
 * are editorial now: a scrim, copy anchored to the bottom-inline-start, and a
 * panel counter that tells the reader how far through the sequence they are.
 *
 * Three layout objects (`LAYOUT.ltr` / `LAYOUT.rtl` / `PANEL_LAYOUT`) and the
 * inline `ctaStyle` blocks are gone. Direction is logical properties, so there
 * is nothing to swap; the `letter-spacing: -2px` bug those objects existed to
 * work around (it rendered the hero button as "BOOKYOUREVCHECK") cannot recur.
 *
 * EVERY WORD IS STILL A ROW. Nothing on this page is written in JSX.
 */

export default function HomePage({
  page,
  locale = DEFAULT_LOCALE,
  /** The `home_panels` rows, already ordered by the resolver's sort_order. */
  panels = [],
  /** The five service categories, trimmed by lib/home-page.js. */
  services = [],
  servicesHeading = null,
  locations = [],
  reviews = [],
  network = [],
  social = [],
  /** The resolved `section_content` row - see lib/sections.js. */
  sections,
  /** Page one of this country's posts in this language, from lib/blog-posts.js.
   *  Shaped { posts, page, total, totalPages }; an empty one hides the section. */
  blog = { posts: [], page: 1, total: 0, totalPages: 0 },
}) {
  const rtl = isRtl(locale);
  const { branch, cities } = page;

  /** ctaPath is stored bare - "contact", "services/programming". */
  const href = (path) => localePath(locale, path);

  const marquee = page.marquee ?? [];

  return (
    <>
      <SeoHead
        locale={locale}
        branch={branch}
        cities={cities}
        // "" is the home page: localePath turns it into "/" and "/ar" rather
        // than "//" and "/ar/".
        path=""
        title={page.meta_title}
        description={page.meta_description}
        keywords={page.meta_keywords}
        jsonLd={homeJsonLd({ locale, branch, cities, network, social })}
      />

      <div dir={rtl ? "rtl" : undefined}>
        {/* ================= HERO =================
            Full screen, video behind, one h1. `100svh` rather than `100vh` so
            the copy is not hidden behind a phone's address bar on first paint. */}
        <section className="relative flex h-[100svh] min-h-[36rem] flex-col justify-end overflow-hidden">
          <HeroVideo
            desktopSrc={page.hero_video_desktop_url}
            mobileSrc={page.hero_video_mobile_url}
            poster={page.hero_poster_url}
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Two layers: a bottom-weighted scrim for the copy, and a flat wash
              so the header stays legible over a bright frame. */}
          <div className="evs-scrim absolute inset-0" aria-hidden="true" />
          <div className="absolute inset-0 bg-surface-sunken/25" aria-hidden="true" />

          <div className="evs-shell relative z-10 pb-16 md:pb-24">
            <Reveal className="max-w-4xl">
              {/* The tag and the h1 sit together, as they did before: the badge
                  is `hero_tag`, the sentence beside it is the page's only h1 -
                  and its one line of copy that names a place, which read
                  "in UAE" on Qatar's home page until 0064.

                  The h1 is the SEO sentence, NOT the display line below it. An
                  earlier pass here made the h1 `sr-only` and marked the visible
                  headline `aria-hidden`, which reads well to a crawler and
                  leaves a screen-reader user with no headline at all. Both are
                  real text now. */}
              <div className="mb-6 flex flex-wrap items-center gap-3">
                {page.hero_tag && (
                  <span className="inline-flex items-center gap-2 rounded-sm border border-line bg-surface-sunken/60 px-2.5 py-1.5 text-eyebrow font-semibold tracking-[0.16em] text-content uppercase backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                    {page.hero_tag}
                  </span>
                )}
                <h1 className="font-sans text-eyebrow font-semibold tracking-[0.16em] text-content-secondary uppercase">
                  {page.h1}
                </h1>
              </div>

              {/* No weight class: `text-display-2` carries font-weight 600 with
                  its size, leading and tracking, so this <p> gets the same
                  treatment as an <h2> without inheriting the heading default.

                  display-2, NOT display-1. At its 7rem ceiling display-1 filled
                  most of the hero's width on a desktop and read as a banner
                  rather than a headline; display-2 tops out at 5rem. Both are
                  clamped, so the mobile end barely moves - 3rem to 2.5rem. */}
              <p className="font-display text-display-2 text-content uppercase">
                {page.hero_heading}
              </p>

              <p className="mt-6 max-w-xl text-lead text-content-secondary">
                {page.hero_subtitle}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <a href={href(page.hero_cta_path)} className="evs-btn evs-btn-primary evs-btn-lg">
                  {page.hero_cta_label}
                  <ArrowRight className="h-4 w-4" />
                </a>
                {branch?.support_phone && (
                  <a
                    href={`tel:${branch.support_phone}`}
                    className="evs-btn evs-btn-secondary evs-btn-lg"
                  >
                    {/*
                      * LTR, OR THE NUMBER READS BACKWARDS.
                      *
                      * `600 500 387` is three digit groups separated by spaces.
                      * Digits are left-to-right on their own, but inside an RTL
                      * paragraph the bidi algorithm lays the GROUPS out
                      * right-to-left — so the Arabic hero printed `387 500 600`.
                      * The `tel:` href was right, so tapping worked and nothing
                      * looked broken; anyone reading it and dialling by hand got
                      * a wrong number.
                      *
                      * `.evs-latin` is the treatment the CTA band, the workshop
                      * pages and /sos already give this: direction ltr, bidi
                      * isolate, Latin font. RTL only — in English it would swap
                      * the display face for no reason.
                      */}
                    <span className={rtl ? "evs-latin" : undefined} dir="ltr">
                      {branch.support_phone_display || branch.support_phone}
                    </span>
                  </a>
                )}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= MARQUEE =================
            Was a Swiper running at speed 12000 with autoplay delay 1 — a
            library, a config blob and an init hook to slide text sideways. This
            is one CSS animation over the list printed twice, which is what makes
            the loop seamless. `aria-hidden` on the copy so a screen reader does
            not read every service name twice. */}
        {marquee.length > 0 && (
          <div className="overflow-hidden border-y border-line-subtle bg-surface-sunken py-5">
            <div className="flex w-max animate-marquee items-center gap-10 hover:[animation-play-state:paused]">
              {[...marquee, ...marquee].map((item, i) => (
                <span
                  key={i}
                  aria-hidden={i >= marquee.length ? "true" : undefined}
                  className="flex items-center gap-10 font-display text-xl whitespace-nowrap text-content-muted uppercase"
                >
                  {item}
                  <span className="h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ================= PANELS =================
            The full-screen image sections, kept — and kept scroll-snapped.
            `snap-y snap-mandatory` on the wrapper rather than the page, so the
            snapping stops when the panels do and the sections below scroll
            normally. */}
        {panels.length > 0 && (
          <div className="snap-y snap-mandatory">
            {panels.map((panel, index) => (
              <section
                key={panel.slug}
                className="relative flex h-[100svh] min-h-[34rem] snap-start items-end overflow-hidden"
              >
                <img
                  /* `image_url` is a plain '/img/evs/evs-001.jpg' — a column you
                     can type into. assetUrl adds the Netlify image CDN in
                     production only; it 404s on a dev server, where these
                     backgrounds used to render black.

                     WITH A WIDTH, because without one the CDN converts the
                     format and keeps the pixels: evs-002.jpg came down at
                     525 KB. These are full-bleed, so 1920 is the largest they
                     are ever painted at — and at that width the same file is
                     52 KB. */
                  src={assetUrl(panel.image_url, { w: 1920 })}
                  alt={panel.title}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="evs-scrim-strong absolute inset-0" aria-hidden="true" />

                <div className="evs-shell relative z-10 pb-16 md:pb-24">
                  <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
                    <Reveal className="max-w-2xl">
                      {/* The counter is real information — how far through the
                          sequence this panel is — rather than decoration. */}
                      <span className="evs-eyebrow mb-6">
                        {String(index + 1).padStart(2, "0")} / {String(panels.length).padStart(2, "0")}
                      </span>

                      <h2 className="text-display-2 uppercase">{panel.title}</h2>

                      {panel.subtitle && (
                        <p className="mt-5 max-w-lg text-lead text-content-secondary">
                          {panel.subtitle}
                        </p>
                      )}
                    </Reveal>

                    <Reveal delay={120} className="flex flex-none flex-wrap gap-3">
                      {panel.cta_label && (
                        <a href={href(panel.cta_path)} className="evs-btn evs-btn-primary">
                          {panel.cta_label}
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      )}
                      {panel.alt_cta_label && (
                        <a href={href(panel.alt_cta_path)} className="evs-btn evs-btn-secondary">
                          {panel.alt_cta_label}
                        </a>
                      )}
                    </Reveal>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}

        {/* The three shared blocks, over the same rows as before. */}
        <StatsBand
          locale={locale}
          tokens={page.tokens}
          branchCount={locations.length}
          sections={sections}
        />

        <BranchesSection
          locale={locale}
          branch={branch}
          locations={locations}
          sections={sections}
          limit={6}
        />

        <ReviewsSection locale={locale} branch={branch} reviews={reviews} sections={sections} />

        {/* "What we do" - the same card treatment /services uses, rather than a
            rail of small ones. See components/modern/ServicesMosaic, including
            the note that the hub keeps its own copy of this markup. */}
        {services.length > 0 && (
          <section className="evs-shell evs-section">
            <Reveal className="mb-12 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between">
              <h2 className="text-display-3">
                {servicesHeading || servicesHeadingFor(locale)}
                <span className="text-brand-500">.</span>
              </h2>

              <a
                href={href("services")}
                className="evs-btn evs-btn-secondary self-start md:self-auto"
              >
                {allServicesLabel(locale)}
                <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
              </a>
            </Reveal>

            <ServicesMosaic services={services} />
          </section>
        )}

        {/* Server-rendered from the database now, and it returns null on its own
            when this country has no posts in this language. That is what
            replaced hasBlogFeed(): the data decides, not a hand-kept list of
            which locales happen to own an XML file. */}
        {/* Everything below is written for Iraq specifically — see

            components/launch/HomeSections.js. */}

        <HomeSections locale={locale} />

        <BlogFeed
          locale={locale}
          heading={page.blog_heading}
          ctaLabel={allPostsLabel(locale)}
          posts={blog.posts}
        />
      </div>
    </>
  );
}
