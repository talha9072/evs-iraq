import { Star } from "@/components/chrome/icons";

/**
 * A Google rating - logo, stars, the average and how many it averages.
 *
 * WHY IT IS ITS OWN COMPONENT. The branch cards want it, the workshop pages
 * want it, and /branches wants it; three copies of a half-star clip would drift.
 * It takes a location row's three 0089 columns and nothing else.
 *
 * IT RENDERS NOTHING WITHOUT A RATING. A workshop that has not been rated shows
 * no badge at all - not a zero, not five empty stars. That is what lets 0089
 * ship the columns empty and lets a new location be inserted before anyone has
 * looked its listing up.
 *
 * THE COUNT IS NOT OPTIONAL DRESSING. A 5.0 from three people and a 4.7 from
 * nine hundred are different claims, and printing the average alone is how that
 * difference gets hidden. It is shown whenever the row has it.
 *
 * THE HALF STAR IS A CLIP, NOT A SECOND ICON SET. Two identical rows of five
 * stars sit on top of each other and the coloured one is clipped to
 * `rating / 5`. So 4.3 renders as 4.3, not rounded to a half - and there is one
 * icon to maintain rather than empty/half/full variants.
 *
 * DIRECTION-SAFE. The clip is `inset-inline-start` and a logical width, so in
 * Arabic the fill starts from the right-hand star without a second rule.
 */

/** Google's four-colour G. Their mark, on their rating - so it is drawn, not approximated. */
function GoogleMark({ className = "" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

function Stars({ rating }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));

  /* `shrink-0` ON EVERY STAR, and `w-max` on the row. This is the whole trick,
     and getting it wrong is why the first version rendered 4.6 as five full
     stars: the fill row lives inside a container narrowed to 92%, and a flex
     item's default `flex-shrink: 1` means the stars OBLIGED - they squeezed to
     fit instead of being cut off. So every rating painted five complete stars
     at slightly different widths, which reads as five stars.

     The row has to keep its natural width and let `overflow-hidden` do the
     cutting. That is the difference between clipping and compressing. */
  const row = (className) => (
    <span className={`flex w-max ${className}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className="h-3.5 w-3.5 shrink-0" fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  );

  return (
    <span className="relative inline-flex shrink-0" aria-hidden="true">
      {/* The track: five stars at the colour of an unfilled one. */}
      {row("text-line-strong")}
      {/* The fill, clipped to the rating. `#fbbc04` is Google's own star yellow
          rather than the brand green - this is their rating, and recolouring it
          would make it look like ours. */}
      <span
        className="absolute top-0 start-0 overflow-hidden"
        style={{ inlineSize: `${pct}%` }}
      >
        {row("text-[#fbbc04]")}
      </span>
    </span>
  );
}

export default function GoogleRating({
  rating,
  count = null,
  url = null,
  /** From `section_content.branches.reviews` - the badge's accessible name. */
  label = null,
  locale = "en",
  className = "",
}) {
  const value = Number(rating);
  if (!Number.isFinite(value) || value <= 0) return null;

  /* `4.8` in English, `٤٫٨` in Arabic - the same call every other number on
     these pages makes, rather than a hard-coded toFixed(1). */
  const printed = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
  const printedCount =
    Number.isFinite(Number(count)) && Number(count) > 0
      ? new Intl.NumberFormat(locale).format(Number(count))
      : null;

  const body = (
    <>
      <GoogleMark className="h-4 w-4 shrink-0" />
      <Stars rating={value} />
      <span className="text-sm font-semibold text-content tabular-nums">{printed}</span>
      {printedCount && (
        <span className="text-sm text-content-muted tabular-nums">({printedCount})</span>
      )}
    </>
  );

  const shared = `inline-flex items-center gap-2 ${className}`;

  /* A link when the row has a listing, so the number can be checked rather than
     taken on trust. `rel="noopener"` because it opens in a new tab, and the
     label is the accessible name - without it a screen reader gets "4.8 (312)"
     with no idea what it rates. */
  return url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label || undefined}
      className={`${shared} rounded-sm transition-opacity duration-200 hover:opacity-80`}
    >
      {body}
    </a>
  ) : (
    <span className={shared} role="img" aria-label={label || undefined}>
      {body}
    </span>
  );
}
