"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  Code2,
  FileText,
  FolderKanban,
  Link2,
  Search,
  UserRound,
  X,
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
  { href: "#projects", label: "Projects" },
  { href: "#technologies", label: "Technologies" },
  { href: "#transcripts", label: "Transcripts" },
];

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
        <div className="h-16 bg-[#06142e]" />
        <div className="animate-pulse motion-reduce:animate-none">
          <div className="bg-sky-50/70 dark:bg-white/[0.03]">
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-5 py-14 sm:px-8 md:flex-row md:gap-16 md:py-20">
              <div className="h-40 w-40 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800 sm:h-52 sm:w-52" />
              <div className="w-full max-w-lg space-y-4">
                <div className="h-7 w-48 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="h-14 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-5 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-24 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          </div>
          <div className="mx-auto mt-14 grid max-w-5xl gap-6 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0d1729]"
              >
                <div className="aspect-[16/11] bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  /* ------------------------------- Error state ------------------------------- */
  if (error || !portfolio) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-b from-sky-50/70 to-slate-50 px-5 py-12 text-slate-900 dark:from-[#080f1e] dark:to-[#080f1e] dark:text-white">
        <div
          role="alert"
          className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5 animate-in fade-in zoom-in-95 duration-500 dark:border-white/10 dark:bg-[#0d1729] sm:p-12"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
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
  const biography = portfolio.bio_override || portfolio.bio || "";
  const initials = studentName
    .split(/\s+/)
    .filter(Boolean)
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

  // Hide zero stats so a brand-new portfolio doesn't open with "0 projects"
  const stats = (
    [
      ["Projects", projects.length],
      ["Technologies", technologies.length],
      ["Transcripts", transcripts.length],
    ] as [string, number][]
  ).filter(([, value]) => value > 0);

  return (
    <main className="min-h-[100dvh] bg-white text-slate-900 selection:bg-sky-200 selection:text-sky-950 dark:bg-[#080f1e] dark:text-slate-100 dark:selection:bg-sky-800 dark:selection:text-white">
      {/* ------------------------------- Header ------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#06142e]/90 text-white backdrop-blur-xl">
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
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/40"
              >
                {link.label}
              </a>
            ))}
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
        aria-labelledby="student-name"
        className="relative isolate overflow-hidden border-b border-slate-200 bg-gradient-to-b from-sky-50 via-white to-white dark:border-white/10 dark:from-[#0b1a38] dark:via-[#080f1e] dark:to-[#080f1e]"
      >
        {/* Decorative dot grid + glow */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-60 dark:hidden"
          style={{
            backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "linear-gradient(to bottom, black, transparent 85%)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 hidden opacity-[0.08] dark:block"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "linear-gradient(to bottom, black, transparent 85%)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-sky-300/30 blur-3xl dark:bg-blue-500/20"
        />

        <div className="mx-auto max-w-5xl px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16 md:pt-20">
          <div className="flex flex-col items-center gap-10 text-center md:flex-row md:gap-16 md:text-left">
            {/* Round profile photo */}
            <div className="relative shrink-0 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-700">
              <div className="rounded-full bg-gradient-to-br from-sky-400 to-blue-600 p-1 shadow-2xl shadow-blue-600/25">
                <div className="h-40 w-40 overflow-hidden rounded-full bg-white ring-4 ring-white dark:bg-[#0b2150] dark:ring-[#080f1e] sm:h-52 sm:w-52">
                  {portfolio.profile_photo_url && !imgError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={portfolio.profile_photo_url}
                      alt={`${studentName} profile`}
                      onError={() => setImgError(true)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-sky-50 dark:bg-[#0b2150]">
                      {initials ? (
                        <span className="text-6xl font-bold text-sky-600 dark:text-sky-200">{initials}</span>
                      ) : (
                        <UserRound className="h-20 w-20 text-sky-600 dark:text-sky-200" aria-hidden />
                      )}
                    </div>
                  )}
                </div>
              </div>
              <span
                title="Logos College student"
                className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-slate-200 dark:bg-[#0d1729] dark:ring-white/10 sm:bottom-3 sm:right-3"
              >
                <BadgeCheck className="h-6 w-6 text-sky-600 dark:text-sky-300" aria-hidden />
                <span className="sr-only">Logos College student</span>
              </span>
            </div>

            {/* Introduction */}
            <div className="min-w-0 max-w-xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-700">
              {portfolio.program_name && (
                <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-sky-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-sky-700 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
                  <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{portfolio.program_name}</span>
                </p>
              )}

              <h1
                id="student-name"
                className="mt-4 break-words text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
              >
                {studentName}
              </h1>

              <p className="mt-3 bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-xl font-semibold text-transparent dark:from-sky-300 dark:to-blue-400 sm:text-2xl">
                {portfolio.title || "Student Portfolio"}
              </p>

              {hasBio && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-5 text-left shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">{bioText}</p>
                  {bioIsLong && (
                    <button
                      type="button"
                      onClick={() => setBioOpen((open) => !open)}
                      aria-expanded={bioOpen}
                      className="mt-2 rounded text-xs font-semibold text-sky-600 underline underline-offset-4 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 dark:text-sky-300"
                    >
                      {bioOpen ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              )}

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <a
                  href="#projects"
                  className={`group inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 ${PRIMARY_BTN}`}
                >
                  View projects
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </a>
                {transcripts.length > 0 && (
                  <a
                    href="#transcripts"
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 dark:border-white/15 dark:bg-transparent dark:text-slate-200 dark:hover:text-sky-300"
                  >
                    <FileText className="h-4 w-4" aria-hidden />
                    Transcripts
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats strip */}
          {stats.length > 0 && (
            <dl className="mx-auto mt-12 flex max-w-2xl divide-x divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.04]">
              {stats.map(([label, value]) => (
                <div key={label} className="flex flex-1 flex-col-reverse items-center px-3 py-4 text-center">
                  <dt className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    {label}
                  </dt>
                  <dd className="text-2xl font-bold tracking-tight sm:text-3xl">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* ------------------------------ Main content ------------------------------ */}
      <div className="mx-auto max-w-5xl space-y-20 px-5 py-16 sm:space-y-24 sm:px-8 sm:py-20">
        {/* Projects */}
        <section id="projects" aria-labelledby="projects-heading" className="scroll-mt-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Portfolio" title="Projects" id="projects-heading">
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
                className="inline-flex min-h-9 items-center gap-2 rounded-full bg-sky-50 px-3.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300"
              >
                Technology: {activeTech}
                <X className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only">Clear technology filter</span>
              </button>
            </div>
          )}

          {projects.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center dark:border-white/15 dark:bg-white/[0.025]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
                <Code2 className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-5 text-lg font-bold">No projects yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                Projects will appear here when this student adds them to their portfolio.
              </p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-slate-100 px-6 py-14 text-center dark:bg-white/5">
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
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onOpen={setSelected} />
              ))}
            </div>
          )}
        </section>

        {/* Technologies */}
        <section id="technologies" aria-labelledby="technologies-heading" className="scroll-mt-24">
          <SectionHeading eyebrow="Skills" title="Technologies" id="technologies-heading">
            {technologies.length > 0 && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Tools and languages used across projects. Select one to filter.
              </p>
            )}
          </SectionHeading>

          {technologies.length > 0 ? (
            <div
              role="group"
              aria-label="Filter projects by technology"
              className="mt-6 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-white/[0.025] sm:p-6"
            >
              {technologies.map(({ name, count }) => (
                <TechChip
                  key={name}
                  name={name}
                  count={count}
                  active={activeTech === name}
                  onToggle={() => selectTech(name)}
                />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No technologies listed yet.</p>
          )}
        </section>

        {/* Transcripts */}
        <section id="transcripts" aria-labelledby="transcripts-heading" className="scroll-mt-24">
          <SectionHeading eyebrow="Academic record" title="Transcripts" id="transcripts-heading">
            {transcripts.length > 0 && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Records issued by Logos College.
              </p>
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

      {selected && <ProjectModal project={selected} onClose={closeModal} />}
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Section heading                              */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  eyebrow,
  title,
  id,
  children,
}: {
  eyebrow: string;
  title: string;
  id: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-600 dark:text-sky-300">
        <span aria-hidden className="h-0.5 w-6 rounded-full bg-gradient-to-r from-sky-400 to-blue-600" />
        {eyebrow}
      </p>
      <h2 id={id} className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Technology chip                              */
/* -------------------------------------------------------------------------- */

function TechChip({
  name,
  count,
  active,
  onToggle,
}: {
  name: string;
  count: number;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={`inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/25 ${
        active
          ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-600/25"
          : "border border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-sky-400/40 dark:hover:text-sky-300"
      }`}
    >
      {name}
      <span
        className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
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
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
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
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Project card                                */
/* -------------------------------------------------------------------------- */

function ProjectCard({ project, onOpen }: { project: Project; onOpen: (project: Project) => void }) {
  const tech = getTechnologies(project.technologies);
  const hasLive = isExternalUrl(project.project_url);
  const maxTech = 3;

  return (
    // The title button stretches over the whole card (after:absolute), so the card has a single tab stop.
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 focus-within:ring-4 focus-within:ring-sky-500/30 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-blue-950/[0.08] motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-white/10 dark:bg-[#0d1729] dark:hover:border-sky-400/30">
      <div className="relative aspect-[16/11] overflow-hidden bg-slate-100 dark:bg-slate-900">
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
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug tracking-tight">
          <button
            type="button"
            onClick={() => onOpen(project)}
            aria-haspopup="dialog"
            className="cursor-pointer text-left transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-sky-600 focus:outline-none dark:group-hover:text-sky-300"
          >
            {project.title}
          </button>
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
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
          className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-slate-700 transition group-hover:text-sky-600 dark:text-slate-200 dark:group-hover:text-sky-300"
        >
          View details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Project details                              */
/* -------------------------------------------------------------------------- */

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tech = getTechnologies(project.technologies);
  const liveUrl = isExternalUrl(project.project_url) ? project.project_url! : null;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
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
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        className="relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-t-3xl bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300 dark:bg-[#0d1729] sm:rounded-3xl"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close project details"
          className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/60 text-white backdrop-blur transition hover:bg-slate-950/80 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/50"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

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
              onClick={onClose}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
            >
              Close
            </button>
          </div>
        </div>
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
        fit === "cover" ? "object-cover object-top group-hover:scale-[1.03]" : "object-contain p-3"
      }`}
    />
  );
}