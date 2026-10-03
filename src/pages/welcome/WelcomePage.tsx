import { Link } from "@tanstack/react-router";
import {
  Moon,
  FileText,
  ArrowRight,
  NotebookPen,
  ExternalLink,
  PanelsTopLeft
} from "lucide-react";

const featureCards = [
  {
    title: "Write",
    description: "A focused Markdown editor with the essentials close at hand.",
    icon: FileText
  },
  {
    title: "Preview",
    description:
      "Switch between edit, preview, and split views while you work.",
    icon: PanelsTopLeft
  },
  {
    title: "Dark only",
    description:
      "Designed directly for a calm dark workspace from the first screen.",
    icon: Moon
  }
];

export function WelcomePage() {
  return (
    <main className="flex h-full min-h-0 flex-col overflow-y-auto bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
              <NotebookPen size={15} />
              MDraft
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-normal text-white sm:text-6xl">
              A simple place to write Markdown and see it clearly.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Open a document, write in Markdown, preview the result, and save
              it when it is ready.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-cyan-400/60 bg-cyan-400 px-5 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
                to="/markdown"
              >
                <ArrowRight size={18} />
                Start Writing
              </Link>
              <a
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-5 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
                href="https://github.com/precene/mdraft"
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink size={18} />
                GitHub
              </a>
            </div>
          </div>

          <div className="relative hidden min-h-105 overflow-hidden rounded-lg lg:block">
            <svg
              aria-hidden="true"
              className="absolute inset-0 h-full w-full"
              fill="none"
              viewBox="0 0 560 420"
            >
              <defs>
                <linearGradient
                  id="panelGlow"
                  x1="112"
                  x2="488"
                  y1="58"
                  y2="350"
                >
                  <stop stopColor="#22d3ee" stopOpacity="0.28" />
                  <stop offset="1" stopColor="#64748b" stopOpacity="0.04" />
                </linearGradient>
              </defs>
              <rect height="420" width="560" fill="#020617" />
              <rect
                height="250"
                rx="10"
                stroke="#334155"
                width="384"
                x="88"
                y="72"
              />
              <rect
                height="250"
                rx="10"
                fill="url(#panelGlow)"
                width="384"
                x="88"
                y="72"
              />
              <path d="M88 122H472" stroke="#1e293b" />
              <circle cx="116" cy="97" fill="#ef4444" r="6" />
              <circle cx="138" cy="97" fill="#eab308" r="6" />
              <circle cx="160" cy="97" fill="#22c55e" r="6" />
              <path
                d="M126 162H256"
                stroke="#67e8f9"
                strokeLinecap="round"
                strokeWidth="8"
              />
              <path
                d="M126 194H328"
                stroke="#94a3b8"
                strokeLinecap="round"
                strokeWidth="7"
              />
              <path
                d="M126 224H294"
                stroke="#64748b"
                strokeLinecap="round"
                strokeWidth="7"
              />
              <path
                d="M126 254H356"
                stroke="#475569"
                strokeLinecap="round"
                strokeWidth="7"
              />
              <path
                d="M126 284H238"
                stroke="#64748b"
                strokeLinecap="round"
                strokeWidth="7"
              />
              <rect
                height="132"
                rx="8"
                stroke="#334155"
                width="138"
                x="292"
                y="154"
              />
              <path
                d="M318 186H396"
                stroke="#67e8f9"
                strokeLinecap="round"
                strokeWidth="7"
              />
              <path
                d="M318 216H376"
                stroke="#94a3b8"
                strokeLinecap="round"
                strokeWidth="6"
              />
              <path
                d="M318 244H404"
                stroke="#64748b"
                strokeLinecap="round"
                strokeWidth="6"
              />
              <path
                d="M92 342C169 376 242 367 312 342C378 318 421 335 468 362"
                stroke="#22d3ee"
                strokeOpacity="0.24"
                strokeWidth="2"
              />
              <path
                d="M66 54L44 76L66 98"
                stroke="#22d3ee"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="5"
              />
              <path
                d="M494 322L516 344L494 366"
                stroke="#22d3ee"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.7"
                strokeWidth="5"
              />
            </svg>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {featureCards.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-5"
                key={feature.title}
              >
                <Icon className="text-cyan-300" size={22} />
                <h2 className="mt-4 text-lg font-semibold text-white">
                  {feature.title}
                </h2>
                <p className="mt-2 leading-6 text-slate-400">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-slate-800 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 text-sm text-slate-500">
          <span>
            MDraft | All rights reserved &copy; {new Date().getFullYear()}
          </span>
          <a
            className="transition hover:text-cyan-300"
            href="https://precene.com"
            rel="noreferrer"
            target="_blank"
          >
            Precene Technologies
          </a>
        </div>
      </footer>
    </main>
  );
}
