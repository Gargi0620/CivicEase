
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function AuthPage() {
  const t = useTranslations("auth");
  const home = useTranslations("home");
  const locale = useLocale();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [signupMessage, setSignupMessage] = useState("");
  const [signupError, setSignupError] = useState(false);

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginMessage(t("loginDemoMessage"));
  }

  function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignupMessage("");
    setSignupError(false);

    if (signupPassword !== confirmPassword) {
      setSignupMessage(t("passwordMismatch"));
      setSignupError(true);
      return;
    }

    if (signupPassword.length < 8) {
      setSignupMessage(t("passwordTooShort"));
      setSignupError(true);
      return;
    }

    setSignupMessage(t("signupDemoMessage"));
  }

  return (
    <main className="auth-page">
      <header className="auth-header">
        <Link href={`/${locale}`} className="auth-brand">
          <span className="auth-brand-line">
            CivicEase
            <span className="auth-state-label">MAHARASHTRA</span>
          </span>
          <span className="auth-tagline">{home("brandSubtitle")}</span>
        </Link>

        <div className="auth-header-actions">
          <label>
            <span className="sr-only">{home("language")}</span>
            <select
              aria-label={home("language")}
              value={locale}
              onChange={(event) => {
                const segments = window.location.pathname.split("/");
                segments[1] = event.target.value;
                window.location.assign(segments.join("/"));
              }}
            >
              <option value="en">English</option>
              <option value="mr">मराठी</option>
              <option value="hi">हिन्दी</option>
            </select>
          </label>

          <Link href={`/${locale}`} className="auth-home-link">
            {t("backHome")}
          </Link>
        </div>
      </header>

      <section className="auth-content">
        <div className="auth-heading">
          <p className="auth-eyebrow">{t("eyebrow")}</p>
          <h1>{t("journeyTitle")}</h1>
          <p>{t("journeyDescription")}</p>
        </div>

        <div className="auth-card">
          <section className="auth-panel">
            <div className="auth-panel-icon" aria-hidden="true">
              ↗
            </div>

            <h2>{t("welcomeBack")}</h2>
            <p className="auth-intro">{t("loginDescription")}</p>

            <form className="auth-form" onSubmit={handleLogin}>
              <label className="auth-field">
                {t("email")}
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                  required
                />
              </label>

              <label className="auth-field">
                {t("password")}
                <span className="auth-password-wrap">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    placeholder={t("passwordPlaceholder")}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowLoginPassword((current) => !current)}
                    aria-label={
                      showLoginPassword ? t("hidePassword") : t("showPassword")
                    }
                  >
                    {showLoginPassword ? t("hide") : t("show")}
                  </button>
                </span>
              </label>

              <div className="auth-form-note">
                <span>{t("secureAccess")}</span>
              </div>

              <button type="submit" className="auth-submit">
                {t("loginButton")} <span aria-hidden="true">→</span>
              </button>

              {loginMessage && (
                <p className="auth-status" role="status">
                  {loginMessage}
                </p>
              )}
            </form>

            <p className="auth-panel-footer">{t("newUser")}</p>
          </section>

          <section className="auth-panel auth-signup-panel">
            <div className="auth-panel-icon" aria-hidden="true">
              +
            </div>

            <h2>{t("createAccount")}</h2>
            <p className="auth-intro">{t("signupDescription")}</p>

            <form className="auth-form" onSubmit={handleSignup}>
              <label className="auth-field">
                {t("fullName")}
                <input
                  type="text"
                  value={signupName}
                  onChange={(event) => setSignupName(event.target.value)}
                  placeholder={t("namePlaceholder")}
                  autoComplete="name"
                  required
                />
              </label>

              <label className="auth-field">
                {t("email")}
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(event) => setSignupEmail(event.target.value)}
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                  required
                />
              </label>

              <label className="auth-field">
                {t("createPassword")}
                <span className="auth-password-wrap">
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    value={signupPassword}
                    onChange={(event) => setSignupPassword(event.target.value)}
                    placeholder={t("minimumPassword")}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowSignupPassword((current) => !current)}
                    aria-label={
                      showSignupPassword ? t("hidePassword") : t("showPassword")
                    }
                  >
                    {showSignupPassword ? t("hide") : t("show")}
                  </button>
                </span>
              </label>

              <label className="auth-field">
                {t("confirmPassword")}
                <span className="auth-password-wrap">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder={t("confirmPasswordPlaceholder")}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    aria-label={
                      showConfirmPassword ? t("hidePassword") : t("showPassword")
                    }
                  >
                    {showConfirmPassword ? t("hide") : t("show")}
                  </button>
                </span>
              </label>

              <button type="submit" className="auth-submit">
                {t("signupButton")} <span aria-hidden="true">→</span>
              </button>

              {signupMessage && (
                <p
                  className={`auth-status ${signupError ? "auth-status-error" : ""}`}
                  role="status"
                >
                  {signupMessage}
                </p>
              )}
            </form>

            <p className="auth-panel-footer">{t("signupFooter")}</p>
          </section>
        </div>
      </section>

      <footer className="auth-footer">
        <span>CivicEase Maharashtra</span>
        <span>{t("footerText")}</span>
        <Link href={`/${locale}/schemes`}>
          {home("exploreSchemes")} →
        </Link>
      </footer>
    </main>
  );
}
