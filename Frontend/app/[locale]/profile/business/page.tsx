
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  BriefcaseBusiness,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const stages = [
  "I have a business idea",
  "Planning to start a business",
  "Business recently started",
  "Existing business",
];

const businessTypes = [
  "Manufacturing",
  "Retail / Trading",
  "Service-based business",
  "Food / Food processing",
  "Agriculture / Allied activities",
  "Handicrafts / Handloom",
  "Technology / Startup",
  "Other",
];

type ProfileAnswers = {
  location?: string;
  district?: string;
  age?: string;
  education?: string;
  stage?: string;
  businessType?: string;
  otherBusiness?: string;
  [key: string]: unknown;
};

export default function BusinessPage() {
  const locale = useLocale();

  const [stage, setStage] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [otherBusiness, setOtherBusiness] = useState("");
  const [error, setError] = useState("");

  // Restore previously saved answers when returning to this page.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("civiceaseProfile");

      if (saved) {
        const answers: ProfileAnswers = JSON.parse(saved);
        setStage(answers.stage || "");
        setBusinessType(answers.businessType || "");
        setOtherBusiness(answers.otherBusiness || "");
      }
    } catch {
      setError("Unable to load saved answers. Please try again.");
    }
  }, []);

  const completed = Boolean(
    stage &&
      businessType &&
      (businessType !== "Other" || otherBusiness.trim())
  );

  function handleNext(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!stage || !businessType) {
      setError("Please answer both questions before continuing.");
      return;
    }

    if (businessType === "Other" && !otherBusiness.trim()) {
      setError("Please describe your business type.");
      return;
    }

    try {
      const saved = sessionStorage.getItem("civiceaseProfile");
      const previousAnswers: ProfileAnswers = saved
        ? JSON.parse(saved)
        : {};

      sessionStorage.setItem(
        "civiceaseProfile",
        JSON.stringify({
          ...previousAnswers,
          stage,
          businessType,
          otherBusiness:
            businessType === "Other" ? otherBusiness.trim() : "",
        })
      );

      // Step 3 will be added next.
      window.location.assign(`/${locale}/profile/ownership`);
    } catch {
      setError("Unable to save your answers. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-8 text-[#35213b] sm:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <Link href={`/${locale}`} className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[#512b50]">
              CivicEase
            </span>
            <span className="mt-1 text-xs text-[#806d7e]">
              An Initiative for Women Entrepreneurs
            </span>
          </Link>

          <div className="flex flex-col items-center gap-2">
            <span className="rounded-lg border border-[#e5d5e4] bg-[#f7eff7] px-4 py-2 text-sm font-semibold text-[#512b50]">
              Profile Setup
            </span>
            <div className="h-1 w-10 rounded-full bg-[#70446e]" />
          </div>
        </header>

        {/* Main card */}
        <section className="rounded-3xl border border-[#e8dce6] bg-white p-5 shadow-sm sm:p-9">
          {/* Progress */}
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between gap-4 text-sm">
              <span className="font-semibold text-[#512b50]">
                Step 2 of 5
              </span>
              <span className="text-[#806d7e]">
                {completed ? "40% completed" : "20% completed"}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[#eee5ed]">
              <div
                className="h-full rounded-full bg-[#70446e] transition-all duration-300"
                style={{ width: `${completed ? 40 : 20}%` }}
              />
            </div>
          </div>

          {/* Page heading */}
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1e6f0] text-[#70446e]">
              <BriefcaseBusiness size={24} />
            </div>

            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#886387]">
              Your Business
            </p>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Tell us about your business
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#756775] sm:text-base">
              Your business stage and activity help us identify schemes that
              may be relevant to your goals.
            </p>
          </div>

          <form onSubmit={handleNext} className="space-y-8">
            {/* Question 4 */}
            <fieldset>
              <legend className="mb-4 text-base font-semibold">
                4. Which stage best describes your business?
                <span className="ml-1 text-red-600">*</span>
              </legend>

              <div className="grid gap-3 sm:grid-cols-2">
                {stages.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setStage(item)}
                    className={`rounded-2xl border p-4 text-left text-sm font-medium transition ${
                      stage === item
                        ? "border-[#70446e] bg-[#f7eff7] ring-1 ring-[#70446e]"
                        : "border-[#e7dfe6] hover:border-[#b99ab7]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Question 5 */}
            <fieldset>
              <legend className="mb-4 text-base font-semibold">
                5. What type of business do you operate or plan to start?
                <span className="ml-1 text-red-600">*</span>
              </legend>

              <div className="grid gap-3 sm:grid-cols-2">
                {businessTypes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setBusinessType(item)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                      businessType === item
                        ? "border-[#70446e] bg-[#f7eff7] text-[#512b50] ring-1 ring-[#70446e]"
                        : "border-[#e7dfe6] hover:border-[#b99ab7]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {businessType === "Other" && (
                <div className="mt-5">
                  <label
                    htmlFor="otherBusiness"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Describe your business
                    <span className="ml-1 text-red-600">*</span>
                  </label>

                  <textarea
                    id="otherBusiness"
                    value={otherBusiness}
                    onChange={(event) =>
                      setOtherBusiness(event.target.value)
                    }
                    placeholder="Briefly describe your business activity"
                    rows={3}
                    className="w-full rounded-xl border border-[#e3d7e2] px-4 py-3 outline-none focus:border-[#70446e] focus:ring-2 focus:ring-[#70446e]/15"
                  />
                </div>
              )}
            </fieldset>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between border-t border-[#eee5ed] pt-6">
              <Link
                href={`/${locale}/profile`}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-[#765b75] hover:bg-[#faf7f2]"
              >
                <ArrowLeft size={17} />
                Previous
              </Link>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-[#70446e] px-6 py-3 font-semibold text-white transition hover:bg-[#583456]"
              >
                Next Step
                <ArrowRight size={17} />
              </button>
            </div>
          </form>
        </section>

        {/* Footer */}
        <p className="mt-6 text-center text-xs leading-5 text-[#897b87]">
          Your answers help CivicEase identify potentially relevant schemes.
          Final eligibility depends on each scheme&apos;s official rules.
        </p>
      </div>
    </main>
  );
}
