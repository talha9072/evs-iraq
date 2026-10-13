import { useRef, useState } from "react";
import { assetUrl } from "@/lib/images";
import { branchTokens, interpolate } from "@/lib/branches";
import { isRtl, DEFAULT_LOCALE } from "@/lib/locale";
import { altFor } from "@/lib/alt";
import Reveal from "@/components/modern/Reveal";
import StatsBand from "@/components/modern/StatsBand";
import BranchesSection from "@/components/modern/BranchesSection";
import ReviewsSection from "@/components/modern/ReviewsSection";
import {
  ArrowRight, Battery, Car, Charge, Climate, Diagnostics,
  Electronics, MapPin, Software, Support, Wrench,
} from "@/components/chrome/icons";

/**
 * /ev-car-brands - the brands hub.
 *
 * REDESIGNED - Tailwind, no Crafto. The six brand panels are `hierarchy_1` rows
 * and every word on them still comes from the database, so a seventh brand is
 * an INSERT.
 *
 * WHY THIS FILE EXISTS. The hub was written INLINE in its two route files -
 * 517 lines in pages/ev-car-brands/index.js and 551 in the [locale] copy, most
 * of it the same markup twice with the copy translated in place. That is the
 * shape every other page in this project has already been migrated out of, and
 * it is why the two had drifted: the English hub prints "1st EV Center in
 * {{country_the}}" and the Arabic one "أول مركز للمركبات الكهربائية في {{country}}"
 * from two separate hardcoded counter blocks.
 *
 * THE COUNTER BLOCK IS GONE, replaced by StatsBand. Both routes hardcoded the
 * same four figures - #1, locations.length, +200 Experienced Staff, 21,452
 * Happy Customers - which are the exact values `section_content.stats` already
 * holds with per-branch overrides. Same numbers today; correct per country from
 * now on, and one fewer copy to keep in step.
 *
 * BENGALI falls back to English here rather than to Arabic. The [locale] route
 * served ar/ar-IQ/bn from one file with Arabic written into it, so a Bengali
 * build would have rendered this whole page in Arabic. bn is not published by
 * this branch today, so nothing visible changes - but the fallback is now the
 * one that would be right if it were.
 */

/** Every string below is lifted verbatim from the route file it replaces. */
const COPY = {
  en: {
    introEyebrow: "Your One-Stop EV Solution",
    introTitle: "From routine maintenance to complex repairs",
    introBody: "At EVS, we provide electric vehicle services ranging from routine maintenance to specialized repairs. We are the only regional center for high-voltage battery repairs and offer expert collision services. Our programming solutions include software updates and GPS adjustments, especially for imported vehicles, ensuring your EV stays in top condition.",
    listHeading: "We combine expert knowledge with state-of-the-art facilities to consistently deliver top-quality results.",
    closing: "Leading the global transition to sustainable electric mobility",
    taglines: [
      "Embrace the electric revolution.",
      "Comprehensive EV Solutions.",
      "Innovation Meets Sustainability.",
    ],
    services: [
    {
      icon: Wrench,
      title: "Regular Maintenance Services",
      text: "Comprehensive packages including major and minor services, manufacturer-recommended maintenance, and precise tire alignments to ensure optimal performance, safety, and longevity of your electric vehicle.",
    },
    {
      icon: Software,
      title: "Software Solutions and Upgrades",
      text: "Advanced diagnostics, programming, and software upgrades tailored to enhance EV performance.",
    },
    {
      icon: MapPin,
      title: "Conversion to GCC Specifications",
      text: "Custom modifications to ensure electric vehicles meet GCC regional standards and regulations.",
    },
    {
      icon: Battery,
      title: "High-Voltage Battery Repairs",
      text: "Specialized repair and refurbishment services to extend the life and efficiency of high-voltage EV batteries.",
    },
    {
      icon: Charge,
      title: "Fast Charger Installations and Repairs",
      text: "Installation, maintenance, and repair of fast charging systems for optimal EV charging performance.",
    },
    {
      icon: Car,
      title: "Custom EV Modifications",
      text: "Bespoke modifications and upgrades designed to enhance vehicle performance, efficiency, and aesthetics.",
    },
    {
      icon: Climate,
      title: "Thermal Management System Repairs",
      text: "Expert servicing of cooling and heating systems critical to maintaining battery health in extreme climates.",
    },
    {
      icon: Diagnostics,
      title: "Motor Repairs and Replacements",
      text: "Precision repair and replacement services for electric motors to maintain peak performance.",
    },
    {
      icon: Electronics,
      title: "Inverter and Converter Repairs",
      text: "Repairs and upgrades for inverters and converters to ensure efficient energy management in EVs.",
    },
    {
      icon: Support,
      title: "On-Board Diagnostics (OBD) Services",
      text: "Comprehensive diagnostics with advanced tools to accurately identify and resolve vehicle issues.",
    },
    ],
  },
  ar: {
    introEyebrow: "حلك الشامل للمركبات الكهربائية",
    introTitle: "من الصيانة الدورية إلى الإصلاحات المعقدة",
    introBody: "في إي في إس، نقدم خدمات المركبات الكهربائية التي تشمل الصيانة الدورية والإصلاحات المتخصصة. نحن المركز الإقليمي الوحيد لإصلاح البطاريات عالية الجهد ونقدم خدمات إصلاح الحوادث باحترافية. تشمل حلولنا البرمجية تحديثات البرمجيات وتعديلات نظام تحديد المواقع، خاصة للمركبات المستوردة، لضمان بقاء مركبتك الكهربائية في أفضل حالاتها.",
    listHeading: "نمزج بين المعرفة المتخصصة والمرافق الحديثة لتقديم نتائج عالية الجودة باستمرار.",
    closing: "نقود التحول العالمي نحو التنقل الكهربائي المستدام",
    taglines: [
      "احتضن الثورة الكهربائية.",
      "حلول شاملة للمركبات الكهربائية.",
      "الابتكار يلتقي بالاستدامة.",
    ],
    services: [
    {
      icon: Wrench,
      title: "خدمات الصيانة الدورية",
      text: "باقات شاملة تشمل الخدمات الرئيسية والثانوية، الصيانة الموصى بها من الشركة المصنعة، ومحاذاة الإطارات بدقة لضمان الأداء الأمثل والسلامة وطول عمر مركبتك الكهربائية.",
    },
    {
      icon: Software,
      title: "حلول وتحديثات البرمجيات",
      text: "تشخيصات متقدمة، برمجة، وتحديثات برمجية مصممة لتحسين أداء المركبات الكهربائية.",
    },
    {
      icon: MapPin,
      title: "التحويل إلى مواصفات دول مجلس التعاون الخليجي",
      text: "تعديلات مخصصة لضمان توافق المركبات الكهربائية مع المعايير واللوائح الإقليمية لدول مجلس التعاون الخليجي.",
    },
    {
      icon: Battery,
      title: "إصلاحات البطاريات عالية الجهد",
      text: "خدمات إصلاح وتجديد متخصصة لتمديد عمر وكفاءة بطاريات المركبات الكهربائية عالية الجهد.",
    },
    {
      icon: Charge,
      title: "تركيب وإصلاح أجهزة الشحن السريع",
      text: "تركيب، صيانة، وإصلاح أنظمة الشحن السريع لتحقيق أداء شحن مثالي للمركبات الكهربائية.",
    },
    {
      icon: Car,
      title: "تعديلات مخصصة للمركبات الكهربائية",
      text: "تعديلات وتحسينات مخصصة مصممة لتعزيز أداء المركبة وكفاءتها وجمالياتها.",
    },
    {
      icon: Climate,
      title: "إصلاحات نظام الإدارة الحرارية",
      text: "خدمة متخصصة لأنظمة التبريد والتدفئة الحيوية للحفاظ على صحة البطارية في المناخات القاسية.",
    },
    {
      icon: Diagnostics,
      title: "إصلاحات واستبدال المحركات",
      text: "خدمات إصلاح واستبدال دقيقة للمحركات الكهربائية للحفاظ على الأداء الأمثل.",
    },
    {
      icon: Electronics,
      title: "إصلاحات العاكسات والمحولات",
      text: "إصلاحات وتحسينات للعاكسات والمحولات لضمان إدارة فعالة للطاقة في المركبات الكهربائية.",
    },
    {
      icon: Support,
      title: "خدمات التشخيص على متن السيارة",
      text: "تشخيصات شاملة باستخدام أدوات متقدمة لتحديد المشكلات وحلها بدقة.",
    },
    ],
  },
};

const copyFor = (locale) =>
  COPY[locale] ?? COPY[String(locale).split("-")[0]] ?? COPY.en;

export default function BrandsHub({
  locale = DEFAULT_LOCALE,
  hub,
  brands = [],
  branch,
  cities = [],
  locations = [],
  reviews = [],
  /** The resolved `section_content` row - see lib/sections.js. */
  sections,
}) {
  const t = copyFor(locale);
  const tokens = branch ? branchTokens(branch, cities, locale) : {};

  /** Which capability the stage is showing - see the note on that block. */
  const [activeService, setActiveService] = useState(0);
  /** One ref per tab button, so an arrow key can take the focus ring with the
   *  selection rather than leaving it behind on a `tabIndex={-1}` button. */
  const serviceTabs = useRef([]);

  /** The hub's own copy names a country, so it goes through the tokens. */
  const fill = (value) => interpolate(value, tokens);

  return (
    <div dir={isRtl(locale) ? "rtl" : undefined}>
      {/* ================= HERO ================= */}
      <section className="relative flex min-h-[30rem] items-end overflow-hidden pt-32 md:min-h-[38rem]">
        {hub?.hero_bg_url && (
          <img
            src={assetUrl(hub.hero_bg_url, { w: 1920 })}
            alt={[hub?.hero_title_prefix, hub?.hero_highlight, hub?.hero_title_suffix]
              .filter(Boolean)
              .map(fill)
              .join(" ")}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="evs-scrim absolute inset-0" aria-hidden="true" />

        <div className="evs-shell relative z-10 pb-14 md:pb-20">
          <Reveal className="max-w-3xl">
            <h1 className="text-display-2 uppercase">
              {fill(hub?.hero_title_prefix)}{" "}
              <span className="text-brand-500">{fill(hub?.hero_highlight)}</span>{" "}
              {fill(hub?.hero_title_suffix)}
            </h1>

            {hub?.hero_description && (
              <p className="mt-5 max-w-2xl text-lead text-content-secondary">
                {fill(hub.hero_description)}
              </p>
            )}
          </Reveal>
        </div>
      </section>

      {/* ================= BRANDS =================
          Six rows, as a grid. They were six full-screen scroll-snapped panels -
          the same treatment the services hub had, and the same problem: getting
          to the sixth brand meant six viewport-height scrolls. */}
      <section className="evs-shell evs-section">
        <Reveal stagger={70} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => {
            /* Falls back to the brand's hero image. XPeng is the one brand of
               the six with no showcase image, and a flat dark card among five
               photographs reads as broken rather than as a choice. */
            const image = brand.showcase_bg_url || brand.hero_bg_url;

            return (
            <a
              key={brand.id ?? brand.href}
              href={brand.href}
              className="evs-card evs-card-interactive group relative flex min-h-[19rem] flex-col justify-end overflow-hidden"
            >
              {image && (
                <img
                  src={assetUrl(image, { w: 800 })}
                  alt={brand.name || ""}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}
              <div className="evs-scrim-strong absolute inset-0" aria-hidden="true" />

              <div className="relative p-6">
                <h2 className="text-heading uppercase">{brand.name}</h2>
                {brand.showcase_tagline && (
                  <p className="mt-2 text-sm text-content-secondary">{brand.showcase_tagline}</p>
                )}
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-500">
                  {brand.showcase_cta_label}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </div>
            </a>
            );
          })}
        </Reveal>
      </section>

      {/* ================= INTRO ================= */}
      <section className="evs-shell evs-section-sm">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal from="start" className="lg:col-span-6">
            <img
              src={assetUrl("/img/evs/IMG_2078-edit-2.png", { w: 1024 })}
              srcSet={[320, 640, 1024, 1440]
                .map((w) => `${assetUrl("/img/evs/IMG_2078-edit-2.png", { w })} ${w}w`)
                .join(", ")}
              sizes="(max-width: 1024px) 100vw, 50vw"
              alt={altFor("brandsIntro", locale)}
              loading="lazy"
              className="w-full rounded-xl"
            />
          </Reveal>

          <Reveal from="end" delay={100} className="lg:col-span-6 xl:col-span-5 xl:col-start-8">
            <span className="evs-eyebrow mb-6">{t.introEyebrow}</span>
            <h2 className="text-display-3">
              {t.introTitle}
              <span className="text-brand-500">.</span>
            </h2>
            <p className="mt-6 text-lead text-content-secondary">{t.introBody}</p>
          </Reveal>
        </div>
      </section>

      {/* ================= THE TEN SERVICES =================
          ONE AT A TIME, BIG.

          TWO SHAPES ALREADY FAILED HERE. Three columns of icon-number-title-
          paragraph was the shape every software marketing page uses. Replacing it
          with a hairline index made it an editorial list - better, still a list:
          ten things sitting there at the same weight, none of them worth
          stopping on.

          SO NOTHING SITS THERE. A stage carries ONE capability at full size - a
          numeral bled off the corner at 13rem, the icon in a ring, the title at
          heading size - and a numbered index beside it switches which. Ten items
          get the room of one, and the reader chooses rather than scans.

          IT IS THE TAB PATTERN THIS CODEBASE ALREADY HAS, the one on /about:
          roving `tabIndex`, arrow keys that move the selection AND the focus
          with it, `aria-selected` / `aria-controls` on real buttons. Same
          vocabulary, different scale - three rows and a paragraph there, ten and
          a stage here. That is the design system doing its job, not a repeat.

          THE PANELS CROSS-FADE IN PLACE because all ten occupy ONE grid cell
          (`col-start-1 row-start-1`). The container is therefore as tall as the
          longest of them and NOTHING MOVES when the selection changes - no
          height animation, no jump, no measuring. The inactive ones are still in
          the layout, which is exactly what holds the height.

          THE STAGE STICKS. Below `lg` it sits above the index, and ten rows are
          taller than a phone - so tapping the tenth would otherwise change a
          panel that scrolled off the top five rows ago. Pinned, the answer is
          always on screen. It is not wrapped in `Reveal` for the reason the
          About page's is not: Reveal leaves a permanent `translate3d` on its
          wrapper, and a transformed ancestor is a containing block. */}
      <section className="evs-shell evs-section">
        <Reveal className="mb-12 max-w-4xl md:mb-16">
          <h2 className="text-display-3 text-balance">{t.listHeading}</h2>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* THE GRID ITEM IS THE STICKY ELEMENT, and it has to be - a sticky
              element travels inside its PARENT, and a wrapper around it is
              exactly as tall as the stage, so `sticky` on an inner div did
              nothing on a phone where the two columns become two rows. On the
              grid item, the parent is the grid: the stage travels the whole
              height of the index beside it. `self-start` is the other half -
              without it a grid item stretches to the row and has nowhere to
              go. */}
          <div className="sticky top-24 grid self-start lg:top-28 lg:col-span-7">
              {t.services.map((service, index) => {
                const Glyph = service.icon;
                const selected = index === activeService;
                return (
                  <div
                    key={service.title}
                    role="tabpanel"
                    id={`evs-capability-panel-${index}`}
                    aria-labelledby={`evs-capability-tab-${index}`}
                    aria-hidden={!selected}
                    className={`col-start-1 row-start-1 transition-[opacity,transform] duration-500 ease-out ${
                      selected
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-3 opacity-0"
                    }`}
                  >
                    <div className="relative h-full overflow-hidden rounded-2xl border border-line-subtle bg-surface-raised p-8 sm:p-10 xl:p-12">
                      {/* The numeral, bled off the corner. Wallpaper, not a
                          label - the index beside it is where the number is
                          readable, and this is the same figure at the size the
                          block is actually about. */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -end-3 -top-10 font-display text-[9rem] leading-none tabular-nums text-brand-500/10 select-none sm:text-[13rem]"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="relative grid h-16 w-16 place-items-center rounded-full border border-brand-500/40 text-brand-500">
                        <Glyph className="h-7 w-7" />
                      </span>

                      <h3 className="relative mt-9 text-heading uppercase">{service.title}</h3>

                      <p className="relative mt-5 max-w-xl text-lead text-content-secondary">
                        {service.text}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>

          <Reveal
            stagger={40}
            role="tablist"
            aria-orientation="vertical"
            aria-label={t.listHeading}
            className="lg:col-span-5"
            onKeyDown={(e) => {
              if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
              e.preventDefault();
              const step = e.key === "ArrowDown" ? 1 : -1;
              const next = (activeService + step + t.services.length) % t.services.length;
              setActiveService(next);
              /* AND THE FOCUS MOVES WITH IT. Without this an arrow key changes
                 the stage while the ring stays behind on a button that now has
                 `tabIndex={-1}`, and the next Tab press leaves the list from
                 nowhere. Same fix the About tabs carry. */
              serviceTabs.current[next]?.focus();
            }}
          >
            {t.services.map((service, index) => {
              const selected = index === activeService;
              return (
                <button
                  key={service.title}
                  type="button"
                  role="tab"
                  ref={(el) => {
                    serviceTabs.current[index] = el;
                  }}
                  id={`evs-capability-tab-${index}`}
                  aria-selected={selected}
                  aria-controls={`evs-capability-panel-${index}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveService(index)}
                  /* POINTING AT A ROW SELECTS IT on a device that has a pointer,
                     which is what makes ten of these feel like one surface
                     rather than ten buttons. Click still works, and a touch
                     screen never fires it. */
                  onMouseEnter={() => setActiveService(index)}
                  className={`group flex w-full items-center gap-5 border-b border-line-subtle py-4 text-start transition-colors duration-200 first:border-t ${
                    selected ? "text-content" : "text-content-muted hover:text-content"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`font-display text-lg leading-none tabular-nums transition-colors duration-300 ${
                      selected ? "text-brand-500" : "text-brand-500/30"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="text-subheading font-semibold">{service.title}</span>

                  {/* The indicator: a rule that grows on the selected row. One
                      moving part, and it says which without a filled panel
                      behind the words. */}
                  <span
                    aria-hidden="true"
                    className={`ms-auto h-px flex-none bg-brand-500 transition-all duration-300 ease-out ${
                      selected ? "w-10 opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* The four figures, from section_content rather than hardcoded twice. */}
      <StatsBand
        locale={locale}
        tokens={tokens}
        branchCount={locations.length}
        sections={sections}
      />

      {/* ================= CLOSING ================= */}
      <section className="evs-shell evs-section-sm">
        <Reveal className="border-t border-line-subtle pt-12">
          <h2 className="max-w-3xl text-display-3">
            {t.closing}
            <span className="text-brand-500">.</span>
          </h2>

          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {t.taglines.map((tagline) => (
              <li
                key={tagline}
                className="font-display text-xl text-content-muted uppercase"
              >
                {tagline}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <ReviewsSection locale={locale} branch={branch} reviews={reviews} sections={sections} />

      <BranchesSection
        locale={locale}
        branch={branch}
        locations={locations}
        sections={sections}
        limit={6}
      />
    </div>
  );
}
