import { useEffect, useRef } from "react";

/**
 * The CTA's energy field — a grid of points rolling under a travelling wave,
 * with a few drifting motes above it.
 *
 * THIS IS EVSWORLDWIDE'S CTA BACKGROUND, REBUILT WITHOUT THREE.JS. Over there
 * it is `components/homepage/CtaBackground.js`: an `@react-three/fiber` canvas
 * holding a 120 x 70 `<points>` field, ninety motes and a slowly swaying rig.
 * Every number below is copied from it — the grid, the gap, the wave, the
 * camera, the fog, the point sizes, the two colours, the sway. What changed is
 * the renderer, not the picture.
 *
 * WHY NOT JUST INSTALL THREE. `three` plus `@react-three/fiber` is about 170 kB
 * gzipped, and it would be shipped on EVERY page, because this block renders
 * beside the footer in `_app.js`. That is more JavaScript than the rest of this
 * site puts together, for one decorative panel. The whole scene is 8,400 points
 * with no lights, no materials, no depth test and no interaction, so the part of
 * three.js actually being used here is a perspective divide.
 *
 * SO THE PROJECTION IS DONE BY HAND, exactly as three would do it:
 *
 *   1. the rig's Euler XYZ rotation, which with `rotation.z = 0` is Rx · Ry;
 *   2. into view space against a camera at (0, 5, 11) looking at the origin,
 *      which is what R3F points its default camera at;
 *   3. a 50° vertical FOV perspective divide;
 *   4. `gl_PointSize = size * (height / 2) / depth`, three's own size
 *      attenuation, so the dots grow towards the camera the same way;
 *   5. linear fog from 7 to 22 units. Three mixes the colour towards the fog
 *      colour; with additive blending against a near-black page that is the
 *      same thing as fading the point out, so it is applied as alpha.
 *
 * `globalCompositeOperation = "lighter"` is the additive blending, which is
 * what makes the crests brighten where the dots crowd together.
 *
 * IT DOES NOT RUN WHEN IT CANNOT BE SEEN. The observer starts the loop when the
 * section scrolls in and stops it when it leaves, so a reader parked at the top
 * of a long page is not paying for a 60 fps canvas at the bottom of it.
 *
 * REDUCED MOTION GETS ONE FRAME. The field is drawn once, at t = 0, and left
 * there — the texture survives, the movement does not.
 */

/* ---- the scene, verbatim from CtaBackground.js ---- */
const COLS = 120;
const ROWS = 70;
const GAP = 0.34;
const MOTE_COUNT = 90;

const CAM_Y = 5;
const CAM_Z = 11;
const FOV = 50;

const FOG_NEAR = 7;
const FOG_FAR = 22;

const WAVE_COLOR = "#8dc63f";
const WAVE_SIZE = 0.05;
const WAVE_OPACITY = 0.85;

const MOTE_COLOR = "#d8ff9e";
const MOTE_SIZE = 0.07;
const MOTE_OPACITY = 0.5;

/* Camera basis for `lookAt(0, 0, 0)` from (0, CAM_Y, CAM_Z) with +Y up. The X
   axis comes out as (1, 0, 0) because the camera sits on the YZ plane, so the
   view transform is two dot products and a subtraction. */
const CAM_LEN = Math.hypot(CAM_Y, CAM_Z);
const ZA_Y = CAM_Y / CAM_LEN;
const ZA_Z = CAM_Z / CAM_LEN;
/* yAxis = cross(zAxis, xAxis) */
const YA_Y = ZA_Z;
const YA_Z = -ZA_Y;

/** 1 / tan(fov / 2) — the vertical half-height of the frustum at unit depth. */
const FOCAL = 1 / Math.tan(((FOV / 2) * Math.PI) / 180);

export default function CtaWaveField({ className }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    /* ---- the grid, built once ---- */
    /* Only x and z are stored: y is the wave, so it changes every frame. */
    const gridX = new Float32Array(COLS);
    const gridZ = new Float32Array(ROWS);
    for (let i = 0; i < COLS; i++) gridX[i] = (i - COLS / 2) * GAP;
    for (let j = 0; j < ROWS; j++) gridZ[j] = (j - ROWS / 2) * GAP;

    /* THE WAVE IS THREE TERMS AND EACH ONE IS SEPARABLE — the first depends
       only on x, the second only on z, the third only on their sum — so the
       8,400 points need 380 trig calls a frame between them rather than 25,200.
       The picture is identical; this is arithmetic, not an approximation. */
    const termX = new Float32Array(COLS);
    const termZ = new Float32Array(ROWS);
    const termSum = new Float32Array(COLS + ROWS);

    /* ---- the motes ---- */
    const motes = new Float32Array(MOTE_COUNT * 3);
    for (let i = 0; i < MOTE_COUNT; i++) {
      motes[i * 3] = (Math.random() - 0.5) * 26;
      motes[i * 3 + 1] = Math.random() * 6 + 0.5;
      motes[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }

    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /* Everything below works in CSS pixels; the transform above handles the
       device ratio. `scale` is three's point-size uniform: half the viewport
       height. `minDot` keeps the farthest points from disappearing into a
       sub-pixel rectangle, which is the one thing a GPU does better here. */
    const draw = (t) => {
      const scale = h / 2;
      const minDot = 1 / dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      /* the rig's sway */
      const rotX = -0.32 + Math.sin(t * 0.15) * 0.04;
      const rotY = Math.sin(t * 0.1) * 0.16;
      const cx = Math.cos(rotX);
      const sx = Math.sin(rotX);
      const cy = Math.cos(rotY);
      const sy = Math.sin(rotY);

      const aspect = w / h;
      const fx = (FOCAL / aspect) * 0.5 * w;
      const fy = FOCAL * 0.5 * h;

      /* A point in world space, through the rig and the camera, onto the
          canvas. Returns 0 when it is behind the camera or past the fog. */
      const project = (x, y, z, size, opacity) => {
        /* rig: Ry then Rx */
        const x1 = x * cy + z * sy;
        const z1 = z * cy - x * sy;
        const y2 = y * cx - z1 * sx;
        const z2 = y * sx + z1 * cx;

        /* view */
        const dy = y2 - CAM_Y;
        const dz = z2 - CAM_Z;
        const depth = -(dy * ZA_Y + dz * ZA_Z);
        if (depth <= 0.1 || depth >= FOG_FAR) return 0;

        const alpha = ((FOG_FAR - depth) / (FOG_FAR - FOG_NEAR)) * opacity;
        if (alpha <= 0.004) return 0;

        const vy = dy * YA_Y + dz * YA_Z;
        const sxp = w * 0.5 + (x1 * fx) / depth;
        const syp = h * 0.5 - (vy * fy) / depth;
        const d = Math.max((size * scale) / depth, minDot);

        ctx.globalAlpha = alpha > 1 ? 1 : alpha;
        ctx.fillRect(sxp - d * 0.5, syp - d * 0.5, d, d);
        return 1;
      };

      /* ---- the wave ---- */
      for (let i = 0; i < COLS; i++) termX[i] = Math.sin(gridX[i] * 0.45 + t) * 0.6;
      for (let j = 0; j < ROWS; j++) termZ[j] = Math.cos(gridZ[j] * 0.4 + t * 0.8) * 0.45;
      for (let k = 0; k < COLS + ROWS; k++) {
        const sum = (k - (COLS + ROWS) / 2) * GAP;
        termSum[k] = Math.sin(sum * 0.3 + t * 1.3) * 0.3;
      }

      ctx.fillStyle = WAVE_COLOR;
      for (let i = 0; i < COLS; i++) {
        const x = gridX[i];
        const a = termX[i];
        for (let j = 0; j < ROWS; j++) {
          project(x, a + termZ[j] + termSum[i + j], gridZ[j], WAVE_SIZE, WAVE_OPACITY);
        }
      }

      /* ---- the motes ----
         They have a rotation of their own inside the rig, so the two compose:
         spin about Y first, then everything above. */
      const my = t * 0.03;
      const mc = Math.cos(my);
      const ms = Math.sin(my);
      ctx.fillStyle = MOTE_COLOR;
      for (let i = 0; i < MOTE_COUNT; i++) {
        const x = motes[i * 3];
        const z = motes[i * 3 + 2];
        project(x * mc + z * ms, motes[i * 3 + 1], z * mc - x * ms, MOTE_SIZE, MOTE_OPACITY);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    let raf = 0;
    let start = 0;
    let running = false;

    const frame = (now) => {
      if (!start) start = now;
      draw((now - start) / 1000);
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const play = () => {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };

    resize();
    draw(0);

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw(0);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? play() : stop()),
      { threshold: 0 },
    );
    io.observe(canvas);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
