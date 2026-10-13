/**
 * Tailwind v4 runs as a PostCSS plugin. There is no tailwind.config.js — the
 * whole theme is declared in CSS, in `styles/app.css`, under `@theme`.
 *
 * Content detection is automatic in v4: it walks the project from this file's
 * directory, honouring .gitignore, so `components/`, `pages/` and `lib/` are all
 * scanned without being listed anywhere.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
