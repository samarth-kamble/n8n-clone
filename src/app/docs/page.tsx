"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  SearchIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  ExternalLinkIcon,
  CheckCircle2Icon,
  LightbulbIcon,
  CodeIcon,
  BookOpenIcon,
  XIcon,
} from "lucide-react";
import { docSections, type DocItem, type DocSection } from "./docs-data";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Helper Components                                                  */
/* ------------------------------------------------------------------ */

function DocIcon({
  icon,
  className,
  size = 24,
}: {
  icon: string;
  className?: string;
  size?: number;
}) {
  const isPath = icon.startsWith("/");

  if (isPath) {
    return (
      <div className={cn("relative flex items-center justify-center", className)}>
        <Image
          src={icon}
          alt="Icon"
          width={size}
          height={size}
          className="object-contain"
        />
      </div>
    );
  }

  return <span className={className}>{icon}</span>;
}

/* ------------------------------------------------------------------ */
/*  Sidebar Navigation                                                 */
/* ------------------------------------------------------------------ */

function Sidebar({
  sections,
  activeId,
  onSelect,
  search,
  onSearch,
}: {
  sections: DocSection[];
  activeId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearch: (v: string) => void;
}) {
  const [expandedSections, setExpandedSections] = useState<string[]>(
    sections.map((s) => s.id)
  );

  const toggle = (id: string) =>
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  return (
    <aside className="w-72 shrink-0 border-r border-border bg-card/60 backdrop-blur-sm overflow-y-auto h-full hidden lg:flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border/50 p-4">
        <Link
          href="/workflows"
          className="flex items-center gap-3 mb-4 group"
        >
          <Image src="/logos/logo.svg" alt="Nodebase" width={28} height={28} />
          <span className="font-bold text-base tracking-tight">
            Nodebase <span className="text-primary">Docs</span>
          </span>
        </Link>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            placeholder="Search docs..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-background/80 pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {sections.map((section) => {
          const isExpanded = expandedSections.includes(section.id);
          return (
            <div key={section.id}>
              <button
                onClick={() => toggle(section.id)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold text-foreground hover:bg-accent/50 transition-colors"
              >
                <DocIcon icon={section.icon} className="text-base" size={16} />
                <span className="flex-1 text-left">{section.title}</span>
                <ChevronRightIcon
                  className={`size-3.5 text-muted-foreground transition-transform duration-200 ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
              </button>
              {isExpanded && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border/50 pl-3">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSelect(item.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-all ${
                        activeId === item.id
                          ? "bg-primary/10 text-primary font-medium border-l-2 border-primary -ml-[13px] pl-[23px]"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <Link
          href="/workflows"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeftIcon className="size-3" />
          Back to App
        </Link>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile Nav                                                         */
/* ------------------------------------------------------------------ */

function MobileNav({
  sections,
  activeId,
  onSelect,
  search,
  onSearch,
  open,
  onClose,
}: {
  sections: DocSection[];
  activeId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearch: (v: string) => void;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-80 bg-card shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-bold">Navigation</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent">
            <XIcon className="size-4" />
          </button>
        </div>
        <div className="p-3">
          <div className="relative mb-3">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {sections.map((section) => (
            <div key={section.id} className="mb-2">
              <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <DocIcon icon={section.icon} size={14} /> {section.title}
              </p>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm ${
                    activeId === item.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Detail Panel                                                       */
/* ------------------------------------------------------------------ */

function DetailPanel({ item }: { item: DocItem }) {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <article className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <BookOpenIcon className="size-3" />
        <span>Docs</span>
        <ChevronRightIcon className="size-3" />
        <span>{item.category}</span>
        <ChevronRightIcon className="size-3" />
        <span className="text-foreground font-medium">{item.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="size-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
          <DocIcon icon={item.icon} size={32} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">{item.title}</h1>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
              {item.category}
            </span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Overview */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <BookOpenIcon className="size-4 text-primary" />
          Overview
        </h2>
        <div className="rounded-lg border border-border bg-card/50 p-5 leading-relaxed text-sm text-foreground/90">
          {item.details}
        </div>
      </section>

      {/* Step-by-step */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2Icon className="size-4 text-primary" />
          Step-by-Step Guide
        </h2>
        <div className="space-y-2">
          {item.steps.map((step, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(activeStep === i ? null : i)}
              className={`w-full text-left flex items-start gap-3 p-3.5 rounded-lg border transition-all duration-200 ${
                activeStep === i
                  ? "border-primary/40 bg-primary/5 shadow-sm"
                  : "border-border/60 bg-card/30 hover:border-border hover:bg-card/50"
              }`}
            >
              <span
                className={`size-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  activeStep === i
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed pt-0.5">{step}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Configuration */}
      {item.config && item.config.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CodeIcon className="size-4 text-primary" />
            Configuration
          </h2>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                    Field
                  </th>
                  <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {item.config.map((c, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/50 last:border-0 hover:bg-accent/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-primary font-medium whitespace-nowrap">
                      {c.label}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Code Example */}
      {item.example && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CodeIcon className="size-4 text-primary" />
            Example
          </h2>
          <pre className="rounded-lg border border-border bg-[#1a1b26] text-green-400 p-4 text-xs leading-relaxed overflow-x-auto font-mono">
            {item.example}
          </pre>
        </section>
      )}

      {/* Tips */}
      {item.tips && item.tips.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <LightbulbIcon className="size-4 text-amber-500" />
            Pro Tips
          </h2>
          <div className="space-y-2">
            {item.tips.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5"
              >
                <span className="text-amber-500 mt-0.5 text-sm">💡</span>
                <span className="text-sm text-foreground/80">{tip}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Landing / Welcome                                                  */
/* ------------------------------------------------------------------ */

function Welcome({
  sections,
  onSelect,
}: {
  sections: DocSection[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
          <BookOpenIcon className="size-3" />
          Documentation
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
          Nodebase Documentation
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
          Everything you need to build powerful workflow automations. Learn about
          triggers, nodes, credentials, and more.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        {[
          { label: "Triggers", count: "6", icon: "⚡" },
          { label: "AI Nodes", count: "3", icon: "🧠" },
          { label: "Actions", count: "6", icon: "🚀" },
          { label: "Guides", count: "4", icon: "📚" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card/50 p-4 text-center hover:border-primary/30 hover:shadow-md transition-all duration-300"
          >
            <span className="text-2xl">{s.icon}</span>
            <p className="text-2xl font-bold mt-1">{s.count}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Section Cards */}
      {sections.map((section) => (
        <div key={section.id} className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <DocIcon icon={section.icon} size={20} className="text-xl" />
            <h2 className="text-xl font-bold">{section.title}</h2>
            <span className="ml-auto text-xs text-muted-foreground">
              {section.items.length} items
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {section.description}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {section.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="group text-left rounded-xl border border-border bg-card/40 p-4 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-2">
                  <DocIcon
                    icon={item.icon}
                    size={24}
                    className="text-xl group-hover:scale-110 transition-transform"
                  />
                  <span className="font-semibold text-sm">{item.title}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center gap-1 mt-3 text-[10px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Read more
                  <ChevronRightIcon className="size-3" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function DocsPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Filter sections based on search
  const filteredSections = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return docSections;
    return docSections
      .map((s) => ({
        ...s,
        items: s.items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            s.title.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [search]);

  // Find selected item
  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    for (const s of docSections) {
      const found = s.items.find((i) => i.id === selectedId);
      if (found) return found;
    }
    return null;
  }, [selectedId]);

  // Scroll to top on selection change
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedId]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <Sidebar
        sections={filteredSections}
        activeId={selectedId}
        onSelect={setSelectedId}
        search={search}
        onSearch={setSearch}
      />

      {/* Mobile Nav Overlay */}
      <MobileNav
        sections={filteredSections}
        activeId={selectedId}
        onSelect={setSelectedId}
        search={search}
        onSearch={setSearch}
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Main Content */}
      <main ref={contentRef} className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border p-3 flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-2 rounded-md border border-border hover:bg-accent"
          >
            <BookOpenIcon className="size-4" />
          </button>
          <Link href="/workflows" className="flex items-center gap-2">
            <Image src="/logos/logo.svg" alt="Nodebase" width={22} height={22} />
            <span className="font-bold text-sm">
              Nodebase <span className="text-primary">Docs</span>
            </span>
          </Link>
          {selectedId && (
            <button
              onClick={() => setSelectedId(null)}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeftIcon className="size-3" />
              All Docs
            </button>
          )}
        </div>

        <div className="p-6 md:p-10">
          {selectedItem ? (
            <DetailPanel item={selectedItem} />
          ) : (
            <Welcome sections={filteredSections} onSelect={setSelectedId} />
          )}
        </div>
      </main>
    </div>
  );
}
