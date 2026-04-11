"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Sparkles, History, TrendingUp, Users, Loader2, Package
} from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ stock: 0, tasks: 0 });
  const [quickProducts, setQuickProducts] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserEmail(user.email || "Maker");

    const [prodRes, taskRes] = await Promise.all([
      supabase.from('products').select('id, name, current_stock'),
      supabase.from('tasks').select('id').eq('is_completed', false)
    ]);

    const totalStock = prodRes.data?.reduce((acc, item) => acc + (item.current_stock || 0), 0) || 0;
    setStats({ stock: totalStock, tasks: taskRes.data?.length || 0 });
    setQuickProducts(prodRes.data || []);
    setLoading(false);
  }

  async function updateStock(item: any, change: number) {
    const newStock = Math.max(0, item.current_stock + change);
    const { error } = await supabase.from('products').update({ current_stock: newStock }).eq('id', item.id);
    if (!error) {
      setQuickProducts(quickProducts.map(p => p.id === item.id ? { ...p, current_stock: newStock } : p));
      setStats(prev => ({ ...prev, stock: prev.stock + change }));
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#7a967a]">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p className="font-bold uppercase tracking-widest text-[10px]">Syncing Hub...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto text-stone-800 pb-20">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#637a63]">Sage & Sand Hub</h1>
          <p className="text-stone-400 text-xs italic line-clamp-1">{userEmail}</p>
        </div>
        <div className="flex -space-x-2 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-[#7a967a] flex items-center justify-center text-white text-[10px] font-bold shadow-sm">ME</div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-[#f1e6d2] flex items-center justify-center text-[#637a63] text-[10px] font-bold shadow-sm">D</div>
        </div>
      </header>

      {/* STAT CARDS - Responsive Grid to prevent smoosh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
        <StatCard label="In Stock" value={stats.stock} icon={<Package size={20}/>} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Pending Tasks" value={stats.tasks} icon={<History size={20}/>} color="text-amber-600" bg="bg-amber-50" />
        <StatCard label="Sales (Week)" value="$0" icon={<TrendingUp size={20}/>} color="text-[#c2b280]" bg="bg-[#fdfbf7]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PRODUCTION LOG */}
        <section className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-[#f1e6d2] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#f4f7f4] p-2 rounded-lg text-[#637a63]"><Sparkles size={20} /></div>
            <h2 className="text-lg sm:text-xl font-bold text-[#637a63]">Production Log</h2>
          </div>
          
          <div className="space-y-3">
            {quickProducts.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 sm:p-4 bg-[#fdfbf7] rounded-2xl border border-[#f1e6d2]">
                <p className="font-bold text-[#637a63] text-sm sm:text-base truncate mr-2">{item.name}</p>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <button onClick={() => updateStock(item, -1)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-[#f1e6d2] text-[#637a63] font-bold shadow-sm">-</button>
                  <span className="w-4 sm:w-6 text-center font-black text-xs sm:text-sm text-[#637a63]">{item.current_stock}</span>
                  <button onClick={() => updateStock(item, 1)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-[#f1e6d2] text-[#637a63] font-bold shadow-sm">+</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TEAM ACTIVITY */}
        <section className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-[#f1e6d2] shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#fdfbf7] p-2 rounded-xl text-[#c2b280]"><Users size={20} /></div>
            <h2 className="text-lg sm:text-xl font-bold text-[#637a63]">Team Activity</h2>
          </div>
          <div className="space-y-6">
            <ActivityItem user="System" action="Sync complete" target="Cloud" time="Just now" />
            <ActivityItem user="You" action="Active" target="Dashboard" time="Now" />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, bg }: any) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-[#f1e6d2] shadow-sm flex items-center gap-4 transition-all">
      <div className={`p-3 sm:p-4 rounded-2xl ${bg} ${color} shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest truncate">{label}</p>
        <p className={`text-xl sm:text-2xl lg:text-3xl font-black ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function ActivityItem({ user, action, target, time }: any) {
  return (
    <div className="flex gap-4">
      <div className="w-2 h-2 rounded-full bg-[#c2b280] mt-1.5 shrink-0"></div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-stone-600 truncate">
          <span className="font-bold text-[#637a63]">{user}</span> {action} <span className="italic text-[#c2b280]">"{target}"</span>
        </p>
        <p className="text-[9px] font-bold text-stone-300 uppercase mt-0.5">{time}</p>
      </div>
    </div>
  );
}