"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings, Plus, Trash2, Layers, Tag, Loader2, X } from 'lucide-react';

export default function SettingsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState("");

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('name', { ascending: true });
    setCategories(data || []);
    setLoading(false);
  }

  async function handleAddCategory(type: 'material' | 'product') {
    if (!newCatName.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('categories').insert([{ name: newCatName, type: type, user_id: user?.id }]).select();
    if (data) { setCategories([...categories, data[0]]); setNewCatName(""); }
  }

  const materialCats = categories.filter(c => c.type === 'material');
  const productCats = categories.filter(c => c.type === 'product');

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto min-h-screen text-stone-800 pb-20">
      <header className="mb-10"><h1 className="text-2xl sm:text-3xl font-bold text-[#637a63] flex items-center gap-3"><Settings className="text-[#7a967a]" /> Hub Settings</h1><p className="text-stone-400 text-xs sm:text-sm italic">Organize your Sage & Sand labels</p></header>

      {/* Grid stacks on tablets (md and smaller) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-[#7a967a] ml-2"><Layers size={18} /><h2 className="font-bold uppercase tracking-widest text-[10px]">Materials</h2></div>
          <CategoryBox value={newCatName} onChange={setNewCatName} onAdd={() => handleAddCategory('material')} list={materialCats} onRefresh={fetchCategories} color="bg-[#7a967a]" />
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2 text-[#c2b280] ml-2"><Tag size={18} /><h2 className="font-bold uppercase tracking-widest text-[10px]">Products</h2></div>
          <CategoryBox value={newCatName} onChange={setNewCatName} onAdd={() => handleAddCategory('product')} list={productCats} onRefresh={fetchCategories} color="bg-[#c2b280]" />
        </section>
      </div>
    </div>
  );
}

function CategoryBox({ value, onChange, onAdd, list, onRefresh, color }: any) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-[2rem] border border-[#f1e6d2] shadow-sm">
      <div className="flex gap-2 mb-6">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Add new..." className="flex-1 p-3 bg-stone-50 rounded-xl border border-stone-100 outline-none text-sm" />
        <button onClick={onAdd} className={`${color} text-white px-4 rounded-xl active:scale-95 transition-transform`}><Plus size={20} /></button>
      </div>
      <div className="space-y-1">
        {list.map((cat: any) => (
          <div key={cat.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl group hover:bg-[#fdfbf7]">
            <span className="font-medium text-stone-600 text-sm">{cat.name}</span>
            <button onClick={async () => { if(confirm("Delete category?")) { await supabase.from('categories').delete().eq('id', cat.id); onRefresh(); } }} className="p-2 text-stone-300 hover:text-rose-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}