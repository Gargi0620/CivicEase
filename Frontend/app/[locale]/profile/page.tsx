
"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { MapPin, ArrowLeft, ArrowRight } from "lucide-react";

const districts = [
  "Ahmednagar", "Akola", "Amravati", "Beed", "Bhandara", "Buldhana",
  "Chandrapur", "Chhatrapati Sambhajinagar", "Dharashiv", "Dhule",
  "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur",
  "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded",
  "Nandurbar", "Nashik", "Palghar", "Parbhani", "Pune", "Raigad",
  "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane",
  "Wardha", "Washim", "Yavatmal",
];

type ProfileAnswers = {
  location?: string;
  district?: string;
  age?: string;
  education?: string;
  [key: string]: unknown;
};

export default function ProfilePage() {
  const locale = useLocale();
  const t = useTranslations("profile");
  const [location, setLocation] = useState("");
  const [district, setDistrict] = useState("");
  const [age, setAge] = useState("");
  const [education, setEducation] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Restore saved answers from the current questionnaire.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("civiceaseProfile");

      if (saved) {
        const answers: ProfileAnswers = JSON.parse(saved);
        setLocation(answers.location || "");
        setDistrict(answers.district || "");
        setAge(answers.age || "");
        setEducation(answers.education || "");
      }
    } catch {
      setError("Unable to load saved answers.");
    } finally {
      setLoaded(true);
    }
  }, []);

  // Automatically save changes without overwriting other steps.
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
          location,
          district: location === "maharashtra" ? district : "",
          age,
          education,
        })
      );
    } catch {
      setError("Unable to save your answers.");
    }
  }, [location, district, age, education, loaded]);

  const completed = Boolean(
    location &&
    age &&
    education &&
    (location !== "maharashtra" || district)
  );

  function handleNext(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!location || !age || !education) {
      setError("Please answer all the required questions.");
      return;
    }

    if (location === "maharashtra" && !district) {
      setError("Please select your district.");
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
          location,
          district: location === "maharashtra" ? district : "",
          age,
          education,
        })
      );

      window.location.assign(`/${locale}/profile/business`);
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

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-8 text-[#35213b] sm:px-8">
      <div className="mx-auto max-w-4xl">
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
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between gap-4 text-sm">
              <span className="font-semibold text-[#512b50]">
  {t("step", { current: 1, total: 5 })}
</span>
              <span className="text-[#806d7e]">
                {completed ? t("completed", { progress: 20 }) : t("completed", { progress: 0 })}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[#eee5ed]">
              <div
                className="h-full rounded-full bg-[#70446e] transition-all duration-300"
                style={{ width: completed ? "20%" : "0%" }}
              />
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1e6f0] text-[#70446e]">
              <MapPin size={24} />
            </div>

            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#886387]">
              Personal &amp; Location
            </p>

            <h1 className="text-2xl font-bold sm:text-3xl">
  {t("step1.heading")}
</h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#756775] sm:text-base">
              {t("step1.description")}
            </p>
          </div>

          <form onSubmit={handleNext} className="space-y-8">
            <fieldset>
              <legend className="mb-4 text-base font-semibold">
                1. Where will your business operate?
                <span className="ml-1 text-red-600">*</span>
              </legend>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    value: "maharashtra",
                    title: "Maharashtra",
                    description: "My business will operate in Maharashtra",
                  },
                  {
                    value: "outside",
                    title: "Outside Maharashtra",
                    description: "My business will operate in another state",
                  },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setLocation((current) =>
                        current === item.value ? "" : item.value
                      );
                      setDistrict("");
                    }}
                    className={`rounded-2xl border p-4 text-left transition ${
                      location === item.value
                        ? "border-[#70446e] bg-[#f7eff7] ring-1 ring-[#70446e]"
                        : "border-[#e7dfe6] hover:border-[#b99ab7]"
                    }`}
                  >
                    <span className="block font-semibold">{item.title}</span>
                    <span className="mt-1 block text-sm text-[#806f7e]">
                      {item.description}
                    </span>
                  </button>
                ))}
              </div>

              {location === "maharashtra" && (
                <div className="mt-5">
                  <label htmlFor="district" className="mb-2 block text-sm font-semibold">
                    Select your district
                    <span className="ml-1 text-red-600">*</span>
                  </label>

                  <select
                    id="district"
                    value={district}
                    onChange={(event) => setDistrict(event.target.value)}
                    className="w-full rounded-xl border border-[#e3d7e2] bg-white px-4 py-3 outline-none focus:border-[#70446e] focus:ring-2 focus:ring-[#70446e]/15"
                  >
                    <option value="">Choose your district</option>
                    {districts.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
              )}
            </fieldset>

            <fieldset>
              <legend className="mb-4 text-base font-semibold">
                2. What is your age group?
                <span className="ml-1 text-red-600">*</span>
              </legend>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {["Below 18", "18–25", "26–40", "Above 40"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setAge((current) => current === item ? "" : item)
                    }
                    className={`rounded-xl border px-3 py-4 text-sm font-medium transition ${
                      age === item
                        ? "border-[#70446e] bg-[#f7eff7] text-[#512b50] ring-1 ring-[#70446e]"
                        : "border-[#e7dfe6] hover:border-[#b99ab7]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-4 text-base font-semibold">
                3. What is your highest level of education?
                <span className="ml-1 text-red-600">*</span>
              </legend>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "No formal education",
                  "Primary school",
                  "Secondary school",
                  "Higher secondary",
                  "Diploma / ITI",
                  "Undergraduate degree",
                  "Postgraduate degree",
                  "Other",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setEducation((current) => current === item ? "" : item)
                    }
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                      education === item
                        ? "border-[#70446e] bg-[#f7eff7] text-[#512b50] ring-1 ring-[#70446e]"
                        : "border-[#e7dfe6] hover:border-[#b99ab7]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </fieldset>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between border-t border-[#eee5ed] pt-6">
              <Link
                href={`/${locale}/auth`}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-[#765b75] hover:bg-[#faf7f2]"
              >
                <ArrowLeft size={17} />
                Back
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
