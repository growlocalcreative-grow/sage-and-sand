"use client";

import React from 'react';
import { 
  Sprout, Package, Calendar, LayoutDashboard, 
  CheckSquare, BookOpen, Clock, LogOut, Settings, X 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const pathname = usePathname();
  
  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <>
      {/* Dimmer: Uses 'fixed' to cover the whole screen */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[90] md:hidden transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* Sidebar: Uses 'svh' to handle mobile heights perfectly */}
      <aside className={`
        fixed inset-y-0 left-0 z-[100] w-72 bg-white border-r border-[#f1e6d2] 
        transform transition-transform duration-300 ease-in-out flex flex-col
        md:relative md:translate-x-0 h-[100svh]
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#7a967a] p-2 rounded-lg text-white">
              <Sprout size={24} />
            </div>
            <span className="font-bold text-xl text-[#637a63] tracking-tight">Sage & Sand</span>
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-stone-400 hover:text-[#7a967a] active:scale-90 transition-transform">
            <X size={28} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto scroll-touch">
          <NavLink href="/" icon={<LayoutDashboard size={20}/>} label="Dashboard" active={pathname === '/'} onClick={onClose} />
          <NavLink href="/inventory" icon={<Package size={20}/>} label="Inventory" active={pathname === '/inventory'} onClick={onClose} />
          <NavLink href="/planner" icon={<Clock size={20}/>} label="Production Planner" active={pathname === '/planner'} onClick={onClose} />
          <NavLink href="/tasks" icon={<CheckSquare size={20}/>} label="Team Tasks" active={pathname === '/tasks'} onClick={onClose} />
          <NavLink href="/calendar" icon={<Calendar size={20}/>} label="Market Calendar" active={pathname === '/calendar'} onClick={onClose} />
          <NavLink href="/cms" icon={<BookOpen size={20}/>} label="Brand Vault" active={pathname === '/cms'} onClick={onClose} />
          <NavLink href="/settings" icon={<Settings size={20}/>} label="Settings" active={pathname === '/settings'} onClick={onClose} />
        </nav>

        <div className="p-6 border-t border-[#f1e6d2]">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 p-4 bg-stone-50 text-stone-400 hover:text-rose-500 rounded-2xl transition-all text-xs font-bold uppercase tracking-widest"
          >
            <LogOut size={16} />
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
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group ${
        active 
        ? 'bg-[#f4f7f4] text-[#7a967a] shadow-sm font-bold' 
        : 'text-stone-500 hover:bg-[#fdfbf7] hover:text-[#7a967a]'
      }`}
    >
      <span className="transition-transform group-active:scale-110">{icon}</span>
      <span className="text-sm sm:text-base">{label}</span>
    </Link>
  );
}