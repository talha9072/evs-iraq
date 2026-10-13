import Head from "next/head";
import { useEffect, useRef } from "react";

/* Decorative hero background video.
 *
 * This element is deliberately rendered with no source and no autoplay, and
 * only wired up once the page has loaded. Two browser behaviours make that
 * necessary:
 *
 * - `media` on a <source> inside a <video> is ignored. The media resource
 *   selection algorithm never consults it, so the first <source> always wins.
 *   The homepage previously relied on it, which meant desktop visitors were
 *   served the 3.7 MB "mobile" rendition and the 1280px one was never used.
 *
 * - `autoplay` overrides `preload="none"`. An element that has to reach a
 *   playable state begins fetching immediately, whatever preload says. Hiding
 *   a second <video> with `d-none` does not help either - `display: none` does
 *   not cancel a media download, so the Arabic homepage was fetching both
 *   renditions on every visit.
 *
 * The poster paints on its own while the page loads, then the correct
 * rendition for the viewport is fetched during idle time. If scripting is
 * unavailable the poster simply remains, which is fine for aria-hidden
 * decoration.
 */
/** The origin of an absolute URL, or null for a relative path or a bad value. */
function originOf(url) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export default function HeroVideo({
  mobileSrc,
  desktopSrc,
  poster,
  className = "hero-img",
  mobileQuery = "(max-width: 767px)",
}) {
  const videoRef = useRef(null);

  // A same-origin poster needs no preconnect, and a relative path has no origin to
  // read - so both cases yield null and the tag is simply not emitted.
  const origin = originOf(poster) ?? originOf(desktopSrc) ?? originOf(mobileSrc);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    const start = () => {
      if (cancelled || !videoRef.current) return;

      const isMobile =
        typeof window.matchMedia === "function" &&
        window.matchMedia(mobileQuery).matches;

      const src = (isMobile ? mobileSrc : desktopSrc) || desktopSrc || mobileSrc;
      if (!src) return;

      video.src = src;
      video.load();

      // Muted inline playback is normally permitted, but a rejection here is
      // not worth surfacing - the poster just stays visible.
      const played = video.play();
      if (played && typeof played.catch === "function") played.catch(() => {});
    };

    // Hold the fetch back until load has fired so it cannot take bandwidth
    // from the hero heading, its font, or the render-blocking stylesheets.
    const schedule = () => {
      if (cancelled) return;
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(start, { timeout: 2000 });
      } else {
        window.setTimeout(start, 200);
      }
    };

    if (document.readyState === "complete") {
      schedule();
      return () => {
        cancelled = true;
      };
    }

    window.addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
    };
  }, [mobileSrc, desktopSrc, mobileQuery]);

  return (
    <>
      {/* The poster fills the viewport on a phone - far larger than the hero
          heading - so once it is a real image it becomes the LCP element.
          It has to be fetched at high priority off a preconnected origin,
          or it just moves the bottleneck rather than removing it. */}
      <Head>
        {/* Derived from the poster rather than hardcoded to res.cloudinary.com,
            which is where these files happen to live today. The URLs are a
            `home_page.hero_video_*` / `hero_poster_url` row now (0065, split into
            columns by 0066), so pointing the preconnect at a host the row no longer
            uses would cost a handshake and save nothing. */}
        {origin && <link rel="preconnect" href={origin} crossOrigin="anonymous" />}
        {poster && (
          <link
            rel="preload"
            as="image"
            href={poster}
            fetchPriority="high"
          />
        )}
      </Head>

      <video
        ref={videoRef}
        playsInline
        /* Safe to keep: an element with no src never fetches, whatever
           autoplay says. It only takes effect once the effect above assigns a
           source, and it is what makes playback resume correctly if the page
           was opened in a background tab - the explicit play() there resolves
           without starting in a hidden tab, and nothing would retry it. */
        autoPlay
        muted
        loop
        preload="none"
        className={className}
        poster={poster}
        aria-hidden="true"
      />
    </>
  );
}
