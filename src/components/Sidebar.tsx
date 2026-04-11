"use client";

import React from 'react';
import { 
  Sprout, Package, Calendar, LayoutDashboard, 
  CheckSquare, BookOpen, Clock, LogOut, Settings, X 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// We add 'isOpen' and 'onClose' so the Mobile Nav can control it
export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const pathname = usePathname();
  
  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  // Common classes for mobile vs desktop
  const sidebarBase = "w-64 bg-white border-r border-[#f1e6d2] flex flex-col h-screen sticky top-0 transition-transform duration-300 z-[100]";
  const mobileClasses = isOpen ? "translate-x-0 fixed" : "-translate-x-full fixed md:translate-x-0 md:sticky";

  return (
    <>
      {/* Background Dimmer for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] md:hidden" 
          onClick={onClose}
        />
      )}

      <aside className={`${sidebarBase} ${mobileClasses}`}>
        {/* Brand Logo & Close Button */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#7a967a] p-2 rounded-lg text-white">
              <Sprout size={24} />
            </div>
            <span className="font-bold text-xl text-[#637a63] tracking-tight text-nowrap">Sage & Sand</span>
          </div>
          {/* Close button - only visible on mobile */}
          <button onClick={onClose} className="md:hidden p-2 text-stone-400 hover:text-[#7a967a]">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <NavLink href="/" icon={<LayoutDashboard size={20}/>} label="Dashboard" active={pathname === '/'} onClick={onClose} />
          <NavLink href="/inventory" icon={<Package size={20}/>} label="Inventory" active={pathname === '/inventory'} onClick={onClose} />
          <NavLink href="/planner" icon={<Clock size={20}/>} label="Production Planner" active={pathname === '/planner'} onClick={onClose} />
          <NavLink href="/tasks" icon={<CheckSquare size={20}/>} label="Team Tasks" active={pathname === '/tasks'} onClick={onClose} />
          <NavLink href="/calendar" icon={<Calendar size={20}/>} label="Market Calendar" active={pathname === '/calendar'} onClick={onClose} />
          <NavLink href="/cms" icon={<BookOpen size={20}/>} label="Brand Vault" active={pathname === '/cms'} onClick={onClose} />
          <NavLink href="/settings" icon={<Settings size={20}/>} label="Settings" active={pathname === '/settings'} onClick={onClose} />
        </nav>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-[#f1e6d2] space-y-2">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 p-3 text-stone-400 hover:text-rose-400 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

function NavLink({ href, icon, label, active, onClick }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
        active 
        ? 'bg-[#f4f7f4] text-[#7a967a] shadow-sm' 
        : 'text-stone-500 hover:bg-[#fdfbf7] hover:text-[#7a967a]'
      }`}
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span className="font-medium text-sm lg:text-base">{label}</span>
    </Link>
  );
}