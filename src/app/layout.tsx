import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "flypewpet — Pet carrier flight compatibility",
  description:
    "Check whether a specific pet carrier meets the in-cabin rules for your exact flight itinerary — leg by leg, with transparent reasoning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="paw-mark h-8 w-8 text-sm">🐾</span>
              <span>flypewpet</span>
            </Link>
            <nav className="hidden items-center gap-5 text-sm text-slate-600 md:flex">
              <Link href="/find" className="hover:text-slate-900">Find a carrier</Link>
              <Link href="/carriers" className="hover:text-slate-900">Catalog</Link>
              <Link href="/rules" className="hover:text-slate-900">Rules &amp; sources</Link>
              <Link href="/for-merchants" className="hover:text-slate-900">For merchants</Link>
              <Link href="/check" className="ghost-cta">
                Check a trip
              </Link>
              <Link href="/check" className="primary-cta px-4 py-2 text-sm">
                Start check
              </Link>
            </nav>
            <Link href="/check" className="primary-cta px-4 py-2 text-sm md:hidden">
              Check
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">{children}</main>
        <footer className="border-t border-stone-200/70 bg-white/70">
          <div className="mx-auto max-w-6xl space-y-2 px-4 py-6 text-xs text-slate-500">
            <p>
              flypewpet is a compatibility checker, not a guarantee. Airlines make the
              final acceptance decision at the gate. Always confirm current policy with
              your airline before you travel.
            </p>
            <p>
              Some links on this site are affiliate links. As an Amazon Associate we may earn
              from qualifying purchases. This never affects which carriers we recommend.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
