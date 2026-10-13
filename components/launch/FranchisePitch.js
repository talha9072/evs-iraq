import { localePath, isRtl } from "@/lib/locale";

/**
 * The franchise page.
 *
 * IT DOES NOT TAKE THE APPLICATION. evsworldwide.com already runs the whole
 * funnel — qualifying form, NDA, questionnaire, scoring and an admin pipeline —
 * and a second entry point on a country site would either duplicate that or,
 * worse, collect enquiries nobody is watching. So every call to action here
 * hands off to /franchise/apply on the group site.
 *
 * What this page is for is the half of the job the group site cannot do: make
 * the case for BAHRAIN specifically, and rank for someone searching from here.
 */

const APPLY = "https://evsworldwide.com/franchise/apply";
const OPPORTUNITY = "https://evsworldwide.com/franchise/opportunity";
const REPORT = "https://evsworldwide.com/market-intelligence/iraq";

const COPY = {
  en: {
    eyebrow: "Franchise",
    heading: "Run an EVS centre in Iraq.",
    intro:
      "EVS franchises specialist electric-vehicle workshops. Iraq is an open territory, and the case for it is unusual in the network: the cars are already here, almost none of them came with a dealer behind them, and there is very little independent high-voltage capability in the country to meet them.",
    whyHeading: "Why Iraq, specifically",
    why: [
      {
        title: "The demand is not a future window — it is now",
        body: "In most markets the independent workshop waits for the warranty to expire. Iraq skipped that step: the cars arrived through importers rather than dealer networks, so for a large share of them there is no manufacturer service channel to wait for. The owner's first service visit is already an independent one.",
      },
      {
        title: "Hybrids, not just electrics, and that doubles the work",
        body: "Iraq is one of the region's larger hybrid markets before it is an electric one. A hybrid carries a petrol engine AND a high-voltage battery — two maintenance schedules on one car. General garages take the engine half and miss the battery; EV-only shops do the reverse. Doing both is the position almost nobody holds here.",
      },
      {
        title: "A territory with room for more than one site",
        body: "Iraq is roughly 438,000 square kilometres and Baghdad is the first centre, not the only one. Basra is about 550 km south and Erbil about 350 north, each with its own market and its own grid conditions. This is a territory you grow into rather than one you saturate on day one.",
      },
      {
        title: "Heat and an unsteady grid both do the selling",
        body: "Basra holds Iraq's recorded temperature high above 53°C and Baghdad has reached 52°C, so thermal degradation shows up years earlier than in the climates these cars were validated in. On top of that, charging from neighbourhood generators damages onboard chargers in a way that barely occurs elsewhere. Both are recurring, high-value diagnostic work a general garage cannot do.",
      },
    ],
    getHeading: "What a partner gets",
    get: [
      "A defined territory, with the market intelligence report behind it",
      "Workshop specification — tooling, bays, high-voltage safety and quarantine",
      "Technician training and high-voltage certification",
      "Diagnostic platform access and the brand coverage that comes with it",
      "Brand, site and the marketing system this network runs on",
      "The operating playbook from workshops already running in four countries",
    ],
    ctaHeading: "Applications are handled by EVS Worldwide",
    ctaBody:
      "Territory applications go through the group site, which runs the qualifying, the NDA and the territory review. It takes a few minutes to start.",
    apply: "Apply for the Iraq territory",
    opportunity: "Read the franchise opportunity",
    report: "Iraq market report",
    note: "Capital and qualifying requirements are set out during the application.",
  },
  ar: {
    eyebrow: "الامتياز",
    heading: "أدِر مركز إي في إس في العراق.",
    intro:
      "تمنح إي في إس امتيازات لورش متخصصة في صيانة السيارات الكهربائية. والعراق منطقة متاحة، وحجّته مختلفة عن غيره في الشبكة: السيارات موجودة فعلاً، ولم يأتِ خلف معظمها وكيل، والقدرات المستقلة على التعامل مع الجهد العالي في البلد محدودة جداً.",
    whyHeading: "لماذا العراق تحديداً",
    why: [
      {
        title: "الطلب ليس نافذة مستقبلية بل قائم الآن",
        body: "في معظم الأسواق تنتظر الورشة المستقلة انتهاء الضمان. والعراق تجاوز هذه الخطوة: فالسيارات دخلت عبر المستوردين لا عبر شبكات الوكالات، ولا توجد لنسبة كبيرة منها قناة صيانة من المصنّع تُنتظر أصلاً. فأول زيارة صيانة للمالك هي زيارة مستقلة بالفعل.",
      },
      {
        title: "الهجينة لا الكهربائية وحدها، وهذا يضاعف العمل",
        body: "العراق من أكبر أسواق الهجينة في المنطقة قبل أن يكون سوقاً كهربائية. والسيارة الهجينة تحمل محرك بنزين وبطارية جهد عالٍ معاً — جدولا صيانة في سيارة واحدة. والورش العامة تأخذ شق المحرك وتغفل البطارية، وورش الكهربائية وحدها تفعل العكس. والجمع بينهما موقع لا يشغله أحد تقريباً هنا.",
      },
      {
        title: "منطقة تتسع لأكثر من موقع",
        body: "مساحة العراق نحو 438 ألف كيلومتر مربع، وبغداد هي المركز الأول لا الوحيد. فالبصرة تبعد زهاء 550 كيلومتراً جنوباً وأربيل نحو 350 شمالاً، ولكل منهما سوقها وظروف شبكتها. وهذه منطقة تنمو فيها تدريجياً لا تشبعها في يومها الأول.",
      },
      {
        title: "الحرارة والشبكة غير المستقرة كلتاهما تبيعان",
        body: "تحمل البصرة أعلى درجة حرارة مسجلة في العراق فوق 53 درجة، وبلغت بغداد 52، فيظهر التدهور الحراري أبكر بسنوات من المناخات التي اعتُمدت فيها هذه السيارات. يضاف إلى ذلك أن الشحن من مولّدات الأحياء يُتلف الشواحن الداخلية بصورة نادرة الحدوث في غير العراق. وكلاهما عمل تشخيصي متكرر وعالي القيمة لا تستطيعه ورشة عامة.",
      },
    ],
    getHeading: "ما يحصل عليه الشريك",
    get: [
      "منطقة محددة، مدعومة بتقرير تحليل السوق",
      "مواصفات الورشة — المعدات والمنصات وسلامة الجهد العالي ومنطقة العزل",
      "تدريب الفنيين واعتماد الجهد العالي",
      "الوصول إلى منصات التشخيص وتغطية العلامات",
      "العلامة التجارية والموقع والنظام التسويقي",
      "دليل التشغيل من ورش عاملة في أربع دول",
    ],
    ctaHeading: "الطلبات تُدار عبر إي في إس العالمية",
    ctaBody:
      "تمر طلبات المناطق عبر موقع المجموعة، الذي يتولى التأهيل واتفاقية السرية ومراجعة المنطقة. ولا يستغرق البدء سوى دقائق.",
    apply: "قدّم على منطقة العراق",
    opportunity: "اقرأ عن فرصة الامتياز",
    report: "تقرير سوق العراق",
    note: "تُحدَّد متطلبات رأس المال والتأهيل أثناء تقديم الطلب.",
  },
};

export default function FranchisePitch({ locale = "en" }) {
  const t = COPY[String(locale).split("-")[0]] ?? COPY.en;

  return (
    <div dir={isRtl(locale) ? "rtl" : undefined}>
      <section className="evs-shell evs-section">
        <div className="max-w-3xl">
          <span className="evs-eyebrow mb-6 inline-block">{t.eyebrow}</span>
          <h1 className="text-display-2 uppercase">{t.heading}</h1>
          <p className="mt-6 text-lead text-content-secondary">{t.intro}</p>
        </div>

        <h2 className="mt-16 text-display-3">{t.whyHeading}</h2>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {t.why.map((item) => (
            <div key={item.title} className="evs-card flex flex-col p-6">
              <h3 className="text-subheading text-content">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-content-secondary">{item.body}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-16 text-display-3">{t.getHeading}</h2>
        <ul className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
          {t.get.map((item) => (
            <li key={item} className="flex items-start gap-3 text-content-secondary">
              <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="evs-card mt-16 p-8 md:p-10">
          <h2 className="text-display-3">{t.ctaHeading}</h2>
          <p className="mt-4 max-w-2xl text-lead text-content-secondary">{t.ctaBody}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href={APPLY} rel="noopener" className="evs-btn evs-btn-primary evs-btn-lg">
              {t.apply}
            </a>
            <a href={OPPORTUNITY} rel="noopener" className="evs-btn evs-btn-secondary evs-btn-lg">
              {t.opportunity}
            </a>
            <a href={REPORT} rel="noopener" className="evs-btn evs-btn-secondary evs-btn-lg">
              {t.report}
            </a>
          </div>
          <p className="mt-6 text-sm text-content-muted">{t.note}</p>
        </div>

        <p className="mt-10 text-sm text-content-muted">
          <a href={localePath(locale, "our-network")} className="text-brand-500 underline underline-offset-4">
            {locale.startsWith("ar") ? "شبكة إي في إس" : "Where EVS already operates"}
          </a>
        </p>
      </section>
    </div>
  );
}
