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

export default function TripCard({ trip }: TripCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date?: string) => {
    if (!date) return "Recently created";

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      {/* Card Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
        <div className="flex items-start justify-between">

          <div>
            <p className="mb-2 text-sm font-medium text-blue-100">
              Destination
            </p>

            <h2 className="text-2xl font-bold">
              {trip.destination}
            </h2>
          </div>

          {/* <div className="text-4xl">
            ✈️
          </div> */}

        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-6">

        {/* Category */}
        <div className="mb-5">
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {trip.category}
          </span>
        </div>

        {/* Information */}
        <div className="space-y-4">

          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <span className="text-sm text-gray-500">
              Duration
            </span>

            <span className="font-semibold text-gray-900">
              {trip.days} Days
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <span className="text-sm text-gray-500">
              Budget
            </span>

            <span className="font-semibold text-gray-900">
              {formatCurrency(trip.budget)}
            </span>
          </div>

        </div>

        {/* View Detail */}
        <div className="mt-auto pt-6">
          <Link
            href={`/trips/${trip.id}`}
            className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            View Detail
          </Link>
        </div>

      </div>
    </div>
  );
}
