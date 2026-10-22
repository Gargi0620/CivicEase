
"use client";

import { useEffect, useRef,useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  UserRound,
  Landmark,
  ClipboardCheck,
  GitBranch,
  ArrowRight,
  LogOut,
} from "lucide-react";

export default function ProfileDashboardPage() {
  const locale = useLocale();

  const [username, setUsername] = useState("there");
  const [email, setEmail] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [chatPosition, setChatPosition] = useState<{
  x: number;
  y: number;
} | null>(null);

const dragStart = useRef<{
  pointerX: number;
  pointerY: number;
  startX: number;
  startY: number;
  moved: boolean;
} | null>(null);

const suppressClick = useRef(false);

  useEffect(() => {
  try {
    const saved = sessionStorage.getItem("civiceaseProfile");

    if (saved) {
      const answers = JSON.parse(saved);
      const name =
        answers.fullName ||
        answers.firstName ||
        answers.name;

      if (typeof name === "string" && name.trim()) {
        setUsername(name.trim().split(" ")[0]);
      }
    }

    const savedUser = localStorage.getItem("civiceaseUser");

    if (savedUser) {
      const user = JSON.parse(savedUser);
      const name =
        user.fullName ||
        user.name ||
        user.firstName;

      if (typeof name === "string" && name.trim()) {
        setUsername(name.trim().split(" ")[0]);
      }

      if (typeof user.email === "string") {
        setEmail(user.email);
      }
    }
  } catch {
    // Keep the dashboard usable if saved data is unavailable.
  }
}, []);

  const cards = [
    {
      title: "Personalised Schemes",
      description:
        "Discover government schemes relevant to your profile.",
      button: "Explore My Schemes",
      href: `/${locale}/profile/personal-schemes`,
      icon: Landmark,
    },
    {
      title: "Check Documents",
      description:
        "Check the documents required for your schemes.",
      button: "Check Documents",
      href: `/${locale}/profile/documents`,
      icon: ClipboardCheck,
    },
    {
      title: "Application Process",
      description:
        "Understand the steps to apply for a scheme.",
      button: "View Application Steps",
      href: `/${locale}/profile/application`,
      icon: GitBranch,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-[#faf7f2] text-[#35213b]">
      {/* Navigation */}
      <header className="relative z-20 flex min-h-[68px] items-center justify-between gap-4 border-b border-[#eee5ed] bg-[#fffaf5] px-5 py-3 sm:px-8">
        <Link
          href={`/${locale}`}
          className="flex shrink-0 flex-col"
        >
          <span className="flex items-center gap-2 text-lg font-bold tracking-tight text-[#512b50]">
            CivicEase
            <span className="rounded-sm bg-[#f3d6e8] px-2 py-1 text-[9px] font-semibold tracking-wide text-[#806d7e]">
              MAHARASHTRA
            </span>
          </span>
          <span className="text-[10px] text-[#806d7e]">
            An Initiative for Women Entrepreneurs
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-2 text-sm font-medium md:flex"
        >
          <Link
            href={`/${locale}`}
            className="rounded-t-md px-4 py-3 hover:bg-[#f7eff7]"
          >
            Home
          </Link>
          <Link
            href={`/${locale}/schemes`}
            className="rounded-t-md px-4 py-3 hover:bg-[#f7eff7]"
          >
            Explore Schemes
          </Link>
          <Link
            href={`/${locale}#about`}
            className="rounded-t-md px-4 py-3 hover:bg-[#f7eff7]"
          >
            About
          </Link>
          <Link
            href={`/${locale}/profile/dashboard`}
            aria-current="page"
            className="border-b-2 border-[#512b50] bg-[#f7eff7] px-4 py-3 font-semibold text-[#512b50]"
          >
            Profile
          </Link>
        </nav>

        <div className="relative shrink-0">
          <button
            type="button"
            aria-label="Open profile menu"
            aria-expanded={profileMenuOpen}
            onClick={() => setProfileMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#512b50] text-white shadow-sm transition hover:bg-[#70446e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#70446e]"
          >
            <UserRound size={20} />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-[#e8dce6] bg-[#fffdf9] p-4 shadow-xl">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3e7ef] text-[#512b50]">
                  <UserRound size={20} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#512b50]">
                    {username === "there" ? "Your Profile" : username}
                  </p>
                  {email && (
                    <p className="truncate text-xs text-[#806d7e]">
                      {email}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-[#eee5ed] pt-3">
                <Link
                  href={`/${locale}/profile/review`}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-[#f7eff7]"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  Edit Profile
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    window.location.assign(`/${locale}/auth`);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#70446e] hover:bg-[#f7eff7]"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Dashboard content */}
      <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 py-14 sm:px-8 lg:py-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[#512b50] sm:text-4xl">
            Welcome back, {username}!
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#806d7e] sm:text-base">
            Access matched schemes, statutory documents, and application steps.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="flex min-h-[240px] flex-col rounded-2xl border border-[#eee2e8] bg-[#fffdf9] p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:p-7"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0e8ed] text-[#512b50]">
                  <Icon size={24} strokeWidth={1.8} />
                </div>

                <h2 className="text-lg font-semibold text-[#512b50]">
                  {card.title}
                </h2>

                <p className="mt-2 flex-1 text-sm leading-6 text-[#806d7e]">
                  {card.description}
                </p>

                <Link
                  href={card.href}
                  className="mt-6 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#512b50] px-4 py-3 text-center text-sm font-semibold !text-white transition hover:bg-[#70446e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#70446e] [&_svg]:!text-white"
                >
                  {card.button}
                  <ArrowRight size={17} />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto flex flex-col gap-5 border-t border-[#eee5ed] bg-[#f6f0e6] px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="font-semibold text-[#512b50]">
            CivicEase Maharashtra
          </p>
          <p className="mt-1 max-w-xl text-xs leading-5 text-[#806d7e]">
            © 2025 CivicEase Maharashtra. All statutory rights reserved.
            Department of Women &amp; Child Development, Government of Maharashtra.
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#70446e]"
        >
          <Link href={`/${locale}#about`} className="hover:underline">
            About Us
          </Link>
          <Link href={`/${locale}/faqs`} className="hover:underline">
            FAQs
          </Link>
          <Link href={`/${locale}/contact`} className="hover:underline">
            Contact Us
          </Link>
          <Link href={`/${locale}/schemes`} className="hover:underline">
            Official Sources
          </Link>
        </nav>
      </footer>

      {/* Floating draggable chatbot */}
<button
  type="button"
  aria-label="Open CivicEase chatbot"
  onPointerDown={(event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    dragStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: rect.left,
      startY: rect.top,
      moved: false,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }}
  onPointerMove={(event) => {
    if (!dragStart.current) return;

    const dx = event.clientX - dragStart.current.pointerX;
    const dy = event.clientY - dragStart.current.pointerY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragStart.current.moved = true;
    }

    if (dragStart.current.moved) {
      const size = 68;

      setChatPosition({
        x: Math.max(
          0,
          Math.min(
            window.innerWidth - size,
            dragStart.current.startX + dx
          )
        ),
        y: Math.max(
          0,
          Math.min(
            window.innerHeight - size,
            dragStart.current.startY + dy
          )
        ),
      });
    }
  }}
  onPointerUp={() => {
    suppressClick.current = Boolean(dragStart.current?.moved);
    dragStart.current = null;
  }}
  onClick={() => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }

    window.dispatchEvent(new Event("civicease:open-chatbot"));
  }}
  style={
    chatPosition
      ? {
          position: "fixed",
          left: chatPosition.x,
          top: chatPosition.y,
          right: "auto",
          bottom: "auto",
        }
      : undefined
  }
  className={`group z-50 flex h-[76px] w-[76px] touch-none items-center justify-center rounded-full bg-transparent transition-shadow hover:drop-shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#70446e] ${
    chatPosition ? "fixed" : "fixed bottom-16 right-5 sm:right-8"
  }`}
>
  <img
    src="/chatbot-icon.png"
    alt=""
    draggable={false}
    className="h-full w-full select-none object-contain"
  />

  <span className="pointer-events-none absolute bottom-[84px] right-0 translate-y-2 whitespace-nowrap rounded-xl border border-[#eee2e8] bg-[#fffaf5] px-4 py-2 text-sm font-medium !text-[#512b50] opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
    Have a question?
    </span>

        <span className="pointer-events-none absolute bottom-[76px] right-0 translate-y-2 whitespace-nowrap rounded-xl border border-[#eee2e8] bg-[#fffaf5] px-4 py-2 text-sm font-medium text-[#512b50] opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          Have a question?
        </span>
      </button>
    </main>
  );
}
