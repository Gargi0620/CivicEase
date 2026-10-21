"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, UserRound, Menu, X } from "lucide-react";

function EntrepreneurIllustration() {
  return (
    <div className="entrepreneur-art">
      <img
        src="/woman-entrepreneur.png"
        alt="Woman entrepreneur working on her business"
      />
    </div>
  );
}

export default function HomePage() {
  const t = useTranslations("home");
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);

  const changeLanguage = (nextLocale: string) => {
    const pathParts = window.location.pathname.split("/");
    pathParts[1] = nextLocale;
    window.location.assign(pathParts.join("/") || `/${nextLocale}`);
  };

  return (
    <main className="civicease-page">
      <div className="landing-frame">
        <header className="landing-header">
          <Link href={`/${locale}`} className="landing-brand" aria-label="CivicEase home">
            <span className="brand-name">CivicEase</span>
            <span className="brand-subtitle">MAHARASHTRA</span>
          </Link>

          <nav className={`landing-nav ${menuOpen ? "nav-open" : ""}`}>
          <Link
                      href={`/${locale}`}
                      onClick={() => setMenuOpen(false)}
                      className="nav-link active"
                     aria-current="page"
          >
           {t("homeNav")}
          </Link>
            <Link href={`/${locale}/schemes`} onClick={() => setMenuOpen(false)}>
              {t("exploreSchemes")}
            </Link>
            <a href="#about" onClick={() => setMenuOpen(false)}>
              {t("about")}
            </a>
          </nav>

          <div className="header-actions">
            <select
              className="language-select"
              value={locale}
              onChange={(event) => changeLanguage(event.target.value)}
              aria-label={t("language")}
            >
              <option value="en">English</option>
              <option value="mr">मराठी</option>
              <option value="hi">हिन्दी</option>
            </select>

            <Link href={`/${locale}/auth`} className="header-login">
              {t("loginSignup")}
            </Link>

            <Link
              href={`/${locale}/auth`}
              className="profile-button"
              aria-label={t("loginSignup")}
            >
              <UserRound size={19} />
            </Link>
          </div>

          <button
            className="mobile-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </header>

        <section className="landing-hero">
          <div className="hero-copy">
            <h1>{t("heroTitle")}</h1>
            <p className="hero-tagline">{t("tagline")}</p>
            <p className="hero-description">{t("description")}</p>

            <Link href={`/${locale}/schemes`} className="hero-cta">
              {t("exploreSchemes")}
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="hero-visual">
            <EntrepreneurIllustration />
          </div>
        </section>

        <footer className="landing-footer">
          <div className="footer-brand">
            <span className="footer-brand-name">CivicEase</span>
            <span className="footer-brand-subtitle">MAHARASHTRA</span>
          </div>

          <p>{t("footerCopyright")}</p>

          <nav className="footer-links" aria-label="Footer navigation">
            <a href="#about">{t("aboutUs")}</a>
            <Link href={`/${locale}/schemes`}>{t("faqs")}</Link>
            <a href="mailto:support@civicease.example">{t("contactUs")}</a>
            <Link href={`/${locale}/schemes`}>{t("officialSources")}</Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
