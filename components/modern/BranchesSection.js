import { DEFAULT_LOCALE } from "@/lib/locale";
import { toBranchCard } from "@/lib/branch-card";
import Reveal from "@/components/modern/Reveal";
import BranchCard from "@/components/modern/BranchCard";
import { ArrowRight } from "@/components/chrome/icons";

/**
 * The workshop directory block, as it appears on the home, about, services,
 * brand and workshop pages.
 *
 * SAME ROWS, SAME GRID AS BEFORE. `locations` for this branch,
 * `section_content.branches` for the labels, three across on a large screen.
 *
 * IT NO LONGER HAS ITS OWN CARD. This file used to build one inline - its own
 * markup, its own mapping of the row - while /branches rendered
 * components/modern/BranchCard from a shape lib/pages.js built. Two cards for
 * one thing, and they drifted exactly as you would expect: /branches learned
 * that four of the nine UAE workshops are Express bays with no photograph and
 * gave them a typographic panel, and this one kept painting an empty grey box
 * where their photo would have been. That is the pair of black cards the home
 * page has been showing.
 *
 * One card now, one mapping in lib/branch-card.js - which is what made 0089's
 * Google rating and the Visit button land on both pages at once instead of
 * twice.
 */

/**
 * "All branches" - the section's link to the full directory.
 *
 * `section_content.branches` carries heading, call, directions, follow and
 * 0089's visit and reviews, and no label for this. Kept in code rather than
 * inventing a column for two words, the same call FaqPage makes for its
 * contact prompt.
 */
const ALL = { en: "All branches", ar: "كل الفروع", bn: "সব শাখা" };
const allLabel = (locale) => ALL[locale] ?? ALL[String(locale).split("-")[0]] ?? ALL.en;

export default function BranchesSection({
  locale = DEFAULT_LOCALE,
  branch,
  locations = [],
  sections,
  /** Cap the grid - the home page shows a selection, /branches shows them all. */
  limit = null,
  className = "",
}) {
  const t = sections?.branches;
  if (!t) {
    throw new Error(
      "BranchesSection: no section_content.branches for this locale - pass sections from getSections(locale)"
    );
  }

  const shown = limit ? locations.slice(0, limit) : locations;
  if (shown.length === 0) return null;

  const branchesHref = locale === DEFAULT_LOCALE ? "/branches" : `/${locale}/branches`;

  return (
    <section className={`evs-shell evs-section ${className}`}>
      <Reveal className="mb-12 flex flex-col gap-5 md:mb-16 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-display-3">
            {t.heading}
            <span className="text-brand-500">.</span>
          </h2>
        </div>

        {limit && locations.length > shown.length && (
          <a href={branchesHref} className="evs-btn evs-btn-secondary self-start md:self-auto">
            {allLabel(locale)}
            <ArrowRight className="h-4 w-4" />
          </a>
        )}
      </Reveal>

      <Reveal stagger={70} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((location) => {
          const card = toBranchCard(location, locale);

          /* `page_path` alone decides whether the title is a link and whether
             the Visit button appears - the same rule /branches uses, rather
             than this block's old `location.slug`, which linked every card
             including workshops that have no page in any language.

             The stored value has NO leading slash ("evs-dubai"), so the slash
             is added here; without it the href is relative and /ar/ resolves it
             against the document. */
          const href = card.pagePath
            ? locale === DEFAULT_LOCALE
              ? `/${card.pagePath}`
              : `/${locale}/${card.pagePath}`
            : undefined;

          return (
            <BranchCard
              key={card.slug}
              card={card}
              href={href}
              labels={t}
              fallbackPhone={branch?.support_phone}
              locale={locale}
            />
          );
        })}
      </Reveal>
    </section>
  );
}
