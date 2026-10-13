/**
 * Give the nav's chevrons the click handler Litho only ever attaches once.
 *
 * THE PROBLEM. `public/js/main.js` binds its dropdown toggles at script load:
 *
 *   document.querySelectorAll('.btn-dropdown').forEach(button => {
 *     button.addEventListener('click', function () {
 *       const nextDiv = this.nextElementSibling;
 *       if (nextDiv && nextDiv.classList.contains('menu-item-list')) {
 *         nextDiv.classList.toggle('show');
 *       }
 *     });
 *   });
 *
 * One pass, direct binding, no delegation. The three top-level chevrons are in
 * the served HTML so they are caught by it; the per-brand chevrons inside the
 * hamburger now arrive after that pass and would get nothing - the brand
 * submenus would simply not open. (In the DESKTOP bar the chevron sits inside
 * the <a>, so its nextElementSibling is nothing and it never toggled anything
 * there anyway: that submenu opens on hover, from CSS.)
 *
 * WHY NOT DELEGATE ON document. Because main.js already binds the static ones
 * directly, and a document-level delegate would fire for those too - toggling
 * `show` twice per click, which reads as "the menu does not open".
 *
 * So: bind exactly the chevrons this app rendered, once each. `data-nav-bound`
 * is the mark; it is a data attribute with no styling attached.
 */
export default function bindDropdowns(root = document) {
  const toggles = root.querySelectorAll("[data-nav-dropdown]:not([data-nav-bound])");

  for (const toggle of toggles) {
    toggle.setAttribute("data-nav-bound", "");
    toggle.addEventListener("click", () => {
      const next = toggle.nextElementSibling;
      if (next && next.classList.contains("menu-item-list")) {
        next.classList.toggle("show");
      }
    });
  }

  return toggles.length;
}
