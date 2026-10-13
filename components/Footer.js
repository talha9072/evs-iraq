// components/common/Footer.js
import { DEFAULT_LOCALE, isRtl } from "@/lib/locale";
import useNav from "@/components/nav/useNav";
import { hasSos } from "@/lib/features";

/**
 * The class lists below are reproduced exactly, including the parts that look
 * like mistakes: five `col-lg-3` columns in a twelve-column grid (so Opening
 * Hours wraps to its own line), `target="_blank"` with `rel="noopener
 * noreferrer"` on links to our own pages, and `justify-xs-center` beside
 * `align-items-center`. Live looks the way it looks because of them.
 *
 * Per-country content comes from `nav.footer` - see lib/footer.js. The headings,
 * the copyright line, the credit and the six Quick Links stay here: they do not
 * grow when a workshop or a service is added.
 */

/** icon class and aria-label wording per account, in the order the footer shows. */
const SOCIAL = {
  facebook: { icon: "bi bi-facebook", name: "facebook" },
  tiktok: { icon: "bi bi-tiktok", name: "tiktok" },
  linkedin: { icon: "bi bi-linkedin", name: "linkedin" },
  // Capital I, as it was written. The aria-labels were not consistent and this
  // is not the change to make them so.
  instagram: { icon: "bi bi-instagram", name: "Instagram" },
};

export default function Footer({ locale = DEFAULT_LOCALE }) {
  // See the note in HomePage: without isolation the number reads backwards.
  const rtl = isRtl(locale);
  // Every link below is relative and carries this prefix. They were absolute
  // https://evsuae.com/... URLs, so the Oman and Qatar footers sent every
  // visitor to the UAE.
  const p = locale === DEFAULT_LOCALE ? "" : `/${locale}`;

  const { footer } = useNav(locale);

  return (
    <footer className="snap-section half-footer bg-nero-grey position-relative pb-0 border-top border-color-transparent-white-light">
      <div className="container">
        <div className="row justify-content-center align-items-center align-items-lg-start mb-5 text-center text-sm-start sm-mb-30px">
          {/* Column 1: Logo + Contact + Social */}
          <div className="col-lg-3 col-md-12 col-sm-6 text-lg-start text-md-center md-mb-30px">
            <a href={p || "/"} className="footer-logo d-inline-block">
              <img
                data-no-retina=""
                src="/img/EVS-logo.svg"
                height="115"
                width="300"
                alt="evs-logo"
              />
            </a>

            <span className="text-white ls-05px d-block fs-17 mb-5px mt-15">Contact Us</span>
            <div>
              <i className="feather icon-feather-phone-call icon-very-small me-10px"></i>
              {/* tel: gets the E.164 number, the text gets the way the country
                  writes it. The UAE footer used to link tel:600500387 - the local
                  form of a 600 number, which does not dial from abroad. */}
              {/* No href at all until the number arrives, rather than a bare
                  "tel:" in the served HTML. */}
              <a href={footer.phone ? `tel:${footer.phone}` : undefined}>
                <span className={rtl ? "evs-latin" : undefined} dir="ltr">
                  {footer.phoneDisplay}
                </span>
              </a>
            </div>
            <div>
              <i className="feather icon-feather-mail icon-very-small me-10px"></i>
              <a href={footer.email ? `mailto:${footer.email}` : undefined}>{footer.email}</a>
            </div>

            <span className="text-white ls-05px d-block fs-17 mb-5px mt-15">Social Media</span>
            <div className="d-flex align-items-center justify-xs-center gap-3">
              {footer.social.map((account) => (
                <a
                  key={account.key}
                  href={account.href}
                  target="_blank"
                  rel="noopener"
                  aria-label={`Visit ${footer.branchName} on ${SOCIAL[account.key]?.name ?? account.key}`}
                >
                  <i className={`${SOCIAL[account.key]?.icon ?? "bi"} icon-small`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-lg-3 col-md-4 col-sm-6 fs-16 lh-26 fw-500 last-paragraph-no-margin sm-mb-30px mt-lg-3">
            <span className="text-white ls-05px d-block fs-26 mb-15px">Quick Links</span>
            <div><a href={`${p}/about`}>About us</a></div>
            <div><a href={`${p}/services`}>Services</a></div>
            {/* See lib/features.js - Oman and Qatar answer 404 for /sos. */}
            {hasSos() && <div><a href={`${p}/sos`}>Roadside Assitance</a></div>}
          </div>

          {/* Column 3: Locations
              The ordinary workshops only - no Express, no Riyadh. That is how all
              three live footers read; lib/footer.js filters on `variant`. */}
          <div className="col-lg-3 col-md-4 col-sm-6 fs-16 lh-26 fw-500 last-paragraph-no-margin xs-mb-30px mt-lg-3">
            <span className="text-white ls-05px d-block fs-26 mb-15px">Locations</span>

            {footer.locations.map((location) => (
              <div key={location.href}>
                <a href={location.href} target="_blank" rel="noopener noreferrer">
                  {location.label}
                </a>
              </div>
            ))}
          </div>

          {/* Column: EVS Network */}
          <div className="col-lg-3 col-md-4 col-sm-6 fs-16 lh-26 fw-500 last-paragraph-no-margin xs-mb-30px mt-lg-3">
            <span className="text-white ls-05px d-block fs-26 mb-15px">EVS Network</span>
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
          {/* Column 4: Opening Hours
              Two strings, not one: `.opening-day` is `width:100px;
              display:inline-block`, and that is what lines the two rows up. */}
          <div className="col-lg-3 col-md-4 col-sm-6 fs-16 lh-26 fw-500 last-paragraph-no-margin xs-mb-30px mt-lg-3">
            <span className="text-white ls-05px d-block fs-26 mb-15px">Opening Hours</span>
            <span className="d-block">
              <span className="opening-day">{footer.hours.day}</span> {footer.hours.time}
            </span>
            <span className="d-block">
              <span className="opening-day">{footer.hours.closedDay}</span> {footer.hours.closedNote}
            </span>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom position-relative pt-25px pb-25px border-top border-color-transparent-white-light">
          <div className="row align-items-center">
            <div className="col-lg-4 text-center text-lg-start md-mb-15px">
              <span className="fs-16 fw-500">
                © Copyright 2026 EVS - Electric Vehicle Services.
                <br />
                Website crafted by{" "}
                <a
                  href="https://oasis-digital.ae"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white"
                >
                  Oasis Digital
                </a>
              </span>
            </div>
            <div className="col-lg-8 text-center text-lg-end">
  <ul className="footer-navbar fs-16 fw-500">
    {/* The dash sits inside the link on every item but the first, which is how
        it was written - it is part of the link text, not a separator element. */}
    {footer.services.map((service, index) => (
      <li className="nav-item" key={service.href}>
        <a
          href={service.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {index === 0 ? service.label : `- ${service.label}`}
        </a>
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
