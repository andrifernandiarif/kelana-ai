"use client";

import { useState } from "react";

interface TripResult {
  destination: string;
  days: number;
  budget: number;
  month: string;
  travel_style: string;
  daily_budget?: number;
  category?: string;
  travel_season?: string;
  ai_recommendation?: string;
}

interface DailyItinerary {
  day: number;
  title: string;
  morning: string[];
  afternoon: string[];
  evening: string[];
  transportation: string;
  local_food: string[];
}

interface FoodRecommendation {
  name: string;
  description: string;
}

interface BudgetBreakdown {
  accommodation: number;
  transportation: number;
  food: number;
  activities: number;
  miscellaneous: number;
}

interface TripResult {
  destination: string;
  days: number;
  budget: number;
  month: string;
  travel_style: string;
  daily_budget?: number;
  category?: string;
  travel_season?: string;

  daily_itinerary?: DailyItinerary[];
  travel_tips?: string[];
  local_food_recommendations?: FoodRecommendation[];
  budget_breakdown?: BudgetBreakdown;
}

export default function Home() {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("");
  const [month, setMonth] = useState("");
  const [travelStyle, setTravelStyle] = useState("");

  const [result, setResult] = useState<TripResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState("");

  const loadingStages = [
    {
      title: "Understanding your trip",
      description: "Analyzing your destination, budget, and travel style...",
      icon: "🧭",
    },
    {
      title: "Planning your itinerary",
      description: "Finding activities and places that match your preferences...",
      icon: "🗺️",
    },
    {
      title: "Optimizing your budget",
      description: "Creating a trip plan that fits your budget...",
      icon: "💰",
    },
    {
      title: "Adding local experiences",
      description: "Selecting food, transportation, and local experiences...",
      icon: "🍜",
    },
    {
      title: "Your trip is almost ready",
      description: "Putting everything together into your personalized itinerary...",
      icon: "✨",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setLoadingStage(0);
    setError("");
    setResult(null);

    // Loading animation
    const stageInterval = setInterval(() => {
      setLoadingStage((current) => {
        if (current < loadingStages.length - 1) {
          return current + 1;
        }

        return current;
      });
    }, 1800);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/trips",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            destination,
            days: Number(days),
            budget: Number(budget),
            month,
            travel_style: travelStyle,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        console.error("Backend error:", errorData);

        throw new Error(
          errorData.detail
            ? JSON.stringify(errorData.detail)
            : "Failed to generate trip"
        );
      }

      const data = await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);
      setError(
        "We couldn't generate your trip. Please check your backend connection and try again."
      );
    } finally {
      clearInterval(stageInterval);
      setLoading(false);
    }
  };

  const handleCreateNewTrip = () => {
    setResult(null);
    setError("");
    setDestination("");
    setBudget("");
    setDays("");
    setMonth("");
    setTravelStyle("");
  };

  /*
   * ============================
   * LOADING PAGE
   * ============================
   */

  if (loading) {
    const currentStage = loadingStages[loadingStage];

    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
        </div>

        <div className="relative flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-xl text-center">

            {/* Logo */}
            <div className="mb-8">
              <div className="mb-3 text-4xl">✈️</div>

              <h1 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Kelana AI
                </span>
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Smart Plan - Epic Trips
              </p>
            </div>

            {/* Loading Card */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl">

              {/* Animated Icon */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-4xl ring-1 ring-white/10">
                <span className="animate-pulse">
                  {currentStage.icon}
                </span>
              </div>

              <p className="mb-2 text-sm font-medium text-blue-400">
                Creating your perfect trip
              </p>

              <h2 className="text-2xl font-bold">
                {currentStage.title}
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
                {currentStage.description}
              </p>

              {/* Progress */}
              <div className="mt-8">
                <div className="mb-3 flex justify-between text-xs text-slate-500">
                  <span>
                    Step {loadingStage + 1} of {loadingStages.length}
                  </span>

                  <span>
                    {Math.round(
                      ((loadingStage + 1) / loadingStages.length) * 100
                    )}
                    %
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
                    style={{
                      width: `${
                        ((loadingStage + 1) /
                          loadingStages.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Trip Summary */}
              <div className="mt-8 grid grid-cols-3 gap-3">

                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <p className="text-xs text-slate-500">
                    Destination
                  </p>

                  <p className="mt-1 truncate text-sm font-medium">
                    {destination}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <p className="text-xs text-slate-500">
                    Days
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {days}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <p className="text-xs text-slate-500">
                    Style
                  </p>

                  <p className="mt-1 truncate text-sm font-medium">
                    {travelStyle}
                  </p>
                </div>

              </div>

              <p className="mt-6 text-xs text-slate-600">
                ✨ AI is crafting your journey...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ============================
   * RESULT PAGE
   * ============================
   */

  if (result) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">

        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6">

          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm text-blue-400">
                ✨ Your AI Trip
              </p>

              <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
                {result.destination}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Your personalized journey is ready.
              </p>
            </div>

            <button
              onClick={handleCreateNewTrip}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10"
            >
              ← Create New Trip
            </button>
          </div>

          {/* Trip Overview */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur">
              <p className="text-xs text-slate-500">
                Duration
              </p>

              <p className="mt-2 text-xl font-bold">
                {result.days} days
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur">
              <p className="text-xs text-slate-500">
                Budget
              </p>

              <p className="mt-2 text-xl font-bold">
                ${result.budget}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur">
              <p className="text-xs text-slate-500">
                Travel Style
              </p>

              <p className="mt-2 text-xl font-bold">
                {result.travel_style}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur">
              <p className="text-xs text-slate-500">
                Travel Month
              </p>

              <p className="mt-2 text-xl font-bold">
                {result.month}
              </p>
            </div>

          </div>

          {/* Category / Season */}
          {(result.category || result.travel_season) && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

              {result.category && (
                <div className="rounded-2xl border border-blue-500/10 bg-blue-500/5 p-5">
                  <p className="text-xs text-blue-400">
                    Trip Category
                  </p>

                  <p className="mt-2 text-lg font-semibold">
                    {result.category}
                  </p>
                </div>
              )}

              {result.travel_season && (
                <div className="rounded-2xl border border-purple-500/10 bg-purple-500/5 p-5">
                  <p className="text-xs text-purple-400">
                    Travel Season
                  </p>

                  <p className="mt-2 text-lg font-semibold">
                    {result.travel_season}
                  </p>
                </div>
              )}

            </div>
          )}

          {/* Daily Budget */}
          {result.daily_budget && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-sm text-slate-400">
                    Recommended Daily Budget
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    ${result.daily_budget.toFixed(2)}
                  </p>
                </div>

                <div className="text-4xl">
                  💰
                </div>

              </div>

            </div>
          )}

          {/* AI Recommendation */}
          {result.ai_recommendation && (
            <div className="mt-8">

              <div className="mb-4">
                <p className="text-sm font-medium text-blue-400">
                  AI Recommendation
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  Your Personalized Itinerary
                </h2>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-xl backdrop-blur-xl sm:p-8">

                <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-7 text-slate-300">
                  {result.ai_recommendation}
                </div>

              </div>
            </div>
          )}

          {result.daily_itinerary?.map((day) => (
            <div
              key={day.day}
              className="rounded-3xl border border-white/10 bg-white/[0.05] p-6"
            >
              <div className="mb-6">
                <p className="text-sm font-medium text-blue-400">
                  DAY {day.day}
                </p>

                <h3 className="mt-1 text-2xl font-bold text-white">
                  {day.title}
                </h3>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">

                <div>
                  <h4 className="mb-3 font-semibold">
                    🌅 Morning
                  </h4>

                  <ul className="space-y-2 text-sm text-slate-400">
                    {day.morning.map((item, index) => (
                      <li key={index}>
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold">
                    ☀️ Afternoon
                  </h4>

                  <ul className="space-y-2 text-sm text-slate-400">
                    {day.afternoon.map((item, index) => (
                      <li key={index}>
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold">
                    🌙 Evening
                  </h4>

                  <ul className="space-y-2 text-sm text-slate-400">
                    {day.evening.map((item, index) => (
                      <li key={index}>
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-white/[0.04] p-4">
                  <p className="text-xs text-slate-500">
                    🚗 Transportation
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    {day.transportation}
                  </p>
                </div>

                <div className="rounded-xl bg-white/[0.04] p-4">
                  <p className="text-xs text-slate-500">
                    🍜 Local Food
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    {day.local_food.join(", ")}
                  </p>
                </div>

              </div>
            </div>
          ))}

          {/* If AI recommendation doesn't exist */}
          {!result.ai_recommendation && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center">

              <div className="text-4xl">
                🗺️
              </div>

              <h2 className="mt-4 text-xl font-bold">
                Trip Generated Successfully
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Your trip information has been successfully created.
              </p>

            </div>
          )}

          {/* Footer */}
          <div className="mt-10 pb-6 text-center text-xs text-slate-600">
            ✨ Kelana AI — Smart Plan - Epic Trips
          </div>

        </div>
      </main>
    );
  }

  /*
   * ============================
   * FORM PAGE
   * ============================
   */

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">

        <div className="w-full max-w-2xl">

          {/* Header */}
          <div className="mb-8 text-center">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              ✈️ AI Travel Planner
            </div>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Kelana AI
              </span>
            </h1>

            <p className="mt-4 text-lg font-medium text-slate-300">
              Smart Plan - Epic Trips
            </p>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Plan your perfect trip with AI. Tell us where you want to go,
              your budget, travel month, and travel style.
            </p>

          </div>

          {/* Form Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl sm:p-8">

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Destination */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Destination
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2">
                    📍
                  </span>

                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Bali, Indonesia"
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-3.5 pl-12 pr-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                  />

                </div>
              </div>

              {/* Budget + Days */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Budget
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      $
                    </span>

                    <input
                      type="number"
                      min="1"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="2000"
                      required
                      className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-3.5 pl-10 pr-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                    />

                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Duration
                  </label>

                  <div className="relative">

                    <input
                      type="number"
                      min="1"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      placeholder="7"
                      required
                      className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3.5 pr-16 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                      days
                    </span>

                  </div>
                </div>

              </div>

              {/* Month */}
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Travel Month
                </label>

                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3.5 text-white outline-none focus:border-blue-500"
                >

                  <option value="" disabled>
                    Select travel month
                  </option>

                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>

                </select>

              </div>

              {/* Travel Style */}
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Travel Style
                </label>

                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3.5 text-white outline-none focus:border-blue-500"
                >

                  <option value="" disabled>
                    Select your travel style
                  </option>

                  <option value="Budget">Budget</option>
                  <option value="Standard">Standard</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Family">Family</option>
                  <option value="Romantic">Romantic</option>
                  <option value="Solo">Solo</option>

                </select>

              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="group w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] hover:from-blue-400 hover:to-purple-500 active:scale-[0.99]"
              >
                <span className="flex items-center justify-center gap-2">
                  Generate AI Trip

                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </button>

            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
              ✨ Powered by AI
            </div>

          </div>

          <p className="mt-6 text-center text-xs text-slate-600">
            Your journey starts with a smart plan.
          </p>

        </div>
      </div>
    </main>
  );
}