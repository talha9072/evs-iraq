import { interpolate } from "@/lib/branches";
import Reveal from "@/components/modern/Reveal";

/**
 * The four-figure band.
 *
 * Same rows as the legacy `StatsCounter` — `section_content.stats`, with the
 * branch overrides that stopped Oman and Qatar publishing the UAE's staff count
 * as their own — and the same throw when the row is missing, because a section
 * that is mostly numbers fails silently otherwise.
 *
 * WHAT CHANGED. The legacy component had three different shapes (`ltr`, `rtl`
 * and a third for the home page) because the two home pages had drifted from the
 * other nine routes and nobody wanted to move them. There is one shape here.
 *
 * The count-up animation is gone with it. It relied on Crafto's
 * `.vertical-counter`, it only ever ran in English — the Arabic figures were
 * literal text, since you cannot count up to the word "الأول" — and a number
 * that arrives late reads as a loading state rather than a fact. Figures are
 * printed. That also removes the layout shift they caused.
 */
/** Whole class names, so Tailwind's scanner can find them. See the note below. */
const COLUMNS = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

export default function StatsBand({
  locale = "en",
  tokens = {},
  /** How many workshops this branch has. Omitted rather than defaulted: any
   *  fixed number is wrong in every country but one. */
  branchCount = null,
  sections,
  className = "",
}) {
  const t = sections?.stats;
  if (!t) {
    throw new Error(
      "StatsBand: no section_content.stats for this locale - pass sections from getSections(locale)"
    );
  }

  /* `firstNoPlace` is what the first label reads when the caller supplies no
     tokens — /about does exactly that, and `interpolate` deliberately leaves an
     unresolved token visible, so that page used to print the literal string
     "1st EV Center in {{country_the}}". */
  /* TWO SHAPES, AND BOTH ARE REAL. English and Bengali carry
     `{ label, value, prefix }`; ARABIC CARRIES `display` - a finished string.
     This component read `display` once, was "fixed" to read `value`, and that
     fix printed the literal word "undefined" as three of the four figures on
     every Arabic page that shows this band. The comment here still asserted
     there was no `display` column.

     Neither shape is wrong. Arabic's first figure is "الأول" - a WORD, not a
     number - so `value: 1, prefix: "#"` cannot express it, which is precisely
     why that row uses `display`. So `display` wins where it exists and the
     numeric pair is composed where it does not. No migration: there is nothing
     to normalise towards. */
  /*
   * A BAKED `items` ARRAY WINS OVER THE FOUR INHERITED KEYS, and on this
   * deployment it is what ships.
   *
   * The inherited shape is `first / branches / staff / customers`, and three of
   * those four are facts about a TRADING business: a staff count, a customer
   * count, and a number of branches. EVS has not opened in Iraq, so the band
   * published "+200 Experienced Staff" and "21452 Happy Customers" - the UAE
   * group's figures, presented as the country's own - on 584 pages including the
   * home page, with a lit "0 Branches" box beside them. The same class of fault
   * that lib/sections.js was written to stop Oman and Qatar committing, which is
   * why the comment there promises branch overrides; this fork has no database,
   * so there was no override to inherit.
   *
   * `items` is an ordered list of figures that are TRUE before opening: counted
   * out of this build's own content, or facts about the group that say so. When
   * Iraq opens and the rows come from the platform database again, drop
   * `items` and the four keys below take over unchanged.
   */
  const stats = Array.isArray(t.items)
    ? t.items.map((item) => ({ ...item, label: interpolate(item.label, tokens) }))
    : [
        {
          ...t.first,
          label: Object.keys(tokens).length ? interpolate(t.first.label, tokens) : t.firstNoPlace,
        },
        /* `> 0`, NOT `!= null`. A branch count of zero is a real answer here -
           getLocations() returns [] until there is a workshop - and `!= null`
           let it through to render the figure "0" under the label "Branches". */
        branchCount > 0 && { value: branchCount, prefix: "", label: t.branches },
        { ...t.staff },
        { ...t.customers },
      ].filter(Boolean);

  return (
    <section className={`evs-shell evs-section-sm ${className}`}>
      {/* THE COLUMN COUNT FOLLOWS THE FIGURES, and it has to: `branchCount` is
          optional, so this band is three items as often as four, and a fixed
          `lg:grid-cols-4` left the fourth cell empty - a lit, bordered box with
          nothing in it, which is what the workshop pages were showing.

          Written as a lookup rather than `lg:grid-cols-${n}`: Tailwind scans
          source text for whole class names, so an interpolated one is never
          generated and the class silently does nothing. */}
      <Reveal
        as="dl"
        stagger={90}
        className={`grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line-subtle bg-line-subtle ${
          COLUMNS[stats.length] ?? "lg:grid-cols-4"
        }`}
      >
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col gap-2 bg-surface p-7 lg:p-9">
            <dd className="font-sans text-display-3 font-semibold text-content tabular-nums">
              {stat.display != null && stat.display !== "" ? (
                stat.display
              ) : (
                <>
                  {stat.prefix ? <span className="text-brand-500">{stat.prefix}</span> : null}
                  {/* Guarded, so a row missing BOTH keys renders an empty
                      figure rather than the word "undefined" - which is what
                      the unguarded String() did. */}
                  {stat.value == null ? "" : String(stat.value)}
                </>
              )}
            </dd>
            <dt className="text-eyebrow font-semibold tracking-[0.14em] text-content-muted uppercase">
              {stat.label}
            </dt>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
