"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { UserRound, Mail, LockKeyhole, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  function changeLanguage(nextLocale: string) {
    window.location.assign(`/${nextLocale}/auth`);
  }

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isLogin && password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    try {
      const endpoint = isLogin
        ? "http://localhost:8000/auth/login"
        : "http://localhost:8000/auth/signup";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 409) {
          setError("An account with this email already exists. Please log in.");
        } else if (response.status === 401) {
          setError("Incorrect email or password.");
        } else if (response.status === 422) {
          setError(
            "Please enter a valid email and a password of at least 8 characters.",
          );
        } else {
          setError(data.detail || "Something went wrong. Please try again.");
        }
        return;
      }

      // Signup creates the account; login establishes the session.
      // Sign in after signup so the user can save their profile.
      if (!isLogin) {
        const loginResponse = await fetch("http://localhost:8000/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        });

        if (!loginResponse.ok) {
          setError("Your account was created. Please log in to continue.");
          setIsLogin(true);
          setPassword("");
          setConfirmPassword("");
          return;
        }
      }

      window.location.assign(`/${locale}/profile`);
    } catch {
      setError(
        "Could not connect to CivicEase. Please check that the backend is running.",
      );
    }
  }

  return (
    <main className="civicease-page auth-page">
      <div className="landing-frame auth-frame">
        <header className="landing-header">
          <Link href={`/${locale}`} className="landing-brand">
            <span className="brand-name">CivicEase</span>
            <span className="brand-subtitle">MAHARASHTRA</span>
            <span className="auth-brand-tagline">{t("brandTagline")}</span>
          </Link>

          <nav className="landing-nav auth-nav" aria-label="Main navigation">
            <Link href={`/${locale}`} className="nav-link">
              {t("home")}
            </Link>
            <Link href={`/${locale}/schemes`} className="nav-link">
              {t("exploreSchemes")}
            </Link>
            <Link href={`/${locale}#about`} className="nav-link">
              {t("about")}
            </Link>
            <Link
              href={`/${locale}/auth`}
              className="nav-link active"
              aria-current="page"
            >
              {t("loginSignup")}
            </Link>
          </nav>
          <div className="auth-language">
            <label htmlFor="auth-language-select">{t("language")}</label>

            <select
              id="auth-language-select"
              value={locale}
              onChange={(event) => changeLanguage(event.target.value)}
            >
              <option value="en">English</option>
              <option value="mr">मराठी</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </header>

        <section className="auth-main">
          <div className="auth-card">
            <h1>{isLogin ? t("loginTitle") : t("signupTitle")}</h1>

            <p className="auth-subtitle">
              {isLogin ? t("loginSubtitle") : t("signupSubtitle")}
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="auth-field">
                  <label htmlFor="fullName">{t("fullName")}</label>
                  <div className="auth-input-wrap">
                    <UserRound size={16} aria-hidden="true" />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder={t("fullNamePlaceholder")}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="email">{t("email")}</label>
                <div className="auth-input-wrap">
                  <Mail size={16} aria-hidden="true" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t("emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="password">{t("password")}</label>
                <div className="auth-input-wrap">
                  <LockKeyhole size={16} aria-hidden="true" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    placeholder={t("passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={
                      showPassword ? t("hidePassword") : t("showPassword")
                    }
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="auth-field">
                  <label htmlFor="confirmPassword">
                    {t("confirmPassword")}
                  </label>
                  <div className="auth-input-wrap">
                    <LockKeyhole size={16} aria-hidden="true" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder={t("passwordPlaceholder")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="auth-eye"
                      onClick={() =>
                        setShowConfirmPassword((previous) => !previous)
                      }
                      aria-label={
                        showConfirmPassword
                          ? t("hidePassword")
                          : t("showPassword")
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="auth-submit">
                {isLogin ? t("loginButton") : t("signupButton")}
              </button>
            </form>

            <p className="auth-switch">
              {isLogin ? t("noAccount") : t("haveAccount")}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin((previous) => !previous);
                  setError("");
                }}
              >
                {isLogin ? t("signupLink") : t("loginLink")}
              </button>
            </p>
          </div>
        </section>

        <footer className="auth-footer">{t("copyright")}</footer>
      </div>
    </main>
  );
}
