"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Code2,
  FileText,
  FolderKanban,
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

const BIO_EXCERPT_LENGTH = 220;

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
  const [activeTech, setActiveTech] = useState("All");
  const [selected, setSelected] = useState<Project | null>(null);
  const [bioOpen, setBioOpen] = useState(false);

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

  const filteredProjects = useMemo(
    () =>
      activeTech === "All"
        ? projects
        : projects.filter((project) => getTechnologies(project.technologies).includes(activeTech)),
    [projects, activeTech]
  );

  const closeModal = useCallback(() => setSelected(null), []);

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
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-5 py-14 sm:flex-row sm:justify-center sm:gap-14 sm:py-20">
            <div className="h-36 w-36 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800 sm:h-44 sm:w-44" />
            <div className="w-full max-w-md space-y-3">
              <div className="h-12 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-5 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-24 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="aspect-[208/188] rounded-2xl bg-slate-200 dark:bg-slate-800" />
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

  return (
    <main className="min-h-[100dvh] bg-white text-slate-900 selection:bg-sky-200 selection:text-sky-950 dark:bg-[#080f1e] dark:text-slate-100 dark:selection:bg-sky-800 dark:selection:text-white">
      {/* ------------------------------- Header ------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#06142e]/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-5 sm:px-8">
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
        </div>
      </header>

      {/* --------------------------------- Hero -------------------------------- */}
      <section aria-labelledby="student-name" className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center sm:flex-row sm:justify-center sm:gap-14 sm:text-left">
          {/* Round profile photo */}
          <div className="h-36 w-36 shrink-0 overflow-hidden rounded-full bg-sky-50 shadow-lg shadow-slate-900/10 ring-4 ring-sky-100 dark:bg-[#0b2150] dark:ring-white/10 sm:h-44 sm:w-44">
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
                  <span className="text-5xl font-semibold text-sky-600 dark:text-sky-200">{initials}</span>
                ) : (
                  <UserRound className="h-16 w-16 text-sky-600 dark:text-sky-200" aria-hidden />
                )}
              </div>
            )}
          </div>

          {/* Name, title, bio */}
          <div className="min-w-0 max-w-md">
            <h1
              id="student-name"
              className="break-words text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
            >
              {studentName}
            </h1>

            <p className="mt-2 text-xl text-slate-600 dark:text-slate-300">
              {portfolio.title || "Student Portfolio"}
            </p>

            {portfolio.program_name && (
              <p className="mt-1 text-sm font-medium text-sky-600 dark:text-sky-300">{portfolio.program_name}</p>
            )}

            {hasBio && (
              <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-left text-sm leading-6 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                <p className="whitespace-pre-line">{bioText}</p>
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

            <a
              href="#projects"
              className="group mt-5 inline-flex min-h-11 items-center gap-1.5 rounded text-sm font-medium underline decoration-sky-500 decoration-2 underline-offset-[6px] transition hover:text-sky-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 dark:hover:text-sky-300"
            >
              View projects
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------ Main content ------------------------------ */}
      <div className="mx-auto max-w-4xl space-y-16 px-5 pb-20 sm:space-y-20 sm:px-8 sm:pb-24">
        {/* Projects */}
        <section id="projects" className="scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
              {projects.length > 0 && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
                  {activeTech !== "All"
                    ? `Showing ${filteredProjects.length} of ${projects.length}`
                    : `${projects.length} ${projects.length === 1 ? "project" : "projects"}`}
                </p>
              )}
            </div>

            {activeTech !== "All" && (
              <button
                type="button"
                onClick={() => setActiveTech("All")}
                className="inline-flex min-h-9 items-center gap-2 rounded-full bg-sky-50 px-3.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300"
              >
                Technology: {activeTech}
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </div>

          {projects.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center dark:border-white/15 dark:bg-white/[0.025]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
                <Code2 className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-5 text-lg font-bold">No projects yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                Projects will appear here when this student adds them to their portfolio.
              </p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-slate-100 px-6 py-12 text-center dark:bg-white/5">
              <h3 className="font-bold">No matching projects</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                No project uses this technology.
              </p>
              <button
                type="button"
                onClick={() => setActiveTech("All")}
                className="mt-5 min-h-11 rounded-xl border border-slate-300 px-5 text-sm font-semibold transition hover:border-sky-400 hover:text-sky-600 dark:border-white/10 dark:hover:text-sky-300"
              >
                Clear filter
              </button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onOpen={setSelected} />
              ))}
            </div>
          )}
        </section>

        {/* Technologies */}
        <section id="technologies" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold tracking-tight">Technologies</h2>
          {technologies.length > 0 ? (
            <>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Select a technology to filter the projects above.
              </p>
              <div className="mt-5 flex flex-wrap gap-3" role="group" aria-label="Filter projects by technology">
                {technologies.map(({ name, count }) => (
                  <TechChip
                    key={name}
                    name={name}
                    count={count}
                    active={activeTech === name}
                    onToggle={() => {
                      setActiveTech(activeTech === name ? "All" : name);
                      if (activeTech !== name) {
                        document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No technologies listed yet.</p>
          )}
        </section>

        {/* Transcripts */}
        <section id="transcripts" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold tracking-tight">Transcripts</h2>
          {transcripts.length > 0 ? (
            <ul className="mt-5 grid max-w-xl gap-3">
              {transcripts.map((transcript, index) => (
                <TranscriptRow key={transcript.id ?? index} transcript={transcript} index={index} />
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No transcripts available yet.</p>
          )}
        </section>
      </div>

      {/* --------------------------------- Footer -------------------------------- */}
      <footer className="border-t border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-[#06142e]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-12 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-bold text-slate-700 transition hover:text-sky-600 dark:text-slate-200 dark:hover:text-sky-300 sm:justify-start"
          >
            <Image src={icon} alt="" width={20} height={20} /> Logos College
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
          : "bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-700 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-sky-500/10 dark:hover:text-sky-300"
      }`}
    >
      {name}
      <span className={`text-xs ${active ? "text-sky-100" : "text-slate-400"}`}>{count}</span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Transcript row                              */
/* -------------------------------------------------------------------------- */

function TranscriptRow({ transcript, index }: { transcript: Transcript; index: number }) {
  const href = isLinkableUrl(transcript.file_url) ? transcript.file_url! : null;
  const label = transcript.title || `Transcript ${index + 1}`;

  const content = (
    <>
      <span className="flex min-w-0 items-center gap-3">
        <FileText className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-300" aria-hidden />
        <span className="truncate">{label}</span>
      </span>
      {href && <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />}
    </>
  );

  const rowClass =
    "flex h-12 items-center justify-between gap-3 rounded-xl bg-slate-100 px-4 text-sm font-medium text-slate-700 dark:bg-white/5 dark:text-slate-200";

  return (
    <li>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${rowClass} transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 dark:hover:bg-sky-500/10 dark:hover:text-sky-300`}
        >
          {content}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : (
        <div className={rowClass}>{content}</div>
      )}
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Project card                                */
/* -------------------------------------------------------------------------- */

function ProjectCard({ project, onOpen }: { project: Project; onOpen: (project: Project) => void }) {
  const tech = getTechnologies(project.technologies);

  return (
    // The title button stretches over the whole card (after:absolute), so the card has a single tab stop.
    <article className="group relative min-w-0 rounded-2xl focus-within:ring-4 focus-within:ring-sky-500/30">
      <div className="relative aspect-[208/188] overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-blue-950/10 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 dark:bg-white/5 dark:ring-white/10">
        {project.image_url ? (
          <ProjectImage src={project.image_url} title={project.title} fit="cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Code2 className="h-8 w-8 text-sky-500/70 dark:text-sky-300/60" aria-hidden />
          </div>
        )}
      </div>

      <h3 className="mt-3 line-clamp-1 text-base font-semibold leading-snug tracking-tight">
        <button
          type="button"
          onClick={() => onOpen(project)}
          aria-haspopup="dialog"
          className="cursor-pointer text-left transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-sky-600 focus:outline-none dark:group-hover:text-sky-300"
        >
          {project.title}
        </button>
      </h3>

      {tech.length > 0 && (
        <p className="mt-1 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
          {tech.slice(0, 4).join(" · ")}
        </p>
      )}
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
          <h2 className="pr-10 text-2xl font-semibold tracking-tight sm:text-3xl">{project.title}</h2>

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