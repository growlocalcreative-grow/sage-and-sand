"use client"; // This allows us to use logic like Redirects

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
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

  useEffect(() => {
    const protectRoute = async () => {
      // 1. Ask Supabase if we have a valid user session
      const { data: { session } } = await supabase.auth.getSession();

      // 2. If no session and we aren't already on the login page...
      if (!session && pathname !== '/login') {
        router.push('/login');
      } 
      // 3. If they ARE logged in but trying to go to the login page, send them to dashboard
      else if (session && pathname === '/login') {
        router.push('/');
      }

      setIsLoading(false);
    };

    protectRoute();

    // This part listens for if the user signs out in another tab
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  // Don't show the Sidebar or Content while we are checking their "ID Card"
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

  // If we are on the login page, we don't want the Sidebar to show!
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en">
      <body className={`antialiased font-sans flex bg-[#fdfbf7] min-h-screen text-stone-800`}>
        {!isLoginPage && <Sidebar />}
        
        <main className={`flex-1 overflow-y-auto max-h-screen ${isLoginPage ? 'w-full' : ''}`}>
          {children}
        </main>
      </body>
    </html>
  );
}