/**
 * The <li> items inside the header's three dropdowns.
 *
 * Six renderers, because the same three menus exist twice in each header - once
 * in the desktop bar, once inside the hamburger - and the two are NOT the same
 * markup. In the desktop bar the chevron sits inside the <a>; in the hamburger
 * it is a sibling of it. That difference is what Litho's CSS keys off, so it is
 * reproduced rather than tidied.
 *
 * The only thing that differs between the English and Arabic headers is which
 * way the chevron points, so it arrives as a prop: `fa-angle-right` for LTR,
 * `fa-angle-left` for RTL. Both were already hardcoded that way, and
 * `fa-angle-left/right` are physical, not logical - they do not flip themselves.
 *
 * MARKUP DELIBERATELY PRESERVED, including the bits that look wrong:
 *   - `text-uppercase` on the items, which is why "Zeekr" from the database
 *     still reads ZEEKR on screen.
 *   - the desktop brand chevron's `id`, which duplicates the submenu's
 *     aria-labelledby. Litho's dropdown JS hooks the `.btn-dropdown` CLASS, not
 *     these ids, so they are decoration - but removing them is a change with no
 *     upside.
 *
 * ONE THING CHANGED ON PURPOSE. Submenu ids are now `evBrand-<slug>`. The
 * hardcoded menu numbered them evOne..evFive by hand and gave two different
 * brands the same `evTwoDropdownMenuLink`, which is invalid HTML. Ids are not
 * visible and nothing selects on them.
 */

/** The chevron classes for a direction. `dir` is "ltr" or "rtl". */
const chevron = (dir) =>
  `fa-solid fa-angle-${dir === "rtl" ? "left" : "right"} btn-dropdown text-base-color fs-14`;

/* ============================ Services ============================ */

/** The desktop bar's Services list. */
export function ServicesDesktop({ items, dir }) {
  return items.map((item) => (
    <li className="menu-item" key={item.href}>
      <a
        className="nav-link alt-font text-uppercase text-white btn-sub-dropdown"
        href={item.href}
      >
        {item.label} <i className={chevron(dir)} id="evDropdownMenuLink"></i>
      </a>
    </li>
  ));
}

/**
 * The hamburger's Services list - no chevron at all.
 *
 * The first item used to carry `submenu-icon-content` and the other four did
 * not; the class has no rule anywhere in the stylesheets, so it is dropped
 * rather than reproduced on an arbitrary item.
 */
export function ServicesHamburger({ items }) {
  return items.map((item) => (
    <li className="menu-item" key={item.href}>
      <a className="nav-link alt-font" href={item.href}>
        {item.label}
      </a>
    </li>
  ));
}

/* ============================== Brands ============================== */

/** A brand's models. Same markup in both bars. */
function ModelItems({ models }) {
  return models.map((model) => (
    <li className="menu-item" key={model.href}>
      <a
        className="nav-link alt-font text-uppercase text-white"
        href={model.href}
      >
        {model.label}
      </a>
    </li>
  ));
}

/** The desktop bar's EV Car Brands list - chevron INSIDE the link. */
export function BrandsDesktop({ items, dir }) {
  return items.map((brand) => {
    const submenuId = `evBrand-${brand.slug}`;
    return (
      <li className="menu-item" key={brand.href}>
        <a
          className="nav-link alt-font text-uppercase text-white btn-sub-dropdown"
          href={brand.href}
        >
          {brand.label} <i className={chevron(dir)} id={submenuId}></i>
        </a>
        {brand.models.length > 0 && (
          <ul
            className="menu-item-list fw-500 sub-dropdown-menu"
            aria-labelledby={submenuId}
          >
            <ModelItems models={brand.models} />
          </ul>
        )}
      </li>
    );
  });
}

/**
 * The hamburger's EV Car Brands list - chevron NEXT TO the link, which is what
 * makes it a working toggle: Litho reads `nextElementSibling`.
 *
 * `data-nav-dropdown` is how components/nav/bindDropdowns.js finds it. Litho
 * binds its toggles once at script load, and these arrive after that.
 */
export function BrandsHamburger({ items, dir }) {
  return items.map((brand) => {
    const submenuId = `evBrand-${brand.slug}-menu`;
    return (
      <li className="menu-item" key={brand.href}>
        <a
          className="nav-link alt-font text-uppercase text-white btn-sub-dropdown"
          href={brand.href}
        >
          {brand.label}
        </a>
        <i className={chevron(dir)} id={submenuId} data-nav-dropdown=""></i>
        {brand.models.length > 0 && (
          <ul
            className="menu-item-list fw-500 sub-dropdown-menu"
            aria-labelledby={submenuId}
          >
            <ModelItems models={brand.models} />
          </ul>
        )}
      </li>
    );
  });
}

/* ============================= Branches ============================= */

/**
 * The desktop bar's Branches list.
 *
 * `express` puts the Express workshops in `li.express`, which Litho styles
 * differently - that is the whole reason `locations.variant` is carried through.
 */
export function BranchesDesktop({ items, dir }) {
  return items.map((item) => (
    <li className={item.express ? "menu-item express" : "menu-item"} key={item.href}>
      <a
        className="nav-link alt-font text-uppercase text-white btn-sub-dropdown"
        href={item.href}
      >
        {item.label} <i className={chevron(dir)} id="evDropdownMenuLink"></i>
      </a>
    </li>
  ));
}

/** The hamburger's Branches list - no chevron. */
export function BranchesHamburger({ items }) {
  return items.map((item) => (
    <li className={item.express ? "menu-item express" : "menu-item"} key={item.href}>
      <a
        className="nav-link alt-font text-uppercase text-white btn-sub-dropdown"
        href={item.href}
      >
        {item.label}
      </a>
    </li>
  ));
}
