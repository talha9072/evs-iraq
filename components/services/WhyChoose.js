import { assetUrl } from "@/lib/images";
import { interpolate } from "@/lib/branches";
import { isRtl } from "@/lib/locale";
import Reveal from "@/components/modern/Reveal";

/**
 * The "Why Choose EVS?" block, one component for every language.
 *
 * Replaces the WhyChooseEVS / WhyChooseEVSAr pair. Three things were wrong
 * with that pair, and all three only show up once a second country exists:
 *
 * 1. EVERY IMAGE WAS AN ABSOLUTE evsuae.com URL - sixteen of them per file,
 *    including the srcSet entries. An Oman build served four photos off the
 *    UAE's domain. The paths are site-relative now and lib/images.js adds the
 *    CDN wrapper in production, so each site serves its own copies.
 *
 * 2. "DUBAI" WAS WRITTEN INTO THE COPY, twice - the fourth card's heading and
 *    its paragraph. A Qatar build claimed to be trusted by Dubai's EV
 *    community. Both are {{city}} now, so Oman reads Muscat and Qatar Doha.
 *
 * 3. The two files disagreed about the ORDER of the four reasons. English led
 *    with EV-Only Expertise and ended with Trusted; Arabic led with Trusted
 *    and ended with EV-Only. The cards are numbered 01-04, so "01" stood over
 *    a different reason depending on which language you read. See ORDER below.
 */

/**
 * The four reasons, in one canonical order for every language.
 *
 * ORDER: this is the English order, and Arabic now follows it. The live Arabic
 * page has items 1 and 4 swapped, which reads as an authoring slip rather than
 * a decision - nothing else on that page is reordered, and the numbers are
 * hardcoded 01-04 in source order, so the swap made Arabic's "01" a different
 * claim from English's "01". The progression expertise -> tools -> scope ->
 * trust is also the one that builds.
 *
 * RTL still reads right-to-left: `dir="rtl"` on the section makes the flex row
 * lay out from the right, so 01 sits on the right where an Arabic reader
 * starts. The order is fixed in the markup; only the direction changes.
 *
 * The image belongs to the reason, not to the position - the live Arabic page
 * carries the same four pairings in its different order, so they travel
 * together here.
 */
const ITEMS = [
  { id: "expertise", image: "/img/blog/EVS-69.jpg" },
  { id: "diagnostics", image: "/img/carev2.png" },
  { id: "allInOne", image: "/img/blog/EVS-73.jpg" },
  { id: "trusted", image: "/img/evs/IMG_2085.jpg" },
];

/** The widths the srcSet offers, unchanged from the hardcoded version. */
const WIDTHS = [320, 500, 768];

/**
 * One entry per language, not per country.
 *
 * THE FOURTH REASON USED TO BE SOCIAL PROOF, and it was fabricated here.
 * "Trusted by {{city}}'s EV Community" / "EV owners across {{city}} choose us"
 * is a claim about a customer base, published on 78 pages of a site for a
 * country EVS has never traded in. It is the one reason of the four that cannot
 * be true before opening, so it is now the group's record, attributed to the
 * group.
 *
 * Only that reason names a place, so only it carries a token.
 *
 * ⚠️ The Bengali is new copy with no live Bengali page to port from, so it has
 * had no native reviewer. Recorded in docs/PLATFORM.md with the rest of the bn
 * strings.
 */
const COPY = {
  en: {
    heading: "Why Choose EVS?",
    expertise: {
      title: "EV-Only Expertise",
      text: "We focus on electric vehicles. Every service is built for EV systems.",
    },
    diagnostics: {
      title: "Advanced Diagnostics & Tools",
      text: "We use cutting-edge EV software and insulated tools to handle issues safely and accurately.",
    },
    allInOne: {
      title: "All-in-One Service Center",
      text: "Repairs, paint, batteries, AC - all under one roof, so a car is not shuttled between three shops.",
    },
    trusted: {
      title: "Backed by the EVS Group",
      text: "The {{city}} centre opens with the tooling, the training and the procedures already running in EVS workshops across the Gulf.",
    },
  },

  ar: {
    heading: "لماذا تختار إي في إس؟",
    expertise: {
      title: "خبرة متخصصة في المركبات الكهربائية",
      text: "نركز على المركبات الكهربائية. كل خدمة مصممة خصيصًا لأنظمة المركبات الكهربائية.",
    },
    diagnostics: {
      title: "تشخيص وأدوات متقدمة",
      text: "نستخدم برمجيات متطورة للمركبات الكهربائية وأدوات معزولة للتعامل مع المشكلات بأمان ودقة.",
    },
    allInOne: {
      title: "مركز خدمات شامل",
      text: "الإصلاح والدهان والبطاريات والتكييف تحت سقف واحد، فلا تتنقل السيارة بين ثلاث ورش.",
    },
    trusted: {
      title: "بدعم من مجموعة إي في إس",
      text: "يفتتح مركز {{city}} بالأدوات والتدريب والإجراءات المعمول بها فعلاً في ورش إي في إس في الخليج.",
    },
  },

  bn: {
    heading: "কেন EVS বেছে নেবেন?",
    expertise: {
      title: "শুধু ইভি বিশেষজ্ঞতা",
      text: "আমরা শুধু ইলেকট্রিক গাড়ি নিয়েই কাজ করি। প্রতিটি সার্ভিস ইভি সিস্টেমের জন্যই তৈরি।",
    },
    diagnostics: {
      title: "আধুনিক ডায়াগনস্টিক ও যন্ত্রপাতি",
      text: "নিরাপদে ও নিখুঁতভাবে সমস্যা সমাধানের জন্য আমরা অত্যাধুনিক ইভি সফটওয়্যার এবং ইনসুলেটেড টুল ব্যবহার করি।",
    },
    allInOne: {
      title: "সব সেবা এক জায়গায়",
      text: "মেরামত, রং, ব্যাটারি, এসি — সব কিছু আমাদের নিজস্ব ওয়ার্কশপেই, যাতে আপনার সময় ও ঝামেলা বাঁচে।",
    },
    trusted: {
      title: "{{city}}-এর ইভি কমিউনিটির ভরসা",
      text: "{{city}}-এর ইভি মালিকেরা আমাদের গতি, সততা আর গভীর ইভি অভিজ্ঞতার জন্য আমাদের বেছে নেন।",
    },
  },
};

/**
 * Presentation, by direction rather than language.
 *
 * `dir="rtl"` on the section is what actually reverses the row - flex follows
 * the writing mode - so 01 lands on the right.
 *
 * `rtl-flex` is kept because the live Arabic page carries it, but no
 * stylesheet in this project defines it: it is a no-op today, harmless, and
 * there if a future ar.css wants a hook.
 *
 * `content-hover` is the reverse case - the English page has the wrapper, the
 * Arabic one does not. Its only rules are scoped to `sliding-box-style-02` and
 * this block is `style-03`, so it does nothing either way. Kept on both so the
 * two languages produce the same markup.
 */
const LAYOUT = {
  ltr: { dir: undefined, flex: "" },
  rtl: { dir: "rtl", flex: " rtl-flex" },
};

/** The card that starts expanded - item 2, as the English page has it. */
const ACTIVE_INDEX = 1;

export default function WhyChoose({ locale = "en", tokens = {} }) {
  const copy = COPY[locale] ?? COPY[String(locale).split("-")[0]] ?? COPY.en;

  /* Numbered 01-04 in SOURCE order, in every language. The two legacy files
     disagreed about that order - English led with EV-Only Expertise, Arabic with
     Trusted - so "01" stood over a different claim depending on which language
     you read. One canonical order fixes it; RTL still reads right to left
     because `dir` lays the row out from the right. */
  return (
    <section className="evs-shell evs-section" dir={isRtl(locale) ? "rtl" : undefined}>
      <Reveal className="mb-12 max-w-2xl md:mb-16">
        <h2 className="text-display-3">
          {interpolate(copy.heading, tokens)}
          <span className="text-brand-500">.</span>
        </h2>
      </Reveal>

      <Reveal stagger={80} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item, index) => {
          const text = copy[item.id];
          if (!text) return null;

          return (
            <article
              key={item.id}
              className="evs-card evs-card-interactive group relative flex min-h-[22rem] flex-col justify-end overflow-hidden"
            >
              <img
                /* Site-relative, with the CDN wrapper added by lib/images at
                   build time. Every one of these was an absolute evsuae.com URL
                   before - sixteen per file, srcSet entries included - so an
                   Oman build served four photographs off the UAE's domain. */
                src={assetUrl(item.image, { w: 768 })}
                srcSet={WIDTHS.map((w) => `${assetUrl(item.image, { w })} ${w}w`).join(", ")}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                alt={interpolate(text.title, tokens)}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="evs-scrim-strong absolute inset-0" aria-hidden="true" />

              <div className="relative p-6">
                <span className="font-display text-heading text-brand-500 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3 className="mt-2 text-subheading text-content">
                  {interpolate(text.title, tokens)}
                </h3>

                <p className="mt-2.5 text-sm text-content-secondary">
                  {interpolate(text.text, tokens)}
                </p>
              </div>
            </article>
          );
        })}
      </Reveal>
    </section>
  );
}
