/**
 * Head copy for the three pages whose content is still written in JSX: the
 * roadside-assistance page, the franchise page and the blog index.
 *
 * Grouped in one file rather than three because they have nothing in common
 * except being the last of the hand-written pages - and because the alternative
 * was `lib/sos-seo.js`, `lib/franchise-seo.js`, `lib/blog-seo.js`.
 *
 * Every string carries `{{tokens}}` filled from the branch row. The English ones
 * are live's, with "UAE" and "Dubai" replaced; the Arabic ones are live's Arabic,
 * which reads differently and is not a translation of the English.
 */
export const SOS_SEO = {
  en: {
    title: "EV Roadside Assistance in {{city}} | 24/7 Emergency EV Support",
    description:
      "Stuck on the road? EVS {{country}} offers 24/7 electric vehicle roadside assistance in {{city}}, including emergency charging, towing, and breakdown support by expert EV technicians.",
    keywords:
      "EV roadside assistance {{city}}, electric vehicle towing {{country}}, emergency EV charging, EV breakdown support {{country}}",
  },
  ar: {
    title: "إي في إس إس أو إس | عندما تتوقف مركبتك الكهربائية، نبدأ نحن",
    // Live's Arabic description on this page was the HOMEPAGE's - "أفضل مركز
    // خدمة للسيارات الكهربائية في دبي…" - pasted onto a roadside-assistance page.
    // Replaced with one that describes the page, tokenised.
    description:
      "مساعدة على الطريق للمركبات الكهربائية على مدار الساعة من إي في إس {{country}} في {{city}}: شحن طارئ، سحب المركبة، ودعم الأعطال بأيدي فنيين متخصصين.",
    keywords:
      "مساعدة على الطريق للمركبات الكهربائية {{city}}، سحب السيارات الكهربائية {{country}}، شحن طارئ، دعم أعطال المركبات الكهربائية {{country}}",
  },
  bn: {
    title: "{{city}}-এ ইভি রোডসাইড অ্যাসিস্ট্যান্স | ২৪/৭ ইমার্জেন্সি সহায়তা",
    description:
      "রাস্তায় আটকে গেছেন? ইভিএস {{country}} {{city}}-এ ২৪/৭ ইলেকট্রিক গাড়ির রোডসাইড সহায়তা দেয় — ইমার্জেন্সি চার্জিং, টোয়িং ও ব্রেকডাউন সাপোর্ট।",
    keywords:
      "ইভি রোডসাইড অ্যাসিস্ট্যান্স {{city}}, ইলেকট্রিক গাড়ি টোয়িং {{country}}, ইমার্জেন্সি ইভি চার্জিং",
  },
};

export const FRANCHISE_SEO = {
  en: {
    title: "EV Franchise in {{city}} | Electric Vehicle Service Center",
    description:
      "Join the growing electric vehicle industry with EVS {{country}}. Start your own EV service franchise in {{city}} and benefit from expert support, brand recognition, and a booming market.",
    keywords:
      "EV franchise {{city}}, electric vehicle business {{country}}, EV service center franchise, automotive franchise {{country}}",
  },
  ar: {
    title: "امتياز إي في إس في {{city}} | مركز خدمة المركبات الكهربائية",
    description:
      "انضم إلى صناعة المركبات الكهربائية المتنامية مع إي في إس {{country}}. ابدأ امتيازك الخاص لخدمة السيارات الكهربائية في {{city}} واستفد من الدعم المتخصص، العلامة التجارية المعروفة، وسوق مزدهر.",
    keywords:
      "امتياز المركبات الكهربائية {{city}}، مشروع السيارات الكهربائية {{country}}، امتياز مركز خدمة، امتياز سيارات {{country}}",
  },
  bn: {
    title: "{{city}}-এ ইভি ফ্র্যাঞ্চাইজি | ইলেকট্রিক গাড়ির সার্ভিস সেন্টার",
    description:
      "ইভিএস {{country}}-এর সাথে বর্ধনশীল ইলেকট্রিক গাড়ি শিল্পে যোগ দিন। {{city}}-এ নিজের ইভি সার্ভিস ফ্র্যাঞ্চাইজি শুরু করুন।",
    keywords:
      "ইভি ফ্র্যাঞ্চাইজি {{city}}, ইলেকট্রিক গাড়ির ব্যবসা {{country}}, সার্ভিস সেন্টার ফ্র্যাঞ্চাইজি",
  },
};

export const BLOG_SEO = {
  en: {
    // The on-page heading. It was hand-written into each list route - the
    // English one in pages/blog/index.js, the Arabic in pages/ar/blog/index.js -
    // so a third language meant a third file. One component reads these now.
    h1: "Welcome to Our Blog – Your EV Servicing Hub",
    h2: "Get expert tips on EV maintenance, battery repairs, software upgrades, and more to keep your electric vehicle running smoothly!",
    /* Title aur description dono chhote kiye gaye - Google title ~60 haroof
       par aur description ~160 par kaat deta hai. Purana title UAE par 63 ka
       tha aur Saudi par 72 ("Saudi Arabia" sab se lamba mulk ka naam hai, is
       liye wahi sab se bura suurat-e-haal hai). Kata hua title SERP me
       adhoora dikhta hai aur brand ka naam hi nigal jata hai. */
    title: "EVS {{country}} Blog | EV Tips, News & Maintenance",
    description:
      "Electric vehicle trends, maintenance tips, repair guides and news from EVS {{country}} — the go-to resource for EV owners in {{country_the}}.",
    keywords:
      "EV blog {{country}}, electric vehicle tips, EV maintenance guides, EV repair advice, EV ownership {{country}}, green mobility blog, EVS {{country}} blog",
    // Appended to the title on /blog/page/2 and after - see BlogListPage.
    // Per language, because it is the one word in that title that has to be
    // translated and `page_content` has no row for the blog listing.
    pageLabel: "Page",
  },
  ar: {
    // The on-page heading. It was hand-written into each list route - the
    // English one in pages/blog/index.js, the Arabic in pages/ar/blog/index.js -
    // so a third language meant a third file. One component reads these now.
    h1: "مرحبًا بكم في مدونتنا – مركز خدمات المركبات الكهربائية",
    h2: "احصل على نصائح من الخبراء حول صيانة المركبات الكهربائية، إصلاح البطاريات، تحديثات البرمجيات، وأكثر للحفاظ على سيارتك الكهربائية تعمل بسلاسة!",
    title: "مدونة إي في إس | نصائح وأخبار المركبات الكهربائية",
    description:
      /* Angrezi ki tarah chhoti ki gayi - purani 189 haroof ki thi. */
      "أحدث صيحات المركبات الكهربائية، نصائح الصيانة، أدلة الإصلاح وأخبار إي في إس {{country}} — مصدرك لمعلومات امتلاك سيارة كهربائية.",
    keywords:
      "مدونة المركبات الكهربائية {{country}}، نصائح صيانة السيارات الكهربائية، أدلة إصلاح، امتلاك سيارة كهربائية {{country}}",
    pageLabel: "صفحة",
  },
  bn: {
    // The on-page heading. It was hand-written into each list route - the
    // English one in pages/blog/index.js, the Arabic in pages/ar/blog/index.js -
    // so a third language meant a third file. One component reads these now.
    h1: "আমাদের ব্লগে স্বাগতম – আপনার ইভি সার্ভিসিং হাব",
    h2: "ইভি রক্ষণাবেক্ষণ, ব্যাটারি মেরামত, সফটওয়্যার আপগ্রেড এবং আরও অনেক কিছু নিয়ে বিশেষজ্ঞদের পরামর্শ পান।",
    title: "ইভিএস {{country}} ব্লগ | ইলেকট্রিক গাড়ির টিপস, খবর ও রক্ষণাবেক্ষণ গাইড",
    description:
      "ইভিএস {{country}} থেকে ইলেকট্রিক গাড়ির সর্বশেষ ট্রেন্ড, রক্ষণাবেক্ষণের টিপস, মেরামত গাইড ও খবর জানুন।",
    keywords:
      "ইভি ব্লগ {{country}}, ইলেকট্রিক গাড়ির টিপস, ইভি রক্ষণাবেক্ষণ গাইড",
    pageLabel: "পৃষ্ঠা",
  },
};
