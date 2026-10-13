import { useCallback, useEffect, useRef, useState } from "react";
import { localised } from "@/lib/branches";
import { DEFAULT_LOCALE, isRtl } from "@/lib/locale";
import Reveal from "@/components/modern/Reveal";
import { ChevronLeft, ChevronRight, Star } from "@/components/chrome/icons";

/**
 * Customer reviews - a carousel of cards.
 *
 * SAME ROWS AS BEFORE - the `reviews` table plus `section_content.reviews` for
 * the labels, and `section_content.review_source_logos` for the source mark,
 * keyed on the review's own `source` and falling back to google, which is the
 * only source there is today.
 *
 * `author` and `body` arrive as `{ en, ar }` - unresolved, because one row
 * serves every language - so both go through `localised()`.
 *
 * The CTA is composed from three rows, not one: `ctaBefore` + the count and
 * `plus` + `ctaAfter` + `ctaLink`, which is how the legacy block built
 * "See our 21452+ reviews on Google". Reproduced rather than simplified, so the
 * Arabic sentence keeps its own word order.
 *
 * -------------------------------------------------------------------------
 * WHAT MAKES THE CARD DIFFERENT THIS TIME
 * -------------------------------------------------------------------------
 * The card itself was the problem, not the layout. Four boxes of identical grey
 * with a decorative quote glyph on top, 15px body text in the middle and the
 * stars hidden at the bottom - so the first thing the eye met was an ornament,
 * the rating arrived last, and nothing said where any of it came from.
 *
 * It is ordered by what a reader is actually asking now:
 *
 *   THE RATING FIRST, top-left, because "is this good" comes before "what did
 *   they say". It was at the foot of the card, after the name.
 *
 *   THE SOURCE opposite it. The Google mark was in the section header only, so
 *   an individual quote was unattributed - which is exactly the thing a
 *   testimonial has to answer. Same logo row the header uses, no new data.
 *
 *   THE QUOTE at `text-lead` rather than 15px, in `text-content` rather than
 *   muted grey. It is the only thing on the card worth reading and it was set
 *   like a caption.
 *
 *   A MONOGRAM beside the name. There are no photographs on these rows and
 *   inventing one would be worse than none, so it is the author's own initial -
 *   which is enough to make the foot of the card read as a person rather than
 *   as two more lines of text.
 *
 * The decorative quote glyph is gone. It was the largest thing on the card and
 * it said nothing.
 *
 * -------------------------------------------------------------------------
 * IT IS A SCROLLER, NOT A SLIDESHOW
 * -------------------------------------------------------------------------
 * The legacy block was a Swiper wired by Crafto's main.js - a library, a config
 * blob, an init hook, and synthetic `resize` and `load` events dispatched after
 * mount to make the slider notice markup that arrived after the script did. It
 * also sat inside a `data-anime` block, so on /ev-car-brands it reserved 504px
 * and rendered nothing at all (evs.css:588 documents that chase).
 *
 * The track here is a plain `overflow-x` scroller with CSS scroll-snap: it
 * swipes on a phone, scrolls by trackpad and keyboard, needs no initialisation,
 * cannot arrive before its markup, and still works with JavaScript off. The
 * JavaScript adds only the arrows and the progress rail, and both are DERIVED
 * from scroll position rather than driving it - so there is no "current slide"
 * to fall out of step with the scroller.
 *
 * DIRECTION. `scrollLeft` runs NEGATIVE in a right-to-left scroller, so every
 * measurement takes its absolute value and the paging step is multiplied by the
 * direction. Getting this wrong does not break in English - it breaks only in
 * Arabic, which is exactly the kind of bug that ships.
 */

function Rating({ value = 5, className = "" }) {
  const rounded = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return (
    <div className={`flex items-center gap-1 ${className}`} role="img" aria-label={`${rounded} / 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 shrink-0 ${i < rounded ? "fill-brand-500 text-brand-500" : "text-line-strong"}`}
        />
      ))}
    </div>
  );
}

/** Prev/next. Disabled at the ends, and disabled on the server - see below. */
function Arrow({ label, onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full border border-line text-content transition-all duration-200 hover:border-brand-500 hover:bg-brand-500 hover:text-content-inverse disabled:pointer-events-none disabled:opacity-25"
    >
      {children}
    </button>
  );
}

export default function ReviewsSection({
  locale = DEFAULT_LOCALE,
  reviews = [],
  sections,
  branch,
  className = "",
}) {
  const t = sections?.reviews;
  if (!t) {
    throw new Error(
      "ReviewsSection: no section_content.reviews for this locale - pass sections from getSections(locale)"
    );
  }

  const rtl = isRtl(locale);
  const trackRef = useRef(null);

  /* BOTH ARROWS START DISABLED, deliberately, and that is the whole
     no-JavaScript story. The server cannot know how wide the track will be, so
     it renders them inert; the first measurement after mount enables whichever
     applies. A reader with no JavaScript sees two visibly disabled arrows and a
     track that still swipes and scrolls, rather than two live-looking buttons
     that do nothing. The initial values are also what the client renders first,
     so there is no hydration mismatch to suppress. */
  const [nav, setNav] = useState({ prev: false, next: false, ratio: 1, progress: 0 });

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    // Negative in an RTL scroller - see the note at the top.
    const x = Math.abs(el.scrollLeft);
    setNav({
      // 4px of slack: sub-pixel layout means `x === max` is never quite true at
      // the end, and without it the last arrow never disables.
      prev: x > 4,
      next: x < max - 4,
      ratio: el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1,
      progress: max > 4 ? Math.min(1, x / max) : 0,
    });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    // Not a window resize listener: the track also changes width when the
    // layout reflows or a font finally swaps in, and a resize event fires for
    // neither.
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [measure]);

  const page = useCallback(
    (direction) => {
      const el = trackRef.current;
      if (!el) return;
      // Just under a full viewport, so the card at the edge stays partly in
      // view and the reader keeps their place instead of being teleported.
      const step = el.clientWidth * 0.85;
      el.scrollBy({ left: (rtl ? -1 : 1) * direction * step, behavior: "smooth" });
    },
    [rtl]
  );

  if (reviews.length === 0) return null;

  /* The headline figure is the branch's total review count, not the number of
     quotes shown - the same number the legacy badge printed. */
  const count = branch?.review_count ?? sections?.tokens?.review_count ?? null;
  const logo =
    sections?.review_source_logos?.[reviews[0]?.source] ??
    sections?.review_source_logos?.google ??
    null;

  /* The rail's thumb is as wide a share of the track as the viewport is of the
     content, and travels the rest. The percentage is of its OWN width, which is
     why it is not simply `progress * 100`. */
  const travel = nav.ratio > 0 ? (100 / nav.ratio - 100) * nav.progress : 0;

  return (
    <section className={`evs-shell evs-section ${className}`}>
      <Reveal className="mb-12 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span className="evs-eyebrow mb-5">{t.eyebrow}</span>
          <h2 className="text-display-3">
            {t.heading}
            <span className="text-brand-500">.</span>
          </h2>
        </div>

        <div className="flex flex-col items-start gap-5 md:items-end">
          {/* The aggregate, which the legacy block buried inside a slide. */}
          <div className="flex flex-none items-center gap-4 rounded-lg border border-line-subtle bg-surface-raised px-5 py-4">
            {logo && (
              <img src={logo} alt={t.logoAlt} width="32" height="32" className="h-8 w-8" loading="lazy" />
            )}
            <div className="flex flex-col gap-1.5">
              <Rating value={5} />
              <span className="text-sm text-content-muted">
                {t.ctaBefore}
                {count != null && (
                  <span className="text-content tabular-nums">{`${count}${t.plus}`}</span>
                )}
                {t.ctaAfter}
                {branch?.review_url ? (
                  <a
                    href={branch.review_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-500 underline underline-offset-2"
                  >
                    {t.ctaLink}
                  </a>
                ) : (
                  t.ctaLink
                )}
              </span>
            </div>
          </div>

          {/* `t.prev` and `t.next` were already in section_content - they are
              what the old Swiper labelled its arrows with, and they survived
              the rewrite that dropped it. No new row needed. */}
          {reviews.length > 1 && (
            <div className="flex items-center gap-2">
              <Arrow label={t.prev} onClick={() => page(-1)} disabled={!nav.prev}>
                <ChevronLeft className="h-5 w-5 rtl:-scale-x-100" />
              </Arrow>
              <Arrow label={t.next} onClick={() => page(1)} disabled={!nav.next}>
                <ChevronRight className="h-5 w-5 rtl:-scale-x-100" />
              </Arrow>
            </div>
          )}
        </div>
      </Reveal>

      {/* The track sits INSIDE the shell, so the first card lines up with the
          heading and the last clips at the shell's own edge.

          `tabIndex={0}` because a keyboard user needs to focus the scroller to
          arrow through it; without it the arrow keys scroll the page instead.
          `py` on the track rather than the cards: overflow-x clips the other
          axis too, and the cards' hover lift was being cut off.

          `[scrollbar-width:none]` - the rail below says where you are, and on
          Windows the bar is otherwise a permanent grey slab under the cards. */}
      <div
        ref={trackRef}
        tabIndex={0}
        role="group"
        aria-label={t.eyebrow}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((review, i) => {
          const author = localised(review.author, locale) ?? "";
          /* `Array.from` rather than `author[0]`: an Arabic or Bengali initial
             can be more than one UTF-16 unit, and slicing one would render half
             a character. */
          const initial = Array.from(author.trim())[0] ?? "";

          return (
            <figure
              key={review.id ?? i}
              className="evs-card evs-card-interactive flex w-[80vw] shrink-0 snap-start flex-col p-7 sm:w-[22rem] lg:w-[24rem]"
            >
              {/* Rating first, source opposite - what the reader is asking
                  before they read a word of it. */}
              <div className="flex items-center justify-between gap-4">
                <Rating value={review.rating} />
                {logo && (
                  <img
                    src={logo}
                    alt={t.logoAlt}
                    width="20"
                    height="20"
                    className="h-5 w-5 shrink-0 opacity-70"
                    loading="lazy"
                  />
                )}
              </div>

              {/* `flex-1` so every card's author line sits on the same rule
                  whatever the quote's length - four quotes of different lengths
                  are what made the old row look ragged. */}
              <blockquote className="mt-6 flex-1 text-lead leading-relaxed text-content">
                {localised(review.body, locale)}
              </blockquote>

              <figcaption className="mt-7 flex items-center gap-3.5 border-t border-line-subtle pt-6">
                {/* No photographs on these rows, and inventing one would be
                    worse than none - so the author's own initial. `aria-hidden`
                    because the name is right beside it. */}
                <span
                  aria-hidden="true"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-brand-500/30 bg-brand-500/10 font-display text-xl leading-none text-brand-500 select-none"
                >
                  {initial}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-content">{author}</div>
                  {t.verified && (
                    <div className="mt-0.5 truncate text-xs text-content-muted">{t.verified}</div>
                  )}
                </div>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {/* The progress rail. Dots would need one per review and say nothing about
          how far through a partly-scrolled card you are; this is continuous, is
          the same height whatever the count, and doubles as the scrollbar the
          track above no longer shows.

          `aria-hidden` - it is a picture of the scroll position, and the
          scroller itself is what a screen reader should be told about. */}
      <div className="mt-8 h-px w-full overflow-hidden bg-line-subtle" aria-hidden="true">
        <div
          className="h-px bg-brand-500 transition-transform duration-150 ease-out"
          style={{
            width: `${Math.min(100, nav.ratio * 100)}%`,
            transform: `translateX(${rtl ? -travel : travel}%)`,
          }}
        />
      </div>
    </section>
  );
}
