"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Menu, Sprout } from "lucide-react"; // Import Menu for the hamburger
import "./globals.css";
import Sidebar from "../components/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // This state controls if the sidebar is visible on mobile
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

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.push('/login');
    });

    return () => authListener.subscription.unsubscribe();
  }, [pathname, router]);

  // If the user clicks a link, automatically close the mobile menu
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <html lang="en">
        <body className="bg-[#fdfbf7] flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-[#7a967a] font-bold uppercase tracking-widest">
            Sage & Sand
          </div>
        </body>
      </html>
    );
  }

  const isLoginPage = pathname === '/login';

  return (
    <html lang="en">
      <body className="antialiased font-sans bg-[#fdfbf7] min-h-screen text-stone-800 flex flex-col md:flex-row">
        {!isLoginPage && (
          <>
            {/* MOBILE TOP BAR - Only shows on phone/tablet */}
            <header className="md:hidden bg-white border-b border-[#f1e6d2] p-4 flex justify-between items-center sticky top-0 z-[80] shadow-sm">
              <div className="flex items-center gap-2">
                <div className="bg-[#7a967a] p-1.5 rounded-lg text-white">
                  <Sprout size={20} />
                </div>
                <span className="font-bold text-[#637a63] tracking-tight">Sage & Sand</span>
              </div>
              
              {/* THE HAMBURGER BUTTON */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 bg-[#f4f7f4] rounded-xl text-[#7a967a] hover:bg-[#7a967a] hover:text-white transition-colors"
              >
                <Menu size={24} />
              </button>
            </header>

            {/* THE SIDEBAR - We pass the 'isMobileMenuOpen' state here */}
            <Sidebar 
              isOpen={isMobileMenuOpen} 
              onClose={() => setIsMobileMenuOpen(false)} 
            />
          </>
        )}
        
        <main className={`flex-1 overflow-y-auto max-h-screen ${isLoginPage ? 'w-full' : ''}`}>
          {children}
        </main>
      </body>
    </html>
  );
}