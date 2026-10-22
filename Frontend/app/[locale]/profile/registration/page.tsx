
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  ClipboardCheck,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const registrationTypes = [
  "Udyam Registration (MSME)",
  "GST Registration",
  "Company / LLP Registration",
  "DPIIT / Startup India Recognition",
  "FSSAI Registration",
  "Other registration",
  "None",
  "Not sure",
];

const supportOptions = [
  "Business loan",
  "Subsidy / financial assistance",
  "Seed funding",
  "Equipment / machinery",
  "Training / skill development",
  "Incubation / mentorship",
  "Patent / intellectual property support",
  "Marketing / market access",
  "Other support",
];

const fundingRanges = [
  "Below ₹50,000",
  "₹50,000 – ₹2 lakh",
  "₹2 lakh – ₹5 lakh",
  "₹5 lakh – ₹10 lakh",
  "₹10 lakh – ₹25 lakh",
  "Above ₹25 lakh",
  "Not sure yet",
];

type ProfileAnswers = {
  [key: string]: unknown;
  isRegistered?: string;
  registrations?: string[];
  otherRegistration?: string;
  supportNeeds?: string[];
  otherSupport?: string;
  fundingRange?: string;
};

export default function RegistrationPage() {
  const locale = useLocale();

  const [isRegistered, setIsRegistered] = useState("");
  const [registrations, setRegistrations] = useState<string[]>([]);
  const [otherRegistration, setOtherRegistration] = useState("");
  const [supportNeeds, setSupportNeeds] = useState<string[]>([]);
  const [otherSupport, setOtherSupport] = useState("");
  const [fundingRange, setFundingRange] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Restore Step 4 answers without disturbing Steps 1–3.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("civiceaseProfile");

      if (saved) {
        const answers: ProfileAnswers = JSON.parse(saved);

        setIsRegistered(answers.isRegistered || "");
        setRegistrations(answers.registrations || []);
        setOtherRegistration(answers.otherRegistration || "");
        setSupportNeeds(answers.supportNeeds || []);
        setOtherSupport(answers.otherSupport || "");
        setFundingRange(answers.fundingRange || "");
      }
    } catch {
      setError("Unable to load your saved answers.");
    } finally {
      setLoaded(true);
    }
  }, []);

  // Save changes automatically while retaining previous-step answers.
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
          isRegistered,
          registrations,
          otherRegistration,
          supportNeeds,
          otherSupport,
          fundingRange,
        })
      );
    } catch {
      setError("Unable to save your answers.");
    }
  }, [
    isRegistered,
    registrations,
    otherRegistration,
    supportNeeds,
    otherSupport,
    fundingRange,
    loaded,
  ]);

  function toggleOption(
    option: string,
    selected: string[],
    update: (next: string[]) => void
  ) {
    if (option === "None" || option === "Not sure") {
      update(selected.includes(option) ? [] : [option]);
      return;
    }

    const withoutExclusive = selected.filter(
      (item) => item !== "None" && item !== "Not sure"
    );

    update(
      selected.includes(option)
        ? withoutExclusive.filter((item) => item !== option)
        : [...withoutExclusive, option]
    );
  }

  const needsFunding = supportNeeds.some((item) =>
    [
      "Business loan",
      "Subsidy / financial assistance",
      "Seed funding",
      "Equipment / machinery",
    ].includes(item)
  );

  const completed =
    Boolean(isRegistered) &&
    (isRegistered === "No" ||
      (registrations.length > 0 &&
        (!registrations.includes("Other registration") ||
          otherRegistration.trim().length > 0))) &&
    supportNeeds.length > 0 &&
    (!needsFunding || Boolean(fundingRange));

  function handleNext(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isRegistered) {
      setError("Please tell us whether your business is registered.");
      return;
    }

    if (
      isRegistered === "Yes" &&
      registrations.length === 0
    ) {
      setError("Please select at least one registration type.");
      return;
    }

    if (
      isRegistered === "Yes" &&
      registrations.includes("Other registration") &&
      !otherRegistration.trim()
    ) {
      setError("Please describe the other registration.");
      return;
    }

    if (supportNeeds.length === 0) {
      setError("Please select at least one type of support you need.");
      return;
    }

    if (needsFunding && !fundingRange) {
      setError("Please select your approximate funding requirement.");
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
          isRegistered,
          registrations: isRegistered === "Yes" ? registrations : [],
          otherRegistration:
            isRegistered === "Yes" &&
            registrations.includes("Other registration")
              ? otherRegistration.trim()
              : "",
          supportNeeds,
          otherSupport: supportNeeds.includes("Other support")
            ? otherSupport.trim()
            : "",
          fundingRange: needsFunding ? fundingRange : "",
        })
      );

      window.location.assign(`/${locale}/profile/review`);
    } catch {
      setError("Unable to save your answers. Please try again.");
    }
  }

  function optionClass(selected: boolean) {
    return `rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
      selected
        ? "border-[#70446e] bg-[#f7eff7] text-[#512b50] ring-1 ring-[#70446e]"
        : "border-[#e7dfe6] hover:border-[#b99ab7]"
    }`;
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#faf7f2] p-8 text-[#512b50]">
        Loading your saved answers...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-8 text-[#35213b] sm:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Consistent CivicEase header */}
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
                Step 4 of 5
              </span>
              <span className="text-[#806d7e]">
                {completed ? "80% completed" : "60% completed"}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[#eee5ed]">
              <div
                className="h-full rounded-full bg-[#70446e] transition-all duration-300"
                style={{ width: `${completed ? 80 : 60}%` }}
              />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1e6f0] text-[#70446e]">
              <ClipboardCheck size={24} />
            </div>

            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#886387]">
              Registration &amp; Assistance
            </p>

            <h1 className="text-2xl font-bold sm:text-3xl">
              What support does your business need?
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#756775] sm:text-base">
              Tell us about your registrations and the support you are looking
              for so we can identify potentially relevant schemes.
            </p>
          </div>

          <form onSubmit={handleNext} className="space-y-8">
            {/* Question 9 */}
            <fieldset>
              <legend className="mb-4 text-base font-semibold">
                9. Is your business registered?
                <span className="ml-1 text-red-600">*</span>
              </legend>

              <div className="grid gap-3 sm:grid-cols-2">
                {["Yes", "No", "In progress", "Not sure"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setIsRegistered((current) =>
                        current === item ? "" : item
                      );

                      if (item !== "Yes") {
                        setRegistrations([]);
                        setOtherRegistration("");
                      }
                    }}
                    className={optionClass(isRegistered === item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {isRegistered === "Yes" && (
                <div className="mt-5">
                  <p className="mb-3 text-sm font-semibold">
                    Which registrations do you have? Select all that apply.
                    <span className="ml-1 text-red-600">*</span>
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {registrationTypes.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          toggleOption(item, registrations, setRegistrations)
                        }
                        className={optionClass(registrations.includes(item))}
                      >
                        <span className="mr-2">
                          {registrations.includes(item) ? "☑" : "□"}
                        </span>
                        {item}
                      </button>
                    ))}
                  </div>

                  {registrations.includes("Other registration") && (
                    <input
                      value={otherRegistration}
                      onChange={(event) =>
                        setOtherRegistration(event.target.value)
                      }
                      placeholder="Specify other registration"
                      className="mt-4 w-full rounded-xl border border-[#e3d7e2] px-4 py-3 outline-none focus:border-[#70446e] focus:ring-2 focus:ring-[#70446e]/15"
                    />
                  )}
                </div>
              )}
            </fieldset>

            {/* Question 10 */}
            <fieldset>
              <legend className="mb-4 text-base font-semibold">
                10. What type of support do you need?
                <span className="ml-1 text-red-600">*</span>
              </legend>

              <p className="mb-3 text-sm text-[#806d7e]">
                Select all that apply.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {supportOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      toggleOption(item, supportNeeds, setSupportNeeds)
                    }
                    className={optionClass(supportNeeds.includes(item))}
                  >
                    <span className="mr-2">
                      {supportNeeds.includes(item) ? "☑" : "□"}
                    </span>
                    {item}
                  </button>
                ))}
              </div>

              {supportNeeds.includes("Other support") && (
                <input
                  value={otherSupport}
                  onChange={(event) => setOtherSupport(event.target.value)}
                  placeholder="Describe the support you need (optional)"
                  className="mt-4 w-full rounded-xl border border-[#e3d7e2] px-4 py-3 outline-none focus:border-[#70446e] focus:ring-2 focus:ring-[#70446e]/15"
                />
              )}
            </fieldset>

            {/* Question 11: conditional funding amount */}
            {needsFunding && (
              <fieldset>
                <legend className="mb-4 text-base font-semibold">
                  11. What is your approximate funding requirement?
                  <span className="ml-1 text-red-600">*</span>
                </legend>

                <div className="grid gap-3 sm:grid-cols-2">
                  {fundingRanges.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setFundingRange((current) =>
                          current === item ? "" : item
                        )
                      }
                      className={optionClass(fundingRange === item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

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
                href={`/${locale}/profile/ownership`}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-[#765b75] hover:bg-[#faf7f2]"
              >
                <ArrowLeft size={17} />
                Previous
              </Link>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-[#70446e] px-6 py-3 font-semibold text-white transition hover:bg-[#583456]"
              >
                Review Profile
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
