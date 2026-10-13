"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, BookOpen, Code2,
  ExternalLink, FolderKanban, GraduationCap, Search, Sparkles, UserRound,
  X,
} from "lucide-react";

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

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

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

  const loadPortfolio = useCallback(async (signal?: AbortSignal) => {
    if (!slug) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_URL}/portfolios/public/${encodeURIComponent(slug)}`,
        { signal, cache: "no-store" }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "This portfolio does not exist or has not been published yet."
            : data.message || data.error || "We couldn't load this portfolio. Please try again."
        );
      }
      const result: Portfolio = data.portfolio ?? data;
      result.projects = data.projects ?? result.projects ?? [];
      setPortfolio(result);
      setImgError(false);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPortfolio(null);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    const controller = new AbortController();
    void loadPortfolio(controller.signal);
    return () => controller.abort();
  }, [loadPortfolio]);

  const projects = useMemo(() => portfolio?.projects ?? [], [portfolio?.projects]);
  const technologies = useMemo(
    () => Array.from(new Set(projects.flatMap((project) => getTechnologies(project.technologies)))).sort(),
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f9fc] px-5 py-8 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-8">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mb-10 flex items-center gap-3"><div className="h-11 w-11 rounded-2xl bg-slate-200 dark:bg-slate-800" /><div className="space-y-2"><div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800" /><div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-800" /></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-12"><div className="flex flex-col gap-7 sm:flex-row sm:items-center"><div className="h-28 w-28 rounded-[2rem] bg-slate-200 dark:bg-slate-800" /><div className="flex-1 space-y-4"><div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" /><div className="h-9 w-2/3 rounded bg-slate-200 dark:bg-slate-800" /><div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" /></div></div></div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="h-44 bg-slate-200 dark:bg-slate-800" /><div className="space-y-3 p-6"><div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" /><div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" /><div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-800" /></div></div>)}</div>
        </div>
      </main>
    );
  }

  if (error || !portfolio) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-5 py-12 text-slate-900 dark:bg-slate-950 dark:text-white">
        <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 sm:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300"><FolderKanban className="h-7 w-7" /></div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-300">Logos College</p>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio unavailable</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">{error || "We couldn't find this student portfolio."}</p>
          <button onClick={() => void loadPortfolio()} className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-400 px-5 text-sm font-bold text-slate-950 shadow-lg shadow-blue-400/25 transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/25">Try again <ArrowRight className="h-4 w-4" /></button>
          <div><Link href="/" className="mt-4 inline-block text-sm font-medium text-slate-500 underline-offset-4 hover:text-blue-500 hover:underline dark:text-slate-400">Back to home</Link></div>
        </div>
      </main>
    );
  }

  const studentName = portfolio.full_name || `${portfolio.first_name || ""} ${portfolio.last_name || ""}`.trim() || "Logos College Student";
  const biography = portfolio.bio_override || portfolio.bio || "";
  const initials = studentName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f9fc] text-slate-900 selection:bg-blue-200 selection:text-blue-950 dark:bg-[#080f1e] dark:text-slate-100 dark:selection:bg-blue-900 dark:selection:text-white">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#080f1e]/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8 lg:px-10">
          <Link href="/" className="group flex items-center gap-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20" aria-label="Logos College home">
            <span className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-lg shadow-blue-700/20 transition-transform group-hover:-rotate-3"><GraduationCap className="h-5 w-5" /></span>
            <span className="leading-tight"><span className="block text-sm font-extrabold tracking-tight">Logos <span className="text-blue-600 dark:text-blue-300">College</span></span><span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Student showcase</span></span>
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"><BadgeCheck className="h-3.5 w-3.5" /> Public portfolio</div>
        </div>
      </header>

      <section className="relative isolate border-b border-slate-200/80 dark:border-white/10">
        <div className="absolute inset-0 -z-20 bg-white dark:bg-[#0b1426]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.14),transparent_42%),radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.10),transparent_42%)]" />
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
          <div className="grid items-center gap-9 lg:grid-cols-[1fr_auto] lg:gap-14">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
              {portfolio.profile_photo_url && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={portfolio.profile_photo_url} alt={`${studentName} profile`} onError={() => setImgError(true)} className="h-28 w-28 shrink-0 rounded-[2rem] border-4 border-white object-cover shadow-xl shadow-blue-950/10 ring-1 ring-slate-200 dark:border-slate-800 dark:ring-white/10 sm:h-36 sm:w-36" />
              ) : (
                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 text-3xl font-black tracking-tight text-white shadow-xl shadow-blue-900/20 ring-4 ring-white dark:ring-slate-800 sm:h-36 sm:w-36 sm:text-4xl"><span>{initials || <UserRound className="h-12 w-12" />}</span></div>
              )}
              <div className="min-w-0">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200"><Sparkles className="h-3.5 w-3.5" /> Student spotlight</div>
                <h1 className="max-w-3xl break-words text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">{studentName}</h1>
                <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">{portfolio.title || "Student Portfolio"}</p>
                {portfolio.program_name && <div className="mt-5 inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300"><BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-300" /><span>Program</span><span className="font-bold text-slate-900 dark:text-white">{portfolio.program_name}</span></div>}
              </div>
            </div>
            <a href="#projects" className="group inline-flex min-h-12 w-fit items-center justify-center gap-2.5 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-blue-400 hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-blue-500/25 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-200"><FolderKanban className="h-4 w-4" /> Explore projects <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" /></a>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-2 gap-3 sm:mt-12">
            <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.035] sm:p-5"><p className="text-2xl font-black tracking-tight">{projects.length}</p><p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Projects showcased</p></div>
            <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.035] sm:p-5"><p className="text-2xl font-black tracking-tight">{technologies.length}</p><p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Technologies used</p></div>
          </div>
        </div>
      </section>

      {biography && <section className="mx-auto max-w-7xl px-5 pt-10 sm:px-8 sm:pt-14 lg:px-10"><div className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.025] dark:border-white/10 dark:bg-white/[0.035] sm:grid-cols-[auto_1fr] sm:gap-6 sm:p-8"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300"><UserRound className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">A little introduction</p><h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">About me</h2><p className="mt-3 max-w-4xl whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">{biography}</p></div></div></section>}

      <section id="projects" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300"><Code2 className="h-4 w-4" /> Selected work</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Projects &amp; creations<span className="text-blue-600 dark:text-blue-300">.</span></h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">A closer look at projects, ideas, and the technologies behind them.</p></div>
          {projects.length > 0 && <div className="w-full lg:max-w-sm"><label htmlFor="project-search" className="mb-2 block text-xs font-semibold text-slate-600 dark:text-slate-300">Find a project</label><div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="project-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, description, tech..." className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>}</div></div>}
        </div>

        {technologies.length > 0 && <div className="mt-7 flex flex-wrap gap-2" aria-label="Filter projects by technology"><button type="button" onClick={() => setActiveTech("All")} aria-pressed={activeTech === "All"} className={`rounded-full px-4 py-2 text-xs font-semibold transition focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${activeTech === "All" ? "bg-blue-400 text-slate-950 shadow-md shadow-blue-400/25" : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-blue-300"}`}>All projects <span className="ml-1 opacity-70">{projects.length}</span></button>{technologies.map((tech) => <button key={tech} type="button" onClick={() => setActiveTech(tech)} aria-pressed={activeTech === tech} className={`rounded-full px-4 py-2 text-xs font-semibold transition focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${activeTech === tech ? "bg-blue-400 text-slate-950 shadow-md shadow-blue-400/25" : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-blue-300"}`}>{tech}</button>)}</div>}

        {projects.length === 0 ? (
          <div className="mt-9 rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center dark:border-white/15 dark:bg-white/[0.025]"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300"><Code2 className="h-6 w-6" /></div><h3 className="mt-5 text-lg font-bold">The next great project starts here</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">Projects will appear here when this student adds them to their portfolio.</p></div>
        ) : filteredProjects.length === 0 ? (
          <div className="mt-9 rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center dark:border-white/10 dark:bg-white/[0.025]"><Search className="mx-auto h-8 w-8 text-slate-400" /><h3 className="mt-4 font-bold">No matching projects</h3><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try another search or choose a different technology.</p><button type="button" onClick={() => { setQuery(""); setActiveTech("All"); }} className="mt-5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:border-blue-400 hover:text-blue-500 dark:border-white/10 dark:hover:text-blue-300">Clear filters</button></div>
        ) : (
          <><div className="mb-5 mt-8 flex items-center justify-between"><p className="text-sm text-slate-500 dark:text-slate-400">Showing <span className="font-bold text-slate-900 dark:text-white">{filteredProjects.length}</span> of {projects.length} projects</p>{(query || activeTech !== "All") && <button type="button" onClick={() => { setQuery(""); setActiveTech("All"); }} className="text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300">Reset filters</button>}</div><div className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">{filteredProjects.map((project) => {
            const projectTech = getTechnologies(project.technologies);
            const validProjectUrl = isExternalUrl(project.project_url) ? project.project_url : null;
            return <article key={project.id} className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/[0.025] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/[0.07] dark:border-white/10 dark:bg-[#0d1729] dark:hover:border-blue-400/30 dark:hover:shadow-black/20">
              <div className="relative h-64 overflow-hidden border-b border-slate-100 bg-gradient-to-br from-slate-50 via-blue-50/70 to-indigo-50/70 dark:border-white/5 dark:from-slate-900 dark:via-blue-950/40 dark:to-indigo-950/30 sm:h-72">{project.image_url ? <ProjectImage src={project.image_url} title={project.title} /> : <div className="flex h-full items-center justify-center"><div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/80 bg-white/70 text-blue-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-blue-300"><Code2 className="h-7 w-7" /></div></div>}<span className="absolute left-4 top-4 rounded-lg border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/75 dark:text-slate-300">Project</span></div>
              <div className="flex flex-1 flex-col p-5 sm:p-6"><h3 className="text-lg font-bold leading-snug tracking-tight transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-300">{project.title}</h3><p className="mt-3 min-h-[4.5rem] whitespace-pre-line text-sm leading-6 text-slate-500 dark:text-slate-400">{project.description ? (project.description.length > 155 ? `${project.description.slice(0, 155).trimEnd()}…` : project.description) : "A project developed as part of this student's practical work."}</p>{projectTech.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{projectTech.slice(0, 5).map((tech) => <span key={tech} className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:border-blue-400/15 dark:bg-blue-400/10 dark:text-blue-200">{tech}</span>)}{projectTech.length > 5 && <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-400">+{projectTech.length - 5}</span>}</div>}<div className="mt-auto pt-6">{validProjectUrl ? <a href={validProjectUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-400 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:border-white/10 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:bg-blue-500 dark:hover:text-white">View live project <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></a> : <span className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 text-xs font-medium text-slate-400 dark:bg-white/[0.035] dark:text-slate-500">Live link not provided <ExternalLink className="h-3.5 w-3.5" /></span>}</div></div>
            </article>;
          })}</div></>
        )}
      </section>

      <footer className="border-t border-slate-200 bg-white dark:border-white/10 dark:bg-[#080f1e]"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-center sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:text-left lg:px-10"><Link href="/" className="inline-flex items-center justify-center gap-2 text-sm font-bold tracking-tight text-slate-700 transition hover:text-blue-500 dark:text-slate-200 dark:hover:text-blue-300 sm:justify-start"><GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-300" /> Logos College</Link><p className="text-xs leading-5 text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} Logos College · Student Portfolio Showcase</p><a href="#projects" className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-300">Back to projects <ArrowRight className="h-3.5 w-3.5" /></a></div></footer>
    </main>
  );
}

function ProjectImage({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="flex h-full items-center justify-center"><Code2 className="h-10 w-10 text-blue-500/70 dark:text-blue-300/60" /></div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={`${title} preview`} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-contain p-3 sm:p-4 transition-transform duration-500 group-hover:scale-[1.02]" />;
}