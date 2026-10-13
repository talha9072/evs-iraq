// components/FooterAr.js
import { DEFAULT_LOCALE } from "@/lib/locale";
import useNav from "@/components/nav/useNav";
import { hasSos } from "@/lib/features";

/**
 * The Arabic footer is NOT a mirror of the English one, so it is still its own
 * file. It uses `text-sm-end` / `text-lg-end` instead of the start variants,
 * `ms-10px` instead of `me-10px`, a 5/7 split in the footer bottom where English
 * has 4/8, `justify-content-lg-start` on the social row, `dir="ltr"` on the phone
 * and the mailbox so Latin digits and an address read the right way round, and it
 * prints the opening hours as one sentence with a colon rather than using the
 * fixed-width `.opening-day` column. All of that is reproduced, not tidied.
 *
 * Per-country content comes from `nav.footer` - see lib/footer.js.
 */

/** icon class and the Arabic name each aria-label uses. */
const SOCIAL = {
  facebook: { icon: "bi bi-facebook", name: "فيسبوك" },
  tiktok: { icon: "bi bi-tiktok", name: "تيك توك" },
  linkedin: { icon: "bi bi-linkedin", name: "لينكدإن" },
  instagram: { icon: "bi bi-instagram", name: "إنستغرام" },
};

export default function FooterAr({ locale = DEFAULT_LOCALE }) {
  // Every link below is relative and carries this prefix. The Arabic footer had
  // /ar written into all seventeen paths, which is exactly why a third language
  // had no way in.
  const p = locale === DEFAULT_LOCALE ? "" : `/${locale}`;

  const { footer } = useNav(locale);

  return (
    <footer className="snap-section half-footer bg-nero-grey position-relative pb-0 border-top border-color-transparent-white-light">
      <div className="container">
        <div className="row justify-content-center align-items-center align-items-lg-start mb-5 text-center text-sm-end sm-mb-30px">

          {/* ===== Column 1: Logo + Contact + Social ===== */}
          <div className="col-lg-3 col-md-12 col-sm-6 text-lg-end text-md-center md-mb-30px">
            <a href={p || "/"} className="footer-logo d-inline-block">
              <img
                data-no-retina=""
                src="/img/EVS-logo.svg"
                height="115"
                width="300"
                alt="شعار إي في إس"
              />
            </a>

            <span className="text-white ls-05px d-block fs-17 mb-5px mt-15">
              تواصلوا معنا
            </span>

            <div>
              <i className="feather icon-feather-phone-call icon-very-small ms-10px urbanist"></i>
              <a className="urbanist" href={footer.phone ? `tel:${footer.phone}` : undefined} dir="ltr">
                {footer.phoneDisplay}
              </a>
            </div>

            <div>
              <i className="feather icon-feather-mail icon-very-small ms-10px"></i>
              <a href={footer.email ? `mailto:${footer.email}` : undefined} dir="ltr">
                {footer.email}
              </a>
            </div>

            <span className="text-white ls-05px d-block fs-17 mb-5px mt-15">
              وسائل التواصل الاجتماعي
            </span>

            <div className="d-flex align-items-center justify-content-center justify-content-lg-start gap-3">
              {footer.social.map((account) => (
                <a
                  key={account.key}
                  href={account.href}
                  target="_blank"
                  rel="noopener"
                  aria-label={`زوروا ${footer.branchName} على ${SOCIAL[account.key]?.name ?? account.key}`}
                >
                  <i className={`${SOCIAL[account.key]?.icon ?? "bi"} icon-small`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* ===== Column 2: Quick Links ===== */}
          <div className="col-lg-3 col-md-4 col-sm-6 fs-16 lh-26 fw-500 last-paragraph-no-margin sm-mb-30px mt-lg-3">
            <span className="text-white ls-05px d-block fs-26 mb-15px">
              روابط سريعة
            </span>

            <div><a href={`${p}/about`}>من نحن</a></div>
            <div><a href={`${p}/services`}>الخدمات</a></div>
            {/* See lib/features.js - Oman and Qatar answer 404 for /sos. */}
            {hasSos() && <div><a href={`${p}/sos`}>المساعدة على الطريق</a></div>}
          </div>

          {/* ===== Column 3: Locations ===== */}
          <div className="col-lg-3 col-md-4 col-sm-6 fs-16 lh-26 fw-500 last-paragraph-no-margin xs-mb-30px mt-lg-3">
            <span className="text-white ls-05px d-block fs-26 mb-15px">
              المواقع
            </span>

            {footer.locations.map((location) => (
              <div key={location.href}>
                <a href={location.href} target="_blank">{location.label}</a>
              </div>
            ))}
          </div>

          {/* Column: EVS Network */}
          <div className="col-lg-3 col-md-4 col-sm-6 fs-16 lh-26 fw-500 last-paragraph-no-margin xs-mb-30px mt-lg-3">
            <span className="text-white ls-05px d-block fs-26 mb-15px">شبكة إي في إس</span>
            <ul className="footer-navbar fs-16 fw-500">
              {footer.network.map((site) => (
                <li className="nav-item mb-10px px-3" key={site.href}>
                  <a
                    href={site.href}
                    target="_blank"
                    rel={site.external ? "noopener noreferrer external" : "noopener noreferrer"}
                  >
                    {site.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {/* ===== Column 4: Working Hours =====
              One sentence with a colon, no `.opening-day` column - that is what
              this footer has always printed, and the Arabic reads wrong split
              across a fixed-width span. */}
          <div
            className="col-lg-3 col-md-4 col-sm-6 fs-16 lh-26 fw-500 last-paragraph-no-margin xs-mb-30px mt-lg-3"
            dir="rtl"
          >
            <span className="text-white ls-05px d-block fs-26 mb-15px">
              ساعات العمل
            </span>

            <span className="d-block">
              {footer.hours.day ? `${footer.hours.day}: ${footer.hours.time}` : null}
            </span>

            <span className="d-block">
              {footer.hours.closedDay
                ? `${footer.hours.closedDay} ${footer.hours.closedNote}`
                : null}
            </span>
          </div>
        </div>

        {/* ===== Footer Bottom ===== */}
        <div className="footer-bottom position-relative pt-25px pb-25px border-top border-color-transparent-white-light">
          <div className="row align-items-center">
            <div className="col-lg-5 text-center text-lg-end md-mb-15px">
              <span className="fs-16 fw-500">
                © حقوق الطبع والنشر <span className="urbanist">2026</span> إي في إس - خدمات المركبات الكهربائية.
                <br />
                صيغ الموقع بواسطة{" "}
                <a
                  href="https://oasis-digital.ae"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white"
                >
                  أواسيس ديجيتال
                </a>
              </span>
            </div>

            <div className="col-lg-7 text-center text-lg-start">
              <ul className="footer-navbar fs-16 fw-500">
                {/* The dash sits AFTER the link here, on every item but the last -
                    the opposite of the English footer, where it is inside the
                    link and on every item but the first. */}
                {footer.services.map((service, index) => (
                  <li className="nav-item" key={service.href}>
                    <a href={service.href} target="_blank">
                      {service.label}
                    </a>
                    {index < footer.services.length - 1 ? <>{" "}-</> : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
