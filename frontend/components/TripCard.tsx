"use client";

import Link from "next/link";

interface Trip {
  id: number;
  destination: string;
  days: number;
  budget: number;
  travel_style: string;
  category: string;
  daily_budget?: number;
  create_at?: string;
}

interface TripCardProps {
  trip: Trip;
}

const getDestinationIcon = (destination: string) => {
  const value = destination.toLowerCase();

  if (value.includes("indonesia") || value.includes("bali")) {
    return "🇮🇩";
  }

  if (value.includes("japan") || value.includes("tokyo")) {
    return "🇯🇵";
  }

  if (value.includes("singapore")) {
    return "🇸🇬";
  }

  if (value.includes("malaysia") || value.includes("kuala lumpur")) {
    return "🇲🇾";
  }

  if (value.includes("thailand") || value.includes("bangkok")) {
    return "🇹🇭";
  }

  if (value.includes("usa") || value.includes("america")) {
    return "🇺🇸";
  }

  if (value.includes("australia")) {
    return "🇦🇺";
  }

  if (value.includes("france") || value.includes("paris")) {
    return "🇫🇷";
  }

  return "🌍";
};

const getCategoryStyle = (category: string) => {
  const value = category.toLowerCase();

  if (value.includes("backpacker")) {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (value.includes("luxury")) {
    return "bg-purple-100 text-purple-700 border-purple-200";
  }

  return "bg-blue-100 text-blue-700 border-blue-200";
};

const getTravelStyleIcon = (travelStyle: string) => {
  const value = travelStyle.toLowerCase();

  if (value.includes("family")) {
    return "👨‍👩‍👧‍👦";
  }

  if (value.includes("solo")) {
    return "🧑";
  }

  if (value.includes("couple")) {
    return "💑";
  }

  return "✈️";
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date?: string) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

export default function TripCard({ trip }: TripCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Header */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm">
              {getDestinationIcon(trip.destination)}
            </div>

            <div>
              <p className="text-sm text-blue-100">
                Destination
              </p>

              <h2 className="text-xl font-bold">
                {trip.destination}
              </h2>
            </div>

          </div>

          <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            #{trip.id}
          </div>
        </div>

        {/* Duration */}
        <div className="mt-6 flex items-center gap-2 text-sm text-blue-100">
          <span>📅</span>
          <span>{trip.days} Days Trip</span>
        </div>

      </div>

      {/* Content */}
      <div className="p-6">

        {/* Budget */}
        <div className="mb-5 rounded-xl bg-gray-50 p-4">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Total Budget
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                USD {formatCurrency(trip.budget)}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
              💰
            </div>

          </div>

          {trip.daily_budget !== undefined && (
            <div className="mt-3 border-t border-gray-200 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Daily Budget
                </span>

                <span className="font-semibold text-gray-700">
                  USD {formatCurrency(trip.daily_budget)} / day
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">

          {/* Category */}
          <span
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getCategoryStyle(
              trip.category
            )}`}
          >
            💳 {trip.category}
          </span>

          {/* Travel Style */}
          <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
            {getTravelStyleIcon(trip.travel_style)}{" "}
            {trip.travel_style}
          </span>

        </div>

        {/* Date */}
        <div className="mt-5 flex items-center gap-2 text-xs text-gray-400">
          <span>🕐</span>
          <span>Created {formatDate(trip.create_at)}</span>
        </div>

        {/* Action */}
        <Link
          href={`/trips/${trip.id}`}
          className="mt-5 block w-full rounded-xl bg-gray-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          View Trip Details →
        </Link>

      </div>
    </div>
  );
}
```
