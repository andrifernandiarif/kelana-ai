"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

import { getStoredToken } from "@/services/authService";

interface TripResult {
  destination: string;
  days: number;
  budget: number;
  month: string;
  travel_style: string;
  category?: string;
  daily_budget?: number;
  travel_season?: string;
  ai_recommendation?: string;
}

const loadingStages = [
  {
    icon: "🧭",
    title: "Understanding your trip",
    description:
      "Analyzing your destination, budget, and travel preferences.",
  },
  {
    icon: "🗺️",
    title: "Planning your itinerary",
    description:
      "Finding places and activities that match your travel style.",
  },
  {
    icon: "💰",
    title: "Optimizing your budget",
    description:
      "Creating a travel plan that fits your available budget.",
  },
  {
    icon: "🍜",
    title: "Adding local experiences",
    description:
      "Selecting local food and transportation recommendations.",
  },
  {
    icon: "✨",
    title: "Finalizing your trip",
    description:
      "Putting everything together into your personalized itinerary.",
  },
];

export default function Home() {
  const router = useRouter();

  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("");
  const [month, setMonth] = useState("");
  const [travelStyle, setTravelStyle] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);

  const [result, setResult] = useState<TripResult | null>(null);

  const [error, setError] = useState("");

  // Track auth state client-side to avoid hydration mismatch
  // Also redirect to /login immediately on mount if not authenticated
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setIsLoggedIn(true);
  }, [router]);

  /*
   * ==========================================
   * LOADING STAGE
   * ==========================================
   */

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setLoadingStage((current) => {
        if (current < loadingStages.length - 1) {
          return current + 1;
        }

        return current;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [loading]);

  /*
   * ==========================================
   * GENERATE TRIP
   * ==========================================
   */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: user must be logged in
    const token = getStoredToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setLoadingStage(0);
    setError("");
    setResult(null);

    try {
      const API_URL = (
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
      ).replace(/\/$/, "");

      const response = await fetch(`${API_URL}/trips`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            destination: destination,
            budget: Number(budget),
            days: Number(days),
            month: month,
            travel_style: travelStyle,
          }),
        }
      );

      if (response.status === 401) {
        // Token expired or invalid — redirect to login
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        throw new Error(errorData.detail || "Failed to generate trip");
      }

      const data = await response.json();
      console.log("AI Trip Result:", data);
      setResult(data);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate your trip. Please make sure the FastAPI backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==========================================
   * CREATE NEW TRIP
   * ==========================================
   */

  const createNewTrip = () => {
    setResult(null);
    setError("");

    setDestination("");
    setBudget("");
    setDays("");
    setMonth("");
    setTravelStyle("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * ==========================================
   * LOADING PAGE
   * ==========================================
   */

  if (loading) {
    const stage = loadingStages[loadingStage];

    const progress =
      ((loadingStage + 1) / loadingStages.length) * 100;

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">

        {/* Background */}

        <div className="absolute inset-0 overflow-hidden">

          <div className="absolute left-[-100px] top-[-100px] h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="absolute bottom-[-100px] right-[-100px] h-80 w-80 rounded-full bg-purple-600/20 blur-3xl" />

        </div>

        <div className="relative w-full max-w-xl">

          {/* Logo */}

          <div className="mb-8 text-center">

            <div className="mb-3 text-4xl">
              ✈️
            </div>

            <h1 className="text-3xl font-bold">
              Kelana
              <span className="text-blue-400">
                AI
              </span>
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Plan Smarter. Travel Better.
            </p>

          </div>

          {/* Loading Card */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-7 text-center shadow-2xl backdrop-blur-xl sm:p-10">

            {/* Icon */}

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.05] text-5xl shadow-lg">

              <span className="animate-pulse">
                {stage.icon}
              </span>

            </div>

            <p className="mt-7 text-sm font-semibold text-blue-400">
              CREATING YOUR TRIP
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {stage.title}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              {stage.description}
            </p>

            {/* Progress */}

            <div className="mt-8">

              <div className="mb-3 flex justify-between text-xs text-slate-500">

                <span>
                  Step {loadingStage + 1} of{" "}
                  {loadingStages.length}
                </span>

                <span>
                  {Math.round(progress)}%
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

            </div>

            {/* Trip Info */}

            <div className="mt-8 grid grid-cols-3 gap-3">

              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">

                <p className="text-xs text-slate-600">
                  Destination
                </p>

                <p className="mt-1 truncate text-sm font-medium">
                  {destination}
                </p>

              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">

                <p className="text-xs text-slate-600">
                  Duration
                </p>

                <p className="mt-1 text-sm font-medium">
                  {days} days
                </p>

              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">

                <p className="text-xs text-slate-600">
                  Style
                </p>

                <p className="mt-1 truncate text-sm font-medium">
                  {travelStyle}
                </p>

              </div>

            </div>

            <p className="mt-7 text-xs text-slate-600">
              ✨ Kelana AI is crafting your journey...
            </p>

          </div>

        </div>

      </main>
    );
  }

  /*
   * ==========================================
   * RESULT PAGE
   * ==========================================
   */

  if (result) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">

        <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">

          {/* Result Hero */}

          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-slate-900 to-purple-600/20 p-7 sm:p-10">

            <div className="relative z-10">

              <p className="text-sm font-semibold text-blue-400">
                ✨ YOUR AI TRIP IS READY
              </p>

              <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
                {result.destination}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Your personalized travel plan has been created
                based on your budget, travel style, and travel
                month.
              </p>

            </div>

          </section>

          {/* Trip Summary */}

          <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">

            <SummaryCard
              label="Duration"
              value={`${result.days} Days`}
              icon="📅"
            />

            <SummaryCard
              label="Budget"
              value={`$${result.budget}`}
              icon="💰"
            />

            <SummaryCard
              label="Travel Month"
              value={result.month}
              icon="🗓️"
            />

            <SummaryCard
              label="Travel Style"
              value={result.travel_style}
              icon="🎒"
            />

          </section>

          {/* Category / Season */}

          {(result.category || result.travel_season) && (
            <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

              {result.category && (
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">

                  <p className="text-xs text-blue-400">
                    TRIP CATEGORY
                  </p>

                  <p className="mt-2 font-semibold">
                    {result.category}
                  </p>

                </div>
              )}

              {result.travel_season && (
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">

                  <p className="text-xs text-purple-400">
                    TRAVEL SEASON
                  </p>

                  <p className="mt-2 font-semibold">
                    {result.travel_season}
                  </p>

                </div>
              )}

            </section>
          )}

          {/* AI Recommendation */}

          {result.ai_recommendation && (
            <section className="mt-12">

              <div className="mb-6">

                <p className="text-sm font-semibold text-blue-400">
                  🗓️ ITINERARY
                </p>

                <h2 className="mt-1 text-3xl font-bold">
                  Your Daily Adventure
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  A personalized itinerary generated by Kelana AI.
                </p>

              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">

                <div className="text-sm leading-7 text-slate-300">
                  <ReactMarkdown>
                    {result.ai_recommendation}
                  </ReactMarkdown>
                  
                </div>

              </div>

            </section>
          )}

          {/* Daily Itinerary Note */}

          <section className="mt-12">

            <div className="mb-5">

              <p className="text-sm font-semibold text-blue-400">
                💡 TRAVEL TIPS
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                Make Your Trip Better
              </h2>

            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <TipCard
                icon="🎒"
                title="Pack Smart"
                description="Bring comfortable clothes and essentials suitable for your destination."
              />

              <TipCard
                icon="💳"
                title="Carry Some Cash"
                description="Keep some local currency available for small shops and local transportation."
              />

              <TipCard
                icon="📱"
                title="Stay Connected"
                description="Consider getting a local SIM or reliable travel connectivity."
              />

              <TipCard
                icon="🌦️"
                title="Check the Weather"
                description="Check the local weather before starting your daily activities."
              />

              <TipCard
                icon="⏰"
                title="Start Early"
                description="Starting early can help you avoid crowds and make better use of your day."
              />

              <TipCard
                icon="🗺️"
                title="Stay Flexible"
                description="Leave some room in your schedule for unexpected discoveries."
              />

            </div>

          </section>

          {/* Local Food */}

          <section className="mt-12">

            <div className="mb-5">

              <p className="text-sm font-semibold text-orange-400">
                🍜 LOCAL FOOD
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                Taste the Destination
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Don't forget to experience the local cuisine.
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <FoodCard
                icon="🍜"
                name="Local Specialties"
                description={`Explore authentic local dishes in ${result.destination}.`}
              />

              <FoodCard
                icon="🍛"
                name="Traditional Cuisine"
                description="Try traditional dishes recommended by locals."
              />

              <FoodCard
                icon="🥘"
                name="Street Food"
                description="Discover affordable and popular street food around your destination."
              />

            </div>

          </section>

          {/* Budget Breakdown */}

          <section className="mt-12">

            <div className="mb-5">

              <p className="text-sm font-semibold text-emerald-400">
                💰 BUDGET
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                Estimated Budget Breakdown
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                An overview of how your travel budget can be allocated.
              </p>

            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">

              <BudgetRow
                label="Accommodation"
                amount={result.budget * 0.35}
                total={result.budget}
              />

              <BudgetRow
                label="Transportation"
                amount={result.budget * 0.15}
                total={result.budget}
              />

              <BudgetRow
                label="Food"
                amount={result.budget * 0.2}
                total={result.budget}
              />

              <BudgetRow
                label="Activities"
                amount={result.budget * 0.2}
                total={result.budget}
              />

              <BudgetRow
                label="Miscellaneous"
                amount={result.budget * 0.1}
                total={result.budget}
              />

              <div className="mt-6 border-t border-white/10 pt-6">

                <div className="flex items-center justify-between">

                  <span className="font-semibold">
                    Total Budget
                  </span>

                  <span className="text-2xl font-bold text-emerald-400">
                    ${result.budget.toFixed(2)}
                  </span>

                </div>

              </div>

            </div>

          </section>

          {/* Bottom CTA */}

          <section className="mt-14 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-8 text-center">

            <div className="text-4xl">
              ✈️
            </div>

            <h2 className="mt-4 text-2xl font-bold">
              Ready for your adventure?
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create another personalized trip with Kelana AI.
            </p>

            <button
              onClick={createNewTrip}
              className="mt-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold transition hover:scale-[1.02]"
            >
              Create New Trip
            </button>

          </section>

        </div>

      </main>
    );
  }

  /*
   * ==========================================
   * HOMEPAGE / FORM
   * ==========================================
   */

  return (
    <main className="min-h-screen bg-slate-950 text-white">


      {/* HERO */}

      <section
        id="home"
        className="mx-auto max-w-6xl px-5 pt-6"
      >

        <div className="relative overflow-hidden rounded-3xl">

          <img
            
            src="https://plus.unsplash.com/premium_photo-1681487612246-a171d00b5e9b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Simple Banner Hero Traveling"

            className="h-[420px] w-full object-cover sm:h-[520px]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-12">

            <div className="max-w-2xl">

              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs backdrop-blur">
                ✨ AI POWERED TRAVEL PLANNER
              </span>

              <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-6xl">
                Plan Smarter.
                <br />
                <span className="text-blue-400">
                  Travel Better.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Create a personalized travel plan based on
                your destination, budget, travel style, and
                travel season.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* PLANNER */}

      <section
        id="planner"
        className="mx-auto max-w-4xl px-5 py-16 sm:py-20"
      >

        <div className="mb-8 text-center">

          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            AI Travel Planner
          </p>

          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Plan Your Next Adventure
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Tell Kelana AI about your trip and let AI
            create a personalized travel plan.
          </p>

        </div>

        {/* FORM */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-2xl backdrop-blur-xl sm:p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* DESTINATION */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Destination
              </label>

              <input
                type="text"
                value={destination}
                onChange={(e) =>
                  setDestination(e.target.value)
                }
                placeholder="e.g. Bali, Indonesia"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

            {/* BUDGET / DAYS */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Budget
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    $
                  </span>

                  <input
                    type="number"
                    min="1"
                    value={budget}
                    onChange={(e) =>
                      setBudget(e.target.value)
                    }
                    placeholder="2000"
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-900 py-3.5 pl-9 pr-4 outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                  />

                </div>

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Duration
                </label>

                <div className="relative">

                  <input
                    type="number"
                    min="1"
                    value={days}
                    onChange={(e) =>
                      setDays(e.target.value)
                    }
                    placeholder="5"
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 pr-16 outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-600">
                    days
                  </span>

                </div>

              </div>

            </div>

            {/* MONTH */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Travel Month
              </label>

              <select
                value={month}
                onChange={(e) =>
                  setMonth(e.target.value)
                }
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 outline-none focus:border-blue-500"
              >

                <option value="" disabled>
                  Select travel month
                </option>

                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}

              </select>

            </div>

            {/* TRAVEL STYLE */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Travel Style
              </label>

              <select
                value={travelStyle}
                onChange={(e) =>
                  setTravelStyle(e.target.value)
                }
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 outline-none focus:border-blue-500"
              >

                <option value="" disabled>
                  Select your travel style
                </option>

                <option value="Adventure">
                  Adventure
                </option>

                <option value="Luxury">
                  Backpacker
                </option>

                <option value="Family">
                  Family
                </option>

                <option value="Solo">
                  Solo
                </option>

              </select>

            </div>

            {/* ERROR */}

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* AUTH NOTICE — tampil jika belum login */}
            {!isLoggedIn && (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-300">
                You need to{" "}
                <Link href="/login" className="font-semibold underline hover:text-yellow-200">
                  log in
                </Link>{" "}
                before generating a trip.
              </div>
            )}

            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 font-semibold shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] hover:from-blue-400 hover:to-purple-500 disabled:opacity-50"
            >
              ✨ Generate AI Trip
            </button>

          </form>

        </div>

      </section>

      {/* ABOUT */}

      <section
        id="about"
        className="border-t border-white/10 bg-slate-900/30"
      >

        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:grid-cols-3">

         <FeatureCard
            icon="💡"
            title="About Kelana AI"
            description="Kelana AI is a smart travel assistant that instantly designs custom itineraries."
          />

          <FeatureCard
            icon="💰"
            title="Budget Friendly"
            description="Plan your journey according to your available budget."
          />

          <FeatureCard
            icon="🌎"
            title="Travel Your Way"
            description="Choose a travel style that matches your personality."
          />

        </div>

      </section>

    </main>
  );
}

/*
 * ==========================================
 * COMPONENTS
 * ==========================================
 */

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">

      <div className="text-xl">
        {icon}
      </div>

      <p className="mt-3 text-xs text-slate-600">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold">
        {value}
      </p>

    </div>
  );
}

function TipCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.07]">

      <div className="text-2xl">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}

function FoodCard({
  icon,
  name,
  description,
}: {
  icon: string;
  name: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

      <div className="text-3xl">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold">
        {name}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}

function BudgetRow({
  label,
  amount,
  total,
}: {
  label: string;
  amount: number;
  total: number;
}) {
  const percentage = (amount / total) * 100;

  return (
    <div className="mb-6">

      <div className="mb-2 flex justify-between text-sm">

        <span className="text-slate-400">
          {label}
        </span>

        <span className="font-medium">
          ${amount.toFixed(2)}
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-800">

        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div>

      <div className="text-3xl">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}