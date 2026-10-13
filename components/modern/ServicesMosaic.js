import { assetUrl } from "@/lib/images";
import Reveal from "@/components/modern/Reveal";
import { ArrowRight } from "@/components/chrome/icons";

/**
 * The five service categories as a mosaic of image cards - the home page's
 * "What we do" block.
 *
 * MODELLED ON THE HUB'S GRID, NOT SHARED WITH IT. /services renders the same
 * shape from its own markup inside ServicesHub, and that file is deliberately
 * left alone: only this block was meant to change, and a page that works should
 * not be refactored to make a different page tidier.
 *
 * So this is a second copy of that treatment, and it is worth saying plainly:
 * if the hub's cards change, this has to change with them. Merging the two is a
 * separate job, for a day when /services is meant to be touched.
 *
 * WHAT IT REPLACED HERE. A rail of small cards - one set of rows given two
 * different treatments on two pages. The hub's is the one that shows what a
 * category IS: a photograph, its name set large, the tagline, and a way in.
 *
 * THE FIRST CARD LEADS. It spans four of six columns and is taller, so the set
 * reads as a menu with a first item rather than as five equal tiles. That is
 * also why its image is requested at 1400px and the rest at 800: the lead card
 * is genuinely twice the size, and one width for both would waste about half
 * the bytes on four of the five.
 *
 * NORMALISED SHAPE, NOT THE RAW ROW. `lib/home-page.js` trims the services tree
 * before it reaches the browser - the whole thing is ~124 KB and carries every
 * leaf's copy, FAQs and meta tags, none of which a card prints.
 */
export default function ServicesMosaic({
  /** [{ id, href, name, tagline, image, icon, ctaLabel }] */
  services = [],
  className = "",
}) {
  if (services.length === 0) return null;

  return (
    <Reveal stagger={80} className={`grid gap-5 md:grid-cols-2 lg:grid-cols-6 ${className}`}>
      {services.map((service, index) => {
        const lead = index === 0;
        return (
          <a
            key={service.id ?? service.href}
            href={service.href}
            className={`evs-card evs-card-interactive group relative flex min-h-[20rem] flex-col justify-end overflow-hidden ${
              lead ? "lg:col-span-4 lg:min-h-[26rem]" : "lg:col-span-2"
            }`}
          >
            {service.image && (
              <img
                src={assetUrl(service.image, { w: lead ? 1400 : 800 })}
                alt={service.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            )}
            <div className="evs-scrim-strong absolute inset-0" aria-hidden="true" />

            <div className="relative p-7">
              {service.icon && (
                <span className="mb-5 grid h-12 w-12 place-items-center rounded-full border border-line bg-surface-sunken/70 backdrop-blur-sm">
                  <img src={service.icon} alt={service.name} width="22" height="22" className="h-5.5 w-5.5" />
                </span>
              )}

              <h3 className={`uppercase ${lead ? "text-display-3" : "text-heading"}`}>
                {service.name}
              </h3>

              {/* The tagline is its own column on the row: the panel's tagline,
                  the card line and the hero's description are three different
                  lengths of the same idea. */}
              {service.tagline && (
                <p className="mt-3 max-w-md text-content-secondary">{service.tagline}</p>
              )}

              {service.ctaLabel && (
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-500">
                  {service.ctaLabel}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                </span>
              )}
            </div>
          </a>
        );
      })}
    </Reveal>
  );
}
