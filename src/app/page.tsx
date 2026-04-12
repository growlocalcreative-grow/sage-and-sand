"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Sparkles, History, TrendingUp, Users, Loader2, Package, ShoppingCart
} from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ stock: 0, tasks: 0, revenue: 0 });
  const [quickProducts, setQuickProducts] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserEmail(user.email || "Maker");

    // Get date for 7 days ago to calculate weekly revenue
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [prodRes, taskRes, salesRes] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('tasks').select('id').eq('is_completed', false),
      supabase.from('sales').select('total_price').gte('created_at', sevenDaysAgo.toISOString())
    ]);

    const totalStock = prodRes.data?.reduce((acc, item) => acc + (item.current_stock || 0), 0) || 0;
    const weeklyRevenue = salesRes.data?.reduce((acc, sale) => acc + (Number(sale.total_price) || 0), 0) || 0;

    setStats({ 
      stock: totalStock, 
      tasks: taskRes.data?.length || 0,
      revenue: weeklyRevenue
    });
    
    setQuickProducts(prodRes.data || []);
    setLoading(false);
  }

  // --- NEW: LOG A SALE ---
  async function handleLogSale(product: any) {
    const amount = prompt(`How many "${product.name}" did you sell?`, "1");
    if (!amount || isNaN(Number(amount))) return;
    const qtySold = parseInt(amount);

    const totalPrice = qtySold * (Number(product.sale_price) || 0);
    const confirmSale = confirm(`Log sale of ${qtySold} ${product.name} for $${totalPrice.toFixed(2)}?`);
    
    if (confirmSale) {
      setLoading(true);
      
      // 1. Record the sale in the cloud
      const { error: saleError } = await supabase.from('sales').insert([{
        product_id: product.id,
        product_name: product.name,
        quantity: qtySold,
        total_price: totalPrice
      }]);

      if (!saleError) {
        // 2. Use our SQL helper to subtract from Product Stock
        await supabase.rpc('decrement_product_stock', { 
          row_id: product.id, 
          amount: qtySold 
        });
        
        alert("Sale logged! Revenue and stock updated.");
        fetchDashboardData(); // Refresh everything
      } else {
        alert("Error logging sale: " + saleError.message);
      }
      setLoading(false);
    }
  }

  // Quick Production Update (From previous step)
  async function updateStock(item: any, change: number) {
    const newStock = Math.max(0, item.current_stock + change);
    const { error } = await supabase.from('products').update({ current_stock: newStock }).eq('id', item.id);
    if (!error) fetchDashboardData();
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#7a967a]">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p className="font-bold uppercase tracking-widest text-[10px]">Syncing Revenue...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto text-stone-800 pb-24">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#637a63]">Sage & Sand Hub</h1>
          <p className="text-stone-400 text-xs italic">{userEmail}</p>
        </div>
        <div className="flex -space-x-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-[#7a967a] flex items-center justify-center text-white text-[10px] font-bold">ME</div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-[#f1e6d2] flex items-center justify-center text-[#637a63] text-[10px] font-bold">D</div>
        </div>
      </header>

      {/* STAT CARDS - Now showing REAL Revenue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
        <StatCard label="Items in Stock" value={stats.stock} icon={<Package size={20}/>} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Pending Tasks" value={stats.tasks} icon={<History size={20}/>} color="text-amber-600" bg="bg-amber-50" />
        <StatCard label="Sales (7 Days)" value={`$${stats.revenue.toFixed(2)}`} icon={<TrendingUp size={20}/>} color="text-[#c2b280]" bg="bg-[#fdfbf7]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#f1e6d2] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#f4f7f4] p-2 rounded-lg text-[#637a63]"><Sparkles size={20} /></div>
            <h2 className="text-lg sm:text-xl font-bold text-[#637a63]">Production & Sales</h2>
          </div>
          
          <div className="space-y-3">
            {quickProducts.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 sm:p-4 bg-[#fdfbf7] rounded-2xl border border-[#f1e6d2]">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[#637a63] text-sm truncate">{item.name}</p>
                  <p className="text-[9px] font-bold text-stone-400 uppercase">Stock: {item.current_stock}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* LOG SALE BUTTON */}
                  <button 
                    onClick={() => handleLogSale(item)}
                    className="p-2 bg-white border border-[#f1e6d2] rounded-xl text-[#c2b280] hover:bg-[#c2b280] hover:text-white transition-all shadow-sm"
                    title="Log a Sale"
                  >
                    <ShoppingCart size={18} />
                  </button>

                  <div className="h-8 w-px bg-stone-100 mx-1" />

                  <button onClick={() => updateStock(item, -1)} className="w-8 h-8 rounded-xl bg-white border border-[#f1e6d2] text-[#637a63] font-bold shadow-sm">-</button>
                  <button onClick={() => updateStock(item, 1)} className="w-8 h-8 rounded-xl bg-white border border-[#f1e6d2] text-[#637a63] font-bold shadow-sm">+</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#f1e6d2] shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#fdfbf7] p-2 rounded-xl text-[#c2b280]"><Users size={20} /></div>
            <h2 className="text-lg sm:text-xl font-bold text-[#637a63]">Recent Activity</h2>
          </div>
          <div className="space-y-6">
            <ActivityItem user="System" action="Sync active" target="Sales Table" time="Now" />
            <p className="text-center text-[10px] font-bold text-stone-300 uppercase tracking-widest pt-4">Sale history appearing soon</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, bg }: any) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] border border-[#f1e6d2] shadow-sm flex items-center gap-4">
      <div className={`p-3 sm:p-4 rounded-2xl ${bg} ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest truncate">{label}</p>
        <p className={`text-xl sm:text-2xl font-black ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function ActivityItem({ user, action, target, time }: any) {
  return (
    <div className="flex gap-4">
      <div className="w-2 h-2 rounded-full bg-[#c2b280] mt-1.5 shrink-0"></div>
      <div className="min-w-0"><p className="text-xs sm:text-sm text-stone-600 truncate"><span className="font-bold text-[#637a63]">{user}</span> {action} <span className="italic text-[#c2b280]">"{target}"</span></p><p className="text-[9px] font-bold text-stone-300 uppercase mt-0.5">{time}</p></div>
    </div>
  );
}