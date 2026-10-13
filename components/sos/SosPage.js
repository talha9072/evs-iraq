import SeoHead from "@/components/services/SeoHead";
import Reveal from "@/components/modern/Reveal";
import { assetUrl } from "@/lib/images";
import { DEFAULT_LOCALE, isRtl } from "@/lib/locale";
import { altFor } from "@/lib/alt";
import { SOS_SEO } from "@/lib/static-seo";
import { Phone } from "@/components/chrome/icons";

/**
 * /sos and /ar/sos - 24/7 roadside assistance.
 *
 * REDESIGNED - Tailwind, no Crafto, so this page carries the same header and
 * footer as every other route. It was one of the last two on the legacy stack.
 *
 * ONE COMPONENT, NOT TWO. There were two page files that had drifted into
 * different pages: the English one was a full-screen background-image hero with
 * a phone button; the Arabic one was a two-column section with a van photograph
 * and no background at all. Neither was a translation of the other, and every
 * structural difference between them was an accident of who wrote which. This
 * is the English hero's shape, which is the one the client signed off, with the
 * Arabic page's van photograph kept as the frame's image.
 *
 * THE PHONE NUMBER IS THE BRANCH'S. Both files hard-coded it - `tel:600500387`
 * in English and `tel:+971600500387` in Arabic, two different strings for the
 * same line, neither of them a row. It comes from `branch.support_phone` now,
 * printed with `support_phone_display`, which is the column that exists for
 * exactly this and is what every other page on the site uses.
 *
 * THE WORDS ARE STILL IN CODE. This page has no `section_content` row and no
 * table of its own; `lib/static-seo.js` carries only its meta tags. They are
 * kept in one table below rather than split across two files, which is the same
 * call ServicesCarousel and FaqPage make for their own chrome - and it is a
 * table a migration can replace with a row without touching the markup.
 */

const COPY = {
  en: {
    tag: "EVS",
    h1: "24/7 Emergency EV Roadside Support — Wherever You Are",
    displayA: "When your ",
    displayHighlight: "EV",
    displayB: " stops, we ",
    displayHighlightB: "start.",
    cta: "Call us",
  },
  ar: {
    tag: "إي في إس",
    h1: "خدمة الطوارئ للمركبات الكهربائية في الإمارات",
    displayA: "عندما تتوقف ",
    displayHighlight: "مركبتك الكهربائية",
    displayB: "، ",
    displayHighlightB: "نبدأ نحن.",
    cta: "اتصل بنا",
  },
};
const copyFor = (locale) =>
  COPY[locale] ?? COPY[String(locale).split("-")[0]] ?? COPY.en;

export default function SosPage({ branch, cities, locale = DEFAULT_LOCALE }) {
  if (!branch) return null;

  const rtl = isRtl(locale);
  const seo = SOS_SEO[locale] ?? SOS_SEO[String(locale).split("-")[0]] ?? SOS_SEO.en;
  const t = copyFor(locale);

  const phone = branch.support_phone;
  const phoneLabel = branch.support_phone_display || phone;

  return (
    <>
      <SeoHead
        locale={locale}
        branch={branch}
        cities={cities}
        path="sos"
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
      />

      {/* `dir` only - no `arabic-page` wrapper. That was a Crafto hook and it
          resolves to nothing on a redesigned page. */}
      <div dir={rtl ? "rtl" : undefined}>
        <section className="relative flex min-h-[100svh] items-end overflow-hidden pt-32">
          <img
            src={assetUrl("/img/sos/sos-hero.webp", { w: 1920 })}
            alt={altFor("sosHero", locale)}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* The same four-gradient treatment every inner hero uses, rather than
              the `dark-overlay` class this page had - a flat wash that dimmed
              the whole photograph evenly. See .evs-hero-veil. */}
          <div className="evs-hero-veil absolute inset-0" aria-hidden="true" />

          <div className="evs-shell relative z-10 pb-20 md:pb-28">
            <Reveal className="max-w-3xl" stagger={110}>
              <div className="mb-7 flex items-center gap-3 md:mb-9">
                <span className="font-sans text-eyebrow font-bold tracking-[0.2em] text-content-accent uppercase">
                  {t.tag}
                </span>
                <span className="h-3 w-px shrink-0 bg-line-strong" aria-hidden="true" />
                {/* The page's only h1, and the sentence that says what it is. */}
                <h1 className="font-sans text-eyebrow font-medium tracking-[0.2em] text-content-secondary uppercase">
                  {t.h1}
                </h1>
              </div>

              <p className="font-display text-display-2 text-balance text-content uppercase">
                {t.displayA}
                <span className="text-brand-500">{t.displayHighlight}</span>
                {t.displayB}
                <span className="text-brand-500">{t.displayHighlightB}</span>
              </p>

              {/* THE GLYPH STRIP IS GONE. `/img/sos/icons.svg` sat here - three
                  boxed pictograms between the headline and the call button. They
                  were decorative and said nothing the page does not say in words,
                  and they put a row of small busy shapes in the one place a
                  reader's eye should go straight from the sentence to the number.
                  The file is left in `public/` rather than deleted; nothing else
                  references it. */}
              {phone && (
                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <a href={`tel:${phone}`} className="evs-btn evs-btn-primary evs-btn-lg">
                    <Phone className="h-4 w-4" />
                    {t.cta}
                    {/* Latin digits inside an Arabic sentence, the same
                        treatment LocationPage gives the number it prints. */}
                    <span className={rtl ? "evs-latin" : undefined} dir="ltr">
                      {phoneLabel}
                    </span>
                  </a>
                </div>
              )}
            </Reveal>
          </div>
        </section>
      </div>
    </>
  );
}
