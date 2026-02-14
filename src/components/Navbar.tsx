"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar({ user }: { user?: { email: string; plan: string } | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
              </svg>
            </div>
            <span className="text-lg font-bold">AI Radar</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <NavLink href="/dashboard" current={pathname} label="Dashboard" />
                <NavLink href="/settings" current={pathname} label="Settings" />
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-sm text-[var(--muted)]">{user.email}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent-light)] uppercase font-semibold">
                    {user.plan}
                  </span>
                </div>
              </>
            ) : (
              <>
                <NavLink href="/#pricing" current={pathname} label="Pricing" />
                <NavLink href="/#demo" current={pathname} label="Demo" />
                <Link href="/api/auth/login" className="btn-primary text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-[var(--muted)]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {user ? (
              <>
                <MobileLink href="/dashboard" label="Dashboard" />
                <MobileLink href="/settings" label="Settings" />
              </>
            ) : (
              <>
                <MobileLink href="/#pricing" label="Pricing" />
                <MobileLink href="/#demo" label="Demo" />
                <MobileLink href="/api/auth/login" label="Get Started" />
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, current, label }: { href: string; current: string; label: string }) {
  const isActive = current === href;
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        isActive ? "text-[var(--accent-light)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] rounded-lg"
    >
      {label}
    </Link>
  );
}
