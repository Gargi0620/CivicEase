
"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, UserRound, Menu } from "lucide-react";

function EntrepreneurIllustration() {
  return (
    <svg
      className="hero-illustration"
      viewBox="0 0 640 300"
      role="img"
      aria-label="Woman entrepreneur working on a laptop"
    >
      <defs>
        <linearGradient id="backdrop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4e9e4" />
          <stop offset="100%" stopColor="#fff8f2" />
        </linearGradient>
        <linearGradient id="blouse" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7b3b60" />
          <stop offset="100%" stopColor="#512443" />
        </linearGradient>
      </defs>

      <rect width="640" height="300" rx="24" fill="url(#backdrop)" />
      <path
        d="M0 224 C80 180 100 122 182 130 C245 136 265 82 333 80 C401 78 424 142 486 111 C548 80 596 104 640 72 L640 300 L0 300Z"
        fill="#e9dcd8"
        opacity=".7"
      />
      <path
        d="M0 258 C100 230 130 256 220 228 C300 204 392 248 470 224 C550 199 597 218 640 206 L640 300 L0 300Z"
        fill="#f2e7e1"
      />

      <g stroke="#a06d89" strokeWidth="2.5" fill="#fff8f4" opacity=".9">
        <circle cx="534" cy="57" r="31" />
        <path
          d="M516 67h36M520 63V48h28v15M525 48l9-8 9 8M527 53v8M534 53v8M541 53v8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="593" cy="127" r="29" />
        <path
          d="M578 139v-20h30v20M584 131l7-6 6 4 7-10M601 119h3v3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M446 45h30l14 14v43h-44z" />
        <path
          d="M476 45v15h14M454 70h25M454 80h25M454 90h18"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      <g transform="translate(72 170)">
        <path d="M24 86V28" stroke="#6f5a4c" strokeWidth="4" strokeLinecap="round" />
        <path d="M24 54C-3 46-8 27 0 17C21 20 29 37 24 54Z" fill="#8b8a72" />
        <path d="M25 43C48 35 55 15 48 4C29 8 21 26 25 43Z" fill="#777d65" />
        <path d="M25 69C4 67-3 53 1 44C18 46 27 56 25 69Z" fill="#a1a18a" />
        <path d="M7 84h35l-5 18H12Z" fill="#b68b8b" />
        <ellipse cx="24" cy="84" rx="18" ry="4" fill="#d2b0a7" />
      </g>

      <path d="M204 114 C195 79 218 40 258 37 C291 36 319 62 315 102 L303 161 L225 166Z" fill="#2d2029" />
      <path d="M221 81 C205 103 207 137 194 157 C185 174 199 197 214 199 L242 135Z" fill="#30212b" />
      <path d="M235 72 C243 51 279 48 294 72 L291 110 C287 132 269 145 253 132 C238 120 229 97 235 72Z" fill="#e9b99e" />
      <path d="M229 86 C219 56 245 36 271 42 C291 45 307 62 300 85 C291 71 282 63 269 62 C256 77 244 81 229 86Z" fill="#30212b" />
      <path d="M237 79 C229 99 237 129 251 143 L244 163 L222 139 L220 99Z" fill="#30212b" />
      <path d="M288 82 C298 96 292 122 281 136 L297 144 C312 118 311 89 300 72Z" fill="#30212b" />
      <path d="M249 91q6-4 11 0M273 91q6-4 11 0" fill="none" stroke="#5d3b37" strokeWidth="2" strokeLinecap="round" />
      <path d="M264 98l-3 12 7 1M258 119q9 6 17-1" fill="none" stroke="#a45d5a" strokeWidth="2" strokeLinecap="round" />
      <circle cx="256" cy="96" r="2" fill="#30212b" />
      <circle cx="279" cy="96" r="2" fill="#30212b" />

      <path d="M231 139 C211 143 197 158 190 183 L171 252 L324 252 L310 183 C304 157 289 143 276 139 L261 157Z" fill="url(#blouse)" />
      <path d="M247 143 L263 158 L278 140 L290 153 L274 187 L253 188 L235 154Z" fill="#f7eee7" />
      <path d="M247 143l-8 30 18 19 8-34M278 140l10 34-17 18-9-34" fill="none" stroke="#a56c8a" strokeWidth="2" />
      <path d="M195 175 C215 186 222 202 236 215 L272 236 L259 252 L218 235 C195 226 182 205 185 190Z" fill="#6d3155" />
      <path d="M295 175 C282 191 282 208 296 221 L327 239 L317 253 L282 237 C260 225 259 204 269 184Z" fill="#5a2748" />

      <path d="M68 258h532" stroke="#b28b8a" strokeWidth="5" strokeLinecap="round" />
      <rect x="352" y="188" width="138" height="65" rx="5" fill="#c9c5c4" transform="skewX(-10)" />
      <path d="M365 251h145l-15 8H349Z" fill="#a9a5a6" />
      <path d="M383 192l95-1" stroke="#e4e0df" strokeWidth="2" opacity=".8" />
      <path d="M250 225 C271 226 291 236 311 241 L333 242 C341 242 344 251 335 254 L304 254 C280 250 262 244 245 239Z" fill="#e9b99e" />
      <path d="M296 220 C314 221 330 231 348 236 L363 238 C372 240 370 248 361 249 L337 247 C318 243 302 239 289 233Z" fill="#e9b99e" />

      <path d="M82 263h68l-5 10H78Z" fill="#f9f3ed" stroke="#c5aaa8" strokeWidth="1.5" />
      <path d="M85 260h66l-3 7H82Z" fill="#c5a6b0" />
      <rect x="553" y="237" width="26" height="25" rx="3" fill="#6c3154" />
      <path d="M558 237l-3-27M567 237l7-33M573 237l12-23" stroke="#4b2d3f" strokeWidth="3" strokeLinecap="round" />
      <path d="M550 262h32" stroke="#b28b8a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function HomePage() {
  const t = useTranslations("home");
  const locale = useLocale();

  function openSchemes() {
    window.location.assign(`/${locale}/schemes`);
  }

  function changeLanguage(nextLocale: string) {
    const segments = window.location.pathname.split("/");
    segments[1] = nextLocale;
    window.location.assign(segments.join("/"));
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <Link
          className="brand"
          href={`/${locale}`}
          aria-label="CivicEase home"
        >
          <span className="brand-line">
            <span className="brand-name">CivicEase</span>
            <span className="state-tag">MAHARASHTRA</span>
          </span>
          <span className="brand-subtitle">{t("brandSubtitle")}</span>
        </Link>

        <nav className="main-nav" aria-label="Main navigation">
          <Link className="nav-link active" href={`/${locale}`}>
            {t("homeNav")}
          </Link>
          <button
            className="nav-link"
            type="button"
            onClick={openSchemes}
          >
            {t("exploreSchemes")}
          </button>
          <a className="nav-link" href="#about">
            {t("about")}
          </a>
        </nav>

        <div className="header-actions">
          <label className="language-selector">
            <span className="sr-only">{t("language")}</span>
            <select
              aria-label={t("language")}
              value={locale}
              onChange={(event) => changeLanguage(event.target.value)}
            >
              <option value="en">English</option>
              <option value="mr">मराठी</option>
              <option value="hi">हिन्दी</option>
            </select>
          </label>

          <Link href={`/${locale}/auth`} className="login-nav-button">
            {t("loginSignup")}
          </Link>

          <a className="profile-button" href={`/${locale}/auth`} aria-label="Profile">
            <UserRound size={17} strokeWidth={2.5} />
          </a>

          <button
            className="mobile-menu"
            type="button"
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">{t("heroTitle")}</h1>

          <p className="hero-tagline">{t("tagline")}</p>

          <p className="hero-description">{t("description")}</p>

          <button
            className="primary-button"
            type="button"
            onClick={openSchemes}
          >
            {t("exploreSchemes")} <ArrowRight size={17} />
          </button>
        </div>

        <div className="hero-art">
          <EntrepreneurIllustration />
        </div>
      </section>

      <footer className="footer">
        <div className="footer-brand">
          <span className="footer-name">CivicEase</span>
          <span className="state-tag footer-state">MAHARASHTRA</span>
        </div>

        <span className="copyright">{t("footerCopyright")}</span>

        <nav className="footer-nav" aria-label="Footer navigation">
          <a href="#about">{t("aboutUs")}</a>
          <a href="#faqs">{t("faqs")}</a>
          <a href="#contact">{t("contactUs")}</a>
          <a href="#sources">{t("officialSources")}</a>
        </nav>
      </footer>
    </main>
  );
}
