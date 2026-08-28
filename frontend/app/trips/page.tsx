"use client";

import { useEffect, useState } from "react";
import TripCard from "@/components/TripCard";

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

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/v1/trips"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch trips");
        }

        const data = await response.json();

        setTrips(data);
      } catch (error) {
        console.error(error);
        setError("Failed to load trip history.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-10">

          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
            KelanaAI
          </p>

          <h1 className="text-3xl font-bold text-gray-900">
            Trip History
          </h1>

          <p className="mt-2 text-gray-500">
            Explore your previously generated travel plans.
          </p>

        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">

              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

              <p className="text-gray-500">
                Loading your trips...
              </p>

            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && trips.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">

            <div className="mb-4 text-5xl">
              ✈️
            </div>

            <h2 className="text-xl font-semibold text-gray-900">
              No trips yet
            </h2>

            <p className="mt-2 text-gray-500">
              Start planning your first adventure with KelanaAI.
            </p>

          </div>
        )}

        {/* Trip Grid */}
        {!loading && !error && trips.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
              />
            ))}

          </div>
        )}

      </div>

    </main>
  );
}
```
