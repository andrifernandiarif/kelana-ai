import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">

        {/* BRAND */}
        <div>
            <Link href="/">
            <p className="font-semibold text-white">
                ✈️ Kelana
                <span className="text-blue-400">
                AI
                </span>
                <span className="ml-2 text-xs text-slate-600">
                Plan Smarter. Travel Better.
                </span>
            </p>
            </Link>
        </div>
                
            
        {/* LINKS */}
        <div className="flex justify-center gap-5 text-xs text-slate-500">

          <Link
            href="/"
            className="transition hover:text-white"
          >
            Home
          </Link>

          <Link
            href="/#about"
            className="transition hover:text-white"
          >
            About
          </Link>

          <Link
            href="/#planner"
            className="transition hover:text-white"
          >
            Planner
          </Link>

          <Link
            href="/trips"
            className="transition hover:text-white"
          >
            My Trips
          </Link>

        </div>

        {/* COPYRIGHT */}
        <p className="text-xs text-slate-600">
          © 2026 Kelana AI
        </p>

      </div>

    </footer>
  );
}
