"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AskKelanaAI from "@/components/AskKelanaAI";

// Pages where Header should NOT be shown (login/register/chat use their own layout)
const NO_HEADER_PATHS = ["/login", "/register", "/chat"];
// Pages where Footer and FAB should NOT be shown
const AUTH_PATHS = ["/login", "/register"];
// Pages where FAB should NOT be shown (chat has its own interface)
const NO_FAB_PATHS = ["/login", "/register", "/chat"];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);
  const isNoHeader = NO_HEADER_PATHS.includes(pathname);
  const isNoFab    = NO_FAB_PATHS.includes(pathname);

  return (
    <>
      {!isNoHeader && <Header />}
      <main className="flex-1">{children}</main>
      {!isAuthPage && <Footer />}
      {!isNoFab && <AskKelanaAI />}
    </>
  );
}
