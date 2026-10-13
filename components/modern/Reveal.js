import { useEffect, useRef } from "react";

/**
 * Scroll-triggered reveal.
 *
 * WHAT THIS REPLACES. The legacy pages carry 37 `data-anime` attributes read by
 * Crafto's `main.js`, which drives them through jQuery-appear bound to
 * `$(window).scroll`. That has two failure modes this project has already been
 * bitten by: inside `.scroll-container` the window never scrolls, so the handler
 * never fires and blocks stay at `opacity: 0` for good — the workaround is still
 * in evs.css:614 — and blocks already on screen at load sometimes never get
 * their class at all.
 *
 * IntersectionObserver has neither problem. It reports what is visible whichever
 * element scrolls, and it fires immediately for anything already in view.
 *
 * IT FAILS SAFE, and that is the main point. The hidden state is applied
 * IMPERATIVELY after mount, so the server HTML and the first client render both
 * show the content. If scripting is off, the observer is missing, or the JS
 * simply never arrives, the page is readable. The legacy system did the
 * opposite: `[data-anime] { opacity: 0 }` shipped in the stylesheet, so any
 * scripting failure left a blank page.
 *
 * Doing it imperatively also means zero extra renders — there is no state here,
 * and nothing re-renders when an element comes into view.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  /** ms before this element starts, once it is in view. */
  delay = 0,
  /** ms between each direct child. 0 reveals the block as one. */
  stagger = 0,
  /** How far it travels. `none` fades only — right for large imagery. */
  from = "up",
  className = "",
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No observer, or the reader asked for less motion: leave everything as it
    // was rendered, which is visible.
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const offset =
      from === "none"  ? "translate3d(0,0,0)" :
      from === "start" ? "translate3d(-1.5rem,0,0)" :
      from === "end"   ? "translate3d(1.5rem,0,0)" :
                         "translate3d(0,1.75rem,0)";

    /* In stagger mode the CHILDREN animate, not the wrapper — the wrapper is
       usually the grid or flex container, and moving it would move the layout.
       Styling the real children (rather than wrapping each one) is what keeps
       them grid items. */
    const targets = stagger > 0 ? Array.from(node.children) : [node];
    if (targets.length === 0) return;

    targets.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = offset;
      el.style.transition =
        `opacity 700ms var(--ease-out) ${delay + i * stagger}ms, ` +
        `transform 700ms var(--ease-out) ${delay + i * stagger}ms`;
    });

    const show = () =>
      targets.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "translate3d(0,0,0)";
      });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        show();
        observer.disconnect(); // one-shot — it never replays on scroll back
      },
      // Fires a little before the top edge arrives, so the motion has finished
      // by the time the element is properly in view rather than starting then.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      // If this unmounts mid-animation the styles go with it, but a remount
      // (a client-side route change back) must not inherit a hidden element.
      targets.forEach((el) => {
        el.style.opacity = "";
        el.style.transform = "";
        el.style.transition = "";
      });
    };
  }, [delay, stagger, from]);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
