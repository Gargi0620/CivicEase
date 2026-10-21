
"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { UserRound } from "lucide-react";

type SiteHeaderProps = {
  active?: "home" | "schemes" | "auth";
};

export function SiteHeader({ active }: SiteHeaderProps) {
  const locale = useLocale();
  const t = useTranslations("home");

  return (
    <header className="landing-header">
      <Link href={`/${locale}`} className="landing-brand">
        <span className="brand-name">CivicEase</span>
        <span className="brand-subtitle">MAHARASHTRA</span>
        <span className="auth-brand-tagline">{t("brandSubtitle")}</span>
      </Link>

      <nav className="landing-nav" aria-label="Main navigation">
        <Link
          href={`/${locale}`}
          className={`nav-link ${active === "home" ? "active" : ""}`}
        >
          {t("homeNav")}
        </Link>

        <Link
          href={`/${locale}/schemes`}
          className={`nav-link ${active === "schemes" ? "active" : ""}`}
        >
          {t("exploreSchemes")}
        </Link>

        <Link href={`/${locale}#about`} className="nav-link">
          {t("about")}
        </Link>

        <Link
          href={`/${locale}/auth`}
          className={`nav-link ${active === "auth" ? "active" : ""}`}
        >
          {t("loginSignup")}
        </Link>
      </nav>

      <Link
        href={`/${locale}/auth`}
        className="profile-link"
        aria-label={t("loginSignup")}
      >
        <UserRound size={20} />
      </Link>
    </header>
  );
}

export function SiteFooter() {
  const locale = useLocale();
  const t = useTranslations("home");

  return (
    <footer className="landing-footer">
      <span>CivicEase · MAHARASHTRA</span>
      <span>{t("footerCopyright")}</span>
      <div className="footer-links">
        <Link href={`/${locale}#about`}>{t("aboutUs")}</Link>
        <Link href={`/${locale}#faqs`}>{t("faqs")}</Link>
        <Link href={`/${locale}#contact`}>{t("contactUs")}</Link>
        <Link href={`/${locale}#sources`}>{t("officialSources")}</Link>
      </div>
    </footer>
  );
}
