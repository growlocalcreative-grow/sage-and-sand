"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BookOpen, Sparkles, Copy, Palette, 
  Trash2, Edit3, X, Plus, CheckCircle2, Loader2 
} from 'lucide-react';

export default function BrandVault() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    type: 'story',
    title: '',
    content: '',
    tags: ''
  });

  useEffect(() => {
    fetchVault();
  }, []);

  async function fetchVault() {
    setLoading(true);
    const { data, error } = await supabase
      .from('brand_vault')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setItems(data || []);
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Clean up tags into an array
    const tagArray = formData.tags.split(',').map(t => t.trim());

    const { data, error } = await supabase
      .from('brand_vault')
      .insert([{ ...formData, tags: tagArray, user_id: user?.id }])
      .select();

    if (!error && data) {
      setItems([data[0], ...items]);
      setIsModalOpen(false);
      setFormData({ type: 'story', title: '', content: '', tags: '' });
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000); // Tooltip disappears after 2s
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen text-stone-800 pb-20">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#637a63]">Brand Vault</h1>
          <p className="text-stone-400 text-sm italic">Shared brand assets for Sage & Sand</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#f1e6d2] text-[#637a63] px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#e7d9c1] transition-all"
        >
          <Plus size={20} /> Add Story
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT COLUMN: FIXED ASSETS */}
        <div className="space-y-8">
           {/* Color Palette (UI Only for now) */}
           <section className="bg-white p-8 rounded-[2.5rem] border border-[#f1e6d2] shadow-sm">
              <h2 className="text-xs font-black text-stone-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Palette size={16} /> Brand Colors
              </h2>
              <div className="space-y-4">
                 <ColorBlock name="Primary Sage" hex="#7a967a" />
                 <ColorBlock name="Deep Sage" hex="#637a63" />
                 <ColorBlock name="Soft Sand" hex="#f1e6d2" />
                 <ColorBlock name="Light Sand" hex="#fdfbf7" />
              </div>
           </section>
        </div>

        {/* RIGHT COLUMN: DYNAMIC STORIES */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xs font-black text-stone-300 uppercase tracking-widest mb-2 flex items-center gap-2">
            <BookOpen size={16} /> Copy Library
          </h2>

          {loading ? (
            <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-[#7a967a]" /></div>
          ) : items.filter(i => i.type === 'story' || i.type === 'voice').map((item) => (
            <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-[#f1e6d2] group hover:border-[#7a967a] transition-all relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#637a63]">{item.title}</h3>
                  <div className="flex gap-2 mt-2">
                    {item.tags?.map((tag: string) => (
                      <span key={tag} className="text-[9px] font-bold uppercase tracking-tighter bg-[#fdfbf7] border border-[#f1e6d2] px-2 py-0.5 rounded text-stone-400">{tag}</span>
                    ))}
                  </div>
                </div>
                
                {/* COPY BUTTON */}
                <button 
                  onClick={() => handleCopy(item.content, item.id)}
                  className={`p-3 rounded-xl transition-all flex items-center gap-2 ${copiedId === item.id ? 'bg-[#7a967a] text-white' : 'bg-[#f1e6d2] text-[#637a63] hover:scale-105'}`}
                >
                  {copiedId === item.id ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  <span className="text-xs font-bold">{copiedId === item.id ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">{item.content}</p>
              
              <button 
                onClick={async () => {
                  if(confirm("Delete this story?")) {
                    await supabase.from('brand_vault').delete().eq('id', item.id);
                    setItems(items.filter(i => i.id !== item.id));
                  }
                }}
                className="absolute bottom-4 right-8 opacity-0 group-hover:opacity-100 text-stone-300 hover:text-rose-400 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: ADD NEW STORY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-[#637a63]">New Story</h3>
              <button type="button" onClick={() => setIsModalOpen(false)}><X className="text-stone-300" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl border border-stone-100 outline-none focus:ring-2 focus:ring-[#7a967a]" placeholder="e.g. Sage Stuffy Care" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Content / Story</label>
                <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl border border-stone-100 h-32 outline-none focus:ring-2 focus:ring-[#7a967a]" placeholder="Paste your social media caption or story here..." />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Tags (Comma separated)</label>
                <input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl border border-stone-100 outline-none" placeholder="Crochet, Care, Socials" />
              </div>
            </div>

            <button type="submit" className="w-full bg-[#7a967a] text-[#fdfbf7] py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-lg hover:bg-[#637a63] transition-all">
              Save to Vault
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function ColorBlock({ name, hex }: any) {
  const [copied, setCopied] = useState(false);
  
  const copyHex = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div onClick={copyHex} className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-stone-50 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl shadow-inner border border-stone-100" style={{ backgroundColor: hex }} />
        <div>
          <p className="text-sm font-bold text-stone-700">{name}</p>
          <p className="text-[10px] text-stone-400 uppercase font-mono">{hex}</p>
        </div>
      </div>
      <div className={`text-[#7a967a] transition-all ${copied ? 'opacity-100 scale-100' : 'opacity-0 scale-50 group-hover:opacity-30'}`}>
        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
      </div>
    </div>
  );
}