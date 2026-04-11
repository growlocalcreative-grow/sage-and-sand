"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Sparkles, Hammer, History, 
  TrendingUp, Users, Loader2, Package, CheckCircle2 
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
    
    // 1. Get current user info
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserEmail(user.email || "Maker");

    // 2. Fetch everything at once for speed!
    const [prodRes, taskRes] = await Promise.all([
      supabase.from('products').select('id, name, current_stock'),
      supabase.from('tasks').select('id').eq('is_completed', false)
    ]);

    // 3. Calculate Total Stock
    const totalStock = prodRes.data?.reduce((acc, item) => acc + (item.current_stock || 0), 0) || 0;

    setStats({
      stock: totalStock,
      tasks: taskRes.data?.length || 0
    });

    setQuickProducts(prodRes.data || []);
    setLoading(false);
  }

  // Quick Production Update Logic
  async function updateStock(item: any, change: number) {
    const newStock = Math.max(0, item.current_stock + change);
    
    const { error } = await supabase
      .from('products')
      .update({ current_stock: newStock })
      .eq('id', item.id);

    if (!error) {
      setQuickProducts(quickProducts.map(p => p.id === item.id ? { ...p, current_stock: newStock } : p));
      // Update the big total stat too
      setStats(prev => ({ ...prev, stock: prev.stock + change }));
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-[#7a967a]">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p className="font-bold uppercase tracking-widest text-xs">Syncing Hub...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto text-stone-800 pb-20">
      {/* Welcome Header */}
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#637a63]">Sage & Sand Hub</h1>
          <p className="text-stone-400 text-sm italic">Logged in as: <span className="font-bold text-[#7a967a]">{userEmail}</span></p>
        </div>
        <div className="flex -space-x-2">
          <div className="w-10 h-10 rounded-full border-2 border-white bg-[#7a967a] flex items-center justify-center text-[#fdfbf7] text-xs font-bold shadow-sm">ME</div>
          <div className="w-10 h-10 rounded-full border-2 border-white bg-[#f1e6d2] flex items-center justify-center text-[#637a63] text-xs font-bold shadow-sm">D</div>
        </div>
      </header>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard label="Items in Stock" value={stats.stock} icon={<Package size={20}/>} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Pending Tasks" value={stats.tasks} icon={<History size={20}/>} color="text-amber-600" bg="bg-amber-50" />
        <StatCard label="Sales (Week)" value="$0" icon={<TrendingUp size={20}/>} color="text-[#c2b280]" bg="bg-[#fdfbf7]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LIVE PRODUCTION LOG */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-[#f1e6d2] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#f4f7f4] p-2 rounded-xl text-[#637a63]">
              <Sparkles size={24} />
            </div>
            <h2 className="text-xl font-bold text-[#637a63]">Production Log</h2>
          </div>
          
          <p className="text-xs text-stone-400 mb-6 font-bold uppercase tracking-widest">Update finished stock levels:</p>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {quickProducts.length > 0 ? quickProducts.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-[#fdfbf7] rounded-2xl border border-[#f1e6d2] hover:border-[#7a967a] transition-all">
                <div>
                  <p className="font-bold text-[#637a63]">{item.name}</p>
                  <p className="text-[10px] font-black text-[#c2b280] uppercase tracking-tighter">Current: {item.current_stock}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => updateStock(item, -1)}
                    className="w-10 h-10 rounded-xl bg-white border border-[#f1e6d2] flex items-center justify-center text-[#637a63] hover:bg-rose-50 hover:text-rose-500 transition-all font-bold shadow-sm"
                  >-</button>
                  <span className="w-6 text-center font-black text-[#637a63]">{item.current_stock}</span>
                  <button 
                    onClick={() => updateStock(item, 1)}
                    className="w-10 h-10 rounded-xl bg-white border border-[#f1e6d2] flex items-center justify-center text-[#637a63] hover:bg-[#7a967a] hover:text-white transition-all font-bold shadow-sm"
                  >+</button>
                </div>
              </div>
            )) : (
              <p className="text-stone-400 italic text-sm text-center py-10">No products found in inventory.</p>
            )}
          </div>
        </section>

        {/* TEAM ACTIVITY (Placeholder for now) */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-[#f1e6d2] shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#fdfbf7] p-2 rounded-xl text-[#c2b280]">
              <Users size={24} />
            </div>
            <h2 className="text-xl font-bold text-[#637a63]">Team Activity</h2>
          </div>

          <div className="space-y-8 relative">
            {/* Design Line */}
            <div className="absolute left-1 top-2 bottom-2 w-0.5 bg-[#f1e6d2]"></div>
            
            <ActivityItem user="System" action="Sync complete" target="Cloud Database" time="Just now" />
            <ActivityItem user="You" action="Viewing" target="Dashboard Overview" time="Active" />
            <p className="text-center text-[10px] font-bold text-stone-300 uppercase tracking-[0.2em] pt-4">More activity tracking coming soon</p>
          </div>
        </section>

      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-[#f1e6d2] shadow-sm flex items-center gap-5 group hover:border-[#7a967a] transition-all">
      <div className={`p-4 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-3xl font-black ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function ActivityItem({ user, action, target, time }: any) {
  return (
    <div className="flex gap-6 relative z-10">
      <div className="w-2.5 h-2.5 rounded-full bg-[#c2b280] ring-4 ring-white mt-1.5 shrink-0"></div>
      <div>
        <p className="text-sm text-stone-600">
          <span className="font-bold text-[#637a63]">{user}</span> {action} <span className="italic text-[#c2b280]">"{target}"</span>
        </p>
        <p className="text-[10px] font-bold text-stone-300 uppercase tracking-tighter mt-1">{time}</p>
      </div>
    </div>
  );
}