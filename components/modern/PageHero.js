import { assetUrl } from "@/lib/images";
import Reveal from "@/components/modern/Reveal";
import { ArrowRight, ChevronRight } from "@/components/chrome/icons";

/**
 * The hero every inner page shares - service categories, individual services,
 * and anything else that is a photograph with a title over it.
 *
 * WHAT IT REPLACES. `components/services/Hero.js`, which set its background
 * with an inline `style` on a `page-title-big-typography` section and carried
 * the same block of Revolution Slider leftovers the home page did: a
 * `tp-caption` wrapper, a `rev-btn`, and an inline style object with
 * `transform: matrix3d(...)` and `visibility: inherit` on the button.
 *
 * BREADCRUMBS ARE NEW, and they are the reason this exists as its own
 * component. A service page is three levels deep - /services/battery-electrical
 * /pdu-repair - and the legacy page gave a reader no way back up except the
 * browser button. They are real navigation, and they emit BreadcrumbList
 * structured data, which is what puts the trail under a Google result.
 */
export default function PageHero({
  /** [{ label, href }] - the last entry is the current page and is not linked. */
  crumbs = [],
  eyebrow,
  title,
  /** Appended to the title in the brand green, no space inserted. */
  highlight,
  description,
  bgUrl,
  cta,
  /** Smaller variant for leaf pages, so a category still outranks its services. */
  size = "large",
  children,
}) {
  const tall = size === "large";

  return (
    <section
      className={`relative flex items-end overflow-hidden pt-32 ${
        tall ? "min-h-[30rem] md:min-h-[38rem]" : "min-h-[24rem] md:min-h-[30rem]"
      }`}
    >
      {bgUrl && (
        <img
          src={assetUrl(bgUrl, { w: 1920 })}
          /* alt="" tha - aur yeh site ka sab se zyada dohraya jaane wala
             hero hai, akela wahi saikron khaali alt bana raha tha. Safhe ka
             apna unwan hi is tasveer ka sach hai: woh pehle se tarjuma
             shuda hai aur har mulk par alag. */
          alt={[eyebrow, title, highlight]
            .filter((v) => typeof v === "string" && v.trim())
            .join(" ")}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/* Not `evs-scrim` - that is a bottom-up wash and this hero puts its
          breadcrumbs and eyebrow a third of the way DOWN the frame, where the
          wash is still transparent. See .evs-hero-veil. */}
      <div className="evs-hero-veil absolute inset-0" aria-hidden="true" />

      <div className="evs-shell relative z-10 pb-14 md:pb-20">
        {/* ONE COLUMN, at the title's measure. There WAS a two-column
            variant, added for the car-brand tree because its descriptions run
            315-444 characters and a 36rem measure made a tower of them - it
            put the prose in its own rule-bordered column beside the headline.
            It solved the measure and cost the page its shape, and every one of
            its three call sites is stacked now, so the branch is gone rather
            than left waiting for a fourth. The measure it existed for is fixed
            where it belonged: on the paragraph. */}
        <Reveal delay={80} className="max-w-3xl">
          <div>
            {/* THE TRAIL IS A STEP BRIGHTER THAN THE DEFAULT, on purpose. The
                token contrast ratios in app.css are measured against the dark SURFACE, not
                against a photograph - so `content-muted` is a comfortable 7:1 on
                a page and close to nothing over a lit workshop. The veil above
                does most of the work; this is the other half of it. */}
            {crumbs.length > 0 && (
              <nav aria-label="Breadcrumb" className="mb-7">
                <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-content-secondary">
                  {crumbs.map((crumb, i) => {
                    const last = i === crumbs.length - 1;
                    return (
                      <li key={crumb.href ?? crumb.label} className="flex items-center gap-2">
                        {i > 0 && (
                          <ChevronRight
                            className="h-3.5 w-3.5 flex-none rtl:rotate-180"
                            aria-hidden="true"
                          />
                        )}
                        {last ? (
                          <span aria-current="page" className="text-content">
                            {crumb.label}
                          </span>
                        ) : (
                          <a
                            href={crumb.href}
                            className="transition-colors duration-200 hover:text-brand-500"
                          >
                            {crumb.label}
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </nav>
            )}

            {/* `.evs-eyebrow` sets content-muted, which is right on a flat
                section and disappears over a photograph. The utility overrides
                it - the components layer loses to utilities, which is the whole
                point of the layer order declared at the top of app.css. */}
            {eyebrow && <span className="evs-eyebrow mb-6 text-content-secondary">{eyebrow}</span>}

            <h1
              className={`${tall ? "text-display-2" : "text-display-3"} text-balance uppercase`}
            >
              {title}
              {highlight && <span className="text-brand-500">{highlight}</span>}
            </h1>
          </div>

          {(description || cta?.label) && (
            <div>
              {description && (
                <p
                  /* STACKED TAKES THE TITLE'S MEASURE, not a narrower one. It
                     was `max-w-xl` - 36rem - which is a comfortable measure for
                     the one-sentence descriptions the services tree has and a
                     seven-line tower for the car-brand tree, whose longest runs
                     391 characters. The live page sets the same text in 730px
                     beside a 730px headline and it comes out at five lines, so
                     that is the shape being matched: one column, one width, the
                     lede sitting square under the headline rather than stepping
                     in from it.
                     Widening a measure can only REMOVE line breaks, so no hero
                     using this can get taller than it already was. */
                  className="mt-5 max-w-3xl text-lead text-content-secondary"
                >
                  {description}
                </p>
              )}

              {cta?.label && (
                <a
                  href={cta.href}
                  className="evs-btn evs-btn-primary evs-btn-lg mt-9"
                >
                  {cta.label}
                  <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
                </a>
              )}
            </div>
          )}

          {children}
        </Reveal>
      </div>
    </section>
  );
}

/**
 * BreadcrumbList for the same trail the hero renders, so the markup and the
 * structured data can never disagree.
 *
 * `siteUrl` is the branch's own origin - `branch.site_url` - because a
 * BreadcrumbList wants absolute URLs and hardcoding evsuae.com here would put
 * the UAE's domain in Qatar's structured data, which is the class of bug this
 * whole migration exists to remove.
 */
export function breadcrumbJsonLd(crumbs, siteUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      ...(crumb.href ? { item: `${siteUrl ?? ""}${crumb.href}` } : {}),
    })),
  };
}
