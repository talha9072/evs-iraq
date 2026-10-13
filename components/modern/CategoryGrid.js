import Reveal from "@/components/modern/Reveal";
import ServicesMosaic from "@/components/modern/ServicesMosaic";

/**
 * "Electric Vehicle Services" - the block at the foot of every category and
 * service page, linking all five categories.
 *
 * It includes the category you are already on, exactly as the legacy block did.
 * That looks like an oversight and is not: it is a menu of the whole tree, and
 * a menu with a hole in it is harder to read than one without.
 *
 * THE SAME MOSAIC THE HOME PAGE RENDERS. This was a compact row - icon, name,
 * one line, an arrow - so the deepest pages on the site presented the five
 * categories quite differently from the way the home page and /services do.
 * Same rows, same idea, three treatments; now two.
 *
 * A category carries three different lengths of the same idea -
 * `showcase_tagline` for a panel, `card_description` for a compact card,
 * `hero_description` for its own hero. The mosaic is the panel treatment, so it
 * takes the tagline, and falls back to the card line where a row has none.
 */
export default function CategoryGrid({ categories = [], heading, className = "" }) {
  if (categories.length === 0) return null;

  return (
    <section className={`evs-shell evs-section-sm ${className}`}>
      {heading && (
        <Reveal className="mb-10 max-w-2xl">
          <h2 className="text-display-3">
            {heading}
            <span className="text-brand-500">.</span>
          </h2>
        </Reveal>
      )}

      <ServicesMosaic
        services={categories.map((c) => ({
          id: c.id,
          href: c.href,
          name: c.name,
          tagline: c.showcase_tagline ?? c.card_description ?? null,
          image: c.showcase_bg_url ?? null,
          icon: c.iconUrl ?? null,
          ctaLabel: c.showcase_cta_label ?? null,
        }))}
      />
    </section>
  );
}
