
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Search,
  UserRound,
} from "lucide-react";

type Scheme = Record<string, unknown>;

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function readValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function field(scheme: Scheme, ...keys: string[]): unknown {
  for (const key of keys) {
    if (scheme[key] !== null && scheme[key] !== undefined) {
      return scheme[key];
    }
  }
  return undefined;
}

function getDocuments(scheme: Scheme): string[] {
  const raw = field(
    scheme,
    "required_documents",
    "requiredDocuments",
    "documents_required",
    "documents",
  );

  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const doc = item as Record<string, unknown>;
          return readValue(
            doc.document_name ?? doc.name ?? doc.title ?? doc.document,
          );
        }
        return "";
      })
      .filter(Boolean);
  }

  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(readValue).filter(Boolean);
      }
    } catch {
      return raw
        .split(/\r?\n|[,;]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

export default function CheckDocumentsPage() {
  const locale = useLocale();

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [chatPosition, setChatPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragMoved = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const loadSchemes = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/schemes`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Could not load schemes.");

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
      setError(
        "Unable to load schemes. Check that the backend is running and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSchemes();
  }, [loadSchemes]);

  const schemeId = (scheme: Scheme, index: number) =>
    readValue(field(scheme, "scheme_id", "id")) || `scheme-${index}`;

  const schemeName = (scheme: Scheme) =>
    readValue(field(scheme, "scheme_name", "name", "title")) ||
    "Unnamed scheme";

  const selectedScheme = schemes.find(
    (scheme, index) => schemeId(scheme, index) === selectedId,
  );

  const documents = useMemo(
    () => (selectedScheme ? getDocuments(selectedScheme) : []),
    [selectedScheme],
  );

  const visibleSchemes = schemes.filter((scheme) =>
    schemeName(scheme).toLowerCase().includes(search.trim().toLowerCase()),
  );

  const availableCount = documents.filter(
    (doc) => checked[`${selectedId}:${doc}`],
  ).length;

  const readiness = documents.length
    ? Math.round((availableCount / documents.length) * 100)
    : 0;

  const missingDocuments = documents.filter(
    (doc) => !checked[`${selectedId}:${doc}`],
  );

  function selectScheme(id: string) {
    setSelectedId(id);
    setChecked({});
  }

  function startDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    dragOffset.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    lastPointer.current = { x: event.clientX, y: event.clientY };
    dragMoved.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

    if (
      Math.abs(event.clientX - lastPointer.current.x) > 3 ||
      Math.abs(event.clientY - lastPointer.current.y) > 3
    ) {
      dragMoved.current = true;
    }

    lastPointer.current = { x: event.clientX, y: event.clientY };

    if (!dragMoved.current) return;

    setChatPosition({
      x: Math.max(
        8,
        Math.min(
          event.clientX - dragOffset.current.x,
          window.innerWidth - 72,
        ),
      ),
      y: Math.max(
        8,
        Math.min(
          event.clientY - dragOffset.current.y,
          window.innerHeight - 72,
        ),
      ),
    });
  }

  function openChat() {
    if (dragMoved.current) {
      dragMoved.current = false;
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
            <p className="text-[11px] text-[#675660]">
              An Initiative for Women Entrepreneurs
            </p>
          </Link>

          <nav className="flex items-center gap-2 text-sm sm:gap-5">
            <Link href={`/${locale}`} className="rounded-md px-3 py-2 hover:bg-[#f2eae3]">
              Home
            </Link>
            <Link href={`/${locale}/schemes`} className="rounded-md px-3 py-2 hover:bg-[#f2eae3]">
              Explore Schemes
            </Link>
            <Link href={`/${locale}/about`} className="hidden rounded-md px-3 py-2 hover:bg-[#f2eae3] sm:block">
              About
            </Link>
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
              <h1 className="text-3xl font-semibold sm:text-4xl">
                Check Documents
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[#65555f] sm:text-base">
                Review the documents required for a government scheme and track
                which ones you already have.
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
                <option key={schemeId(scheme, index)} value={schemeId(scheme, index)}>
                  {schemeName(scheme)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p>{error}</p>
            <button
              onClick={() => void loadSchemes()}
              className="mt-2 font-semibold underline"
              type="button"
            >
              Try again
            </button>
          </div>
        )}

        {selectedScheme && (
          <>
            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-[1fr_280px]">
              <div className="rounded-xl border border-[#eee5dc] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#f0e5e8]">
                    <ClipboardCheck size={23} />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold">Required documents</h2>
                    <p className="text-sm text-[#7d6c80]">
                      Tick each document you currently have.
                    </p>
                  </div>
                </div>

                {documents.length > 0 ? (
                  <div className="mt-5 divide-y divide-[#eee5dc]">
                    {documents.map((doc) => {
                      const key = `${selectedId}:${doc}`;
                      const isAvailable = Boolean(checked[key]);

                      return (
                        <label
                          key={key}
                          className="flex cursor-pointer items-start gap-3 py-4"
                        >
                          <input
                            type="checkbox"
                            checked={isAvailable}
                            onChange={(event) =>
                              setChecked((previous) => ({
                                ...previous,
                                [key]: event.target.checked,
                              }))
                            }
                            className="mt-1 h-4 w-4 accent-[#512b50]"
                          />
                          <span className="flex-1 text-sm leading-6">
                            {doc}
                          </span>
                          {isAvailable && (
                            <CheckCircle2
                              size={18}
                              className="mt-1 text-green-700"
                            />
                          )}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-5 min-h-20 text-sm text-[#7d6c80]">
                    No required-document list is available for this scheme in
                    the current API response.
                  </p>
                )}
              </div>

              <aside className="h-fit rounded-xl border border-[#eee5dc] bg-white p-5 shadow-sm sm:p-6">
                <h2 className="font-semibold">Document readiness</h2>
                <div className="mt-5 flex items-end gap-2">
                  <span className="text-4xl font-semibold text-[#79517c]">
                    {readiness}%
                  </span>
                  <span className="mb-1 text-sm text-[#7d6c80]">
                    ready
                  </span>
                </div>
                <div
                  className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#eee5ec]"
                  role="progressbar"
                  aria-valuenow={readiness}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-[#79517c] transition-all"
                    style={{ width: `${readiness}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-[#7d6c80]">
                  {availableCount} of {documents.length} documents marked
                  available.
                </p>

                <div className="mt-5 rounded-lg bg-[#f7f1e7] p-4">
                  <p className="text-sm font-semibold">
                    {documents.length === 0
                      ? "Check the scheme requirements"
                      : missingDocuments.length === 0
                        ? "Checklist complete"
                        : "Documents to arrange"}
                  </p>
                  <p className="mt-1 text-sm text-[#65555f]">
                    {documents.length === 0
                      ? "Consult the scheme's official requirements."
                      : missingDocuments.length === 0
                        ? "You have marked every listed document as available."
                        : `${missingDocuments.length} listed document(s) are not yet marked available.`}
                  </p>
                </div>
              </aside>
            </div>

            {missingDocuments.length > 0 && documents.length > 0 && (
              <div className="mb-6 rounded-xl border border-[#eadfe5] bg-white p-5">
                <h2 className="font-semibold">Documents you may need to arrange</h2>
                <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-[#65555f]">
                  {missingDocuments.map((doc) => (
                    <li key={doc}>{doc}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mb-4 text-xs leading-5 text-[#7d6c80]">
              This percentage measures checklist completion only. It does not
              confirm scheme eligibility or validate uploaded documents.
              Confirm mandatory requirements against the official scheme
              guidelines.
            </p>
          </>
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

      {/* Uses the same icon asset and chatbot event as the profile page */}
      <div
        className="group fixed z-50"
        style={
          chatPosition
            ? { left: chatPosition.x, top: chatPosition.y }
            : { right: 24, bottom: 24 }
        }
      >
        <span className="pointer-events-none absolute bottom-full right-0 mb-3 whitespace-nowrap rounded-lg border border-[#eadfe5] bg-white px-4 py-2 text-xs font-medium text-[#512b50] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          Have a question?
        </span>
        <button
          type="button"
          aria-label="Open CivicEase chatbot. Drag to move."
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={openChat}
          onPointerCancel={() => {
            dragMoved.current = false;
          }}
          className="flex h-[68px] w-[68px] touch-none items-center justify-center rounded-full bg-transparent transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#8754e9]"
          style={{ cursor: "grab" }}
        >
          <img
            src="/chatbot-icon.png"
            alt=""
            draggable={false}
            className="h-full w-full select-none object-contain"
          />
        </button>
      </div>
    </main>
  );
}
