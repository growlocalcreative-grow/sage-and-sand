"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Menu, Sprout } from "lucide-react";
import "./globals.css";
import Sidebar from "../components/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const protectRoute = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && pathname !== '/login') {
        router.push('/login');
      } else if (session && pathname === '/login') {
        router.push('/');
      }
      setIsLoading(false);
    };
    protectRoute();

    // Force scroll to top on page change to fix the "mid-section load" bug
    window.scrollTo(0, 0);
  }, [pathname, router]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <html lang="en">
        <body className="bg-[#fdfbf7] flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-[#7a967a] font-bold uppercase tracking-widest text-sm">
            Sage & Sand
          </div>
        </body>
      </html>
    );
  }

  const isLoginPage = pathname === '/login';

  return (
    <html lang="en">
      <body className="antialiased font-sans bg-[#fdfbf7] text-stone-800 min-h-screen">
        <div className="flex flex-col md:flex-row min-h-screen">
          {!isLoginPage && (
            <>
              {/* MOBILE TOP BAR - Fixed to prevent invisible space */}
              <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-[#f1e6d2] p-4 flex justify-between items-center sticky top-0 z-[80] shrink-0">
                <div className="flex items-center gap-2">
                  <div className="bg-[#7a967a] p-1 rounded-lg text-white">
                    <Sprout size={18} />
                  </div>
                  <span className="font-bold text-[#637a63] text-sm">Sage & Sand</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-[#f4f7f4] rounded-xl text-[#7a967a]">
                  <Menu size={22} />
                </button>
              </header>

              <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            </>
          )}
          
          <main className={`flex-1 ${isLoginPage ? 'w-full' : 'w-full md:max-w-[calc(100%-16rem)]'}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}