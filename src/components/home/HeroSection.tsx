import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import HeroChaosCanvas from "./HeroChaosCanvas";

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium mb-6">
              Developer Knowledge Hub
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
              Stop Losing Your
              <br />
              <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Developer Knowledge
              </span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
              Snippets in VS Code. Prompts in chat history. Commands in .txt files.
              Links lost in bookmarks. DevStash is one searchable hub for everything you build with.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
                Start for Free
              </Link>
              <a href="#features" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                See Features
              </a>
            </div>
          </div>

          {/* Visual */}
          <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-4">
            {/* Chaos box */}
            <div className="flex-1 w-full min-w-0 rounded-xl border border-border bg-card/50 overflow-hidden">
              <div className="px-3 py-2 border-b border-border text-xs text-muted-foreground">
                Your knowledge today...
              </div>
              <div className="h-56 sm:h-64">
                <HeroChaosCanvas />
              </div>
            </div>

            {/* Arrow */}
            <div className="shrink-0 rotate-90 sm:rotate-0">
              <svg viewBox="0 0 60 24" fill="none" className="w-12 h-6" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M0 12 H48 M36 4 L52 12 L36 20"
                  stroke="url(#heroArrow)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="heroArrow" x1="0" y1="0" x2="60" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Dashboard preview */}
            <div className="flex-1 w-full min-w-0 rounded-xl border border-border bg-card/50 overflow-hidden">
              <div className="px-3 py-2 border-b border-border text-xs text-muted-foreground">
                ...with DevStash
              </div>
              <div className="h-56 sm:h-64 flex">
                {/* Mini sidebar */}
                <div className="w-10 border-r border-border bg-card flex flex-col items-center py-3 gap-3">
                  <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center text-[8px] font-bold text-blue-400">
                    DS
                  </div>
                  {[
                    "#3b82f6",
                    "#f59e0b",
                    "#06b6d4",
                    "#22c55e",
                    "#ec4899",
                    "#6366f1",
                  ].map((color) => (
                    <div
                      key={color}
                      className="w-3 h-3 rounded-full"
                      style={{ background: color }}
                    />
                  ))}
                </div>

                {/* Mini main */}
                <div className="flex-1 p-2 flex flex-col gap-2 overflow-hidden">
                  {/* Topbar */}
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 h-4 rounded bg-muted/50" />
                    <div className="w-8 h-4 rounded bg-blue-500/30" />
                  </div>

                  {/* Stats strip */}
                  <div className="flex gap-2">
                    {[
                      { num: "24", label: "snippets", color: "#3b82f6" },
                      { num: "18", label: "prompts", color: "#f59e0b" },
                      { num: "9", label: "notes", color: "#22c55e" },
                    ].map((s) => (
                      <div key={s.label} className="flex flex-col items-center flex-1">
                        <span className="text-[10px] font-bold" style={{ color: s.color }}>
                          {s.num}
                        </span>
                        <span className="text-[7px] text-muted-foreground">{s.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Mini cards grid */}
                  <div className="grid grid-cols-2 gap-1 flex-1">
                    {[
                      { color: "#3b82f6", w: "55%" },
                      { color: "#f59e0b", w: "60%" },
                      { color: "#06b6d4", w: "50%" },
                      { color: "#22c55e", w: "65%" },
                      { color: "#ec4899", w: "45%" },
                      { color: "#6366f1", w: "58%" },
                    ].map((card, i) => (
                      <div
                        key={i}
                        className="rounded border bg-card/80 p-1.5 flex flex-col gap-1"
                        style={{ borderColor: card.color + "40" }}
                      >
                        <div className="flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: card.color }}
                          />
                          <div
                            className="h-1.5 rounded bg-current opacity-20"
                            style={{ width: card.w, color: card.color }}
                          />
                        </div>
                        <div className="h-1 rounded bg-muted/40 w-3/4" />
                        <div className="flex gap-0.5">
                          <div
                            className="h-1 w-4 rounded"
                            style={{ background: card.color + "30" }}
                          />
                          <div
                            className="h-1 w-4 rounded"
                            style={{ background: card.color + "30" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
