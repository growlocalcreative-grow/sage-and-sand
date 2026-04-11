"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Settings, Plus, Trash2, Layers, Tag, Loader2, X 
} from 'lucide-react';

export default function SettingsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (!error) setCategories(data || []);
    setLoading(false);
  }

  async function handleAddCategory(type: 'material' | 'product') {
    if (!newCatName.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: newCatName, type: type, user_id: user?.id }])
      .select();

    if (!error && data) {
      setCategories([...categories, data[0]]);
      setNewCatName("");
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category? This won't delete items already using it, but it will remove it from the dropdown options.")) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) setCategories(categories.filter(c => c.id !== id));
  }

  // Split categories for the UI
  const materialCats = categories.filter(c => c.type === 'material');
  const productCats = categories.filter(c => c.type === 'product');

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen text-stone-800 pb-20">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-[#637a63] flex items-center gap-3">
          <Settings className="text-[#7a967a]" /> Hub Settings
        </h1>
        <p className="text-stone-400 text-sm italic mt-1">Manage your Sage & Sand organization rules</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* MATERIAL CATEGORIES */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-[#7a967a]">
            <Layers size={20} />
            <h2 className="font-bold uppercase tracking-widest text-sm">Material Categories</h2>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-[#f1e6d2] shadow-sm">
            <div className="flex gap-2 mb-6">
              <input 
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Fabric" 
                className="flex-1 p-3 bg-stone-50 rounded-xl border border-stone-100 outline-none focus:ring-2 focus:ring-[#7a967a] text-sm"
              />
              <button 
                onClick={() => handleAddCategory('material')}
                className="bg-[#7a967a] text-[#fdfbf7] px-4 rounded-xl font-bold hover:bg-[#637a63] transition-all"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {materialCats.map(cat => (
                <CategoryRow key={cat.id} name={cat.name} onDelete={() => deleteCategory(cat.id)} />
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCT CATEGORIES */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-[#c2b280]">
            <Tag size={20} />
            <h2 className="font-bold uppercase tracking-widest text-sm">Product Categories</h2>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-[#f1e6d2] shadow-sm">
             <div className="flex gap-2 mb-6">
              <input 
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Home Decor" 
                className="flex-1 p-3 bg-stone-50 rounded-xl border border-stone-100 outline-none focus:ring-2 focus:ring-[#c2b280] text-sm"
              />
              <button 
                onClick={() => handleAddCategory('product')}
                className="bg-[#c2b280] text-[#fdfbf7] px-4 rounded-xl font-bold hover:bg-[#b0a060] transition-all"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {productCats.map(cat => (
                <CategoryRow key={cat.id} name={cat.name} onDelete={() => deleteCategory(cat.id)} />
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// Small helper component for the list rows
function CategoryRow({ name, onDelete }: { name: string, onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl group hover:bg-[#fdfbf7] transition-all">
      <span className="font-medium text-[#637a63]">{name}</span>
      <button 
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-rose-400 transition-all"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}