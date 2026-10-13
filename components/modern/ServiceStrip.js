/**
 * The scrolling service strip on a workshop page.
 *
 * WHAT IT REPLACES. Four components - `ServiceMarquee`, `ServiceMarqueeExpress`,
 * and Arabic copies of both - each wrapping a Swiper configured at speed 12000
 * with an autoplay delay of 1, which is the trick the theme used to make a
 * slider behave like a marquee. The legacy pages hid the pairing well: they
 * aliased the import
 *
 *     import ServiceMarquee from ".../ServiceMarqueeExpress";
 *
 * so the JSX tag read `<ServiceMarquee />` on all ten pages and only the import
 * line differed. Grepping the tag said they were identical.
 *
 * One component now, and one CSS animation over the list printed twice - which
 * is what makes the loop seamless without a library, an init hook, or the
 * synthetic resize events the Swiper version needed.
 *
 * THE WORD LISTS STAY IN CODE, deliberately, as they did before: they are two
 * fixed marketing strips rather than a catalogue that grows, and moving them to
 * rows would mean three locales x seventeen strings nobody would ever edit.
 * Adding a language is one entry per list.
 */

const SERVICES = {
  en: [
    "EV Vehicle Health Check",
    "EV Repair",
    "High Voltage Battery Repair",
    "EV Drive Unit Repair",
    "EV Sim Card Installation",
    "Navigation System and Mapping",
    "EV Software Updates",
    "EV Body Repair",
    "EV Warranty Packages",
    "EV Roadside Assistance",
  ],
  ar: [
    "فحص صحة المركبة الكهربائية",
    "إصلاح المركبات الكهربائية",
    "إصلاح البطاريات عالية الجهد",
    "إصلاح وحدة القيادة الكهربائية",
    "تركيب بطاقة SIM للمركبات الكهربائية",
    "نظام الملاحة والخرائط",
    "تحديثات برمجيات المركبات الكهربائية",
    "إصلاح هيكل المركبات الكهربائية",
    "باقات ضمان المركبات الكهربائية",
    "مساعدة الطريق للمركبات الكهربائية",
  ],
  bn: [
    "ইভি ভেহিকল হেলথ চেক",
    "ইভি মেরামত",
    "হাই ভোল্টেজ ব্যাটারি মেরামত",
    "ইভি ড্রাইভ ইউনিট মেরামত",
    "ইভি সিম কার্ড ইনস্টলেশন",
    "নেভিগেশন সিস্টেম ও ম্যাপিং",
    "ইভি সফটওয়্যার আপডেট",
    "ইভি বডি মেরামত",
    "ইভি ওয়ারেন্টি প্যাকেজ",
    "ইভি রোডসাইড অ্যাসিস্ট্যান্স",
  ],
};

/** The four EVS Express bays run a different list - warranty activation, A/C
 *  and oil changes rather than the ten EV-specific ones. */
const SERVICES_EXPRESS = {
  en: [
    "EVS Warranty Activation & System Check",
    "Air Conditioning Service including air and cabin filter replacement",
    "Battery Replacement",
    "Brake Service",
    "Oil Change",
    "Tyre Replacement & Inspection",
    "Vehicle Programming & Software Updates",
  ],
  ar: [
    "تفعيل ضمان EVS وفحص النظام",
    "خدمة تكييف الهواء بما في ذلك استبدال فلتر الهواء وفلتر المقصورة",
    "استبدال البطارية",
    "خدمة المكابح",
    "تغيير الزيت",
    "استبدال الإطارات وفحصها",
    "برمجة المركبة وتحديثات البرمجيات",
  ],
  bn: [
    "EVS ওয়ারেন্টি অ্যাক্টিভেশন ও সিস্টেম চেক",
    "এয়ার কন্ডিশনিং সার্ভিস, এয়ার ও কেবিন ফিল্টার প্রতিস্থাপন সহ",
    "ব্যাটারি প্রতিস্থাপন",
    "ব্রেক সার্ভিস",
    "অয়েল চেঞ্জ",
    "টায়ার প্রতিস্থাপন ও পরিদর্শন",
    "ভেহিকল প্রোগ্রামিং ও সফটওয়্যার আপডেট",
  ],
};

function listFor(variant, locale) {
  const table = variant === "express" ? SERVICES_EXPRESS : SERVICES;
  const key = String(locale).split("-")[0];
  return table[locale] ?? table[key] ?? table.en;
}

export default function ServiceStrip({ variant = "standard", locale = "en" }) {
  const items = listFor(variant, locale);
  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden border-y border-line-subtle bg-surface-sunken py-5">
      {/* Printed twice so the loop is seamless. The second copy is aria-hidden
          so a screen reader does not read every service name over again. */}
      <div className="flex w-max animate-marquee items-center gap-10 hover:[animation-play-state:paused]">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            aria-hidden={i >= items.length ? "true" : undefined}
            className="flex items-center gap-10 font-display text-xl whitespace-nowrap text-content-muted uppercase"
          >
            {item}
            <span className="h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
          </span>
        ))}
      </div>
    </div>
  );
}
