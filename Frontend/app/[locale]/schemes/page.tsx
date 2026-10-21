
"use client";
import ChatbotWidget from "../../../components/ChatbotWidget";
import "./schemes.css";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
  Landmark,
  LoaderCircle,
} from "lucide-react";
import Link from "next/link";

type Scheme = {
  id?: string | number;
  scheme_id?: string | number;
  name?: string;
  scheme_name?: string;
  title?: string;
  description?: string;
  department?: string;
  ministry?: string;
  scheme_level?: string;
  level?: string;
  benefits?: unknown;
  eligibility_rules?: unknown;
  eligibility?: unknown;
  documents?: unknown;
  required_documents?: unknown;
  application_method?: string;
  application_process?: string;
  official_source?: string;
  official_link?: string;
  source_url?: string;
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "Information not available";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.map(formatValue).join(", ");
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(
        ([key, item]) =>
          `${key.replace(/_/g, " ")}: ${formatValue(item)}`
      )
      .join(" · ");
  }

  return String(value);
}

function getName(scheme: Scheme): string {
  return (
    scheme.scheme_name ||
    scheme.name ||
    scheme.title ||
    "Unnamed scheme"
  );
}

function getId(scheme: Scheme, index: number): string {
  return String(
    scheme.scheme_id ??
      scheme.id ??
      `CE-${String(index + 1).padStart(3, "0")}`
  );
}

function getOfficialLink(scheme: Scheme): string | undefined {
  const value =
    scheme.official_link ||
    scheme.official_source ||
    scheme.source_url;

  return typeof value === "string" && /^https?:\/\//i.test(value)
    ? value
    : undefined;
}

export default function BrowseSchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadSchemes() {
      try {
        setLoading(true);
        setError("");

        // Read the local JSON dataset, not PostgreSQL.
        const response = await fetch(
          "http://127.0.0.1:8000/schemes",
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Backend returned status ${response.status}.`
          );
        }

        const data: unknown = await response.json();

        const list: unknown[] | null = Array.isArray(data)
          ? data
          : data !== null &&
              typeof data === "object" &&
              "schemes" in data &&
              Array.isArray(data.schemes)
            ? data.schemes
            : null;

        if (!list) {
          throw new Error(
            "The API response does not contain a schemes list."
          );
        }

        setSchemes(list as Scheme[]);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Could not load schemes from the backend."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadSchemes();

    return () => controller.abort();
  }, []);

  const filteredSchemes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return schemes;

    return schemes.filter((scheme, index) => {
      const fields = [
        getName(scheme),
        getId(scheme, index),
        scheme.department,
        scheme.ministry,
        scheme.scheme_level,
        scheme.level,
        scheme.description,
      ];

      return fields
        .filter(
          (value) =>
            typeof value === "string" ||
            typeof value === "number"
        )
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [schemes, search]);

  return (
    <main className="browse-shell">
      <header className="browse-header">
        <Link href="/" className="browse-brand">
          <span className="browse-brand-name">CivicEase</span>
          <span className="browse-brand-tag">MAHARASHTRA</span>
          <span className="browse-brand-subtitle">
            An Initiative for Women Entrepreneurs
          </span>
        </Link>

        <Link href="/" className="back-home">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </header>

      <section className="browse-intro">
        <div className="browse-eyebrow">
          <Landmark size={16} />
          GOVERNMENT SCHEME DIRECTORY
        </div>

        <h1>Explore Schemes</h1>

        <p>
          Discover government support for women entrepreneurs. Compare
          schemes and explore their benefits, eligibility requirements
          and application details.
        </p>

        <div className="browse-search">
          <Search size={20} />
          <input
            type="search"
            placeholder="Search by scheme name, ID or department..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search schemes"
          />
        </div>

        <div className="browse-count">
          {loading
            ? "Loading schemes..."
            : `${filteredSchemes.length} scheme${
                filteredSchemes.length === 1 ? "" : "s"
              } found`}
        </div>
      </section>

      <section className="scheme-results">
        {loading ? (
          <div className="browse-message">
            <LoaderCircle className="loading-icon" size={25} />
            <p>Loading government schemes...</p>
          </div>
        ) : error ? (
          <div className="browse-message browse-error">
            <h2>Unable to load schemes</h2>
            <p>{error}</p>
            <p>
              Ensure your FastAPI backend is running at{" "}
              <code>http://127.0.0.1:8000</code> and that{" "}
              <code>/schemes/json</code> works.
            </p>
            <button
              className="retry-button"
              type="button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="browse-message">
            <FileText size={30} />
            <h2>No schemes found</h2>
            <p>Try another search term.</p>
          </div>
        ) : (
          <div className="scheme-table-wrap">
            <table className="scheme-table">
              <thead>
                <tr>
                  <th>Scheme ID</th>
                  <th>Scheme Name</th>
                  <th>Department</th>
                  <th>Scheme Level</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {filteredSchemes.map((scheme, index) => {
                  const id = getId(scheme, index);
                  const expanded = expandedId === id;
                  const officialLink = getOfficialLink(scheme);

                  return (
                    <Fragment key={`${id}-${index}`}>
                      <tr
                        className={
                          expanded
                            ? "scheme-row selected"
                            : "scheme-row"
                        }
                      >
                        <td>
                          <span className="scheme-id">{id}</span>
                        </td>

                        <td>
                          <span className="scheme-name">
                            {getName(scheme)}
                          </span>
                          <span className="scheme-mobile-meta">
                            {formatValue(
                              scheme.department || scheme.ministry
                            )}
                          </span>
                        </td>

                        <td>
                          {formatValue(
                            scheme.department || scheme.ministry
                          )}
                        </td>

                        <td>
                          <span className="scheme-level">
                            {formatValue(
                              scheme.scheme_level || scheme.level
                            )}
                          </span>
                        </td>

                        <td>
                          <button
                            className="details-button"
                            type="button"
                            onClick={() =>
                              setExpandedId(expanded ? null : id)
                            }
                            aria-expanded={expanded}
                          >
                            {expanded ? "Hide" : "View"}
                            {expanded ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        </td>
                      </tr>

                      {expanded && (
                        <tr className="details-row">
                          <td colSpan={5}>
                            <div className="scheme-details">
                              <h3>{getName(scheme)}</h3>

                              <div className="detail-grid">
                                <div className="detail-item detail-wide">
                                  <h4>Description</h4>
                                  <p>
                                    {formatValue(scheme.description)}
                                  </p>
                                </div>

                                <div className="detail-item">
                                  <h4>Benefits</h4>
                                  <p>
                                    {formatValue(scheme.benefits)}
                                  </p>
                                </div>

                                <div className="detail-item">
                                  <h4>Eligibility requirements</h4>
                                  <p>
                                    {formatValue(
                                      scheme.eligibility_rules ??
                                        scheme.eligibility
                                    )}
                                  </p>
                                </div>

                                <div className="detail-item">
                                  <h4>Required documents</h4>
                                  <p>
                                    {formatValue(
                                      scheme.required_documents ??
                                        scheme.documents
                                    )}
                                  </p>
                                </div>

                                <div className="detail-item">
                                  <h4>Application process</h4>
                                  <p>
                                    {formatValue(
                                      scheme.application_method ??
                                        scheme.application_process
                                    )}
                                  </p>
                                </div>
                              </div>

                              {officialLink && (
                                <a
                                  className="official-link"
                                  href={officialLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Visit Official Source
                                  <ExternalLink size={15} />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="browse-footer">
        <span>CivicEase · Maharashtra</span>
        <span>
          Always verify scheme details with the official department.
        </span>
        <ChatbotWidget />
      </footer>
    </main>
  );
}
