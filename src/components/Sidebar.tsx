"use client"; // This is required because we are adding a button click

import React from 'react';
import { 
  Sprout, Package, Calendar, LayoutDashboard, 
  CheckSquare, BookOpen, Clock, Plus, LogOut, Settings 
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; // Import our Supabase phone

export default function Sidebar() {
  
  // THE SIGN OUT FUNCTION
  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Error signing out");
    } else {
      // Send the user back to the login page and refresh the browser
      window.location.href = "/login";
    }
  }

  return (
    <aside className="w-64 bg-white border-r border-[#f1e6d2] hidden md:flex flex-col h-screen sticky top-0">
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-[#7a967a] p-2 rounded-lg text-white">
          <Sprout size={24} />
        </div>
        <span className="font-bold text-xl text-[#637a63] tracking-tight">Sage & Sand</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavLink href="/" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
        <NavLink href="/inventory" icon={<Package size={20}/>} label="Inventory" />
        <NavLink href="/planner" icon={<Clock size={20}/>} label="Production Planner" />
        <NavLink href="/tasks" icon={<CheckSquare size={20}/>} label="Team Tasks" />
        <NavLink href="/calendar" icon={<Calendar size={20}/>} label="Market Calendar" />
        <NavLink href="/cms" icon={<BookOpen size={20}/>} label="Brand Vault" />
        <NavLink href="/settings" icon={<Settings size={20}/>} label="Settings" />
      </nav>

      {/* FOOTER ACTIONS */}
      <div className="p-4 border-t border-[#f1e6d2] space-y-2">
        <button className="w-full bg-[#f4f7f4] text-[#637a63] p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#7a967a] hover:text-white transition-all font-medium">
          <Plus size={18} />
          New Entry
        </button>

        {/* THE SIGN OUT BUTTON */}
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 p-3 text-stone-400 hover:text-rose-400 transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <LogOut size={14} />
          Sign Out of Hub
        </button>
      </div>
    </aside>
  );
}

// Helper component for links
function NavLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-3 rounded-xl text-stone-500 hover:bg-[#fdfbf7] hover:text-[#7a967a] transition-colors group">
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}