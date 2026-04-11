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

    // Reset scroll to top on every page change
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
    <html lang="en" className="h-full">
      <body className="antialiased font-sans bg-[#fdfbf7] text-stone-800 h-full overflow-hidden">
        <div className="flex flex-col md:flex-row h-full">
          {!isLoginPage && (
            <>
              <header className="md:hidden bg-white border-b border-[#f1e6d2] p-4 flex justify-between items-center z-[80] shrink-0">
                <div className="flex items-center gap-2">
                  <div className="bg-[#7a967a] p-1.5 rounded-lg text-white">
                    <Sprout size={18} />
                  </div>
                  <span className="font-bold text-[#637a63]">Sage & Sand</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-[#f4f7f4] rounded-xl text-[#7a967a]">
                  <Menu size={24} />
                </button>
              </header>
              <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            </>
          )}
          
          {/* 
            This main container is the key to the scroll fix. 
            'flex-1' allows it to take up the rest of the height 
            below the mobile header. 
          */}
          <main className={`flex-1 overflow-y-auto scroll-touch ${isLoginPage ? 'w-full' : ''}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}