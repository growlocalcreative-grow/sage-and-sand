import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "../components/Sidebar"; // This imports our new sidebar

export const metadata: Metadata = {
  title: "Sage & Sand | Craft Management",
  description: "Shared workspace for inventory and market planning.",
  manifest: "/manifest.json", // This links to our new file!
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans flex bg-[#fdfbf7]">
        {/* The Sidebar is now a permanent resident! */}
        <Sidebar />
        
        {/* The "children" is whatever page you are currently looking at */}
        <div className="flex-1 overflow-y-auto h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}