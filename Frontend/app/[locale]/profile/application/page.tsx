
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe,
  Landmark,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

type Scheme = Record<string, unknown>;

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function valueOf(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function getField(scheme: Scheme, ...keys: string[]): unknown {
  for (const key of keys) {
    if (scheme[key] !== null && scheme[key] !== undefined && scheme[key] !== "") {
      return scheme[key];
    }
  }
  return undefined;
}

function parseSteps(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const step = item as Record<string, unknown>;
          return valueOf(step.step ?? step.title ?? step.description ?? step.name);
        }
        return "";
      })
      .filter(Boolean);
  }

  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) return parseSteps(parsed);
    } catch {
      // Treat plain text as line-separated instructions.
    }

    return raw
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*(?:\d+[.)]|[-•])\s*/, "").trim())
      .filter(Boolean);
  }

  return [];
}

export default function ApplicationProcessPage() {
  const locale = useLocale();

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [chatPosition, setChatPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragMoved, setDragMoved] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const loadSchemes = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/schemes`, { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load schemes.");

      const data = await response.json();
      const rows = Array.isArray(data)
        ? data
        : Array.isArray(data.schemes)
          ? data.schemes
          : Array.isArray(data.results)
            ? data.results
            : [];

      setSchemes(rows);
    } catch {
      setError("Could not connect to the schemes database. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSchemes();
  }, [loadSchemes]);

  const getId = (scheme: Scheme, index: number) =>
    valueOf(getField(scheme, "scheme_id", "id")) || `scheme-${index}`;

  const getName = (scheme: Scheme) =>
    valueOf(getField(scheme, "scheme_name", "name", "title")) || "Unnamed scheme";

  const selectedScheme = schemes.find(
    (scheme, index) => getId(scheme, index) === selectedId,
  );

  const rawSteps = selectedScheme
    ? getField(
        selectedScheme,
        "application_steps",
        "application_process",
        "application_method",
        "how_to_apply",
        "application_instructions",
      )
    : undefined;

  const steps = parseSteps(rawSteps);

  const portal = selectedScheme
    ? valueOf(
        getField(
          selectedScheme,
          "official_portal",
          "application_url",
          "official_source",
          "application_link",
          "portal_url",
        ),
      )
    : "";

  const officeName = selectedScheme
    ? valueOf(getField(selectedScheme, "office_name", "application_office", "department"))
    : "";

  const officeAddress = selectedScheme
    ? valueOf(getField(selectedScheme, "office_address", "office_location", "address"))
    : "";

  const officePhone = selectedScheme
    ? valueOf(getField(selectedScheme, "office_phone", "contact_number", "helpline", "phone"))
    : "";

  const isHttpUrl = (url: string) => /^https?:\/\/\S+$/i.test(url);

  function selectScheme(id: string) {
    setSelectedId(id);
    setCompletedSteps({});
  }

  function startDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    setDragOffset({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    setDragMoved(false);
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (!dragging || !event.currentTarget.hasPointerCapture(event.pointerId)) return;

    setDragMoved(true);
    setChatPosition({
      x: Math.max(8, Math.min(event.clientX - dragOffset.x, window.innerWidth - 72)),
      y: Math.max(8, Math.min(event.clientY - dragOffset.y, window.innerHeight - 72)),
    });
  }

  function endDrag() {
    setDragging(false);
  }

  function openChatbot() {
    if (dragMoved) {
      setDragMoved(false);
      return;
    }
    window.dispatchEvent(new Event("civicease:open-chatbot"));
  }

  return (
    <main className="civicease-page flex min-h-screen w-full flex-col overflow-x-hidden bg-[#fcf8f0] text-[#512b50]">
      <header className="w-full border-b border-[#eee5dc] bg-[#fffaf3]">
        <div className="mx-auto flex min-h-[76px] max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 py-3 sm:px-10">
          <Link href={`/${locale}`} className="shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold">CivicEase</span>
              <span className="rounded-sm bg-[#f0eae0] px-2 py-1 text-[10px] font-semibold tracking-wider">
                MAHARASHTRA
              </span>
            </div>
            <p className="text-[11px] text-[#675660]">An Initiative for Women Entrepreneurs</p>
          </Link>

          <nav className="flex items-center gap-2 text-sm sm:gap-5">
            <Link href={`/${locale}`} className="rounded-md px-3 py-2 hover:bg-[#f2eae3]">Home</Link>
            <Link href={`/${locale}/schemes`} className="rounded-md px-3 py-2 hover:bg-[#f2eae3]">Explore Schemes</Link>
            <Link href={`/${locale}/about`} className="hidden rounded-md px-3 py-2 hover:bg-[#f2eae3] sm:block">About</Link>
            <Link
              href={`/${locale}/profile/dashboard`}
              aria-current="page"
              className="rounded-md border-b-2 border-[#512b50] bg-[#f0e5e8] px-4 py-2 font-semibold"
            >
              Profile
            </Link>
          </nav>

          <Link
            href={`/${locale}/profile/dashboard`}
            aria-label="Profile dashboard"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#512b50]"
          >
            <UserRound size={22} color="#FFFFFF" strokeWidth={2.5} />
          </Link>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-5 py-7 sm:px-10 sm:py-9">
        <div className="mb-6 rounded-xl bg-[#f7f1e7] p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl">Application Process</h1>
              <p className="mt-2 max-w-2xl text-sm text-[#65555f] sm:text-base">
                Follow the application instructions and find the official online or offline application channel.
              </p>
            </div>

            <Link
              href={`/${locale}/profile/dashboard`}
              className="inline-flex items-center gap-2 rounded-md border border-[#c5a0b9] bg-[#fffaf3] px-4 py-2 text-sm font-semibold hover:bg-[#f1e5ed]"
            >
              <ArrowLeft size={17} /> Back
            </Link>
          </div>

          <label className="mt-6 block max-w-xl text-sm font-semibold">
            Select a scheme
            <select
              value={selectedId}
              onChange={(event) => selectScheme(event.target.value)}
              disabled={loading || schemes.length === 0}
              className="mt-2 w-full rounded-lg border border-[#e7dce4] bg-white px-4 py-3 font-normal outline-none focus:border-[#79517c]"
            >
              <option value="">
                {loading ? "Loading schemes..." : "Choose a scheme"}
              </option>
              {schemes.map((scheme, index) => (
                <option key={getId(scheme, index)} value={getId(scheme, index)}>
                  {getName(scheme)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p>{error}</p>
            <button type="button" onClick={() => void loadSchemes()} className="mt-2 font-semibold underline">
              Try again
            </button>
          </div>
        )}

        {selectedScheme && (
          <div className="grid flex-1 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="rounded-xl border border-[#eee5dc] bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#f0e5e8]">
                  <FileText size={23} />
                </span>
                <div>
                  <h2 className="text-xl font-semibold">{getName(selectedScheme)}</h2>
                  <p className="text-sm text-[#7d6c80]">Application steps</p>
                </div>
              </div>

              {steps.length > 0 ? (
                <ol className="mt-7 space-y-5">
                  {steps.map((step, index) => (
                    <li key={`${index}-${step}`} className="flex gap-3">
                      <button
                        type="button"
                        aria-label={`Mark step ${index + 1} complete`}
                        aria-pressed={Boolean(completedSteps[index])}
                        onClick={() =>
                          setCompletedSteps((previous) => ({
                            ...previous,
                            [index]: !previous[index],
                          }))
                        }
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          completedSteps[index]
                            ? "bg-green-100 text-green-800"
                            : "bg-[#f0e5e8] text-[#512b50]"
                        }`}
                      >
                        {completedSteps[index] ? <CheckCircle2 size={18} /> : index + 1}
                      </button>
                      <p className={`pt-1 text-sm leading-6 ${completedSteps[index] ? "text-[#7d6c80] line-through" : "text-[#514451]"}`}>
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-6 text-sm leading-6 text-[#7d6c80]">
                  Detailed application steps are not available in the current database response. Check the official scheme source for the latest instructions.
                </p>
              )}
            </section>

            <aside className="space-y-5">
              <section className="rounded-xl border border-[#eee5dc] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f0e5e8]">
                    <Globe size={21} />
                  </span>
                  <h2 className="font-semibold">Apply online</h2>
                </div>

                {isHttpUrl(portal) ? (
                  <>
                    <p className="mt-4 break-words text-sm text-[#65555f]">{portal}</p>
                    <a
                      href={portal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#512b50] px-4 py-3 text-sm font-semibold text-white hover:bg-[#42213f]"
                    >
                      Open official portal <ExternalLink size={16} />
                    </a>
                  </>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-[#7d6c80]">
                    An official online application URL is not available in the current database record.
                  </p>
                )}
              </section>

              <section className="rounded-xl border border-[#eee5dc] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f0e5e8]">
                    <Landmark size={21} />
                  </span>
                  <h2 className="font-semibold">Offline application</h2>
                </div>

                {officeName && officeName !== "—" && (
                  <p className="mt-4 text-sm font-semibold">{officeName}</p>
                )}

                {officeAddress && officeAddress !== "—" && (
                  <p className="mt-3 flex gap-2 text-sm leading-6 text-[#65555f]">
                    <MapPin size={17} className="mt-1 shrink-0" />
                    {officeAddress}
                  </p>
                )}

                {officePhone && officePhone !== "—" && (
                  <p className="mt-3 flex gap-2 text-sm text-[#65555f]">
                    <Phone size={17} className="shrink-0" />
                    {officePhone}
                  </p>
                )}

                {(!officeName || officeName === "—") &&
                  (!officeAddress || officeAddress === "—") &&
                  (!officePhone || officePhone === "—") && (
                    <p className="mt-4 text-sm leading-6 text-[#7d6c80]">
                      Offline office and contact details are not available in the current database record. Please verify them through the relevant government department.
                    </p>
                  )}
              </section>
            </aside>
          </div>
        )}

        {!selectedScheme && !loading && !error && (
          <div className="min-h-[340px] flex-1 rounded-xl border border-[#eee5dc] bg-white shadow-sm" />
        )}
      </section>

      <footer className="mt-auto w-full border-t border-[#eee5dc] bg-[#f7f1e7]">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 py-5 text-xs text-[#65555f] sm:px-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xl font-semibold text-[#512b50]">CivicEase</span>
            <span className="rounded-sm bg-[#eee7dc] px-2 py-1 text-[10px] tracking-wider">MAHARASHTRA</span>
            <span>© 2025 CivicEase Maharashtra. All statutory rights reserved.</span>
          </div>
          <div className="flex flex-wrap gap-5">
            <Link href={`/${locale}/about`}>About Us</Link>
            <Link href={`/${locale}/faqs`}>FAQs</Link>
            <Link href={`/${locale}/contact`}>Contact Us</Link>
            <Link href={`/${locale}/sources`}>Official Sources</Link>
          </div>
        </div>
      </footer>

      {/* Movable chatbot icon */}
      <div
        className="group fixed z-50"
        style={chatPosition ? { left: chatPosition.x, top: chatPosition.y } : { right: 24, bottom: 24 }}
      >
        <span className="pointer-events-none absolute bottom-full right-0 mb-3 whitespace-nowrap rounded-lg border border-[#eadfe5] bg-white px-4 py-2 text-xs font-medium text-[#512b50] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          Have a question?
        </span>
        <button
          type="button"
          aria-label="Open CivicEase chatbot. Drag to move."
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onClick={openChatbot}
          className="flex h-[68px] w-[68px] touch-none items-center justify-center rounded-full bg-transparent transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#8754e9]"
          style={{ cursor: dragging ? "grabbing" : "grab" }}
        >
          <img src="/chatbot-icon.png" alt="" draggable={false} className="h-full w-full select-none object-contain" />
        </button>
      </div>
    </main>
  );
}
