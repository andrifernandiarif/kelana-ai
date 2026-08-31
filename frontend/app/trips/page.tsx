// "use client";

// import Link from "next/link";
// import { useEffect, useMemo, useState } from "react";
// import TripCard from "@/components/TripCard";


// interface Trip {
//   id: number;
//   destination: string;
//   days: number;
//   budget: number;
//   travel_style: string;
//   category: string;
//   daily_budget?: number;
//   ai_recommendation?: string;
//   create_at?: string;
// }

// type SortOption = "latest" | "oldest" | "highest-budget";

// export default function TripsPage() {
//   const [trips, setTrips] = useState<Trip[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [search, setSearch] = useState("");
//   const [sortBy, setSortBy] = useState<SortOption>("latest");

//   // =========================
//   // PAGINATION
//   // =========================

//   const [currentPage, setCurrentPage] = useState(1);

//   // Jumlah card yang tampil setiap halaman
//   const tripsPerPage = 3;

//   useEffect(() => {
//     const fetchTrips = async () => {
//       try {
//         const response = await fetch(
//           "http://127.0.0.1:8000/api/v1/trips"
//         );

//         if (!response.ok) {
//           throw new Error("Failed to fetch trips");
//         }

//         const data = await response.json();

//         setTrips(data);
//       } catch (error) {
//         console.error(error);
//         setError("Failed to load trip history.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTrips();
//   }, []);

//   // =========================
//   // SEARCH + SORT
//   // =========================

//   const filteredTrips = useMemo(() => {
//     const searchTerm = search.trim().toLowerCase();

//     const result = trips.filter((trip) =>
//       trip.destination
//         .toLowerCase()
//         .includes(searchTerm)
//     );

//     return [...result].sort((a, b) => {
//       switch (sortBy) {
//         case "oldest":
//           return (
//             new Date(a.create_at || 0).getTime() -
//             new Date(b.create_at || 0).getTime()
//           );

//         case "highest-budget":
//           return b.budget - a.budget;

//         case "latest":
//         default:
//           return (
//             new Date(b.create_at || 0).getTime() -
//             new Date(a.create_at || 0).getTime()
//           );
//       }
//     });
//   }, [trips, search, sortBy]);

//   // =========================
//   // PAGINATION CALCULATION
//   // =========================

//   const totalPages = Math.ceil(
//     filteredTrips.length / tripsPerPage
//   );

//   const indexOfLastTrip =
//     currentPage * tripsPerPage;

//   const indexOfFirstTrip =
//     indexOfLastTrip - tripsPerPage;

//   const currentTrips = filteredTrips.slice(
//     indexOfFirstTrip,
//     indexOfLastTrip
//   );

//   // =========================
//   // RESET TO PAGE 1
//   // =========================

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [search, sortBy]);

//   // =========================
//   // CHANGE PAGE
//   // =========================

//   const goToPage = (page: number) => {
//     if (page < 1 || page > totalPages) {
//       return;
//     }

//     setCurrentPage(page);

//     window.scrollTo({
//       top: 0,
//       behavior: "smooth",
//     });
//   };

//   return (
//     <main className="min-h-screen bg-gray-50">


//       {/* =========================
//           CONTENT
//       ========================== */}

//       <div className="mx-auto max-w-6xl px-5 py-10">

//         {/* Page Header */}

//         <div className="mb-8">

//           <h1 className="text-3xl font-bold text-gray-900">
//             My Trips
//           </h1>

//           <p className="mt-2 text-gray-500">
//             Explore your previously generated travel plans.
//           </p>

//         </div>

//         {/* =========================
//             LOADING
//         ========================== */}

//         {loading && (
//           <div className="flex min-h-[300px] items-center justify-center">

//             <div className="text-center">

//               <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

//               <p className="text-gray-500">
//                 Loading your trips...
//               </p>

//             </div>

//           </div>
//         )}

//         {/* =========================
//             ERROR
//         ========================== */}

//         {!loading && error && (
//           <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
//             {error}
//           </div>
//         )}

//         {/* =========================
//             EMPTY
//         ========================== */}

//         {!loading && !error && trips.length === 0 && (
//           <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">

//             <div className="mb-4 text-5xl">
//               ✈️
//             </div>

//             <h2 className="text-xl font-semibold text-gray-900">
//               No trips yet
//             </h2>

//             <p className="mt-2 text-gray-500">
//               Start planning your first adventure with KelanaAI.
//             </p>

//             <Link
//               href="/"
//               className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
//             >
//               Create Your First Trip
//             </Link>

//           </div>
//         )}

//         {/* =========================
//             SEARCH & FILTER
//         ========================== */}

//         {!loading && !error && trips.length > 0 && (
//           <>

//             <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

//               <div className="flex flex-col gap-4 md:flex-row">


                
//                 {/* Search */}
//                 <div className="relative flex-1">
//                   <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-5 w-5 text-gray-400"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                       strokeWidth={2}
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
//                       />
//                     </svg>
//                   </div>

//                   <input
//                     type="text"
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     placeholder="Search trips by destination..."
//                     className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
//                   />

//                   {/* Clear Search Button */}
//                   {search && (
//                     <button
//                       type="button"
//                       onClick={() => setSearch("")}
//                       aria-label="Clear search"
//                       className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition hover:text-gray-600"
//                     >
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="h-5 w-5"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                         strokeWidth={2}
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           d="M6 18L18 6M6 6l12 12"
//                         />
//                       </svg>
//                     </button>
//                   )}
//                 </div>



//                 {/* Filter */}

//                 <div className="flex items-center gap-3">

//                   <label
//                     htmlFor="sort"
//                     className="hidden text-sm font-medium text-gray-600 sm:block"
//                   >
//                     Sort by
//                   </label>

//                   <select
//                     id="sort"
//                     value={sortBy}
//                     onChange={(e) =>
//                       setSortBy(
//                         e.target.value as SortOption
//                       )
//                     }
//                     className="w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:w-48"
//                   >

//                     <option value="latest">
//                       Latest
//                     </option>

//                     <option value="oldest">
//                       Oldest
//                     </option>

//                     <option value="highest-budget">
//                       Highest Budget
//                     </option>

//                   </select>

//                 </div>

//               </div>

//             </div>

            
            
//             {/* =========================
//                 RESULT INFO + PAGINATION
//             ========================== */}

//             {filteredTrips.length > 0 && (
//               <div className="mb-5 flex items-center justify-between gap-4">

//                 {/* Showing Number Trips */}
//                 <p className="text-sm text-gray-500">
//                   Showing{" "}
//                   <span className="font-semibold text-gray-900">
//                     {filteredTrips.length}
//                   </span>{" "}
//                   {filteredTrips.length === 1 ? "trip" : "trips"}
//                 </p>

//                 {/* Pagination */}
//                 {totalPages > 1 && (
//                   <div className="flex items-center gap-2">

//                     {/* Previous */}
//                     <button
//                       onClick={() => goToPage(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       aria-label="Previous page"
//                       className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
//                     >
//                       <span className="text-lg leading-none">‹</span>
//                     </button>

//                     {/* Desktop Page Numbers */}
//                     <div className="hidden items-center gap-2 sm:flex">
//                       {Array.from(
//                         { length: totalPages },
//                         (_, index) => index + 1
//                       ).map((page) => (
//                         <button
//                           key={page}
//                           onClick={() => goToPage(page)}
//                           className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${
//                             currentPage === page
//                               ? "bg-blue-600 text-white shadow-sm"
//                               : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
//                           }`}
//                         >
//                           {page}
//                         </button>
//                       ))}
//                     </div>

//                     {/* Mobile Current Page */}
//                     <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white sm:hidden">
//                       {currentPage}
//                     </span>

//                     {/* Next */}
//                     <button
//                       onClick={() => goToPage(currentPage + 1)}
//                       disabled={currentPage === totalPages}
//                       aria-label="Next page"
//                       className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
//                     >
//                       <span className="text-lg leading-none">›</span>
//                     </button>

//                   </div>
//                 )}

//               </div>
//             )}


//             {/* =========================
//                 NO SEARCH RESULT
//             ========================== */}

//             {filteredTrips.length === 0 && (
//               <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">

//                 <div className="mb-4 text-5xl">
//                   🔍
//                 </div>

//                 <h2 className="text-xl font-semibold text-gray-900">
//                   No trips found
//                 </h2>

//                 <p className="mt-2 text-gray-500">
//                   We couldn't find any trip matching
//                   {" "}
//                   "{search}".
//                 </p>

//                 <button
//                   onClick={() => setSearch("")}
//                   className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
//                 >
//                   Clear Search
//                 </button>

//               </div>
//             )}


//             {/* =========================
//                 TRIP GRID
//             ========================== */}

//             {filteredTrips.length > 0 && (
//               <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//                 {currentTrips.map((trip) => (
//                   <div key={trip.id} className="w-full">
//                     <TripCard trip={trip} />
//                   </div>
//                 ))}
//               </div>
//             )}

//           </>

//         )}

//       </div>

//     </main>
//   );
// }


"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import TripCard from "@/components/TripCard";

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
const [trips, setTrips] = useState<Trip[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [search, setSearch] = useState("");
const [sortBy, setSortBy] = useState<SortOption>("latest");

// =========================
// PAGINATION
// =========================
const [currentPage, setCurrentPage] = useState(1);

// Jumlah card yang tampil setiap halaman
const tripsPerPage = 3;

// =========================
// MOBILE CAROUSEL
// =========================
const carouselRef = useRef<HTMLDivElement>(null);
const [activeCard, setActiveCard] = useState(0);

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
const totalPages = Math.ceil(
filteredTrips.length / tripsPerPage
);

const indexOfLastTrip = currentPage * tripsPerPage;

const indexOfFirstTrip =
indexOfLastTrip - tripsPerPage;

const currentTrips = filteredTrips.slice(
indexOfFirstTrip,
indexOfLastTrip
);

// =========================
// RESET TO PAGE 1
// =========================
useEffect(() => {
setCurrentPage(1);
}, [search, sortBy]);

// =========================
// RESET CAROUSEL
// =========================
useEffect(() => {
setActiveCard(0);

if (carouselRef.current) {
  carouselRef.current.scrollTo({
    left: 0,
    behavior: "auto",
  });
}

}, [currentPage, search, sortBy]);

// =========================
// MOBILE CAROUSEL SCROLL
// =========================
const handleCarouselScroll = () => {
if (!carouselRef.current) return;

const container = carouselRef.current;

const cardWidth = container.clientWidth;

const index = Math.round(
  container.scrollLeft / cardWidth
);

setActiveCard(
  Math.min(
    Math.max(index, 0),
    currentTrips.length - 1
  )
);

};

// =========================
// GO TO CARD
// =========================
const goToCard = (index: number) => {
if (!carouselRef.current) return;

const container = carouselRef.current;

container.scrollTo({
  left: index * container.clientWidth,
  behavior: "smooth",
});

setActiveCard(index);

};

// =========================
// CHANGE PAGE
// =========================
const goToPage = (page: number) => {
if (page < 1 || page > totalPages) {
return;
}

setCurrentPage(page);

window.scrollTo({
  top: 0,
  behavior: "smooth",
});

};

return ( <main className="min-h-screen bg-gray-50">
{/* =========================
CONTENT
========================== */} <div className="mx-auto max-w-6xl px-5 py-10">
{/* Page Header */} <div className="mb-8"> <h1 className="text-3xl font-bold text-gray-900">
My Trips </h1>

```
      <p className="mt-2 text-gray-500">
        Explore your previously generated travel plans.
      </p>
    </div>

    {/* =========================
        LOADING
    ========================== */}
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

    {/* =========================
        ERROR
    ========================== */}
    {!loading && error && (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        {error}
      </div>
    )}

    {/* =========================
        EMPTY
    ========================== */}
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

        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Create Your First Trip
        </Link>
      </div>
    )}

    {/* =========================
        SEARCH & FILTER
    ========================== */}
    {!loading && !error && trips.length > 0 && (
      <>
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
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search trips by destination..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

              {/* Clear Search Button */}
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

            {/* Filter */}
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
                onChange={(e) =>
                  setSortBy(
                    e.target.value as SortOption
                  )
                }
                className="w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:w-48"
              >
                <option value="latest">
                  Latest
                </option>

                <option value="oldest">
                  Oldest
                </option>

                <option value="highest-budget">
                  Highest Budget
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* =========================
            RESULT INFO + PAGINATION
        ========================== */}
        {filteredTrips.length > 0 && (
          <div className="mb-5 flex items-center justify-between gap-4">
            {/* Showing Number Trips */}
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {filteredTrips.length}
              </span>{" "}
              {filteredTrips.length === 1
                ? "trip"
                : "trips"}
            </p>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                {/* Previous */}
                <button
                  onClick={() =>
                    goToPage(currentPage - 1)
                  }
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="text-lg leading-none">
                    ‹
                  </span>
                </button>

                {/* Desktop Page Numbers */}
                <div className="hidden items-center gap-2 sm:flex">
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() =>
                        goToPage(page)
                      }
                      className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${
                        currentPage === page
                          ? "bg-blue-600 text-white shadow-sm"
                          : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Mobile Current Page */}
                <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white sm:hidden">
                  {currentPage}
                </span>

                {/* Next */}
                <button
                  onClick={() =>
                    goToPage(currentPage + 1)
                  }
                  disabled={
                    currentPage === totalPages
                  }
                  aria-label="Next page"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="text-lg leading-none">
                    ›
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================
            NO SEARCH RESULT
        ========================== */}
        {filteredTrips.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="mb-4 text-5xl">
              🔍
            </div>

            <h2 className="text-xl font-semibold text-gray-900">
              No trips found
            </h2>

            <p className="mt-2 text-gray-500">
              We couldn't find any trip matching{" "}
              "{search}".
            </p>

            <button
              onClick={() => setSearch("")}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* =========================
            TRIP CARDS
        ========================== */}
        {filteredTrips.length > 0 && (
          <>
            {/* =========================
                MOBILE CAROUSEL
            ========================== */}
            <div className="md:hidden">
              <div
                ref={carouselRef}
                onScroll={handleCarouselScroll}
                className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
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

              {/* Carousel Indicators */}
              {currentTrips.length > 1 && (
                <div className="mt-5 flex items-center justify-center gap-2">
                  {currentTrips.map((trip, index) => (
                    <button
                      key={trip.id}
                      type="button"
                      onClick={() =>
                        goToCard(index)
                      }
                      aria-label={`Go to trip ${index + 1}`}
                      aria-current={
                        activeCard === index
                          ? "true"
                          : undefined
                      }
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

            {/* =========================
                DESKTOP GRID
            ========================== */}
            <div className="hidden w-full grid-cols-1 gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
              {currentTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="w-full"
                >
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
