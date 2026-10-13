import { DEFAULT_LOCALE } from "@/lib/locale";
import { useEffect } from "react";
import useNav from "@/components/nav/useNav";
import bindDropdowns from "@/components/nav/bindDropdowns";
import { hasSos } from "@/lib/features";
import {
  ServicesDesktop,
  ServicesHamburger,
  BrandsDesktop,
  BrandsHamburger,
  BranchesDesktop,
  BranchesHamburger,
} from "@/components/nav/NavMenus";

export default function Header({ locale = DEFAULT_LOCALE }) {
  // Every link below is relative and carries this prefix. They were
  // absolute https://evsuae.com/... URLs, so on the Oman and Qatar sites
  // the whole menu walked the visitor over to the UAE.
  //
  // From DEFAULT_LOCALE, not a literal "en": which locale goes unprefixed
  // comes from NEXT_PUBLIC_LOCALES.
  const p = locale === DEFAULT_LOCALE ? "" : `/${locale}`;

  // Services, EV Car Brands and Branches, from the database, for THIS country.
  // The lists used to be written out by hand - four copies per language - and
  // they were the UAE's, so Qatar's menu offered nine workshops that do not
  // exist on Qatar's site. See lib/nav.js.
  const nav = useNav(locale);

  // Litho binds its dropdown toggles once, when main.js loads. These items
  // arrive after that, so their chevrons have to be bound here or the brand
  // submenus in the hamburger never open. See bindDropdowns.js.
  useEffect(() => {
    bindDropdowns();
  }, [nav]);

  return (
    <>
      {/* start header */}
      <header className="position-sticky top-0">
        {/* start navigation */}
        <nav className="navbar navbar-expand-lg header-transparent bg-transparent border-bottom border-color-dark-gray disable-fixed">
          <div className="container-fluid">
            <div className="col-auto">
              <a className="navbar-brand" href={p || "/"}>
                <img
                  data-no-retina=""
                  src="/img/EVS-logo.svg"
                  height="36"
                  width="96"
                  alt="EVS-logo"
                  className="default-logo"
                />
              </a>
            </div>

            <ul className="menu-item-list fw-500 ls-1px d-flex justify-content-center navbar-nav sm-hide">
              <li className="menu-item">
                <a href={p || "/"} className="nav-link alt-font text-uppercase text-white">
                  Home
                </a>
              </li>
              <li className="menu-item dropdown-btn">
                <a href={`${p}/services`} className="nav-link alt-font text-uppercase text-white btn-dropdown">
                  Services
                </a>
                <i className="fa-solid fa-angle-down btn-dropdown" id="evDropdownMenuLink"></i>
                <ul className="menu-item-list fw-500 dropdown-menu" aria-labelledby="evDropdownMenuLink">
                  <ServicesDesktop items={nav.services} dir="ltr" />
                </ul>
              </li>
              <li className="menu-item">
                <a href={`${p}/extended-warranties`} className="nav-link alt-font text-uppercase text-white">
                  Warranty
                </a>
              </li>
              {/* Only the branches that publish it - Oman and Qatar answer 404 for
                  /sos, so this was a dead link in their main nav. See lib/features.js. */}
              {hasSos() && (
                <li className="menu-item">
                  <a href={`${p}/sos`} className="nav-link alt-font text-uppercase text-white">
                    Roadside Assitance
                  </a>
                </li>
              )}
              <li className="menu-item dropdown-btn">
                <a href={`${p}/ev-car-brands`} className="nav-link alt-font text-uppercase text-white btn-dropdown">
                  EV Car Brands
                </a>
                <i className="fa-solid fa-angle-down btn-dropdown" id="evCarBrands"></i>
                <ul className="menu-item-list fw-500 dropdown-menu" aria-labelledby="evCarBrands">
                  <BrandsDesktop items={nav.brands} dir="ltr" />
                </ul>
              </li>
              <li className="menu-item dropdown-btn">
                <a href={`${p}/branches`} className="nav-link alt-font text-uppercase text-white btn-dropdown">
                  Branches
                </a>
                <i className="fa-solid fa-angle-down btn-dropdown" id="branchesDropdownMenuLink"></i>
                <ul className="menu-item-list fw-500 dropdown-menu" aria-labelledby="branchesDropdownMenuLink">
                  <BranchesDesktop items={nav.branches} dir="ltr" />
                </ul>
              </li>
              <li className="menu-item">
                <a href={`${p}/about`} className="nav-link alt-font text-uppercase text-white">
                  About EVS
                </a>
              </li>
              <li className="menu-item">
                <a href={`${p}/frequently-asked-questions`} className="nav-link alt-font text-uppercase text-white">
                  FAQs
                </a>
              </li>
            </ul>
            <div className="col-auto align-items-center mobile-hide">
              <div className="header-button d-flex align-items-center gap-3">
                <a
                  href=""
                  className="text-white alt-font english-converter fw-500 d-flex align-items-center"
                  style={{ textDecoration: 'none' }}
                >
                  <span className="mob-hide arabic-converter" style={{ paddingLeft: '5px' }}>
                    AR
                  </span>
                  <img
                    className="arabic-converter"
                    data-no-retina=""
                    src="/img/flags/bh.png"
                    alt="Arabic Flag"
                    width="36"
                    height="18"
                    style={{ height: '18px', marginLeft: '6px', verticalAlign: 'middle' }}
                  />
                </a>
                <a
                  href={`${p}/contact`}
                  className="btn btn-medium btn-base-color btn-round-edge btn-box-shadow"
                >
                  <b>Book Service</b>
                </a>
              </div>
            </div>
            <div className="col-auto me-0 sm-me-auto border-start border-color-dark-gray xs-ms-0 lg-hide">
              <div className="header-icon">
                <div className="header-push-button hamburger-push-button icon">
                  <img
                    className="mobile-show arabic-converter"
                    data-no-retina=""
                    src="/img/flags/bh.png"
                    alt="US Flag"
                    width="36"
                    height="18"
                    style={{ height: '18px', marginRight: '10px', verticalAlign: 'middle' }}
                  />
                  <div className="push-button">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        {/* end navigation */}

        {/* start hamburger menu
            The background used to read `ur[](` - a markdown link pasted over
            `url(` at some point before 68278d0, so the English hamburger menu has
            had no background image for as long as git remembers. The Arabic
            header has always had it right. */}
        <div
          className="push-menu hamburger-nav header-dark hamburger-menu-half push-menu-left bg-dark-gray md-w-60 sm-w-100"
          style={{ backgroundImage: "url(/.netlify/images?url=/images/menu-bg.jpg)" }}
        >
          <span className="close-menu text-white bg-white">
            <i className="fa-solid fa-xmark"></i>
          </span>
          <div className="d-flex flex-column justify-content-center h-100 ps-19 pe-19 pt-13 pb-13 xl-p-12 sm-p-20px">
            <div>
              <a className="hamburger-logo" href={p || "/"}>
                <img
                  data-no-retina=""
                  src="/img/EVS-logo.svg"
                  height="36"
                  width="96"
                  alt="evs-logo"
                />
              </a>
            </div>
            <div className="hamburger-menu menu-list-wrapper w-100 lg-w-100 lg-no-margin sm-mt-auto sm-mb-auto" data-scroll-options='{ "theme": "light" }'>
              <ul className="menu-item-list fw-500 ls-1px">
                <li className="menu-item">
                  <a href={p || "/"} className="nav-link alt-font">
                    Home
                  </a>
                </li>
                <li className="menu-item">
                  <a href={`${p}/contact`} className="nav-link alt-font">
                    Contact
                  </a>
                </li>
                <li className="menu-item">
                  <a href={`${p}/services`}>
                    <p className="nav-link alt-font">Services</p>
                  </a>
                  <i className="fa-solid fa-angle-down btn-dropdown" id="navbarDropdownMenuLink"></i>
                  <ul className="menu-item-list fw-500 dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                  <ServicesHamburger items={nav.services} />
                </ul>
                </li>
                <li className="menu-item">
                  <a href={`${p}/extended-warranties`} className="nav-link alt-font">
                    Warranty
                  </a>
                </li>
                {/* Only the branches that publish it - Oman and Qatar answer 404 for
                    /sos, so this was a dead link in their main nav. See lib/features.js. */}
                {hasSos() && (
                  <li className="menu-item">
                    <a href={`${p}/sos`} className="nav-link alt-font">
                      Roadside Assitance
                    </a>
                  </li>
                )}
                <li className="menu-item dropdown-btn">
                  <a href={`${p}/ev-car-brands`} className="nav-link alt-font text-white btn-dropdown">
                    EV Car Brands
                  </a>
                  <i className="fa-solid fa-angle-down btn-dropdown" id="evCarBrands"></i>
                  <ul className="menu-item-list fw-500 dropdown-menu" aria-labelledby="evCarBrands">
                  <BrandsHamburger items={nav.brands} dir="ltr" />
                </ul>
                </li>
                <li className="menu-item dropdown-btn">
                  <a href={`${p}/branches`} className="nav-link alt-font text-white btn-dropdown">
                    Branches
                  </a>
                  <i className="fa-solid fa-angle-down btn-dropdown" id="branchesDropdownMenuLink"></i>
                  <ul className="menu-item-list fw-500 dropdown-menu" aria-labelledby="branchesDropdownMenuLink">
                  <BranchesHamburger items={nav.branches} />
                </ul>
                </li>

                


                <li className="menu-item">
                  <a href={`${p}/about`} className="nav-link alt-font">
                    About EVS
                  </a>
                </li>
                <li className="menu-item">
                  <a href={`${p}/frequently-asked-questions`} className="nav-link alt-font">
                    FAQs
                  </a>
                </li>
              </ul>
            </div>
            <div className="w-90 d-none d-lg-inline-block">
              <div className="row row-cols-1 row-cols-xl-1 menu-address">
                <div className="col">
                  <span className="text-white fs-16 ls-05px">Connect with us</span>
                  <div className="h-1px w-90 lg-w-100 bg-white-transparent-extra-light mt-10px mb-10px"></div>
                  <p className="fs-15 lh-28 w-90 xl-w-100 lg-mb-0">
                    <a
                      href={nav.footer.email ? `mailto:${nav.footer.email}` : undefined}
                      className="d-block text-white-hover"
                    >
                      {nav.footer.email}
                    </a>
                    <a
                      href={nav.footer.phone ? `tel:${nav.footer.phone}` : undefined}
                      className="text-white-hover"
                    >
                      {nav.footer.phoneDisplay}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* end hamburger menu */}
      </header>
      {/* end header */}
    </>
  );
}