"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BookOpen, Copy, Palette, Trash2, X, Plus, CheckCircle2, Loader2 } from 'lucide-react';

export default function BrandVault() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ type: 'story', title: '', content: '', tags: '' });

  useEffect(() => { fetchVault(); }, []);

  async function fetchVault() {
    setLoading(true);
    const { data } = await supabase.from('brand_vault').select('*').order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const tagArray = formData.tags.split(',').map(t => t.trim());
    const { data } = await supabase.from('brand_vault').insert([{ ...formData, tags: tagArray, user_id: user?.id }]).select();
    if (data) { setItems([data[0], ...items]); setIsModalOpen(false); setFormData({ type: 'story', title: '', content: '', tags: '' }); }
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen text-stone-800 pb-20">
      <header className="flex justify-between items-center mb-10">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-[#637a63]">Brand Vault</h1><p className="text-stone-400 text-xs sm:text-sm italic">Sage & Sand Assets</p></div>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#f1e6d2] text-[#637a63] px-5 py-3 rounded-xl font-bold flex items-center gap-2 text-sm shadow-sm active:scale-95"><Plus size={18} /> Add Story</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#f1e6d2] shadow-sm h-fit">
          <h2 className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-6 flex items-center gap-2"><Palette size={14} /> Brand Colors</h2>
          <div className="space-y-4">
            <ColorBlock name="Primary Sage" hex="#7a967a" />
            <ColorBlock name="Deep Sage" hex="#637a63" />
            <ColorBlock name="Soft Sand" hex="#f1e6d2" />
            <ColorBlock name="Light Sand" hex="#fdfbf7" />
          </div>
        </section>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-2 flex items-center gap-2"><BookOpen size={14} /> Copy Library</h2>
          {loading ? <div className="text-center py-10 animate-pulse text-stone-300">Syncing...</div> : items.map((item) => (
            <div key={item.id} className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#f1e6d2] hover:border-[#7a967a] group relative transition-all">
              <div className="flex justify-between items-start mb-4 gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-[#637a63] truncate">{item.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.tags?.map((tag: string) => (
                      <span key={tag} className="text-[9px] font-bold uppercase tracking-tighter bg-[#fdfbf7] border border-[#f1e6d2] px-2 py-0.5 rounded text-stone-400">{tag}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(item.content); setCopiedId(item.id); setTimeout(() => setCopiedId(null), 2000); }} className={`p-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${copiedId === item.id ? 'bg-[#7a967a] text-white shadow-md scale-105' : 'bg-[#f1e6d2] text-[#637a63] shadow-sm'}`}>
                  {copiedId === item.id ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  <span className="text-[10px] font-bold">{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap mb-4">{item.content}</p>
              <button onClick={async () => { if(confirm("Delete?")) { await supabase.from('brand_vault').delete().eq('id', item.id); fetchVault(); } }} className="absolute bottom-4 right-6 p-2 text-stone-300 hover:text-rose-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center"><h3 className="text-xl font-bold text-[#637a63]">New Story</h3><button type="button" onClick={() => setIsModalOpen(false)}><X className="text-stone-300" /></button></div>
            <div className="space-y-4">
              <div><label className="text-[10px] font-black text-stone-400 uppercase ml-1">Title</label><input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl border outline-none text-sm focus:ring-2 focus:ring-[#7a967a]" /></div>
              <div><label className="text-[10px] font-black text-stone-400 uppercase ml-1">Content</label><textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl border h-32 text-sm outline-none focus:ring-2 focus:ring-[#7a967a]" /></div>
              <div><label className="text-[10px] font-black text-stone-400 uppercase ml-1">Tags (Comma separated)</label><input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl border outline-none text-sm" placeholder="e.g. Socials, Care" /></div>
            </div>
            <button type="submit" className="w-full bg-[#7a967a] text-[#fdfbf7] py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs active:scale-95 shadow-lg">Save Story</button>
          </form>
        </div>
      )}
    </div>
  );
}

function ColorBlock({ name, hex }: any) {
  const [copied, setCopied] = useState(false);
  return (
    <div onClick={() => { navigator.clipboard.writeText(hex); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-stone-50 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl shadow-inner border border-stone-100 shrink-0" style={{ backgroundColor: hex }} />
        <div className="min-w-0"><p className="text-xs font-bold text-stone-700 truncate">{name}</p><p className="text-[9px] text-stone-400 font-mono uppercase">{hex}</p></div>
      </div>
      <div className={`text-[#7a967a] transition-all ${copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}><CheckCircle2 size={14}/></div>
    </div>
  );
}