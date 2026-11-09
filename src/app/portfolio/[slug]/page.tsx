"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileText,
  FolderKanban,
  GraduationCap,
  Layers,
  Link2,
  Search,
  Sparkles,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";

import icon from "../../../../public/icons/icon.png";

interface Project {
  id: number;
  title: string;
  description?: string | null;
  technologies?: string | null;
  project_url?: string | null;
  image_url?: string | null;
}

interface Transcript {
  id?: number | string;
  title?: string | null;
  file_url?: string | null;
}

interface Portfolio {
  id: number;
  public_slug: string;
  title?: string | null;
  bio_override?: string | null;
  bio?: string | null;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  program_name?: string | null;
  profile_photo_url?: string | null;
  projects?: Project[];
  transcripts?: Transcript[];
}

// API requests go through /api/proxy so the backend URL stays server-side.

const PRIMARY_BTN =
  "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-600/30 transition hover:brightness-110";

const BIO_EXCERPT_LENGTH = 240;

const NAV_LINKS = [
  { href: "#projects", id: "projects", label: "Projects" },
  { href: "#technologies", id: "technologies", label: "Technologies" },
  { href: "#transcripts", id: "transcripts", label: "Transcripts" },
];

// "top" is the hero; it clears the active nav item when you scroll back up.
const SECTION_IDS = ["top", "projects", "technologies", "transcripts"];

/* -------------------------------------------------------------------------- */
/*                         Motion: styles and small hooks                     */
/* -------------------------------------------------------------------------- */

// All keyframes live here so the page needs no Tailwind config changes.
// Every animation is wrapped in `prefers-reduced-motion: no-preference`,
// so people who ask for less motion get the final, static state.
const PAGE_CSS = `
@keyframes ps-rise { from { transform: translateY(105%); } to { transform: translateY(0); } }
@keyframes ps-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes ps-pop { from { opacity: 0; transform: scale(.86); } to { opacity: 1; transform: none; } }
@keyframes ps-spin { to { transform: rotate(360deg); } }
@keyframes ps-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes ps-drift-a { 0%, 100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(48px,36px,0) scale(1.14); } }
@keyframes ps-drift-b { 0%, 100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-56px,-30px,0) scale(1.1); } }
@keyframes ps-marquee { to { transform: translateX(-50%); } }
@keyframes ps-shimmer { to { transform: translateX(100%); } }
@keyframes ps-live { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,.55); } 100% { box-shadow: 0 0 0 8px rgba(16,185,129,0); } }
@keyframes ps-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes ps-fade-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes ps-sheet-in { from { opacity: 0; transform: translateY(28px) scale(.98); } to { opacity: 1; transform: none; } }
@keyframes ps-sheet-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(20px) scale(.98); } }

.ps-skeleton { position: relative; overflow: hidden; }
.ps-skeleton::after {
  content: ""; position: absolute; inset: 0; transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(148,163,184,.28), transparent);
}

@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }

  .ps-rise { animation: ps-rise .95s cubic-bezier(.2,.8,.2,1) both; animation-delay: var(--d, 0ms); }
  .ps-fade-up { animation: ps-fade-up .8s cubic-bezier(.2,.8,.2,1) both; animation-delay: var(--d, 0ms); }
  .ps-pop { animation: ps-pop .9s cubic-bezier(.2,.8,.2,1) both; animation-delay: var(--d, 0ms); }
  .ps-spin { animation: ps-spin 8s linear infinite; }
  .ps-float { animation: ps-float 5s ease-in-out infinite; }
  .ps-blob-a { animation: ps-drift-a 18s ease-in-out infinite; }
  .ps-blob-b { animation: ps-drift-b 22s ease-in-out infinite; }
  .ps-marquee-track { animation: ps-marquee 45s linear infinite; }
  .ps-marquee:hover .ps-marquee-track { animation-play-state: paused; }
  .ps-skeleton::after { animation: ps-shimmer 1.6s ease-in-out infinite; }
  .ps-live-dot { animation: ps-live 1.8s ease-out infinite; }
  .ps-swap { animation: ps-fade-in .35s ease both; }

  .ps-backdrop-in { animation: ps-fade-in .2s ease both; }
  .ps-backdrop-out { animation: ps-fade-out .18s ease both; }
  .ps-panel-in { animation: ps-sheet-in .38s cubic-bezier(.2,.8,.2,1) both; }
  .ps-panel-out { animation: ps-sheet-out .18s ease-in both; }

  .ps-reveal { transition: opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1); }
  .ps-reveal[data-in="false"] { opacity: 0; transform: translateY(22px) scale(.985); }
}

@media (prefers-reduced-motion: reduce) {
  .ps-bar-fill { transition: none !important; }
}
`;

function PageStyles() {
  return <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />;
}

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Becomes true once the element scrolls into view (and stays true). */
function useInView<T extends Element>(rootMargin = "0px 0px -6% 0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, inView] as const;
}

/** True once the page has scrolled past `threshold` pixels. */
function useScrolledPast(threshold: number) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const update = () => setPast(window.scrollY > threshold);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [threshold]);
  return past;
}

/** Id of the section currently crossing the middle of the viewport. */
function useActiveSection(ids: string[], enabled: boolean) {
  const [active, setActive] = useState("");
  const key = ids.join("|");

  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === "undefined") return;
    const nodes = key
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id === "top" ? "" : entry.target.id);
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [key, enabled]);

  return active;
}

/** Fades and lifts its children in when they scroll into view. */
function Reveal({
  children,
  delay: delayMs = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      data-in={inView ? "true" : "false"}
      className={`ps-reveal ${className}`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}

/** Counts up to `value` the first time it is visible. */
function CountUp({ value }: { value: number }) {
  const [ref, inView] = useInView<HTMLSpanElement>();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const duration = 1100;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <span ref={ref}>
      <span aria-hidden>{display}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}

/** Thin gradient bar at the top of the screen showing reading progress. */
function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const bar = barRef.current;
      if (!bar) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-sky-400 via-blue-500 to-sky-300"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

function getTechnologies(value?: string | null) {
  return (value || "")
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isExternalUrl(value?: string | null) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

// Same as above, but also allows site-relative links such as /uploads/transcript.pdf
function isLinkableUrl(value?: string | null) {
  if (!value) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  return isExternalUrl(value);
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function PublicPortfolioPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTech, setActiveTech] = useState("All");
  const [selected, setSelected] = useState<Project | null>(null);
  const [bioOpen, setBioOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrolled = useScrolledPast(24);
  const showTop = useScrolledPast(700);
  const activeSection = useActiveSection(SECTION_IDS, Boolean(portfolio));

  const loadPortfolio = useCallback(
    async (signal?: AbortSignal) => {
      if (!slug) return;
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/proxy?path=${encodeURIComponent(`/portfolios/public/${slug}`)}`, {
          signal,
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "This portfolio does not exist or has not been published yet."
              : data.message || data.error || "We couldn’t load this portfolio. Please try again."
          );
        }
        const base: Portfolio = data.portfolio ?? data;
        const result: Portfolio = {
          ...base,
          projects: data.projects ?? base.projects ?? [],
          transcripts: data.transcripts ?? base.transcripts ?? [],
        };
        setPortfolio(result);
        setImgError(false);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        setPortfolio(null);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [slug]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadPortfolio(controller.signal);
    return () => controller.abort();
  }, [loadPortfolio]);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const projects = useMemo(() => portfolio?.projects ?? [], [portfolio?.projects]);
  const transcripts = useMemo(() => portfolio?.transcripts ?? [], [portfolio?.transcripts]);

  // Technologies sorted by how many projects use them
  const technologies = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((project) => {
      new Set(getTechnologies(project.technologies)).forEach((tech) => {
        counts.set(tech, (counts.get(tech) || 0) + 1);
      });
    });
    return Array.from(counts, ([name, count]) => ({ name, count })).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name)
    );
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesTech = activeTech === "All" || getTechnologies(project.technologies).includes(activeTech);
      const searchable = `${project.title} ${project.description || ""} ${project.technologies || ""}`.toLowerCase();
      return matchesTech && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [projects, query, activeTech]);

  // A repeating strip of technology names for the hero (decorative)
  const marqueeItems = useMemo(() => {
    if (technologies.length === 0) return [];
    const repeats = Math.max(1, Math.ceil(8 / technologies.length));
    return Array.from({ length: repeats }, () => technologies).flat();
  }, [technologies]);

  const closeModal = useCallback(() => setSelected(null), []);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; fail silently
    }
  }, []);

  const resetFilters = () => {
    setQuery("");
    setActiveTech("All");
  };

  const selectTech = (name: string) => {
    const next = activeTech === name ? "All" : name;
    setActiveTech(next);
    if (next !== "All") document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  };

  /* ------------------------------ Loading state ------------------------------ */
  if (loading) {
    return (
      <main
        role="status"
        aria-busy="true"
        aria-label="Loading portfolio"
        className="min-h-[100dvh] bg-white dark:bg-[#080f1e]"
      >
        <PageStyles />
        <div className="h-16 bg-[#06142e]" />
        <div className="bg-[#06142e]">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-5 pb-24 pt-14 sm:px-8 md:flex-row md:gap-16 md:pt-20">
            <div className="ps-skeleton h-40 w-40 shrink-0 rounded-full bg-white/10 sm:h-52 sm:w-52" />
            <div className="w-full max-w-lg space-y-4">
              <div className="ps-skeleton h-7 w-48 rounded-full bg-white/10" />
              <div className="ps-skeleton h-14 w-3/4 rounded-lg bg-white/10" />
              <div className="ps-skeleton h-5 w-1/3 rounded bg-white/10" />
              <div className="ps-skeleton h-24 w-full rounded-2xl bg-white/10" />
            </div>
          </div>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl gap-6 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0d1729]"
            >
              <div className="ps-skeleton aspect-[16/11] bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-3 p-5">
                <div className="ps-skeleton h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="ps-skeleton h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
                <div className="ps-skeleton h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  /* ------------------------------- Error state ------------------------------- */
  if (error || !portfolio) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-b from-sky-50/70 to-slate-50 px-5 py-12 text-slate-900 dark:from-[#080f1e] dark:to-[#080f1e] dark:text-white">
        <PageStyles />
        <div
          role="alert"
          className="ps-pop w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-[#0d1729] sm:p-12"
        >
          <div className="ps-float mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
            <FolderKanban className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio unavailable</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
            {error || "We couldn’t find this student portfolio."}
          </p>
          <button
            onClick={() => void loadPortfolio()}
            className={`mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 ${PRIMARY_BTN}`}
          >
            Try again <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
          <div>
            <Link
              href="/"
              className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-slate-500 underline-offset-4 hover:text-sky-600 hover:underline dark:text-slate-400"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const studentName =
    portfolio.full_name ||
    `${portfolio.first_name || ""} ${portfolio.last_name || ""}`.trim() ||
    "Logos College Student";
  const nameWords = studentName.split(/\s+/).filter(Boolean);
  const biography = portfolio.bio_override || portfolio.bio || "";
  const initials = nameWords
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const hasBio = Boolean(biography);
  const bioIsLong = biography.length > BIO_EXCERPT_LENGTH;
  const bioText =
    bioIsLong && !bioOpen ? `${biography.slice(0, BIO_EXCERPT_LENGTH).trimEnd()}…` : biography;
  const showSearch = projects.length > 3;
  const filtersActive = query.trim() !== "" || activeTech !== "All";
  const featuredEnabled = !filtersActive && filteredProjects.length >= 4;

  // Hide zero stats so a brand-new portfolio doesn't open with "0 projects"
  const stats = (
    [
      { label: "Projects", value: projects.length, Icon: FolderKanban },
      { label: "Technologies", value: technologies.length, Icon: Layers },
      { label: "Transcripts", value: transcripts.length, Icon: GraduationCap },
    ] as { label: string; value: number; Icon: LucideIcon }[]
  ).filter((stat) => stat.value > 0);

  return (
    <main className="min-h-[100dvh] bg-white text-slate-900 selection:bg-sky-200 selection:text-sky-950 dark:bg-[#080f1e] dark:text-slate-100 dark:selection:bg-sky-800 dark:selection:text-white">
      <PageStyles />
      <ScrollProgress />

      {/* ------------------------------- Header ------------------------------- */}
      <header
        className={`sticky top-0 z-40 border-b border-white/10 text-white backdrop-blur-xl transition-[background-color,box-shadow] duration-300 ${
          scrolled ? "bg-[#06142e]/85 shadow-lg shadow-black/25" : "bg-[#06142e]"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30"
            aria-label="Logos College home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1.5 shadow-md shadow-black/20">
              <Image src={icon} alt="" width={26} height={26} className="object-contain" />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-semibold">Logos College</span>
              <span className="block text-xs font-medium text-sky-400">Student showcase</span>
            </span>
          </Link>

          <nav aria-label="Portfolio sections" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "location" : undefined}
                  className={`relative rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/40 ${
                    isActive ? "text-white" : "text-slate-300"
                  }`}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={`absolute inset-x-3 bottom-0.5 h-0.5 origin-left rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-transform duration-300 ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => void copyLink()}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/40"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-300" aria-hidden />
            ) : (
              <Link2 className="h-4 w-4" aria-hidden />
            )}
            <span className="hidden sm:inline">{copied ? "Link copied" : "Share"}</span>
            <span className="sr-only sm:hidden">{copied ? "Link copied" : "Copy portfolio link"}</span>
          </button>
          <span role="status" className="sr-only">
            {copied ? "Portfolio link copied to clipboard" : ""}
          </span>
        </div>
      </header>

      {/* --------------------------------- Hero -------------------------------- */}
      <section
        id="top"
        aria-labelledby="student-name"
        className="relative isolate overflow-hidden bg-[#06142e] pb-16 text-white"
      >
        {/* Drifting light, plus a faded dot grid */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="ps-blob-a absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-blue-600/40 blur-3xl" />
          <div className="ps-blob-b absolute -bottom-40 -right-24 h-[32rem] w-[32rem] rounded-full bg-sky-400/25 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              maskImage: "linear-gradient(to bottom, black, transparent 90%)",
              WebkitMaskImage: "linear-gradient(to bottom, black, transparent 90%)",
            }}
          />
        </div>

        <div className="mx-auto max-w-5xl px-5 pt-14 sm:px-8 sm:pt-20">
          <div className="flex flex-col items-center gap-10 text-center md:flex-row md:gap-16 md:text-left">
            {/* Round profile photo with a slowly sweeping light ring */}
            <div className="ps-pop relative shrink-0" style={delay(0)}>
              <div aria-hidden className="absolute -inset-6 rounded-full bg-sky-400/20 blur-2xl" />
              <div
                aria-hidden
                className="ps-spin absolute -inset-1.5 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, #38bdf8, #1d4ed8 35%, transparent 60%, #38bdf8)",
                }}
              />
              <div className="relative rounded-full bg-[#06142e] p-1.5">
                <div className="h-40 w-40 overflow-hidden rounded-full bg-[#0b2150] sm:h-52 sm:w-52 lg:h-60 lg:w-60">
                  {portfolio.profile_photo_url && !imgError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={portfolio.profile_photo_url}
                      alt={`${studentName} profile`}
                      onError={() => setImgError(true)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      {initials ? (
                        <span className="text-6xl font-bold text-sky-200">{initials}</span>
                      ) : (
                        <UserRound className="h-20 w-20 text-sky-200" aria-hidden />
                      )}
                    </div>
                  )}
                </div>
              </div>
              <span
                title="Logos College student"
                className="ps-float absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-[#06142e] sm:bottom-4 sm:right-4"
              >
                <BadgeCheck className="h-6 w-6 text-sky-600" aria-hidden />
                <span className="sr-only">Logos College student</span>
              </span>
            </div>

            {/* Introduction: one staged entrance, name first */}
            <div className="min-w-0 max-w-xl">
              {portfolio.program_name && (
                <p
                  className="ps-fade-up inline-flex max-w-full items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3.5 py-1.5 text-xs font-semibold text-sky-200"
                  style={delay(120)}
                >
                  <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{portfolio.program_name}</span>
                </p>
              )}

              <h1
                id="student-name"
                className="mt-4 break-words text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
              >
                {nameWords.map((word, index) => (
                  <Fragment key={`${word}-${index}`}>
                    {index > 0 ? " " : null}
                    <span className="inline-block overflow-hidden pb-[0.14em] align-bottom">
                      <span className="ps-rise inline-block" style={delay(200 + index * 90)}>
                        {word}
                      </span>
                    </span>
                  </Fragment>
                ))}
              </h1>

              <p
                className="ps-fade-up mt-3 bg-gradient-to-r from-sky-300 to-blue-400 bg-clip-text text-xl font-semibold text-transparent sm:text-2xl"
                style={delay(560)}
              >
                {portfolio.title || "Student Portfolio"}
              </p>

              {hasBio && (
                <div
                  className="ps-fade-up mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-left backdrop-blur"
                  style={delay(680)}
                >
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-300">{bioText}</p>
                  {bioIsLong && (
                    <button
                      type="button"
                      onClick={() => setBioOpen((open) => !open)}
                      aria-expanded={bioOpen}
                      className="mt-2 rounded text-xs font-semibold text-sky-300 underline underline-offset-4 hover:text-sky-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/40"
                    >
                      {bioOpen ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              )}

              <div
                className="ps-fade-up mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start"
                style={delay(820)}
              >
                <a
                  href="#projects"
                  className={`group inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/40 ${PRIMARY_BTN}`}
                >
                  View projects
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </a>
                {transcripts.length > 0 && (
                  <a
                    href="#transcripts"
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/40"
                  >
                    <FileText className="h-4 w-4" aria-hidden />
                    Transcripts
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative technology ticker (the real list is in the Technologies section) */}
        {marqueeItems.length > 0 && (
          <div
            aria-hidden
            className="ps-marquee relative mt-14 overflow-hidden border-y border-white/10 py-4"
            style={{
              maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            }}
          >
            <div className="ps-marquee-track flex w-max">
              {[...marqueeItems, ...marqueeItems].map((tech, index) => (
                <span
                  key={`${tech.name}-${index}`}
                  className="flex shrink-0 items-center gap-10 pr-10 text-sm font-semibold text-slate-300/80"
                >
                  {tech.name}
                  <span className="h-1.5 w-1.5 rotate-45 bg-sky-400/70" />
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Stats card overlaps the hero edge */}
      {stats.length > 0 && (
        <div className="relative z-10 mx-auto -mt-8 max-w-3xl px-5 sm:px-8">
          <Reveal>
            <dl
              className="grid divide-x divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-blue-950/10 dark:divide-white/10 dark:border-white/10 dark:bg-[#0d1729]"
              style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
            >
              {stats.map(({ label, value, Icon }) => (
                <div
                  key={label}
                  className="flex items-center justify-center gap-4 px-3 py-4 sm:px-6 sm:py-5"
                >
                  <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300 sm:flex">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="flex flex-col-reverse text-center sm:text-left">
                    <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</dt>
                    <dd className="text-2xl font-bold tracking-tight sm:text-3xl">
                      <CountUp value={value} />
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      )}

      {/* ------------------------------ Main content ------------------------------ */}
      <div className="mx-auto max-w-5xl space-y-20 px-5 py-16 sm:space-y-24 sm:px-8 sm:py-20">
        {/* Projects */}
        <section id="projects" aria-labelledby="projects-heading" className="scroll-mt-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading icon={FolderKanban} title="Projects" id="projects-heading">
              {projects.length > 0 && (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
                  {filtersActive
                    ? `Showing ${filteredProjects.length} of ${projects.length}`
                    : `${projects.length} ${projects.length === 1 ? "project" : "projects"} by this student`}
                </p>
              )}
            </SectionHeading>

            {showSearch && (
              <div className="relative w-full sm:max-w-xs">
                <label htmlFor="project-search" className="sr-only">
                  Search projects
                </label>
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  id="project-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search projects"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-base outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white sm:text-sm [&::-webkit-search-cancel-button]:appearance-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>
            )}
          </div>

          {activeTech !== "All" && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setActiveTech("All")}
                className="ps-pop inline-flex min-h-9 items-center gap-2 rounded-full bg-sky-50 px-3.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300"
              >
                Technology: {activeTech}
                <X className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only">Clear technology filter</span>
              </button>
            </div>
          )}

          {projects.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center dark:border-white/15 dark:bg-white/[0.025]">
              <div className="ps-float mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
                <Code2 className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-5 text-lg font-bold">No projects yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                Projects will appear here when this student adds them to their portfolio.
              </p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="ps-pop mt-8 rounded-2xl bg-slate-100 px-6 py-14 text-center dark:bg-white/5">
              <Search className="mx-auto h-8 w-8 text-slate-400" aria-hidden />
              <h3 className="mt-4 font-bold">No matching projects</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Try another search or choose a different technology.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 min-h-11 rounded-xl border border-slate-300 px-5 text-sm font-semibold transition hover:border-sky-400 hover:text-sky-600 dark:border-white/10 dark:hover:text-sky-300"
              >
                Clear filters
              </button>
            </div>
          ) : (
            // Keyed by technology so the cards re-enter when the filter changes
            <div key={activeTech} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project, index) => {
                const featured = featuredEnabled && index === 0;
                return (
                  <Reveal
                    key={project.id}
                    delay={featured ? 0 : (index % 3) * 90}
                    className={`h-full min-w-0 ${featured ? "sm:col-span-2 lg:col-span-3" : ""}`}
                  >
                    <ProjectCard project={project} onOpen={setSelected} featured={featured} />
                  </Reveal>
                );
              })}
            </div>
          )}
        </section>

        {/* Technologies */}
        <section id="technologies" aria-labelledby="technologies-heading" className="scroll-mt-24">
          <SectionHeading icon={Layers} title="Technologies" id="technologies-heading">
            {technologies.length > 0 && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Tools and languages used across projects. The shading shows how often each one appears. Select one to
                filter.
              </p>
            )}
          </SectionHeading>

          {technologies.length > 0 ? (
            <TechnologyCloud technologies={technologies} activeTech={activeTech} onSelect={selectTech} />
          ) : (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No technologies listed yet.</p>
          )}
        </section>

        {/* Transcripts */}
        <section id="transcripts" aria-labelledby="transcripts-heading" className="scroll-mt-24">
          <SectionHeading icon={GraduationCap} title="Transcripts" id="transcripts-heading">
            {transcripts.length > 0 && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Records issued by Logos College.</p>
            )}
          </SectionHeading>

          {transcripts.length > 0 ? (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {transcripts.map((transcript, index) => (
                <TranscriptCard key={transcript.id ?? index} transcript={transcript} index={index} />
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No transcripts available yet.</p>
          )}
        </section>
      </div>

      {/* --------------------------------- Footer -------------------------------- */}
      <footer className="bg-[#06142e] text-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="flex flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30"
              aria-label="Logos College home"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1.5 shadow-md shadow-black/20">
                <Image src={icon} alt="" width={28} height={28} className="object-contain" />
              </span>
              <span className="text-left leading-tight">
                <span className="block text-base font-semibold">Logos College</span>
                <span className="block text-xs font-medium text-sky-300/80">Excellence in Education</span>
              </span>
            </Link>

            <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex min-h-11 items-center text-sm font-medium text-slate-300 transition hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <a
              href="#top"
              onClick={(event) => {
                event.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-sm font-semibold transition hover:bg-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/40"
            >
              Back to top <ArrowUp className="h-4 w-4" aria-hidden />
            </a>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-slate-400 md:text-left">
            © {new Date().getFullYear()} Logos College. Student portfolio showcase. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Floating back-to-top button */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        aria-hidden={!showTop}
        tabIndex={showTop ? 0 : -1}
        className={`fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full text-white transition duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/50 ${PRIMARY_BTN} ${
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <ArrowUp className="h-5 w-5" aria-hidden />
      </button>

      {selected && (
        <ProjectModal project={selected} projects={filteredProjects} onSelect={setSelected} onClose={closeModal} />
      )}
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Section heading                              */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  icon: Icon,
  title,
  id,
  children,
}: {
  icon: LucideIcon;
  title: string;
  id: string;
  children?: ReactNode;
}) {
  return (
    <Reveal>
      <div className="flex items-start gap-4">
        <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-600/25">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 id={id} className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </Reveal>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Technology chips                             */
/* -------------------------------------------------------------------------- */

function TechnologyCloud({
  technologies,
  activeTech,
  onSelect,
}: {
  technologies: { name: string; count: number }[];
  activeTech: string;
  onSelect: (name: string) => void;
}) {
  const [ref, shown] = useInView<HTMLDivElement>();
  const max = Math.max(...technologies.map((tech) => tech.count), 1);

  return (
    <div
      ref={ref}
      role="group"
      aria-label="Filter projects by technology"
      className="mt-6 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-white/[0.025] sm:p-6"
    >
      {technologies.map(({ name, count }, index) => (
        <TechChip
          key={name}
          name={name}
          count={count}
          ratio={count / max}
          index={index}
          shown={shown}
          active={activeTech === name}
          onToggle={() => onSelect(name)}
        />
      ))}
    </div>
  );
}

function TechChip({
  name,
  count,
  ratio,
  index,
  shown,
  active,
  onToggle,
}: {
  name: string;
  count: number;
  ratio: number;
  index: number;
  shown: boolean;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={`relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-xl px-5 text-sm font-medium transition duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/25 motion-reduce:hover:translate-y-0 ${
        active
          ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-600/25"
          : "border border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-sky-400/40 dark:hover:text-sky-300"
      }`}
    >
      {!active && (
        <span
          aria-hidden
          className="ps-bar-fill absolute inset-y-0 left-0 bg-sky-500/10 transition-[width] duration-1000 ease-out dark:bg-sky-400/10"
          style={{
            width: shown ? `${Math.round(Math.max(0.15, ratio) * 100)}%` : "0%",
            transitionDelay: `${Math.min(index, 12) * 50}ms`,
          }}
        />
      )}
      <span className="relative">{name}</span>
      <span
        className={`relative rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Transcript card                              */
/* -------------------------------------------------------------------------- */

function TranscriptCard({ transcript, index }: { transcript: Transcript; index: number }) {
  const href = isLinkableUrl(transcript.file_url) ? transcript.file_url! : null;
  const label = transcript.title || `Transcript ${index + 1}`;

  const content = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition-colors duration-300 group-hover:bg-sky-600 group-hover:text-white dark:bg-sky-500/10 dark:text-sky-300 dark:group-hover:bg-sky-500 dark:group-hover:text-white">
        <FileText className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{label}</span>
        <span className="block text-xs text-slate-500 dark:text-slate-400">
          {href ? "Academic transcript" : "File unavailable"}
        </span>
      </span>
      {href && (
        <ArrowUpRight
          className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sky-600 dark:group-hover:text-sky-300"
          aria-hidden
        />
      )}
    </>
  );

  const cardClass =
    "group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0d1729]";

  return (
    <li>
      <Reveal delay={Math.min(index, 5) * 70}>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${cardClass} transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg hover:shadow-blue-950/[0.06] focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:hover:border-sky-400/30`}
          >
            {content}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <div className={cardClass}>{content}</div>
        )}
      </Reveal>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Project card                                */
/* -------------------------------------------------------------------------- */

function ProjectCard({
  project,
  onOpen,
  featured = false,
}: {
  project: Project;
  onOpen: (project: Project) => void;
  featured?: boolean;
}) {
  const tech = getTechnologies(project.technologies);
  const hasLive = isExternalUrl(project.project_url);
  const maxTech = featured ? 6 : 3;

  // Feeds the cursor-following glow (see the overlay below)
  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    // The title button stretches over the whole card (after:absolute), so the card has a single tab stop.
    <article
      onPointerMove={handlePointerMove}
      className={`group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 focus-within:ring-4 focus-within:ring-sky-500/30 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-blue-950/[0.08] motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-white/10 dark:bg-[#0d1729] dark:hover:border-sky-400/30 ${
        featured ? "md:flex-row" : ""
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), rgba(56,189,248,0.16), transparent 65%)",
        }}
      />

      <div
        className={`relative aspect-[16/11] overflow-hidden bg-slate-100 dark:bg-slate-900 ${
          featured ? "md:aspect-auto md:min-h-[22rem] md:w-1/2" : ""
        }`}
      >
        {project.image_url ? (
          <ProjectImage src={project.image_url} title={project.title} fit="cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/30">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm dark:bg-white/5 dark:text-sky-300">
              <Code2 className="h-6 w-6" aria-hidden />
            </div>
          </div>
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        {hasLive && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-sm backdrop-blur">
            <span aria-hidden className="ps-live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        )}
      </div>

      <div className={`flex flex-1 flex-col p-5 ${featured ? "md:justify-center md:p-10" : ""}`}>
        {featured && (
          <p className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Featured project
          </p>
        )}

        <h3 className={`text-lg font-bold leading-snug tracking-tight ${featured ? "md:text-3xl" : ""}`}>
          <button
            type="button"
            onClick={() => onOpen(project)}
            aria-haspopup="dialog"
            className="cursor-pointer text-left transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-sky-600 focus:outline-none dark:group-hover:text-sky-300"
          >
            {project.title}
          </button>
        </h3>

        <p
          className={`mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400 ${
            featured ? "line-clamp-2 md:line-clamp-4 md:text-base md:leading-7" : "line-clamp-2"
          }`}
        >
          {project.description || "A project built as part of this student’s practical work."}
        </p>

        {tech.length > 0 && (
          <ul aria-label="Technologies used" className="mt-4 flex flex-wrap gap-1.5">
            {tech.slice(0, maxTech).map((item) => (
              <li
                key={item}
                className="rounded-md bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-200"
              >
                {item}
              </li>
            ))}
            {tech.length > maxTech && (
              <li className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-400">
                +{tech.length - maxTech}
              </li>
            )}
          </ul>
        )}

        <span
          aria-hidden
          className={`mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-slate-700 transition group-hover:text-sky-600 dark:text-slate-200 dark:group-hover:text-sky-300 ${
            featured ? "md:mt-6 md:pt-0" : ""
          }`}
        >
          View details{" "}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Project details                              */
/* -------------------------------------------------------------------------- */

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function ProjectModal({
  project,
  projects,
  onSelect,
  onClose,
}: {
  project: Project;
  projects: Project[];
  onSelect: (project: Project) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closingRef = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [closing, setClosing] = useState(false);

  const tech = getTechnologies(project.technologies);
  const liveUrl = isExternalUrl(project.project_url) ? project.project_url! : null;
  const index = projects.findIndex((item) => item.id === project.id);
  const canNavigate = index !== -1 && projects.length > 1;

  // Latest props for the long-lived keyboard handler (keeps the setup effect from re-running)
  const latest = useRef({ onClose, onSelect, projects, index });
  useEffect(() => {
    latest.current = { onClose, onSelect, projects, index };
  });

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    closeTimer.current = setTimeout(() => latest.current.onClose(), prefersReducedMotion() ? 0 : 180);
  }, []);

  const go = useCallback((direction: 1 | -1) => {
    const { projects: list, index: current, onSelect: select } = latest.current;
    if (current === -1 || list.length < 2) return;
    select(list[(current + direction + list.length) % list.length]);
  }, []);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        requestClose();
        return;
      }
      if (event.key === "ArrowRight") {
        go(1);
        return;
      }
      if (event.key === "ArrowLeft") {
        go(-1);
        return;
      }
      // Keep keyboard focus inside the dialog
      if (event.key === "Tab" && dialogRef.current) {
        const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [requestClose, go]);

  // Start each project at the top when moving between them
  useEffect(() => {
    dialogRef.current?.scrollTo({ top: 0 });
  }, [project.id]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 backdrop-blur-sm sm:items-center sm:p-6 ${
        closing ? "ps-backdrop-out" : "ps-backdrop-in"
      }`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        className={`relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-t-3xl bg-white shadow-2xl dark:bg-[#0d1729] sm:rounded-3xl ${
          closing ? "ps-panel-out" : "ps-panel-in"
        }`}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={requestClose}
          aria-label="Close project details"
          className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/60 text-white backdrop-blur transition hover:bg-slate-950/80 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/50"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        {/* Re-keyed per project so content fades in when you move to the next one */}
        <div key={project.id} className="ps-swap">
          {project.image_url && (
            <div className="aspect-[16/9] w-full bg-slate-100 dark:bg-slate-900">
              <ProjectImage src={project.image_url} title={project.title} fit="contain" />
            </div>
          )}

          <div className="p-6 sm:p-8">
            <div aria-hidden className="mb-4 h-1 w-14 rounded-full bg-gradient-to-r from-sky-400 to-blue-600" />
            <h2 className="pr-10 text-2xl font-bold tracking-tight sm:text-3xl">{project.title}</h2>

            {tech.length > 0 && (
              <ul aria-label="Technologies used" className="mt-4 flex flex-wrap gap-1.5">
                {tech.map((item) => (
                  <li
                    key={item}
                    className="rounded-md bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-200"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
              {project.description || "A project built as part of this student’s practical work."}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              {liveUrl ? (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 ${PRIMARY_BTN}`}
                >
                  View live project <ArrowUpRight className="h-4 w-4" aria-hidden />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <span className="text-sm text-slate-400">No live link provided for this project.</span>
              )}
              <button
                type="button"
                onClick={requestClose}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {canNavigate && (
          <div className="mx-6 flex items-center justify-between gap-3 border-t border-slate-200 py-4 dark:border-white/10 sm:mx-8">
            <button
              type="button"
              onClick={() => go(-1)}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-sky-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-sky-300"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Previous
            </button>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400" aria-live="polite">
              {index + 1} of {projects.length}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-sky-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-sky-300"
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectImage({ src, title, fit }: { src: string; title: string; fit: "cover" | "contain" }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Code2 className="h-10 w-10 text-sky-500/70 dark:text-sky-300/60" aria-hidden />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${title} preview`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`h-full w-full transition-transform duration-500 motion-reduce:transition-none ${
        fit === "cover" ? "object-cover object-top group-hover:scale-[1.04]" : "object-contain p-3"
      }`}
    />
  );
}