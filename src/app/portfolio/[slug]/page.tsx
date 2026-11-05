"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Source_Serif_4 } from "next/font/google";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Check,
  Code2,
  FolderKanban,
  Link2,
  Search,
  UserRound,
  X,
} from "lucide-react";

import icon from "../../../../public/icons/icon.png";

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
});

interface Project {
  id: number;
  title: string;
  description?: string | null;
  technologies?: string | null;
  project_url?: string | null;
  image_url?: string | null;
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
}

// API requests go through /api/proxy so the backend URL stays server-side.

const PRIMARY_BTN =
  "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-600/30 transition hover:brightness-110";

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
        const result: Portfolio = { ...base, projects: data.projects ?? base.projects ?? [] };
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

  const liveCount = useMemo(
    () => projects.filter((project) => isExternalUrl(project.project_url)).length,
    [projects]
  );

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

  /* ---------------------------------- Loading ---------------------------------- */
  if (loading) {
    return (
      <main
        role="status"
        aria-busy="true"
        aria-label="Loading portfolio"
        className="min-h-[100dvh] bg-slate-50 dark:bg-[#080f1e]"
      >
        <div className="animate-pulse motion-reduce:animate-none">
          <div className="bg-[#06142e] px-5 py-16 sm:px-8 sm:py-24">
            <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-center">
              <div className="h-36 w-36 rounded-3xl bg-white/10 sm:h-44 sm:w-44" />
              <div className="flex-1 space-y-4">
                <div className="h-5 w-40 rounded bg-white/10" />
                <div className="h-12 w-2/3 rounded bg-white/10" />
                <div className="h-4 w-1/2 rounded bg-white/10" />
              </div>
            </div>
          </div>
          <div className="mx-auto mt-12 grid max-w-6xl gap-5 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0d1729]"
              >
                <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800" />
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

  /* ----------------------------------- Error ----------------------------------- */
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
  const hasTech = technologies.length > 0;
  // Desktop sidebar shows bio + technologies; on phones the technologies move into the projects section
  const hasSidebar = hasBio || hasTech;
  const filtersActive = query.trim() !== "" || activeTech !== "All";
  const showFeatured = !filtersActive && filteredProjects.length > 1;

  return (
    <main className="min-h-[100dvh] bg-slate-50 text-slate-900 selection:bg-sky-200 selection:text-sky-950 dark:bg-[#080f1e] dark:text-slate-100 dark:selection:bg-sky-800 dark:selection:text-white">
      {/* ------------------------------- Header ------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#06142e]/85 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30"
            aria-label="Logos College home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white p-1.5 shadow-md shadow-black/20">
              <Image src={icon} alt="" width={24} height={24} className="object-contain" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold">Logos College</span>
              <span className="block text-[11px] text-slate-400">Student showcase</span>
            </span>
          </Link>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden min-[380px]:inline">Public portfolio</span>
            <span className="min-[380px]:hidden">Public</span>
          </span>
        </div>
      </header>

      {/* --------------------------------- Hero -------------------------------- */}
      <section className="relative isolate overflow-hidden bg-[#06142e] text-white">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.3),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(37,99,235,0.25),transparent_50%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-60 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-10 -z-10 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"
        />

        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-20 lg:py-24">
          <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-10">
            <div className="shrink-0 rounded-[1.75rem] bg-gradient-to-br from-sky-400 via-blue-500 to-blue-700 p-1 shadow-2xl shadow-black/40">
              {portfolio.profile_photo_url && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={portfolio.profile_photo_url}
                  alt={`${studentName} profile`}
                  onError={() => setImgError(true)}
                  className="h-32 w-32 rounded-3xl bg-[#06142e] object-cover sm:h-44 sm:w-44"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-[#0b2150] text-4xl font-bold text-white sm:h-44 sm:w-44 sm:text-5xl">
                  {initials || <UserRound className="h-14 w-14" aria-hidden />}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h1
                className={`${serif.className} break-words text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl`}
              >
                {studentName}
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-slate-300 sm:text-xl">
                {portfolio.title || "Student Portfolio"}
              </p>

              {portfolio.program_name && (
                <p className="mt-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-100 backdrop-blur-md">
                  <BookOpen className="h-4 w-4 shrink-0 text-sky-300" aria-hidden />
                  <span className="truncate">{portfolio.program_name}</span>
                </p>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#projects"
                  className={`group inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/40 ${PRIMARY_BTN}`}
                >
                  View projects
                  <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" aria-hidden />
                </a>
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  aria-live="polite"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/40"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-300" aria-hidden />
                  ) : (
                    <Link2 className="h-4 w-4" aria-hidden />
                  )}
                  {copied ? "Link copied" : "Copy link"}
                </button>
              </div>
            </div>
          </div>

          <dl className="mt-10 grid max-w-xl grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.06] shadow-lg shadow-black/10 backdrop-blur-md sm:mt-12">
            {[
              ["Projects", projects.length],
              ["Technologies", technologies.length],
              ["Live links", liveCount],
            ].map(([label, value]) => (
              <div key={label} className="px-4 py-4 sm:px-6">
                <dt className="text-xs text-slate-400">{label}</dt>
                <dd className="mt-1 text-2xl font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------ Main content ------------------------------ */}
      <div
        className={`mx-auto max-w-6xl gap-10 px-5 py-12 sm:px-8 sm:py-16 ${
          hasSidebar ? "lg:grid lg:grid-cols-[18rem_1fr] lg:items-start" : ""
        }`}
      >
        {/* Sidebar */}
        {hasSidebar && (
          <aside className={`space-y-5 lg:sticky lg:top-24 ${hasBio ? "mb-10 lg:mb-0" : "hidden lg:block"}`}>
            {hasBio && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0d1729]">
                <h2 className="flex items-center gap-2 text-base font-bold">
                  <span aria-hidden className="h-4 w-1 rounded-full bg-gradient-to-b from-sky-400 to-blue-600" />
                  About
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {biography}
                </p>
              </section>
            )}

            {hasTech && (
              <section className="hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0d1729] lg:block">
                <h2 className="flex items-center gap-2 text-base font-bold">
                  <span aria-hidden className="h-4 w-1 rounded-full bg-gradient-to-b from-sky-400 to-blue-600" />
                  Technologies
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Select one to filter the projects.</p>
                <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter projects by technology">
                  {technologies.map(({ name, count }) => (
                    <TechChip
                      key={name}
                      name={name}
                      count={count}
                      active={activeTech === name}
                      onToggle={() => setActiveTech(activeTech === name ? "All" : name)}
                    />
                  ))}
                </div>
              </section>
            )}
          </aside>
        )}

        {/* Projects */}
        <section id="projects" className="min-w-0 scroll-mt-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className={`${serif.className} text-3xl font-bold tracking-tight sm:text-4xl`}>Projects</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
                {projects.length > 0
                  ? `Showing ${filteredProjects.length} of ${projects.length}`
                  : "Selected work by this student"}
              </p>
            </div>

            {projects.length > 0 && (
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

          {/* Technology chips for phones & tablets (sidebar holds them on desktop) */}
          {hasTech && (
            <div className="-mx-5 mt-5 lg:hidden">
              <div
                role="group"
                aria-label="Filter projects by technology"
                className="flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {technologies.map(({ name, count }) => (
                  <TechChip
                    key={name}
                    name={name}
                    count={count}
                    active={activeTech === name}
                    onToggle={() => setActiveTech(activeTech === name ? "All" : name)}
                    className="shrink-0"
                  />
                ))}
              </div>
            </div>
          )}

          {activeTech !== "All" && (
            <div className="mt-4 hidden lg:block">
              <button
                type="button"
                onClick={() => setActiveTech("All")}
                className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3.5 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-300"
              >
                Technology: {activeTech}
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          )}

          {projects.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center dark:border-white/15 dark:bg-white/[0.025]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
                <Code2 className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-5 text-lg font-bold">No projects yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                Projects will appear here when this student adds them to their portfolio.
              </p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center dark:border-white/10 dark:bg-white/[0.025]">
              <Search className="mx-auto h-8 w-8 text-slate-400" aria-hidden />
              <h3 className="mt-4 font-bold">No matching projects</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Try another search or choose a different technology.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 min-h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold transition hover:border-sky-400 hover:text-sky-600 dark:border-white/10 dark:hover:text-sky-300"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  featured={showFeatured && index === 0}
                  onOpen={setSelected}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* --------------------------------- Footer -------------------------------- */}
      <footer className="border-t border-slate-200 bg-white dark:border-white/10 dark:bg-[#06142e]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-center sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:text-left">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-bold text-slate-700 transition hover:text-sky-600 dark:text-slate-200 dark:hover:text-sky-300 sm:justify-start"
          >
            <Image src={icon} alt="" width={18} height={18} /> Logos College
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Logos College. Student portfolio showcase.
          </p>
          <a
            href="#projects"
            className="inline-flex min-h-11 items-center justify-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-300"
          >
            Back to projects <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </footer>

      {selected && <ProjectModal project={selected} onClose={closeModal} />}
    </main>
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
  className = "",
}: {
  name: string;
  count: number;
  active: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/25 ${
        active
          ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-600/25"
          : "bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-700 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-sky-500/10 dark:hover:text-sky-300"
      } ${className}`}
    >
      {name}
      <span className={active ? "text-sky-100" : "text-slate-400"}>{count}</span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Project card                                */
/* -------------------------------------------------------------------------- */

function ProjectCard({
  project,
  featured,
  onOpen,
}: {
  project: Project;
  featured: boolean;
  onOpen: (project: Project) => void;
}) {
  const tech = getTechnologies(project.technologies);
  const liveUrl = isExternalUrl(project.project_url) ? project.project_url! : null;
  const maxTech = featured ? 8 : 4;

  return (
    // The title button stretches over the whole card (after:absolute), so the card has a single tab stop.
    <article
      className={`group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 focus-within:ring-4 focus-within:ring-sky-500/30 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-blue-950/[0.08] motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-white/10 dark:bg-[#0d1729] dark:hover:border-sky-400/30 ${
        featured ? "md:col-span-2 md:flex-row" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-slate-100 dark:bg-slate-900 ${featured ? "md:w-1/2" : ""}`}
      >
        <div className={`aspect-[16/10] w-full ${featured ? "md:aspect-auto md:h-full md:min-h-[20rem]" : ""}`}>
          {project.image_url ? (
            <ProjectImage src={project.image_url} title={project.title} fit="cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/30">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm dark:bg-white/5 dark:text-sky-300">
                <Code2 className="h-6 w-6" aria-hidden />
              </div>
            </div>
          )}
        </div>
        {featured && (
          <span className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className={`font-bold leading-snug tracking-tight ${featured ? "text-xl sm:text-2xl" : "text-lg"}`}>
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
          className={`mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400 ${
            featured ? "line-clamp-5" : "line-clamp-3"
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

        <div className="mt-auto flex items-center gap-4 pt-6">
          <span
            aria-hidden
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 transition group-hover:text-sky-600 dark:text-slate-200 dark:group-hover:text-sky-300"
          >
            Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`relative z-10 ml-auto inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-xs font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 ${PRIMARY_BTN}`}
            >
              Live project <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>
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
          <h2 className={`${serif.className} pr-10 text-2xl font-bold tracking-tight sm:text-3xl`}>
            {project.title}
          </h2>

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