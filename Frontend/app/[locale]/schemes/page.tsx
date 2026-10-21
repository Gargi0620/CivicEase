
"use client";

import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { useEffect, useMemo, useState } from "react";
import "./schemes.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Scheme = {
  scheme_id?: string | number;
  name?: string;
  level?: string;
  state?: string;
  category?: string;
  description?: string;
  benefits?: {
    type?: string;
    minimum_amount?: number;
    maximum_amount?: number;
    maximum_project_amount?: number;
    maximum_manufacturing_project_cost?: number;
    maximum_service_project_cost?: number;
    interest_rate?: number;
  };
  eligibility_rules?: {
    field?: string;
    reason?: string;
  }[];
  required_documents?: string[];
  application_method?: string;
  official_source?: string;
  last_verified?: string;
  [key: string]: unknown;
};

function getValue(scheme: Scheme, field: string): string {
  switch (field) {
    case "scheme_id":
      return String(scheme.scheme_id ?? "");

    case "scheme_name":
      return scheme.name ?? "";

    case "department":
      return scheme.official_source ?? "";

    case "scheme_level":
      return scheme.level ?? "";

    case "target_beneficiaries":
      return scheme.category ?? "";

    case "business_stage":
      return (
        scheme.eligibility_rules
          ?.map((rule) => rule.reason)
          .filter((reason): reason is string => Boolean(reason))
          .join(" ") ?? ""
      );

    case "business_type":
      return scheme.description ?? "";

    default:
      return "";
  }
}

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout>;

    async function loadSchemes() {
      setLoading(true);
      setError("");

      // Stop waiting if the API takes longer than 10 seconds.
      timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(`${API_BASE}/schemes`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Unable to load schemes (HTTP ${response.status}).`
          );
        }

        const result: unknown = await response.json();

        let records: unknown[] | null = null;

        if (Array.isArray(result)) {
          records = result;
        } else if (result && typeof result === "object") {
          const data = result as Record<string, unknown>;

          if (Array.isArray(data.schemes)) {
            records = data.schemes;
          } else if (Array.isArray(data.items)) {
            records = data.items;
          } else if (Array.isArray(data.data)) {
            records = data.data;
          }
        }

        if (!records) {
          throw new Error(
            "The API response is not a list of schemes. Check the GET /schemes response format."
          );
        }

        setSchemes(records as Scheme[]);
      } catch (err) {
        if (controller.signal.aborted) {
          setError(
            "The request timed out after 10 seconds. Check that the backend is running and accessible."
          );
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading schemes."
          );
        }
      } finally {
        clearTimeout(timeoutId);

        if (!controller.signal.aborted) {
          setLoading(false);
        } else {
          // The timeout also needs to end the loading state.
          setLoading(false);
        }
      }
    }

    loadSchemes();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const filteredSchemes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return schemes;

    return schemes.filter((scheme) =>
      [
        getValue(scheme, "scheme_id"),
        getValue(scheme, "scheme_name"),
        getValue(scheme, "department"),
        getValue(scheme, "scheme_level"),
        getValue(scheme, "target_beneficiaries"),
        getValue(scheme, "business_stage"),
        getValue(scheme, "business_type"),
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [schemes, search]);

  return (
    <div className="page-layout">
      <SiteHeader active="schemes" />

      <main className="schemes-main">
        <section className="schemes-heading">
          <div>
            <h1>Explore Schemes</h1>
            <p>
              Comprehensive repository of government schemes and
              enterprise assistance for women entrepreneurs in Maharashtra.
            </p>
          </div>

          <label className="scheme-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search scheme name or department..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search schemes"
            />
          </label>
        </section>

        <section className="schemes-table-card">
          <div className="schemes-table-scroll">
            <table className="schemes-table">
              <thead>
                <tr>
                  <th>SCHEME_ID</th>
                  <th>SCHEME_NAME</th>
                  <th>DEPARTMENT</th>
                  <th>SCHEME_LEVEL</th>
                  <th>TARGET_BENEFICIARIES</th>
                  <th>BUSINESS_STAGE</th>
                  <th>BUSINESS_TYPE</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="table-message">
                      Loading schemes...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="table-message table-error">
                      <p>{error}</p>
                      <button
                        type="button"
                        className="retry-button"
                        onClick={() => window.location.reload()}
                      >
                        Retry
                      </button>
                      <p>
                        Verify that FastAPI is running and GET /schemes
                        returns a successful response.
                      </p>
                    </td>
                  </tr>
                ) : filteredSchemes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-message">
                      {schemes.length === 0
                        ? "No schemes are available."
                        : "No schemes match your search."}
                    </td>
                  </tr>
                ) : (
                  filteredSchemes.map((scheme, index) => (
                    <tr key={getValue(scheme, "scheme_id") || index}>
                      <td>{getValue(scheme, "scheme_id") || "—"}</td>
                      <td>{getValue(scheme, "scheme_name") || "—"}</td>
                      <td>{getValue(scheme, "department") || "—"}</td>
                      <td>{getValue(scheme, "scheme_level") || "—"}</td>
                      <td>
                        {getValue(scheme, "target_beneficiaries") || "—"}
                      </td>
                      <td>{getValue(scheme, "business_stage") || "—"}</td>
                      <td>{getValue(scheme, "business_type") || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
