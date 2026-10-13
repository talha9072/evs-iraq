/**
 * The icon set.
 *
 * WHAT THIS REPLACES. Five icon fonts — Font Awesome, Feather, Themify, Icomoon
 * and Bootstrap Icons — shipped together in `icon.min.css`: 222 KB of CSS plus
 * eight font files, for perhaps forty distinct glyphs across the whole site.
 *
 * Icons are re-exported from `lucide-react` rather than named directly in
 * components, for two reasons. It keeps one list of every glyph the site uses,
 * which is what stops the set sprawling the way the five fonts did; and it means
 * the site's own vocabulary (`Phone`, `Directions`, `Rating`) is what components
 * import, so swapping the underlying glyph is an edit here rather than a
 * find-and-replace across sixty files.
 *
 * Tree-shaken: only what this file exports ends up in the bundle.
 *
 * USAGE. Size comes from a `h-*`/`w-*` utility and colour from `text-*` — the
 * same two knobs as text, because lucide draws on `currentColor`. Icons are
 * decorative by default; pass `aria-label` where an icon is the only label.
 *
 *   <Phone className="h-4 w-4 text-brand-500" />
 */

export {
  // Navigation and chrome
  ChevronDown as Chevron,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  Menu,
  X as Close,
  Plus,
  Check,
  Search,

  // Contact
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,

  // Content
  Star,
  Quote,
  Calendar,
  ChevronLeft,

  // EV and workshop vocabulary — the glyphs the services, brands and warranty
  // pages need. Named for what they mean here, not for what lucide calls them.
  BatteryCharging as Battery,
  Zap as Charge,
  Wrench,
  ShieldCheck as Warranty,
  Gauge as Diagnostics,
  CircleDot as Tyre,
  Car,
  Truck as Recovery,
  Snowflake as Climate,
  CircuitBoard as Electronics,
  Cpu as Software,
  LifeBuoy as Support,
  Building2 as Branch,
  // The footer marks every EVS Network site with its country flag.
  // evsworldwide.com is the group site rather than a country, so it has no
  // flag to fly and gets this instead.
  Globe,
  Users as Team,
  Award,
  ThumbsUp,

  // Social. lucide dropped brand marks in v1, so these are the closest generic
  // stand-ins — the footer overrides them with real wordmarks below.
  Share2,
} from "lucide-react";

/* ---------------------------------------------------------------------------
   SOCIAL MARKS
   Kept as hand-authored SVG rather than lucide. These are logos, not icons:
   lucide removed brand glyphs in v1 on trademark grounds, and a stroked
   approximation of a wordmark reads as wrong next to the real thing.
   ------------------------------------------------------------------------ */
function Brand({ children, className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export const Facebook = (p) => (
  <Brand {...p}><path d="M14 8.5V7c0-.8.2-1.2 1.3-1.2H17V3h-2.6C11.5 3 10.6 4.4 10.6 6.8v1.7H8.7V11h1.9v10H14V11h2.3l.4-2.5Z" /></Brand>
);

export const Instagram = (p) => (
  <Brand {...p}><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2 0 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.8s0 3.5-.1 4.8c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.5 2.2 15.1 2.2 12s0-3.5.1-4.8c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.8-.1Zm0 3.3a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0 10.7a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4Zm6.8-11a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></Brand>
);

export const Linkedin = (p) => (
  <Brand {...p}><path d="M6.9 21H3.3V9.3h3.6V21ZM5.1 7.7a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2ZM21 21h-3.6v-5.7c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3v5.8H9.7V9.3h3.4V11h.1a3.8 3.8 0 0 1 3.4-1.9c3.6 0 4.3 2.4 4.3 5.5V21Z" /></Brand>
);

export const Tiktok = (p) => (
  <Brand {...p}><path d="M16.5 2h-3.2v13.2a2.7 2.7 0 1 1-2.7-2.7c.3 0 .6 0 .8.1V9.3a6 6 0 1 0 5.1 5.9V8.5a7 7 0 0 0 4 1.3V6.5a3.9 3.9 0 0 1-4-4.5Z" /></Brand>
);

export const Whatsapp = (p) => (
  <Brand {...p}><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.5.1l-.8.9c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5s0-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4 5.3 5.3 0 0 0 3.2.7 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" /></Brand>
);

/** Lookup used by the footer, which gets its accounts as `{ key, href }` rows. */
export const SOCIAL_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  tiktok: Tiktok,
  whatsapp: Whatsapp,
};
