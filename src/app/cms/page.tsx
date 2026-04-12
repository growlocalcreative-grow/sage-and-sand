"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BookOpen, Copy, Palette, Trash2, X, Plus, 
  CheckCircle2, Loader2, Edit3, Save 
} from 'lucide-react';

export default function BrandVault() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    type: 'story',
    title: '',
    content: '',
    tags: ''
  });

  useEffect(() => { fetchVault(); }, []);

  async function fetchVault() {
    setLoading(true);
    const { data } = await supabase.from('brand_vault').select('*').order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  // --- SAVE & UPDATE LOGIC ---
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const tagArray = formData.tags.split(',').map(t => t.trim());
    const dbPayload = { ...formData, tags: tagArray, user_id: user.id };

    let result;
    if (editingId) {
      result = await supabase.from('brand_vault').update(dbPayload).eq('id', editingId).select();
    } else {
      result = await supabase.from('brand_vault').insert([dbPayload]).select();
    }

    if (!result.error) {
      fetchVault();
      closeModal();
    }
    setLoading(false);
  }

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setFormData({
      type: item.type,
      title: item.title,
      content: item.content,
      tags: item.tags?.join(', ') || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ type: 'story', title: '', content: '', tags: '' });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen text-stone-800 pb-24">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#637a63]">Brand Vault</h1>
          <p className="text-stone-400 text-xs sm:text-sm italic">Sage & Sand Assets</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-[#f1e6d2] text-[#637a63] px-5 py-3 rounded-xl font-bold flex items-center gap-2 text-sm shadow-sm active:scale-95 transition-all"
        >
          <Plus size={18} /> Add Story
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: BRAND COLORS */}
        <section className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#f1e6d2] shadow-sm h-fit order-2 lg:order-1">
          <h2 className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Palette size={14} /> Color Palette
          </h2>
          <div className="space-y-4">
            <ColorBlock name="Primary Sage" hex="#7a967a" />
            <ColorBlock name="Deep Sage" hex="#637a63" />
            <ColorBlock name="Soft Sand" hex="#f1e6d2" />
            <ColorBlock name="Light Sand" hex="#fdfbf7" />
          </div>
        </section>

        {/* RIGHT: STORY LIBRARY */}
        <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
          <h2 className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-2 flex items-center gap-2">
            <BookOpen size={14} /> Copy Library
          </h2>

          {loading ? (
            <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-stone-300" /></div>
          ) : items.map((item) => (
            <div key={item.id} className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#f1e6d2] hover:border-[#7a967a] group relative transition-all shadow-sm">
              <div className="flex justify-between items-start mb-4 gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-[#637a63] truncate leading-tight">{item.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.tags?.map((tag: string) => (
                      <span key={tag} className="text-[9px] font-bold uppercase tracking-tighter bg-[#fdfbf7] border border-[#f1e6d2] px-2 py-0.5 rounded text-stone-400">{tag}</span>
                    ))}
                  </div>
                </div>
                
                {/* COPY BUTTON - Highly Visible */}
                <button 
                  onClick={() => handleCopy(item.content, item.id)} 
                  className={`p-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 border ${
                    copiedId === item.id 
                    ? 'bg-[#7a967a] border-[#7a967a] text-white shadow-md scale-105' 
                    : 'bg-[#f1e6d2] border-[#f1e6d2] text-[#637a63] active:scale-95'
                  }`}
                >
                  {copiedId === item.id ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  <span className="text-[10px] font-bold">{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap mb-4">{item.content}</p>
              
              {/* EDIT/TRASH - Visible on touch */}
              <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(item)} className="p-2 text-stone-300 hover:text-[#7a967a]"><Edit3 size={18}/></button>
                <button 
                  onClick={async () => { if(confirm("Delete Story?")) { await supabase.from('brand_vault').delete().eq('id', item.id); fetchVault(); } }} 
                  className="p-2 text-stone-300 hover:text-rose-400"
                >
                  <Trash2 size={18}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: ADD/EDIT STORY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#637a63]">{editingId ? 'Edit Story' : 'New Story'}</h3>
              <button type="button" onClick={closeModal} className="text-stone-300 hover:text-stone-500"><X /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-[10px] font-black text-stone-400 uppercase ml-1">Title</label><input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl border outline-none text-sm focus:ring-2 focus:ring-[#7a967a]" /></div>
              <div><label className="text-[10px] font-black text-stone-400 uppercase ml-1">Content</label><textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl border h-40 text-sm outline-none focus:ring-2 focus:ring-[#7a967a]" /></div>
              <div><label className="text-[10px] font-black text-stone-400 uppercase ml-1">Tags (Comma separated)</label><input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl border outline-none text-sm" placeholder="e.g. Care, Socials" /></div>
            </div>
            <button type="submit" className="w-full bg-[#7a967a] text-[#fdfbf7] py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all">
              {editingId ? 'Update Vault' : 'Save Story'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function ColorBlock({ name, hex }: any) {
  const [copied, setCopied] = useState(false);
  return (
    <div 
      onClick={() => { navigator.clipboard.writeText(hex); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
      className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-stone-50 transition-all border border-transparent hover:border-[#f1e6d2]"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl shadow-inner border border-stone-100 shrink-0" style={{ backgroundColor: hex }} />
        <div className="min-w-0"><p className="text-xs font-bold text-stone-700 truncate">{name}</p><p className="text-[9px] text-stone-400 font-mono uppercase tracking-wider">{hex}</p></div>
      </div>
      <div className={`text-[#7a967a] transition-all ${copied ? 'opacity-100 scale-100' : 'opacity-0 scale-50 group-hover:opacity-40'}`}>
        <CheckCircle2 size={16}/>
      </div>
    </div>
  );
}