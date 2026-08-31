"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";

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

export default function TripDetailPage() {
  const params = useParams();
  const id = params.id;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/v1/trips/${id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch trip");
        }

        const data = await response.json();

        setTrip(data);
      } catch (error) {
        console.error(error);
        setError("Failed to load trip details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTrip();
    }
  }, [id]);

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
      month: "long",
      day: "numeric",
    });
  };

  // ==============================
  // PRINT
  // ==============================
  const handlePrint = () => {
    setMenuOpen(false);

    setTimeout(() => {
      window.print();
    }, 100);
  };

  // ==============================
  // SAVE / DOWNLOAD PDF
  // ==============================
  const handleDownloadPDF = () => {
    setMenuOpen(false);

    setTimeout(() => {
      window.print();
    }, 100);
  };

  // ==============================
  // SHARE SOCIAL MEDIA
  // ==============================
  const handleShare = async () => {
    if (!trip) return;

    setMenuOpen(false);

    const shareUrl = window.location.href;

    const shareData = {
      title: `${trip.destination} - KelanaAI`,
      text: `Check out my ${trip.days}-day travel plan for ${trip.destination} created with KelanaAI.`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);

        alert("Trip link copied to clipboard!");
      }
    } catch (error) {
      console.log("Share cancelled:", error);
    }
  };

  // ==============================
  // WHATSAPP
  // ==============================
  const handleWhatsApp = () => {
    if (!trip) return;

    setMenuOpen(false);

    const shareUrl = window.location.href;

    const message = `✈️ ${trip.destination} - KelanaAI

Check out my ${trip.days}-day travel plan.

💰 Budget: ${formatCurrency(trip.budget)}
🎒 Travel Style: ${trip.travel_style}
🏷️ Category: ${trip.category}

View the full trip:
${shareUrl}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      message
    )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ==============================
  // LOADING
  // ==============================
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="text-gray-500">
            Loading trip details...
          </p>
        </div>
      </main>
    );
  }

  // ==============================
  // ERROR
  // ==============================
  if (error || !trip) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-4xl">

          <Link
            href="/trips"
            className="mb-6 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Trip History
          </Link>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error || "Trip not found."}
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 print:bg-white print:px-0 print:py-0">

      <div className="mx-auto max-w-5xl">

        {/* ==============================
            BACK BUTTON
        ============================== */}
        <div className="no-print">
          <Link
            href="/trips"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            ← Back to Trip History
          </Link>
        </div>

        {/* ==============================
            HEADER
        ============================== */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white shadow-sm print:mb-6 print:rounded-none print:shadow-none">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="mb-2 text-sm font-semibold tracking-wider text-blue-100">
                Destination:
              </p>

              <h1 className="text-3xl font-bold md:text-4xl">
                {trip.destination}
              </h1>

              <p className="mt-2 text-blue-100">
                Your personalized {trip.days}-day travel plan
              </p>

              <p className="mt-6 text-xs text-blue-100 print:mt-6">
                Trip created on {formatDate(trip.create_at)}
              </p>
            </div>

          </div>

        </div>

        {/* ==============================
            TRIP SUMMARY
        ============================== */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm print:shadow-none">
            <p className="text-sm text-gray-500">
              Duration:
            </p>

            <p className="mt-1 text-xl font-bold text-gray-900">
              {trip.days} Days
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm print:shadow-none">
            <p className="text-sm text-gray-500">
              Total Budget:
            </p>

            <p className="mt-1 text-xl font-bold text-gray-900">
              {formatCurrency(trip.budget)}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm print:shadow-none">
            <p className="text-sm text-gray-500">
              Travel Style:
            </p>

            <p className="mt-1 text-xl font-bold capitalize text-gray-900">
              {trip.travel_style}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm print:shadow-none">
            <p className="text-sm text-gray-500">
              Category:
            </p>

            <span className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {trip.category}
            </span>
          </div>

        </div>

        {/* ==============================
            AI RECOMMENDATION
        ============================== */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 print:rounded-none print:border-none print:p-0 print:shadow-none">

          {/* ==============================
              AI HEADER + ACTION BUTTONS
          ============================== */}
          <div className="relative mb-6 border-b border-gray-100 pb-5">

            <div className="pr-16 md:pr-64">

              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                AI Generated Plan
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Your Travel Itinerary
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Generated by KelanaAI based on your trip preferences.
              </p>

            </div>

            
            {/* ==============================
                DESKTOP ACTION BUTTONS
            ============================== */}
            <div className="no-print absolute right-0 top-0 hidden items-center gap-2 md:flex">

              {/* PRINT */}
              <button
                onClick={handlePrint}
                title="Print trip"
                aria-label="Print trip"
                className="group flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="h-[19px] w-[19px] transition-transform duration-200 group-hover:scale-110"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 9V4.5h10.5V9"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18H4.5A1.5 1.5 0 013 16.5v-6A1.5 1.5 0 014.5 9h15a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5H18"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 15.75h10.5v4.5H6.75v-4.5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 12h.008"
                  />
                </svg>
              </button>


              {/* SAVE PDF */}
              <button
                onClick={handleDownloadPDF}
                title="Save as PDF"
                aria-label="Save as PDF"
                className="group flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="h-[19px] w-[19px] transition-transform duration-200 group-hover:scale-110"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.25 2.25H6.75A1.5 1.5 0 005.25 3.75v16.5a1.5 1.5 0 001.5 1.5h11.5a1.5 1.5 0 001.5-1.5V8.25L14.25 2.25z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.25 2.25v6h5.5"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 12.75v5.25m0 0l-2.25-2.25M12 18l2.25-2.25"
                  />
                </svg>
              </button>


              {/* SHARE */}
              <button
                onClick={handleShare}
                title="Share trip"
                aria-label="Share trip"
                className="group flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="h-[19px] w-[19px] transition-transform duration-200 group-hover:scale-110"
                >
                  <circle cx="18" cy="5" r="2.5" />
                  <circle cx="6" cy="12" r="2.5" />
                  <circle cx="18" cy="19" r="2.5" />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 10.75l7.5-4.5M8.25 13.25l7.5 4.5"
                  />
                </svg>
              </button>


              {/* WHATSAPP */}
              <button
                onClick={handleWhatsApp}
                title="Share via WhatsApp"
                aria-label="Share via WhatsApp"
                className="group flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all duration-200 hover:border-green-200 hover:bg-green-50 hover:text-green-600 hover:shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="h-[19px] w-[19px] transition-transform duration-200 group-hover:scale-110"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 11.25a8.25 8.25 0 01-12.9 6.75L3.75 19.5l1.5-3.6A8.25 8.25 0 1120.25 11.25z"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.5 9.25c.2 1.8 1.45 3.4 3.2 4.1.65.25 1.4.05 1.75-.5l.4-.6"
                  />
                </svg>
              </button>

            </div>



            {/* ==============================
                MOBILE HAMBURGER
            ============================== */}
            <div className="no-print absolute right-0 top-0 md:hidden">

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Trip actions menu"
                aria-expanded={menuOpen}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                {menuOpen ? (
                  /* CLOSE ICON */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 6l12 12M18 6L6 18"
                    />
                  </svg>
                ) : (
                  /* MENU ICON */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>


              {/* MOBILE MENU */}
              {menuOpen && (
                <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">

                  {/* PRINT */}
                  <button
                    onClick={handlePrint}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition group-hover:bg-blue-100 group-hover:text-blue-600">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 9V4.5h10.5V9"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18H4.5A1.5 1.5 0 013 16.5v-6A1.5 1.5 0 014.5 9h15a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5H18"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 15.75h10.5v4.5H6.75v-4.5z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18 12h.008"
                        />
                      </svg>

                    </span>

                    <span>Print Trip</span>
                  </button>


                  {/* SAVE PDF */}
                  <button
                    onClick={handleDownloadPDF}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition group-hover:bg-blue-100 group-hover:text-blue-600">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.25 2.25H6.75A1.5 1.5 0 005.25 3.75v16.5a1.5 1.5 0 001.5 1.5h11.5a1.5 1.5 0 001.5-1.5V8.25L14.25 2.25z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.25 2.25v6h5.5"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 12.75v5.25m0 0l-2.25-2.25M12 18l2.25-2.25"
                        />
                      </svg>

                    </span>

                    <span>Save as PDF</span>
                  </button>


                  {/* SHARE */}
                  <button
                    onClick={handleShare}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition group-hover:bg-blue-100 group-hover:text-blue-600">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <circle cx="18" cy="5" r="2.5" />
                        <circle cx="6" cy="12" r="2.5" />
                        <circle cx="18" cy="19" r="2.5" />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 10.75l7.5-4.5M8.25 13.25l7.5 4.5"
                        />
                      </svg>

                    </span>

                    <span>Share Trip</span>
                  </button>


                  {/* WHATSAPP */}
                  <button
                    onClick={handleWhatsApp}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-600"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition group-hover:bg-green-100 group-hover:text-green-600">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20.25 11.25a8.25 8.25 0 01-12.9 6.75L3.75 19.5l1.5-3.6A8.25 8.25 0 1120.25 11.25z"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.5 9.25c.2 1.8 1.45 3.4 3.2 4.1.65.25 1.4.05 1.75-.5l.4-.6"
                        />
                      </svg>

                    </span>

                    <span>Share via WhatsApp</span>
                  </button>

                </div>
              )}

            </div>


          </div>

          {/* ==============================
              MARKDOWN CONTENT
          ============================== */}
          <article className="prose prose-blue max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600">

            {trip.ai_recommendation ? (
              <ReactMarkdown>
                {trip.ai_recommendation}
              </ReactMarkdown>
            ) : (
              <div className="rounded-xl bg-gray-50 p-6 text-center">
                <p className="text-gray-500">
                  No AI recommendation is available for this trip.
                </p>
              </div>
            )}

          </article>

        </section>

        {/* ==============================
            FOOTER BACK BUTTON
        ============================== */}
        <div className="no-print mt-8 text-center">

          <Link
            href="/trips"
            className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            ← Back to Trip History
          </Link>

        </div>

      </div>

      {/* ==============================
          PRINT CSS
      ============================== */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 15mm;
          }

          html,
          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          article {
            font-size: 12pt;
            line-height: 1.6;
          }

          h1,
          h2,
          h3 {
            break-after: avoid;
          }

          p,
          li {
            break-inside: avoid;
          }
        }
      `}
      </style>

    </main>
  );
}



