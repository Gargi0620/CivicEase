
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Users,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const applicantTypes = [
  "Individual entrepreneur",
  "Sole proprietorship",
  "Partnership / LLP",
  "Private limited company",
  "Self-Help Group (SHG)",
  "FPO / Cooperative",
  "NGO / Institution",
  "Other",
];

const ownershipTypes = [
  "Wholly owned by women",
  "Majority women-owned",
  "Jointly owned",
  "Not applicable / Other",
];

const beneficiaryCategories = [
  "General",
  "Scheduled Caste (SC)",
  "Scheduled Tribe (ST)",
  "Other Backward Class (OBC)",
  "Minority community",
  "Person with disability",
  "Prefer not to say",
];

const incomeRanges = [
  "Below ₹1 lakh",
  "₹1 lakh – ₹2.5 lakh",
  "₹2.5 lakh – ₹5 lakh",
  "₹5 lakh – ₹8 lakh",
  "Above ₹8 lakh",
  "Prefer not to say",
];

type ProfileAnswers = {
  [key: string]: unknown;
  applicantType?: string;
  otherApplicantType?: string;
  ownershipType?: string;
  beneficiaryCategory?: string;
  annualFamilyIncome?: string;
};

export default function OwnershipPage() {
  const locale = useLocale();

  const [applicantType, setApplicantType] = useState("");
  const [otherApplicantType, setOtherApplicantType] = useState("");
  const [ownershipType, setOwnershipType] = useState("");
  const [beneficiaryCategory, setBeneficiaryCategory] = useState("");
  const [annualFamilyIncome, setAnnualFamilyIncome] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Restore Step 3 answers while preserving Steps 1 and 2.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("civiceaseProfile");

      if (saved) {
        const answers: ProfileAnswers = JSON.parse(saved);

        setApplicantType(answers.applicantType || "");
        setOtherApplicantType(answers.otherApplicantType || "");
        setOwnershipType(answers.ownershipType || "");
        setBeneficiaryCategory(answers.beneficiaryCategory || "");
        setAnnualFamilyIncome(answers.annualFamilyIncome || "");
      }
    } catch {
      setError("Unable to load your saved answers.");
    } finally {
      setLoaded(true);
    }
  }, []);

  // Automatically save Step 3 answers without deleting previous steps.
  useEffect(() => {
    if (!loaded) return;

    try {
      const saved = sessionStorage.getItem("civiceaseProfile");
      const previousAnswers: ProfileAnswers = saved
        ? JSON.parse(saved)
        : {};

      sessionStorage.setItem(
        "civiceaseProfile",
        JSON.stringify({
          ...previousAnswers,
          applicantType,
          otherApplicantType,
          ownershipType,
          beneficiaryCategory,
          annualFamilyIncome,
        })
      );
    } catch {
      setError("Unable to save your answers.");
    }
  }, [
    applicantType,
    otherApplicantType,
    ownershipType,
    beneficiaryCategory,
    annualFamilyIncome,
    loaded,
  ]);

  const completed = Boolean(
    applicantType &&
      (applicantType !== "Other" || otherApplicantType.trim()) &&
      ownershipType &&
      beneficiaryCategory
  );

  function handleNext(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (
      !applicantType ||
      (applicantType === "Other" && !otherApplicantType.trim()) ||
      !ownershipType ||
      !beneficiaryCategory
    ) {
      setError("Please complete all required questions.");
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
          applicantType,
          otherApplicantType:
            applicantType === "Other" ? otherApplicantType.trim() : "",
          ownershipType,
          beneficiaryCategory,
          annualFamilyIncome,
        })
      );

      window.location.assign(`/${locale}/profile/registration`);
    } catch {
      setError("Unable to save your answers. Please try again.");
    }
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#faf7f2] p-8 text-[#512b50]">
        Loading your saved answers...
      </main>
    );
  }

  function optionClass(selected: boolean) {
    return `rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
      selected
        ? "border-[#70446e] bg-[#f7eff7] text-[#512b50] ring-1 ring-[#70446e]"
        : "border-[#e7dfe6] hover:border-[#b99ab7]"
    }`;
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-8 text-[#35213b] sm:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Same header on every profile step */}
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

        <section className="rounded-3xl border border-[#e8dce6] bg-white p-5 shadow-sm sm:p-9">
          {/* Progress */}
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between gap-4 text-sm">
              <span className="font-semibold text-[#512b50]">
                Step 3 of 5
              </span>
              <span className="text-[#806d7e]">
                {completed ? "60% completed" : "40% completed"}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[#eee5ed]">
              <div
                className="h-full rounded-full bg-[#70446e] transition-all duration-300"
                style={{ width: `${completed ? 60 : 40}%` }}
              />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1e6f0] text-[#70446e]">
              <Users size={24} />
            </div>

            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#886387]">
              Ownership &amp; Beneficiary Details
            </p>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Tell us about your ownership
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#756775] sm:text-base">
              These details help us identify schemes with relevant applicant
              and beneficiary requirements.
            </p>
          </div>

          <form onSubmit={handleNext} className="space-y-8">
            {/* Question 6 */}
            <fieldset>
              <legend className="mb-4 text-base font-semibold">
                6. Who is applying for the scheme?
                <span className="ml-1 text-red-600">*</span>
              </legend>

              <div className="grid gap-3 sm:grid-cols-2">
                {applicantTypes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setApplicantType((current) =>
                        current === item ? "" : item
                      )
                    }
                    className={optionClass(applicantType === item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {applicantType === "Other" && (
                <div className="mt-4">
                  <label
                    htmlFor="otherApplicantType"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Describe the applicant type
                    <span className="ml-1 text-red-600">*</span>
                  </label>
                  <input
                    id="otherApplicantType"
                    value={otherApplicantType}
                    onChange={(event) =>
                      setOtherApplicantType(event.target.value)
                    }
                    placeholder="Enter applicant type"
                    className="w-full rounded-xl border border-[#e3d7e2] px-4 py-3 outline-none focus:border-[#70446e] focus:ring-2 focus:ring-[#70446e]/15"
                  />
                </div>
              )}
            </fieldset>

            {/* Question 7 */}
            <fieldset>
              <legend className="mb-4 text-base font-semibold">
                7. What best describes the ownership of your business?
                <span className="ml-1 text-red-600">*</span>
              </legend>

              <div className="grid gap-3 sm:grid-cols-2">
                {ownershipTypes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setOwnershipType((current) =>
                        current === item ? "" : item
                      )
                    }
                    className={optionClass(ownershipType === item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Question 8 */}
            <fieldset>
              <legend className="mb-4 text-base font-semibold">
                8. Which beneficiary category applies to you?
                <span className="ml-1 text-red-600">*</span>
              </legend>

              <p className="mb-3 text-sm text-[#806d7e]">
                Select the category that applies to you. This information is
                used only to help assess potential scheme relevance.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {beneficiaryCategories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setBeneficiaryCategory((current) =>
                        current === item ? "" : item
                      )
                    }
                    className={optionClass(beneficiaryCategory === item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Optional income question */}
            <fieldset>
              <legend className="mb-3 text-base font-semibold">
                Optional: What is your annual family income?
              </legend>

              <p className="mb-4 text-sm text-[#806d7e]">
                Some schemes have income limits. You can skip this question
                or choose not to disclose.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {incomeRanges.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setAnnualFamilyIncome((current) =>
                        current === item ? "" : item
                      )
                    }
                    className={optionClass(annualFamilyIncome === item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
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
                href={`/${locale}/profile/business`}
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

        <p className="mt-6 text-center text-xs leading-5 text-[#897b87]">
          Your answers help CivicEase identify potentially relevant schemes.
          Final eligibility depends on each scheme&apos;s official rules.
        </p>
      </div>
    </main>
  );
}
