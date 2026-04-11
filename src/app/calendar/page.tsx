"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Calendar as CalendarIcon, MapPin, Search, Plus, Users, 
  ExternalLink, CheckCircle2, Truck, Trash2, Edit2, 
  Save, X, Phone, Mail, PlusCircle 
} from 'lucide-react';

export default function MarketCalendar() {
  const [view, setView] = useState<'schedule' | 'checklist'>('schedule');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [markets, setMarkets] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMarket, setNewMarket] = useState({ name: '', date: '', location: '', host_name: '', host_email: '', host_phone: '' });
  const [newItemText, setNewItemText] = useState("");
  const [checkItems, setCheckItems] = useState([
    { id: 1, label: "Square Reader (Charged!)", checked: true },
    { id: 2, label: "Tablecloths & Displays", checked: false },
    { id: 3, label: "Sage & Sand Business Cards", checked: false }
  ]);

  useEffect(() => { fetchMarkets(); }, []);

  async function fetchMarkets() {
    setLoading(true);
    const { data, error } = await supabase.from('markets').select('*').order('date', { ascending: true });
    if (!error) setMarkets(data || []);
    setLoading(false);
  }

  async function handleAddMarket(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: marketData, error: marketError } = await supabase.from('markets').insert([{ ...newMarket, user_id: user.id }]).select();

    if (marketData) {
      const newMarketId = marketData[0].id;
      const templateTasks = [
        { title: `Pack displays for ${newMarket.name}`, owner: 'me', market_id: newMarketId, user_id: user.id },
        { title: `Charge Square reader`, owner: 'all', market_id: newMarketId, user_id: user.id },
        { title: `Post socials for ${newMarket.name}`, owner: 'daughter', market_id: newMarketId, user_id: user.id }
      ];
      await supabase.from('tasks').insert(templateTasks);
      setMarkets([...markets, marketData[0]]);
      setIsAddModalOpen(false);
      setNewMarket({ name: '', date: '', location: '', host_name: '', host_email: '', host_phone: '' });
    }
    setLoading(false);
  }

  const progressPercent = Math.round((checkItems.filter(i => i.checked).length / checkItems.length) * 100);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen text-stone-800 pb-20">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#637a63]">Market Hub</h1>
          <div className="flex bg-[#f1e6d2]/30 p-1 rounded-xl mt-4 w-fit border border-[#f1e6d2]">
            <button onClick={() => setView('schedule')} className={`px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${view === 'schedule' ? 'bg-white text-[#637a63] shadow-sm' : 'text-stone-400'}`}>12-Month Schedule</button>
            <button onClick={() => setView('checklist')} className={`px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${view === 'checklist' ? 'bg-white text-[#637a63] shadow-sm' : 'text-stone-400'}`}>Market Day Checklist</button>
          </div>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-[#7a967a] text-[#fdfbf7] px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-[#637a63] flex items-center gap-2 active:scale-95 transition-all">
          <Plus size={20} /> Book Market
        </button>
      </header>

      {view === 'schedule' ? (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input type="text" placeholder="Search markets..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#f1e6d2] outline-none bg-white text-sm" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {loading ? <div className="col-span-full py-20 text-center animate-pulse text-stone-400">Syncing calendar...</div> : markets.map(market => (
              <MarketCard key={market.id} market={market} onContactClick={() => setSelectedContact(market)} onRefresh={fetchMarkets} />
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#f1e6d2] shadow-sm">
            <div className="flex justify-between items-end mb-4">
              <div><h3 className="text-xl sm:text-2xl font-bold text-[#637a63] flex items-center gap-3"><Truck size={24}/> Load-In Status</h3></div>
              <span className="text-2xl font-black text-[#7a967a]">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#7a967a] transition-all duration-700" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); setCheckItems([...checkItems, { id: Date.now(), label: newItemText, checked: false }]); setNewItemText(""); }} className="flex gap-2">
            <input value={newItemText} onChange={(e) => setNewItemText(e.target.value)} placeholder="Add to list..." className="flex-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#f1e6d2] outline-none bg-white text-sm" />
            <button type="submit" className="bg-[#7a967a] text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl"><PlusCircle size={24} /></button>
          </form>
          <div className="bg-white rounded-[2rem] border border-[#f1e6d2] shadow-sm divide-y divide-stone-50 overflow-hidden">
            {checkItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 sm:p-5 hover:bg-[#fdfbf7] group transition-colors">
                <button onClick={() => setCheckItems(checkItems.map(i => i.id === item.id ? {...i, checked: !i.checked} : i))} className="flex items-center gap-4 flex-1 text-left">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${item.checked ? 'bg-[#7a967a] border-[#7a967a]' : 'border-stone-200'}`}>{item.checked && <CheckCircle2 size={16} className="text-white" />}</div>
                  <span className={`text-sm sm:text-base font-medium ${item.checked ? 'text-stone-300 line-through' : 'text-stone-600'}`}>{item.label}</span>
                </button>
                <button onClick={() => setCheckItems(checkItems.filter(i => i.id !== item.id))} className="p-2 text-stone-300 hover:text-rose-400 opacity-100 md:opacity-0 md:group-hover:opacity-100"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <form onSubmit={handleAddMarket} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-6 sm:p-10 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center"><h3 className="text-xl font-bold text-[#637a63]">New Market</h3><button type="button" onClick={() => setIsAddModalOpen(false)}><X className="text-stone-300"/></button></div>
            <div className="space-y-4"><input required className="w-full p-3 bg-stone-50 rounded-xl border outline-none text-sm" value={newMarket.name} onChange={e => setNewMarket({...newMarket, name: e.target.value})} placeholder="Market Name" /><div className="grid grid-cols-2 gap-4"><input required className="w-full p-3 bg-stone-50 rounded-xl border text-sm" value={newMarket.date} onChange={e => setNewMarket({...newMarket, date: e.target.value})} placeholder="Date" /><input className="w-full p-3 bg-stone-50 rounded-xl border text-sm" value={newMarket.location} onChange={e => setNewMarket({...newMarket, location: e.target.value})} placeholder="Location" /></div></div>
            <button type="submit" className="w-full bg-[#7a967a] text-[#fdfbf7] py-4 rounded-2xl font-bold uppercase tracking-widest text-xs">Save Market</button>
          </form>
        </div>
      )}

      {selectedContact && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[160] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center"><div className="w-16 h-16 bg-[#7a967a] rounded-full flex items-center justify-center mx-auto mb-4 text-white"><Users size={32}/></div><h3 className="text-xl font-bold">{selectedContact.host_name || "Organizer"}</h3></div>
            <div className="space-y-3"><a href={`tel:${selectedContact.host_phone}`} className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl"><Phone size={18} className="text-[#7a967a]"/><div><p className="text-[10px] font-bold text-stone-400 uppercase">Call</p><p className="font-bold text-sm">{selectedContact.host_phone || 'None'}</p></div></a><a href={`mailto:${selectedContact.host_email}`} className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl"><Mail size={18} className="text-[#c2b280]"/><div><p className="text-[10px] font-bold text-stone-400 uppercase">Email</p><p className="font-bold text-sm truncate max-w-[150px]">{selectedContact.host_email || 'None'}</p></div></a></div>
            <button onClick={() => setSelectedContact(null)} className="w-full text-stone-400 font-bold text-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MarketCard({ market, onDelete, onUpdate, onContactClick, onRefresh }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(market);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border border-[#f1e6d2] shadow-sm hover:border-[#7a967a] transition-all group relative">
      <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button onClick={() => setIsEditing(!isEditing)} className="p-2 text-[#c2b280] bg-stone-50 rounded-lg"><Edit2 size={16} /></button>
        <button onClick={async () => { if(confirm("Delete?")) { await supabase.from('markets').delete().eq('id', market.id); onRefresh(); } }} className="p-2 text-stone-300 bg-stone-50 rounded-lg hover:text-rose-500"><Trash2 size={16} /></button>
      </div>
      <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest block mb-1">{market.date}</span>
      <h3 className="text-lg sm:text-xl font-bold text-[#637a63] mb-4 pr-12">{market.name}</h3>
      <div className="space-y-2 mb-6 text-xs text-stone-500"><p className="flex items-center gap-2"><MapPin size={14} className="text-[#c2b280]"/> {market.location}</p><p className="flex items-center gap-2"><Users size={14} className="text-[#c2b280]"/> {market.host_name || "Organizer"}</p></div>
      <button onClick={onContactClick} className="flex items-center gap-2 text-[10px] font-black text-[#c2b280] hover:text-[#7a967a] uppercase tracking-widest"><ExternalLink size={14}/> Contact Host</button>
    </div>
  );
}