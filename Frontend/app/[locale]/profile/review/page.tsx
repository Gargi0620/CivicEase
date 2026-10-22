
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  UserRound,
  MapPin,
  BriefcaseBusiness,
  Users,
  ClipboardCheck,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

type ProfileAnswers = {
  [key: string]: unknown;
  location?: string;
  district?: string;
  age?: string;
  education?: string;
  stage?: string;
  businessType?: string;
  otherBusiness?: string;
  applicantType?: string;
  otherApplicantType?: string;
  ownershipType?: string;
  beneficiaryCategory?: string;
  annualFamilyIncome?: string;
  isRegistered?: string;
  registrations?: string[];
  otherRegistration?: string;
  supportNeeds?: string[];
  otherSupport?: string;
  fundingRange?: string;
};

export default function ReviewProfilePage() {
  const locale = useLocale();

  const [answers, setAnswers] = useState<ProfileAnswers>({});
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("civiceaseProfile");

      if (saved) {
        setAnswers(JSON.parse(saved));
      }
    } catch {
      setMessage("Unable to load your saved profile. Please try again.");
    } finally {
      setLoaded(true);
    }
  }, []);

  function saveProfile() {
    try {
      sessionStorage.setItem(
        "civiceaseProfile",
        JSON.stringify(answers)
      );

      // Mark the profile as completed for this browser session.
      sessionStorage.setItem("civiceaseProfileCompleted", "true");
      setMessage("Your profile has been saved for this session.");
    } catch {
      setMessage("Unable to save your profile. Please try again.");
    }
    window.location.assign(`/${locale}/profile/dashboard`);
  }

  const locationLabel =
    answers.location === "maharashtra"
      ? `Maharashtra${answers.district ? ` — ${answers.district}` : ""}`
      : answers.location === "outside"
        ? "Outside Maharashtra"
        : "";

  function display(value: unknown): string {
    if (Array.isArray(value)) {
      return value.length ? value.join(", ") : "Not provided";
    }

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    return "Not provided";
  }

  function reviewRow(label: string, value: unknown) {
    return (
      <div className="flex flex-col gap-1 border-b border-[#eee5ed] py-3 last:border-b-0 sm:flex-row sm:justify-between sm:gap-6">
        <span className="text-sm text-[#806d7e]">{label}</span>
        <span className="break-words text-sm font-semibold text-[#512b50] sm:max-w-[60%] sm:text-right">
          {display(value)}
        </span>
      </div>
    );
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#faf7f2] p-8 text-[#512b50]">
        Loading your saved profile...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-8 text-[#35213b] sm:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Consistent header */}
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
                Step 5 of 5
              </span>
              <span className="text-[#806d7e]">100% completed</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[#eee5ed]">
              <div className="h-full w-full rounded-full bg-[#70446e]" />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1e6f0] text-[#70446e]">
              <CheckCircle2 size={24} />
            </div>

            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#886387]">
              Review Your Profile
            </p>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Everything look right?
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#756775] sm:text-base">
              Review the information you provided. You can go back to any
              section to make changes before finding relevant schemes.
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <section className="rounded-2xl border border-[#e8dce6] p-4 sm:p-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-semibold text-[#512b50]">
                  <MapPin size={19} />
                  Personal &amp; Location
                </h2>
                <Link
                  href={`/${locale}/profile`}
                  className="text-sm font-semibold text-[#70446e] hover:underline"
                >
                  Edit
                </Link>
              </div>

              {reviewRow("Business location", locationLabel)}
              {reviewRow("Age group", answers.age)}
              {reviewRow("Education", answers.education)}
            </section>

            {/* Step 2 */}
            <section className="rounded-2xl border border-[#e8dce6] p-4 sm:p-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-semibold text-[#512b50]">
                  <BriefcaseBusiness size={19} />
                  Your Business
                </h2>
                <Link
                  href={`/${locale}/profile/business`}
                  className="text-sm font-semibold text-[#70446e] hover:underline"
                >
                  Edit
                </Link>
              </div>

              {reviewRow("Business stage", answers.stage)}
              {reviewRow(
                "Business type",
                answers.businessType === "Other"
                  ? answers.otherBusiness
                  : answers.businessType
              )}
            </section>

            {/* Step 3 */}
            <section className="rounded-2xl border border-[#e8dce6] p-4 sm:p-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-semibold text-[#512b50]">
                  <Users size={19} />
                  Ownership &amp; Beneficiary Details
                </h2>
                <Link
                  href={`/${locale}/profile/ownership`}
                  className="text-sm font-semibold text-[#70446e] hover:underline"
                >
                  Edit
                </Link>
              </div>

              {reviewRow(
                "Applicant type",
                answers.applicantType === "Other"
                  ? answers.otherApplicantType
                  : answers.applicantType
              )}
              {reviewRow("Business ownership", answers.ownershipType)}
              {reviewRow("Beneficiary category", answers.beneficiaryCategory)}
              {reviewRow("Annual family income", answers.annualFamilyIncome)}
            </section>

            {/* Step 4 */}
            <section className="rounded-2xl border border-[#e8dce6] p-4 sm:p-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-semibold text-[#512b50]">
                  <ClipboardCheck size={19} />
                  Registration &amp; Assistance
                </h2>
                <Link
                  href={`/${locale}/profile/registration`}
                  className="text-sm font-semibold text-[#70446e] hover:underline"
                >
                  Edit
                </Link>
              </div>

              {reviewRow("Business registered?", answers.isRegistered)}
              {reviewRow("Registrations", answers.registrations)}
              {reviewRow("Other registration", answers.otherRegistration)}
              {reviewRow("Support required", answers.supportNeeds)}
              {reviewRow("Other support", answers.otherSupport)}
              {reviewRow("Funding requirement", answers.fundingRange)}
            </section>
          </div>

          {message && (
            <p
              role="status"
              className="mt-5 rounded-xl bg-[#f7eff7] px-4 py-3 text-sm text-[#512b50]"
            >
              {message}
            </p>
          )}

          {/* Navigation */}
          <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-[#eee5ed] pt-6 sm:flex-row sm:items-center">
            <Link
              href={`/${locale}/profile/registration`}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-[#765b75] hover:bg-[#faf7f2]"
            >
              <ArrowLeft size={17} />
              Previous
            </Link>

            <button
              type="button"
              onClick={saveProfile}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#70446e] px-6 py-3 font-semibold text-white transition hover:bg-[#583456]"
            >
              <UserRound size={18} />
              Save Profile &amp; Find Schemes
              <ArrowRight size={17} />
            </button>
          </div>
        </section>

        <p className="mt-6 text-center text-xs leading-5 text-[#897b87]">
          Your answers help CivicEase identify potentially relevant schemes.
          Final eligibility depends on each scheme&apos;s official rules.
        </p>
      </div>
    </main>
  );
}
