
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Landmark,
  LoaderCircle,
  CheckCircle2,
  XCircle,
  CircleHelp,
} from "lucide-react";
import ChatbotWidget from "../../../../components/ChatbotWidget";

type RuleResult = {
  field?: string;
  reason?: string;
  user_value?: unknown;
  required_value?: unknown;
};

type Scheme = {
  scheme_id?: string | number;
  scheme_name?: string;
  description?: string;
  department?: string;
  scheme_level?: string;
  target_beneficiaries?: string;
  business_stage?: string;
  business_type?: string;
  eligibility_criteria?: string;
  eligibility_rules?: unknown;
  benefits?: unknown;
  documents_required?: unknown;
  application_process?: unknown;
  application_url?: string;
  official_source_url?: string;

  match_percentage?: number | null;
  score_type?: string;
  score_label?: string;
  status?: string;
  eligible?: boolean | null;
  match_type?: string;
  match_reasons?: string[];

  passed_rules?: RuleResult[];
  failed_rules?: RuleResult[];
  missing_rules?: RuleResult[];
  review_rules?: RuleResult[];

  matched_count?: number;
  unknown_count?: number | null;
  unmatched_count?: number | null;
  total_requirements?: number | null;
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
      .map(([key, item]) => {
        const readableKey = key.replace(/_/g, " ");
        return `${readableKey}: ${formatValue(item)}`;
      })
      .join(" · ");
  }

  return String(value);
}

function RequirementList({
  title,
  items,
  kind,
}: {
  title: string;
  items: RuleResult[];
  kind: "matched" | "unknown" | "unmatched";
}) {
  if (!items?.length) return null;

  const Icon =
    kind === "matched"
      ? CheckCircle2
      : kind === "unmatched"
        ? XCircle
        : CircleHelp;

  return (
    <section className={`assessment-section assessment-${kind}`}>
      <h3>
        <Icon size={19} />
        {title} ({items.length})
      </h3>

      <ul>
        {items.map((item, index) => (
          <li key={`${item.field ?? "rule"}-${index}`}>
            <strong>
              {item.reason || item.field || "Eligibility requirement"}
            </strong>

            {item.user_value !== undefined &&
              item.user_value !== null && (
                <p>Your answer: {formatValue(item.user_value)}</p>
              )}

            {item.required_value !== undefined && (
              <p>
                Requirement: {formatValue(item.required_value)}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function SchemeDetailsPage() {
  const params = useParams<{ locale: string; schemeId: string }>();
  const locale = params.locale || "en";
  const schemeId = decodeURIComponent(params.schemeId);

  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadScheme() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://127.0.0.1:8000/schemes/${encodeURIComponent(schemeId)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Scheme not found."
              : `Unable to load scheme. Server returned ${response.status}.`
          );
        }

        const data: Scheme = await response.json();
        setScheme(data);

        // Personalised results are saved by the questionnaire flow.
        // If available, merge the assessment for this scheme.
        try {
          const storedProfile = sessionStorage.getItem("civiceaseProfile");

          if (storedProfile) {
            const parsed = JSON.parse(storedProfile);
            const responseMatch = await fetch(
              "http://127.0.0.1:8000/eligibility-check",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ details: parsed }),
                signal: controller.signal,
              }
            );

            if (responseMatch.ok) {
              const matchData = await responseMatch.json();
              const result = (matchData.results || []).find(
                (item: Scheme) =>
                  String(item.scheme_id) === String(data.scheme_id)
              );

              if (result) {
                setScheme({ ...data, ...result });
              }
            }
          }
        } catch (assessmentError) {
          if (
            assessmentError instanceof Error &&
            assessmentError.name === "AbortError"
          ) {
            return;
          }

          // Scheme details remain available even if assessment fails.
          console.warn("Could not load personalised assessment.");
        }
      } catch (fetchError) {
        if (
          fetchError instanceof Error &&
          fetchError.name === "AbortError"
        ) {
          return;
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Something went wrong while loading the scheme."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadScheme();

    return () => controller.abort();
  }, [schemeId]);

  if (loading) {
    return (
      <main className="scheme-detail-shell">
        <div className="scheme-detail-message">
          <LoaderCircle className="loading-icon" size={28} />
          <p>Loading scheme details...</p>
        </div>
      </main>
    );
  }

  if (error || !scheme) {
    return (
      <main className="scheme-detail-shell">
        <Link
          href={`/${locale}/schemes`}
          className="scheme-back-link"
        >
          <ArrowLeft size={17} /> Back to schemes
        </Link>

        <div className="scheme-detail-message">
          <h1>Unable to load scheme</h1>
          <p>{error || "Scheme not found."}</p>
          <p>
            Check that the backend is running and that this scheme ID
            exists in PostgreSQL.
          </p>
        </div>
      </main>
    );
  }

  const officialUrl =
    scheme.official_source_url || scheme.application_url;

  const hasAssessment =
    scheme.match_type === "rule_based" ||
    scheme.match_type === "preliminary";

  const matchedRules = scheme.passed_rules || [];
  const unmatchedRules = scheme.failed_rules || [];
  const unknownRules = [
    ...(scheme.missing_rules || []),
    ...(scheme.review_rules || []),
  ];

  const isPlaceholder = scheme.score_type === "demo_placeholder";

  return (
    <main className="scheme-detail-shell">
      <header className="scheme-detail-header">
        <Link href={`/${locale}/schemes`} className="scheme-brand">
          <Landmark size={24} />
          <span>
            <strong>CivicEase</strong>
            <small>MAHARASHTRA · WOMEN ENTREPRENEURS</small>
          </span>
        </Link>

        <Link
          href={`/${locale}/schemes`}
          className="scheme-back-link"
        >
          <ArrowLeft size={17} />
          Back to schemes
        </Link>
      </header>

      <section className="scheme-detail-hero">
        <span className="scheme-detail-eyebrow">
          GOVERNMENT SCHEME DETAILS
        </span>

        <h1>{scheme.scheme_name || "Government scheme"}</h1>

        <p>
          {scheme.description ||
            scheme.eligibility_criteria ||
            "Review the scheme information and official application source below."}
        </p>

        <div className="scheme-detail-meta">
          <span>ID: {scheme.scheme_id}</span>
          {scheme.department && <span>{scheme.department}</span>}
          {scheme.scheme_level && <span>{scheme.scheme_level}</span>}
        </div>
      </section>

      {hasAssessment && (
        <section className="assessment-card">
          <span className="scheme-detail-eyebrow">
            YOUR PERSONALIZED ASSESSMENT
          </span>

          {scheme.match_percentage !== null &&
          scheme.match_percentage !== undefined ? (
            <>
              <div className="assessment-score">
                <strong>{scheme.match_percentage}%</strong>
                <span>
                  {scheme.score_label ||
                    (isPlaceholder
                      ? "Preliminary profile match · Demo estimate"
                      : "Match with configured requirements")}
                </span>
              </div>

              <div className="assessment-progress">
                <div
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, scheme.match_percentage)
                    )}%`,
                  }}
                />
              </div>
            </>
          ) : (
            <p>
              A percentage is not available yet because the scheme's
              structured eligibility rules are incomplete.
            </p>
          )}

          {isPlaceholder && (
            <p className="assessment-disclaimer">
              This is a temporary demonstration estimate, not a
              calculated eligibility score or approval prediction.
            </p>
          )}

          {scheme.match_type === "rule_based" && (
            <>
              <div className="assessment-counts">
                <span>Matched: {scheme.matched_count ?? 0}</span>
                <span>Unknown: {scheme.unknown_count ?? 0}</span>
                <span>Not matched: {scheme.unmatched_count ?? 0}</span>
              </div>

              <RequirementList
                title="Matched requirements"
                items={matchedRules}
                kind="matched"
              />

              <RequirementList
                title="Needs more information or review"
                items={unknownRules}
                kind="unknown"
              />

              <RequirementList
                title="Requirements not matched"
                items={unmatchedRules}
                kind="unmatched"
              />
            </>
          )}

          {scheme.match_type === "preliminary" && (
            <div className="assessment-note">
              <CircleHelp size={18} />
              <p>
                This scheme matches some of your profile details.
                Detailed eligibility has not been verified yet.
              </p>
            </div>
          )}
        </section>
      )}

      <div className="scheme-detail-grid">
        <section className="scheme-info-card">
          <h2>Benefits</h2>
          <p>{formatValue(scheme.benefits)}</p>
        </section>

        <section className="scheme-info-card">
          <h2>Who can apply?</h2>
          <p>
            {formatValue(scheme.target_beneficiaries)}
          </p>
          <p>
            <strong>Business stages: </strong>
            {formatValue(scheme.business_stage)}
          </p>
          <p>
            <strong>Business types: </strong>
            {formatValue(scheme.business_type)}
          </p>
        </section>

        <section className="scheme-info-card">
          <h2>Eligibility requirements</h2>
          <p>{formatValue(scheme.eligibility_criteria)}</p>
        </section>

        <section className="scheme-info-card">
          <h2>Required documents</h2>
          <p>{formatValue(scheme.documents_required)}</p>
        </section>

        <section className="scheme-info-card">
          <h2>Application process</h2>
          <p>{formatValue(scheme.application_process)}</p>
        </section>
      </div>

      {officialUrl && /^https?:\/\//i.test(officialUrl) && (
        <a
          className="scheme-official-link"
          href={officialUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit official scheme source
          <ExternalLink size={17} />
        </a>
      )}

      <footer className="scheme-detail-footer">
        Verify eligibility, deadlines, and application requirements
        with the official department before applying.
      </footer>

      <ChatbotWidget />
    </main>
  );
}
