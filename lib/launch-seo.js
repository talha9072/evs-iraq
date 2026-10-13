import network from "@/data/network.json";
import { localised } from "@/lib/branches";
import { DEFAULT_LOCALE } from "@/lib/locale";
import { contactFaqJsonLd } from "@/components/launch/LaunchContact";

/**
 * Structured data for the three pages this site added of its own.
 *
 * The inherited pages all carry schema — Service, BreadcrumbList, FAQPage —
 * because EVS-Production builds it from the content rows. /contact, /franchise
 * and /our-network have no rows behind them, so they shipped with none, which
 * is the one real gap a head audit turned up.
 *
 * NO LocalBusiness ANYWHERE. That type wants an address and an opening-hours
 * specification, and inventing either is how a Business Profile gets suspended
 * later. Organization is the honest type for a company with no premises in
 * this country yet.
 */

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://evsiraq.com").replace(/\/$/, "");

const abs = (locale, path = "") => {
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  const clean = String(path).replace(/^\/+/, "");
  return `${SITE}${prefix}${clean ? `/${clean}` : ""}`;
};

/** The company, as every page here should describe it. */
function organisation(locale) {
  return {
    "@type": "Organization",
    "@id": `${SITE}/#organization`,
    name: "EVS Iraq",
    url: SITE,
    logo: `${SITE}/img/EVS-logo.svg`,
    email: "contact@evsworldwide.com",
    parentOrganization: {
      "@type": "Organization",
      name: "EVS Worldwide",
      url: network.group.url,
    },
    areaServed: {
      "@type": "Country",
      name: localised({ en: "Iraq", ar: "العراق" }, locale),
    },
    knowsAbout: [
      "Electric vehicle maintenance",
      "High-voltage battery diagnostics",
      "EV battery state of health",
      "EV software and region coding",
      "Car air conditioning repair",
      "Car body repair and painting",
    ],
  };
}

function crumbs(locale, trail) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: abs(locale, item.path),
    })),
  };
}

const LABEL = {
  home: { en: "Home", ar: "الرئيسية" },
  contact: { en: "Contact", ar: "تواصل معنا" },
  franchise: { en: "Franchise", ar: "الامتياز" },
  network: { en: "The EVS network", ar: "شبكة إي في إس" },
};

const pick = (key, locale) => localised(LABEL[key], locale);

export function contactJsonLd(locale = DEFAULT_LOCALE) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organisation(locale),
      {
        "@type": "ContactPage",
        "@id": `${abs(locale, "contact")}#page`,
        url: abs(locale, "contact"),
        inLanguage: locale,
        isPartOf: { "@id": `${SITE}/#organization` },
      },
      crumbs(locale, [
        { name: pick("home", locale), path: "" },
        { name: pick("contact", locale), path: "contact" },
      ]),
      /* The page's six questions. A contact page with no phone number has the
         FAQ as its only real content, so it is also its best chance of an
         answer being lifted straight into a result. */
      contactFaqJsonLd(locale),
    ],
  };
}

export function franchiseJsonLd(locale = DEFAULT_LOCALE) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organisation(locale),
      {
        "@type": "WebPage",
        "@id": `${abs(locale, "franchise")}#page`,
        url: abs(locale, "franchise"),
        inLanguage: locale,
        isPartOf: { "@id": `${SITE}/#organization` },
        /* The application itself lives on the group site; saying so in the
           graph matches what every button on the page actually does. */
        significantLink: `${network.group.url}/franchise/apply`,
      },
      crumbs(locale, [
        { name: pick("home", locale), path: "" },
        { name: pick("franchise", locale), path: "franchise" },
      ]),
    ],
  };
}

export function networkJsonLd(locale = DEFAULT_LOCALE) {
  const live = network.countries.filter((c) => c.url);

  return {
    "@context": "https://schema.org",
    "@graph": [
      organisation(locale),
      {
        "@type": "CollectionPage",
        "@id": `${abs(locale, "our-network")}#page`,
        url: abs(locale, "our-network"),
        inLanguage: locale,
        isPartOf: { "@id": `${SITE}/#organization` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: live.map((country, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Organization",
              name: `EVS ${country.name.en}`,
              url: country.url,
              areaServed: { "@type": "Country", name: country.name.en },
            },
          })),
        },
      },
      crumbs(locale, [
        { name: pick("home", locale), path: "" },
        { name: pick("network", locale), path: "our-network" },
      ]),
    ],
  };
}
