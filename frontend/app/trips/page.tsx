"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TripCard from "@/components/TripCard";
import { getStoredToken } from "@/services/authService";

interface Trip {
  id: number;
  destination: string;
  days: number;
  budget: number;
  travel_style: string;
  category: string;
  daily_budget?: number;
  ai_recommendation?: string;
  create_at?: string;
}

type SortOption = "latest" | "oldest" | "highest-budget";

export default function TripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  // =========================
  // PAGINATION
  // =========================
  const [currentPage, setCurrentPage] = useState(1);
  const tripsPerPage = 3;

  // =========================
  // MOBILE CAROUSEL
  // =========================
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);

  // =========================
  // FETCH TRIPS (auth-protected)
  // =========================
  useEffect(() => {
    const fetchTrips = async () => {
      const token = getStoredToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const API_URL = (
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
        ).replace(/\/$/, "");

        const response = await fetch(`${API_URL}/trips`, {
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch trips");
        }

        const data = await response.json();
        setTrips(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load trip history.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [router]);

  // =========================
  // SEARCH + SORT
  // =========================
  const filteredTrips = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    const result = trips.filter((trip) =>
      trip.destination.toLowerCase().includes(searchTerm)
    );
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.create_at || 0).getTime() -
            new Date(b.create_at || 0).getTime()
          );
        case "highest-budget":
          return b.budget - a.budget;
        case "latest":
        default:
          return (
            new Date(b.create_at || 0).getTime() -
            new Date(a.create_at || 0).getTime()
          );
      }
    });
  }, [trips, search, sortBy]);

  // =========================
  // PAGINATION CALCULATION
  // =========================
  const totalPages = Math.ceil(filteredTrips.length / tripsPerPage);
  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = filteredTrips.slice(indexOfFirstTrip, indexOfLastTrip);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy]);

  // =========================
  // RESET CAROUSEL
  // =========================
  useEffect(() => {
    setActiveCard(0);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: "auto" });
    }
  }, [currentPage, search, sortBy]);

  // =========================
  // MOBILE CAROUSEL SCROLL
  // =========================
  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    setActiveCard(Math.min(Math.max(index, 0), currentTrips.length - 1));
  };

  const goToCard = (index: number) => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollTo({
      left: index * carouselRef.current.clientWidth,
      behavior: "smooth",
    });
    setActiveCard(index);
  };

  // =========================
  // CHANGE PAGE
  // =========================
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-5 py-10">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
          <p className="mt-2 text-gray-500">
            Explore your previously generated travel plans.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-gray-500">Loading your trips...</p>
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && trips.length === 0 && (
          <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-blue-200 bg-blue-50/50 px-8 py-14 text-center">

            {/* Icon */}
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 text-5xl">
              🗺️
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              No trips yet
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
              You haven&apos;t created any trips yet. Go to the{" "}
              <span className="font-semibold text-blue-600">AI Planner</span>{" "}
              on the homepage to generate your first personalized travel plan!
            </p>

            {/* Steps hint */}
            <div className="mt-7 rounded-xl border border-blue-100 bg-white px-5 py-4 text-left">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">
                How it works
              </p>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">1</span>
                  Go to the <span className="font-semibold text-gray-800">AI Planner</span> section
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">2</span>
                  Fill in your destination, budget, and travel style
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">3</span>
                  Click <span className="font-semibold text-gray-800">Generate AI Trip</span> — your trip will be saved here
                </li>
              </ol>
            </div>

            {/* CTA buttons */}
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/#planner"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                ✨ Go to AI Planner
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Back to Home
              </Link>
            </div>

          </div>
        )}

        {/* SEARCH & FILTER + TRIPS */}
        {!loading && !error && trips.length > 0 && (
          <>
            {/* Search + Sort bar */}
            <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row">
                {/* Search */}
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search trips by destination..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition hover:text-gray-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Sort */}
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="sort"
                    className="hidden text-sm font-medium text-gray-600 sm:block"
                  >
                    Sort by
                  </label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:w-48"
                  >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="highest-budget">Highest Budget</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Result count + pagination controls */}
            {filteredTrips.length > 0 && (
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {filteredTrips.length}
                  </span>{" "}
                  {filteredTrips.length === 1 ? "trip" : "trips"}
                </p>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="text-lg leading-none">‹</span>
                    </button>

                    <div className="hidden items-center gap-2 sm:flex">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${
                              currentPage === page
                                ? "bg-blue-600 text-white shadow-sm"
                                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                    </div>

                    <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white sm:hidden">
                      {currentPage}
                    </span>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      aria-label="Next page"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="text-lg leading-none">›</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* No search result */}
            {filteredTrips.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <div className="mb-4 text-5xl">🔍</div>
                <h2 className="text-xl font-semibold text-gray-900">
                  No trips found
                </h2>
                <p className="mt-2 text-gray-500">
                  We couldn&apos;t find any trip matching &ldquo;{search}&rdquo;.
                </p>
                <button
                  onClick={() => setSearch("")}
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Trip cards */}
            {filteredTrips.length > 0 && (
              <>
                {/* Mobile carousel */}
                <div className="md:hidden">
                  <div
                    ref={carouselRef}
                    onScroll={handleCarouselScroll}
                    className="flex snap-x snap-mandatory overflow-x-auto"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {currentTrips.map((trip) => (
                      <div
                        key={trip.id}
                        className="w-full shrink-0 snap-center px-0.5"
                      >
                        <TripCard trip={trip} />
                      </div>
                    ))}
                  </div>

                  {currentTrips.length > 1 && (
                    <div className="mt-5 flex items-center justify-center gap-2">
                      {currentTrips.map((trip, index) => (
                        <button
                          key={trip.id}
                          type="button"
                          onClick={() => goToCard(index)}
                          aria-label={`Go to trip ${index + 1}`}
                          aria-current={activeCard === index ? "true" : undefined}
                          className={`rounded-full transition-all duration-300 ${
                            activeCard === index
                              ? "h-2 w-6 bg-blue-600"
                              : "h-2 w-2 bg-gray-300 hover:bg-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop grid */}
                <div className="hidden w-full grid-cols-1 gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
                  {currentTrips.map((trip) => (
                    <div key={trip.id} className="w-full">
                      <TripCard trip={trip} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
