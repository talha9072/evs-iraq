import { useRef, useState } from "react";
import SeoHead from "@/components/services/SeoHead";
import Reveal from "@/components/modern/Reveal";
import BranchesSection from "@/components/modern/BranchesSection";
import StatsBand from "@/components/modern/StatsBand";
import ReviewsSection from "@/components/modern/ReviewsSection";
import { ArrowRight } from "@/components/chrome/icons";
import { DEFAULT_LOCALE, isRtl, localePath } from "@/lib/locale";
import { aboutJsonLd } from "@/lib/about-seo";
import { assetUrl } from "@/lib/images";

/**
 * The About page, head and body, for every language.
 *
 * REDESIGNED — Tailwind, no Crafto.
 *
 * WHAT CHANGED, beyond the styling:
 *
 * ONE HERO, NOT TWO. The legacy page rendered the same h1 and headline twice —
 * once in a `page-title-big-typography1` block for wide screens and again in a
 * `.mobile-about` block for phones — with the pair swapped by a `display: none`
 * at 990px. The team photo was a CSS background on one and an <img> on the
 * other, so the two were also fetched differently. It is one section now, with
 * the photo behind the copy at every width.
 *
 * TABS ARE REACT. They were Bootstrap's `data-bs-toggle="tab"` against
 * hardcoded `#tab_four1..3` ids, which meant the panel wiring depended on a
 * script the redesigned pages do not load, and on ids that would collide if the
 * block ever appeared twice. State here, with the roving tab pattern and proper
 * `role`/`aria-controls`, which the legacy markup had none of.
 *
 * NO LAYOUT TABLE. `LAYOUT.ltr` / `LAYOUT.rtl` existed to swap `offset-xl-1`
 * between two columns and flip `text-md-start`/`text-md-end`, because Bootstrap
 * offsets are physical. Logical properties do it for free.
 *
 * EVERY WORD IS STILL A ROW (0070) — both image paths and their alt text, the
 * tab icons' order, the highlighted first word of each tab heading, and where
 * both buttons point.
 */

/** The five renditions each image offered, as a srcset. */
const WIDTHS = [640, 1024, 1440, 1920];
const srcSet = (path) => WIDTHS.map((w) => `${assetUrl(path, { w })} ${w}w`).join(", ");

export default function AboutPage({
  page,
  locale = DEFAULT_LOCALE,
  /** The `about_tabs` rows, already ordered by the resolver's sort_order. */
  tabs = [],
  locations = [],
  reviews = [],
  social = [],
  /** The resolved `section_content` row - see lib/sections.js. */
  sections,
}) {
  const rtl = isRtl(locale);
  const { branch, cities, tokens } = page;
  const [activeTab, setActiveTab] = useState(0);
  /** One ref per tab button, so arrow-key navigation can move the focus ring
   *  with the selection - see the keydown handler below. */
  const tabRefs = useRef([]);

  /** Stored paths are bare - "contact" - so the prefix is added here. */
  const href = (path) => localePath(locale, path);

  /**
   * `{{locale_prefix}}` inside a tab body, the convention 0055 set for FAQ
   * answers: one row serves every language and no absolute evs*.com URL can be
   * stored. DEFAULT_LOCALE has no prefix, so it resolves to "" and the link
   * stays "/franchise".
   */
  const withPrefix = (html) =>
    String(html ?? "").replace(
      /\{\{locale_prefix\}\}/g,
      locale === DEFAULT_LOCALE ? "" : `/${locale}`
    );

  return (
    <>
      <SeoHead
        locale={locale}
        branch={branch}
        cities={cities}
        path="about"
        title={page.meta_title}
        description={page.meta_description}
        keywords={page.meta_keywords}
        jsonLd={aboutJsonLd({ locale, branch, cities, social })}
      />

      <div dir={rtl ? "rtl" : undefined}>
        {/* ================= HERO =================
            THE LIVE PAGE'S HERO, REBUILT IN TAILWIND. Two redesigns tried to
            make the team photo a subject BESIDE the copy - the second gave it
            its own seven-column frame - and both lost the composition
            evsuae.com/about actually has: the picture running the full width of
            the screen with the headline standing on it. That is what is back,
            matched against the live page rather than reimagined:

              background   the photo, cover, anchored to its BOTTOM edge, so the
                           row of people stays in frame at every width
              veil         a flat 20% black, the live value - enough to carry
                           white type, not enough to grey the faces
              copy         top-left of the shell, then 550px of open frame under
                           it, which is where the people are

            NOT `.evs-hero-veil`, the inner-page treatment: that is a heavy
            bottom-up wash for copy sitting at the FOOT of a frame, and here the
            copy is at the top and the photograph below it is the subject. The
            header paints its own top gradient, so the nav stays readable
            without darkening this any further.

            NO `pt-32`. The fixed header is meant to sit ON the image the way it
            does live; it is the COPY that gets cleared, by the `10vw` the old
            stylesheet spent as `padding-top: 10%`. 10vw + 550px is 678px at a
            1280 viewport, which is the live section's height to a pixel.

            BELOW `lg` THE OLD PAGE SPLIT IN TWO - a black block with the copy,
            then the photo beneath it - because a cover crop leaves nothing but a
            wall behind the type on a phone. Same two-part result here out of ONE
            <img> and ONE <h1>: the image is in flow and ordered second at small
            widths, and absolute behind the copy from `lg` up. The legacy markup
            printed the whole heading pair twice and hid one with `display:
            none`, which is two h1s in the document for one page. */}
        <section className="relative flex flex-col overflow-hidden bg-surface-sunken lg:block">
          {page.team_image_url && (
            <img
              src={assetUrl(page.team_image_url, { w: 1920 })}
              srcSet={srcSet(page.team_image_url)}
              /* Full-bleed at every width now - the picture IS the section. */
              sizes="100vw"
              alt={page.team_image_alt}
              width="1920"
              height="1080"
              /* The LCP element on this page, so it is fetched at high priority
                 and never lazily. */
              fetchPriority="high"
              className="order-2 w-full lg:absolute lg:inset-0 lg:h-full lg:object-cover lg:object-bottom"
            />
          )}

          {/* rgba(0, 0, 0, 0.2), the live value - and only where the type is
              over the photograph, which below `lg` it is not. */}
          <div
            className="absolute inset-0 hidden bg-black/20 lg:block"
            aria-hidden="true"
          />

          {/* A SECOND WASH, TOP-DOWN, OVER THE UPPER TWO THIRDS.

              The flat 20% above is even across the whole frame, which is right
              for the type in the middle of it and does nothing for the top edge -
              where the fixed header sits over whatever the photograph happens to
              be doing there. On the workshop shots that is bright sky, and the
              nav's own gradient (SiteHeader) is a 4.5rem strip built to cover a
              bar, not a hero.

              `h-2/3`, a proportion rather than a fixed height: this image is
              full-bleed and its height changes with the viewport, so an `h-64`
              would be most of the frame on a laptop and a sliver of it on a
              large monitor. It started at a third and was extended - a third
              ran out while the headline was still over bright glass, so the
              type sat on the boundary where the wash was already fading.

              THE STOPS ARE NOT EVENLY SPACED, and that is what keeps it from
              looking like a grey band: most of the darkness is spent in the top
              quarter, where the nav and the eyebrow are, and the rest is a long
              slow release across the headline and out. An even gradient over
              two thirds of a hero reads as a filter over the photograph rather
              than as light falling off.

              `lg:block` to match the wash above it. Below that breakpoint the
              copy sits on its own black block with the photograph BELOW it, so
              there is nothing at the top of the image for a scrim to help. */}
          <div
            className="absolute inset-x-0 top-0 hidden h-2/3 bg-linear-to-b from-black/85 from-5% via-black/45 via-35% to-transparent lg:block"
            aria-hidden="true"
          />

          <div className="evs-shell relative z-10 order-1 pt-32 pb-10 lg:pt-[10vw] lg:pb-0">
            <Reveal className="lg:min-h-[34.375rem]" stagger={110}>
              {/* THE UNDERLINE IS THE LIVE PAGE'S, not the new system's dash:
                  `.evs-eyebrow` draws a 1.75rem rule BEFORE the words and this
                  one is a 2px brand rule UNDER them, so `evs-eyebrow-bare` drops
                  the dash rather than letting the two both appear.

                  `text-content` rather than the class's own `content-muted`, for
                  the reason PageHero's crumbs are a step brighter: the token
                  ratios are measured against the dark SURFACE, not against a
                  lit workshop wall. */}
              <span className="evs-eyebrow evs-eyebrow-bare mb-6 border-b-2 border-brand-500 pb-3 text-content">
                {page.h1}
              </span>

              {/* `text-display-2`, the same size every hero on the site uses.
                  NO WIDTH CAP, unlike the old `w-80`: that was 80% of a 1140px
                  Bootstrap container holding a 64px headline, and this face is
                  75-80px in the same shell - so an 80% cap broke a line that
                  otherwise fits, and the live page's single-line banner came out
                  as two. Measured at 1280 the headline is 1039px in 1137px of
                  shell, and at 1920 it is 1110px in 1312px. */}
              <h1 className="text-display-2 text-balance uppercase">
                {page.headline}
                <span className="text-brand-500">.</span>
              </h1>
            </Reveal>
          </div>
        </section>

        {/* ================= OUR JOURNEY ================= */}
        <section className="evs-shell evs-section">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal from="start" className="lg:col-span-6">
              {page.founder_image_url && (
                <img
                  src={assetUrl(page.founder_image_url, { w: 1024 })}
                  srcSet={srcSet(page.founder_image_url)}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  alt={page.founder_image_alt}
                  loading="lazy"
                  className="w-full rounded-xl border border-line-subtle object-cover"
                />
              )}
            </Reveal>

            <Reveal from="end" delay={100} className="lg:col-span-6 xl:col-span-5 xl:col-start-8">
              <span className="evs-eyebrow mb-6">{page.journey_eyebrow}</span>

              <h2 className="text-display-3">
                {page.journey_title}
                <span className="text-brand-500">.</span>
              </h2>

              <p className="mt-6 text-lead text-content-secondary">{page.journey_body}</p>

              <a href={href(page.journey_cta_path)} className="evs-btn evs-btn-primary mt-9">
                {page.journey_cta_label}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Reveal>
          </div>
        </section>

        {/* ================= TABS =================
            Real tabs: one tablist, arrow-key navigation, one panel visible.
            Below `lg` they stack as a vertical list of buttons above the panel
            rather than squeezing into a row that wraps. */}
        {tabs.length > 0 && (
          <section className="evs-shell evs-section-sm">
            <Reveal className="mb-12 max-w-3xl">
              <h2 className="text-display-3">
                {page.tabs_heading}
                <span className="text-brand-500">.</span>
              </h2>
            </Reveal>

            {/* NUMBERED AND RULED, not a stack of boxes. The tab list read as a
                sidebar menu - a filled rounded panel on the selected one, plain
                grey text on the rest - which is the shape of navigation, not of
                a set of chapters. Numbers give it an order and a length the
                reader can see at once, and they tie the two columns together:
                the same figure is set large in the panel opposite.

                It is the same treatment the service pages give their benefits,
                which is what makes two different sections look like one system.

                THE PANEL HAS A FLOOR. The three bodies are different lengths, so
                switching tabs resized the section under the reader's cursor and
                everything below it jumped. `lg:min-h-*` holds the tallest. */}
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div
                role="tablist"
                aria-orientation="vertical"
                aria-label={page.tabs_heading}
                className="lg:col-span-5"
                onKeyDown={(e) => {
                  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
                  e.preventDefault();
                  const step = e.key === "ArrowDown" ? 1 : -1;
                  const next = (activeTab + step + tabs.length) % tabs.length;
                  setActiveTab(next);
                  /* AND MOVE THE FOCUS WITH IT. The roving tabindex was already
                     here, but nothing focused the newly selected tab - so an
                     arrow key changed the panel while the focus ring stayed
                     behind on a tab that now had `tabIndex={-1}`, and the next
                     Tab press jumped out of the list from nowhere. */
                  tabRefs.current[next]?.focus();
                }}
              >
                {tabs.map((tab, index) => {
                  const selected = index === activeTab;
                  return (
                    <button
                      key={tab.slug}
                      type="button"
                      role="tab"
                      ref={(el) => {
                        tabRefs.current[index] = el;
                      }}
                      id={`about-tab-${tab.slug}`}
                      aria-selected={selected}
                      aria-controls={`about-panel-${tab.slug}`}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => setActiveTab(index)}
                      className={`group flex w-full items-center gap-5 border-b border-line-subtle py-6 text-start transition-colors duration-200 first:border-t ${
                        selected ? "text-content" : "text-content-muted hover:text-content"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`font-display text-heading leading-none tabular-nums transition-colors duration-300 ${
                          selected ? "text-brand-500" : "text-brand-500/30"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-subheading font-semibold">{tab.nav_label}</span>
                      {/* The indicator. A bar that grows from nothing on the
                          selected row - the one moving part, and it says which
                          without needing a filled panel behind the words. */}
                      <span
                        aria-hidden="true"
                        className={`ms-auto h-px bg-brand-500 transition-all duration-300 ease-out ${
                          selected ? "w-10 opacity-100" : "w-0 opacity-0"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="lg:col-span-7">
                {tabs.map((tab, index) => (
                  <div
                    key={tab.slug}
                    role="tabpanel"
                    id={`about-panel-${tab.slug}`}
                    aria-labelledby={`about-tab-${tab.slug}`}
                    hidden={index !== activeTab}
                    className="relative overflow-hidden rounded-xl border border-line-subtle bg-surface-raised p-8 lg:min-h-[22rem] md:p-10"
                  >
                    {/* The tab's own number, set large and faint behind the
                        copy, so the panel is visibly the answer to the row
                        that is selected rather than a box that changed. */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -end-4 -top-8 font-display text-[9rem] leading-none text-brand-500/6 select-none"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h3 className="relative text-heading">
                      <span className="text-brand-500">{tab.heading_highlight}</span>{" "}
                      {tab.heading_rest}
                    </h3>

                    {/* HTML, because one body carries an inline link. The only
                        markup a row may contain is a link, and its href is a
                        {{locale_prefix}} token — never an absolute URL. */}
                    <div
                      className="evs-prose relative mt-5 text-lead"
                      dangerouslySetInnerHTML={{ __html: withPrefix(tab.body) }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <StatsBand locale={locale} tokens={tokens} branchCount={locations.length} sections={sections} />

        <ReviewsSection locale={locale} branch={branch} reviews={reviews} sections={sections} />

        <BranchesSection
          locale={locale}
          branch={branch}
          locations={locations}
          sections={sections}
          limit={6}
        />
      </div>
    </>
  );
}
