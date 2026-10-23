
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

type Scheme = Record<string, unknown>;

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function textValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function getField(scheme: Scheme, ...keys: string[]): string {
  for (const key of keys) {
    const value = scheme[key];
    if (value !== null && value !== undefined && value !== "") {
      return textValue(value);
    }
  }
  return "—";
}

function getStatus(scheme: Scheme): string {
  return String(scheme.status || "needs_review");
}

function statusLabel(status: string): string {
  switch (status) {
    case "eligible":
      return "Matches configured rules";
    case "not_eligible":
      return "Does not meet criteria";
    case "needs_more_information":
      return "More information needed";
    case "needs_review":
    default:
      return "Preliminary match";
  }
}

export default function PersonalisedSchemesPage() {
  const locale = useLocale();
  const router = useRouter();

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [levelFilter, setLevelFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const [chatPosition, setChatPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const dragOffset = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const savedProfile = sessionStorage.getItem("civiceaseProfile");

      if (!savedProfile) {
        throw new Error(
          "Please complete your questionnaire before viewing personalised schemes."
        );
      }

      const profile = JSON.parse(savedProfile);

      const response = await fetch(`${API_BASE}/eligibility-check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          details: profile,
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail ||
            "Unable to match schemes to your profile."
        );
      }

      const data = await response.json();

      if (!Array.isArray(data.results)) {
        throw new Error(
          "The matching API returned an unexpected response."
        );
      }

      setSchemes(data.results);
    } catch (err) {
      setSchemes([]);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load personalised schemes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSchemes();
  }, [fetchSchemes]);

  const levels = useMemo(
    () =>
      Array.from(
        new Set(
          schemes
            .map((s) => getField(s, "scheme_level", "level"))
            .filter((v) => v !== "—")
        )
      ),
    [schemes]
  );

  const departments = useMemo(
    () =>
      Array.from(
        new Set(
          schemes
            .map((s) =>
              getField(s, "department", "department_name", "ministry")
            )
            .filter((v) => v !== "—")
        )
      ),
    [schemes]
  );

  const filteredSchemes = useMemo(() => {
    const term = search.trim().toLowerCase();

    return schemes.filter((scheme) => {
      const name = getField(scheme, "scheme_name", "name", "title");
      const department = getField(
        scheme,
        "department",
        "department_name",
        "ministry"
      );
      const level = getField(scheme, "scheme_level", "level");
      const benefits = getField(scheme, "benefits", "description");
      const eligibility = getField(
        scheme,
        "eligibility_criteria",
        "target_beneficiaries"
      );

      const reasons = Array.isArray(scheme.match_reasons)
        ? scheme.match_reasons.map(String).join(" ")
        : "";

      const matchesSearch =
        !term ||
        [name, department, level, benefits, eligibility, reasons]
          .some((value) => value.toLowerCase().includes(term));

      const matchesLevel =
        levelFilter === "all" || level === levelFilter;

      const matchesDepartment =
        departmentFilter === "all" ||
        department === departmentFilter;

      return matchesSearch && matchesLevel && matchesDepartment;
    });
  }, [schemes, search, levelFilter, departmentFilter]);

  function startDragging(
    event: React.PointerEvent<HTMLButtonElement>
  ) {
    if (event.button !== 0) return;

    const rect = event.currentTarget.getBoundingClientRect();

    dragOffset.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    dragging.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveChatbot(
    event: React.PointerEvent<HTMLButtonElement>
  ) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

    const dx = event.clientX - dragOffset.current.x;
    const dy = event.clientY - dragOffset.current.y;

    if (
      Math.abs(event.movementX) > 2 ||
      Math.abs(event.movementY) > 2
    ) {
      dragging.current = true;
    }

    setChatPosition({
      x: Math.max(8, Math.min(dx, window.innerWidth - 68)),
      y: Math.max(8, Math.min(dy, window.innerHeight - 68)),
    });
  }

  function openChatbot() {
    if (dragging.current) {
      dragging.current = false;
      return;
    }

    window.dispatchEvent(new Event("civicease:open-chatbot"));
  }

  return (
    <main className="civicease-page min-h-screen w-full flex flex-col overflow-x-hidden bg-[#fcf8f0] text-[#512b50]">
      <header className="w-full border-b border-[#eee5dc] bg-[#fffaf3]">
        <div className="mx-auto flex min-h-[76px] max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 py-3 sm:px-10">
          <Link href={`/${locale}`} className="shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold tracking-tight">
                CivicEase
              </span>
              <span className="rounded-sm bg-[#f0eae0] px-2 py-1 text-[10px] font-semibold tracking-wider text-[#65555f]">
                MAHARASHTRA
              </span>
            </div>
            <p className="text-[11px] text-[#675660]">
              An Initiative for Women Entrepreneurs
            </p>
          </Link>

          <nav className="flex items-center gap-2 text-sm sm:gap-5">
            <Link
              href={`/${locale}`}
              className="rounded-md px-3 py-2 hover:bg-[#f2eae3]"
            >
              Home
            </Link>
            <Link
              href={`/${locale}/schemes`}
              className="rounded-md px-3 py-2 hover:bg-[#f2eae3]"
            >
              Explore Schemes
            </Link>
            <Link
              href={`/${locale}/profile/dashboard`}
              aria-current="page"
              className="rounded-md bg-[#f0e5e8] px-4 py-2 font-semibold text-[#512b50]"
            >
              Profile
            </Link>
            <Link
              href={`/${locale}/about`}
              className="hidden rounded-md px-3 py-2 hover:bg-[#f2eae3] sm:block"
            >
              About
            </Link>
          </nav>

          <Link
            href={`/${locale}/profile/dashboard`}
            aria-label="Profile"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#512b50] text-white"
          >
            <UserRound size={22} />
          </Link>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-5 py-7 sm:px-10 sm:py-9">
        <div className="mb-5 rounded-xl bg-[#f7f1e7] p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Your Personalised Schemes
              </h1>
              <p className="mt-2 text-sm text-[#65555f] sm:text-base">
                Government schemes matched to your profile and business needs.
              </p>
              <p className="mt-5 flex items-center gap-2 text-sm font-medium">
                <UserRound size={18} />
                {loading
                  ? "Finding schemes for you..."
                  : `${filteredSchemes.length} matching schemes`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push(`/${locale}/profile/dashboard`)}
              className="inline-flex items-center gap-2 rounded-md border border-[#c5a0b9] bg-[#fffaf3] px-4 py-2 text-sm font-semibold transition hover:bg-[#f1e5ed]"
            >
              <ArrowLeft size={17} />
              Back
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-[#eee5dc] bg-white px-3 py-2 sm:max-w-[440px]">
              <Search size={18} className="shrink-0 text-[#7d6c80]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search scheme name or department..."
                aria-label="Search schemes"
                className="w-full bg-transparent text-sm text-[#512b50] outline-none placeholder:text-[#887b8a]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              aria-expanded={showFilters}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f0e5e8] px-5 py-2.5 text-sm font-semibold transition hover:bg-[#e7d5df]"
            >
              <SlidersHorizontal size={17} />
              Filter
              <ChevronDown
                size={15}
                className={showFilters ? "rotate-180" : ""}
              />
            </button>

            <button
              type="button"
              onClick={() => void fetchSchemes()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#c5a0b9] bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-4 rounded-lg border border-[#eadfe5] bg-white/70 p-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Scheme level</span>
                <select
                  value={levelFilter}
                  onChange={(event) => setLevelFilter(event.target.value)}
                  className="min-w-40 rounded-md border border-[#e7dce4] bg-white px-3 py-2"
                >
                  <option value="all">All levels</option>
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Department</span>
                <select
                  value={departmentFilter}
                  onChange={(event) =>
                    setDepartmentFilter(event.target.value)
                  }
                  className="min-w-48 rounded-md border border-[#e7dce4] bg-white px-3 py-2"
                >
                  <option value="all">All departments</option>
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => {
                  setLevelFilter("all");
                  setDepartmentFilter("all");
                  setSearch("");
                }}
                className="self-end rounded-md px-3 py-2 text-sm font-medium underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {!loading && !error && schemes.length > 0 && (
          <p className="mb-3 text-sm text-[#65555f]">
            These are preliminary profile matches unless a scheme has
            verified structured eligibility rules. A match does not
            guarantee government approval.
          </p>
        )}

        <div className="min-h-[420px] flex-1 overflow-hidden rounded-xl border border-[#eee5dc] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
              <thead className="bg-[#f7f2e9] text-xs uppercase tracking-wide text-[#65435e]">
                <tr>
                  <th className="border-r border-[#eee5dc] px-4 py-4">
                    Scheme name
                  </th>
                  <th className="border-r border-[#eee5dc] px-4 py-4">
                    Match status
                  </th>
                  <th className="border-r border-[#eee5dc] px-4 py-4">
                    Department
                  </th>
                  <th className="border-r border-[#eee5dc] px-4 py-4">
                    Scheme level
                  </th>
                  <th className="border-r border-[#eee5dc] px-4 py-4">
                    Benefits
                  </th>
                  <th className="border-r border-[#eee5dc] px-4 py-4">
                    Eligibility
                  </th>
                  <th className="px-4 py-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="h-24 px-4 text-center text-[#796a79]">
                      Finding schemes that match your questionnaire...
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <p className="text-sm text-[#8a354a]">{error}</p>
                      <button
                        type="button"
                        onClick={() => void fetchSchemes()}
                        className="mt-3 rounded-md bg-[#512b50] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Try again
                      </button>
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  filteredSchemes.map((scheme, index) => {
                    const schemeId = getField(scheme, "scheme_id", "id");
                    const name = getField(scheme, "scheme_name", "name", "title");
                    const status = getStatus(scheme);

                    const reasons = Array.isArray(scheme.match_reasons)
                      ? scheme.match_reasons.map(String)
                      : [];

                    return (
                      <tr
                        key={`${schemeId}-${index}`}
                        className="border-t border-[#eee5dc] transition hover:bg-[#fcf8f3]"
                      >
                        <td className="max-w-[260px] px-4 py-5 font-medium text-[#512b50]">
                          {name}
                          {reasons.length > 0 && (
                            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs font-normal text-[#65555f]">
                              {reasons.map((reason, i) => (
                                <li key={`${schemeId}-reason-${i}`}>
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>

                        <td className="px-4 py-5">
                          <span className="inline-block rounded-full bg-[#f4eaf2] px-3 py-1 text-xs font-medium text-[#512b50]">
                            {statusLabel(status)}
                          </span>
                        </td>

                        <td className="max-w-[220px] px-4 py-5 text-[#655b6b]">
                          {getField(scheme, "department", "department_name", "ministry")}
                        </td>

                        <td className="px-4 py-5 text-[#655b6b]">
                          {getField(scheme, "scheme_level", "level")}
                        </td>

                        <td className="max-w-[230px] px-4 py-5 text-[#655b6b]">
                          {getField(scheme, "benefits", "description")}
                        </td>

                        <td className="max-w-[240px] px-4 py-5 text-[#655b6b]">
                          {getField(
                            scheme,
                            "eligibility_criteria",
                            "target_beneficiaries"
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-5">
                          <Link
                            href={`/${locale}/schemes/${encodeURIComponent(schemeId)}`}
                            className="inline-flex items-center gap-2 font-semibold text-[#7b1d5b] hover:underline"
                          >
                            View details <ArrowRight size={16} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}

                {!loading &&
                  !error &&
                  filteredSchemes.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <h2 className="text-lg font-semibold">
                          No matching schemes found
                        </h2>
                        <p className="mt-2 text-sm text-[#65555f]">
                          Try clearing your search or filters. If your
                          profile is incomplete, review your questionnaire
                          answers and try again.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            setLevelFilter("all");
                            setDepartmentFilter("all");
                          }}
                          className="mt-4 rounded-md bg-[#512b50] px-4 py-2 text-sm font-semibold text-white"
                        >
                          Clear filters
                        </button>
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <footer className="mt-auto w-full border-t border-[#eee5dc] bg-[#f7f1e7]">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 py-5 text-xs text-[#65555f] sm:px-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xl font-semibold text-[#512b50]">
              CivicEase
            </span>
            <span className="rounded-sm bg-[#eee7dc] px-2 py-1 text-[10px] tracking-wider">
              MAHARASHTRA
            </span>
            <span className="hidden text-[#d4c7cb] sm:inline">|</span>
            <span>
              © 2025 CivicEase Maharashtra. All statutory rights reserved.
            </span>
          </div>

          <div className="flex flex-wrap gap-5">
            <Link href={`/${locale}/about`} className="hover:underline">
              About Us
            </Link>
            <Link href={`/${locale}/faqs`} className="hover:underline">
              FAQs
            </Link>
            <Link href={`/${locale}/contact`} className="hover:underline">
              Contact Us
            </Link>
            <Link href={`/${locale}/sources`} className="hover:underline">
              Official Sources
            </Link>
          </div>
        </div>
      </footer>

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
          onPointerDown={startDragging}
          onPointerMove={moveChatbot}
          onClick={openChatbot}
          className="flex h-16 w-16 touch-none items-center justify-center rounded-full bg-transparent transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#8754e9]"
          style={{ cursor: "grab" }}
        >
          <img
            src="/chatbot-icon.png"
            alt=""
            draggable={false}
            className="h-16 w-16 select-none object-contain"
          />
        </button>
      </div>
    </main>
  );
}
