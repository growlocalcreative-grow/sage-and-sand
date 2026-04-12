"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Calendar as CalendarIcon, MapPin, Search, Plus, Users, 
  ExternalLink, CheckCircle2, Truck, Trash2, Edit2, 
  Save, X, Phone, Mail, PlusCircle, Loader2 
} from 'lucide-react';

export default function MarketCalendar() {
  const [view, setView] = useState<'schedule' | 'checklist'>('schedule');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [markets, setMarkets] = useState<any[]>([]);
  const [checkItems, setCheckItems] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMarket, setNewMarket] = useState({ name: '', date: '', location: '', host_name: '', host_email: '', host_phone: '' });
  const [newItemText, setNewItemText] = useState("");

  useEffect(() => { fetchAllData(); }, [view]);

  async function fetchAllData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (view === 'schedule') {
      const { data } = await supabase.from('markets').select('*').order('date', { ascending: true });
      setMarkets(data || []);
    } else {
      const { data } = await supabase.from('packing_list').select('*').order('created_at', { ascending: true });
      setCheckItems(data || []);
    }
    setLoading(false);
  }

  async function handleAddMarket(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: marketData } = await supabase.from('markets').insert([{ ...newMarket, user_id: user.id }]).select();

    if (marketData) {
      const newMarketId = marketData[0].id;
      const templateTasks = [
        { title: `Pack displays for ${newMarket.name}`, owner: 'me', market_id: newMarketId, user_id: user.id },
        { title: `Charge Tablet`, owner: 'all', market_id: newMarketId, user_id: user.id },
        { title: `Post socials for ${newMarket.name}`, owner: 'daughter', market_id: newMarketId, user_id: user.id },
	      { title: `Inventory Planning & Audit ${newMarket.name}`, owner: 'me', market_id: newMarketId, user_id: user.id },
        { title: `Price Every Single Item`, owner: 'all', market_id: newMarketId, user_id: user.id },
        { title: `Conduct a "Dry Run" Booth Setup ${newMarket.name}`, owner: 'daughter', market_id: newMarketId, user_id: user.id },
	      { title: `Optimize Payment Systems ${newMarket.name}`, owner: 'daughter', market_id: newMarketId, user_id: user.id },
	      { title: `Pack a "Booth Survival Kit" ${newMarket.name}`, owner: 'daughter', market_id: newMarketId, user_id: user.id },
	      { title: `Design/Update Branding & Signage ${newMarket.name}`, owner: 'daughter', market_id: newMarketId, user_id: user.id },
	      { title: `Prepare Your Packaging Experience ${newMarket.name}`, owner: 'daughter', market_id: newMarketId, user_id: user.id },
	      { title: `Market Our Attendance ${newMarket.name}`, owner: 'daughter', market_id: newMarketId, user_id: user.id },
	      { title: `Map Out the Logistics ${newMarket.name}`, owner: 'daughter', market_id: newMarketId, user_id: user.id },
	      { title: `Plan Snacks and Drinks ${newMarket.name}`, owner: 'daughter', market_id: newMarketId, user_id: user.id }
      ];
      await supabase.from('tasks').insert(templateTasks);
      setMarkets([...markets, marketData[0]]);
      setIsAddModalOpen(false);
      setNewMarket({ name: '', date: '', location: '', host_name: '', host_email: '', host_phone: '' });
    }
    setLoading(false);
  }

  async function addCheckItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('packing_list').insert([{ label: newItemText, user_id: user?.id }]).select();
    if (data) { setCheckItems([...checkItems, data[0]]); setNewItemText(""); }
  }

  async function toggleCheck(item: any) {
    const { error } = await supabase.from('packing_list').update({ is_checked: !item.is_checked }).eq('id', item.id);
    if (!error) setCheckItems(checkItems.map(i => i.id === item.id ? {...i, is_checked: !item.is_checked} : i));
  }

  const progressPercent = checkItems.length > 0 ? Math.round((checkItems.filter(i => i.is_checked).length / checkItems.length) * 100) : 0;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen text-stone-800 pb-24">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#637a63]">Market Hub</h1>
          <div className="flex bg-[#f1e6d2]/30 p-1 rounded-xl mt-4 w-fit border border-[#f1e6d2]">
            <button onClick={() => setView('schedule')} className={`px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${view === 'schedule' ? 'bg-white text-[#637a63] shadow-sm' : 'text-stone-400'}`}>Schedule</button>
            <button onClick={() => setView('checklist')} className={`px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${view === 'checklist' ? 'bg-white text-[#637a63] shadow-sm' : 'text-stone-400'}`}>Pack List</button>
          </div>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-[#7a967a] text-[#fdfbf7] px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-[#637a63] flex items-center gap-2 active:scale-95 transition-all text-sm">
          <Plus size={18} /> Book Market
        </button>
      </header>

      {view === 'schedule' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {loading ? <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-stone-300" /></div> : markets.map(market => (
            <MarketCard key={market.id} market={market} onContactClick={() => setSelectedContact(market)} onRefresh={fetchAllData} />
          ))}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#f1e6d2] shadow-sm">
            <div className="flex justify-between items-end mb-4"><h3 className="text-xl font-bold text-[#637a63] flex items-center gap-3"><Truck size={24}/> Load-In Status</h3><span className="text-2xl font-black text-[#7a967a]">{progressPercent}%</span></div>
            <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-[#7a967a] transition-all duration-700" style={{ width: `${progressPercent}%` }} /></div>
          </div>
          <form onSubmit={addCheckItem} className="flex gap-2">
            <input value={newItemText} onChange={(e) => setNewItemText(e.target.value)} placeholder="Add to cloud list..." className="flex-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#f1e6d2] outline-none bg-white text-sm" />
            <button type="submit" className="bg-[#7a967a] text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl active:scale-95"><PlusCircle size={24} /></button>
          </form>
          <div className="bg-white rounded-[2rem] border border-[#f1e6d2] shadow-sm divide-y divide-stone-50 overflow-hidden">
            {checkItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-5 hover:bg-[#fdfbf7] group">
                <button onClick={() => toggleCheck(item)} className="flex items-center gap-4 flex-1 text-left"><div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${item.is_checked ? 'bg-[#7a967a] border-[#7a967a]' : 'border-stone-200'}`}>{item.is_checked && <CheckCircle2 size={16} className="text-white" />}</div><span className={`font-medium ${item.is_checked ? 'text-stone-300 line-through' : 'text-stone-600'}`}>{item.label}</span></button>
                <button onClick={async () => { await supabase.from('packing_list').delete().eq('id', item.id); fetchAllData(); }} className="p-2 text-stone-300 hover:text-rose-400 opacity-100"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD MARKET MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <form onSubmit={handleAddMarket} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-6 sm:p-10 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center"><h3 className="text-xl font-bold text-[#637a63]">Book New Market</h3><button type="button" onClick={() => setIsAddModalOpen(false)}><X className="text-stone-300"/></button></div>
            <div className="space-y-4">
              <input required className="w-full p-3 bg-stone-50 rounded-xl border outline-none text-sm" value={newMarket.name} onChange={e => setNewMarket({...newMarket, name: e.target.value})} placeholder="Market Name" />
              <div className="grid grid-cols-2 gap-4"><input required className="w-full p-3 bg-stone-50 rounded-xl border text-sm" value={newMarket.date} onChange={e => setNewMarket({...newMarket, date: e.target.value})} placeholder="Date" /><input className="w-full p-3 bg-stone-50 rounded-xl border text-sm" value={newMarket.location} onChange={e => setNewMarket({...newMarket, location: e.target.value})} placeholder="Location" /></div>
              <div className="border-t pt-4"><p className="text-[10px] font-bold text-[#c2b280] uppercase mb-2">Organizer Contact</p><input className="w-full p-3 bg-stone-50 rounded-xl border text-sm mb-2" value={newMarket.host_name} onChange={e => setNewMarket({...newMarket, host_name: e.target.value})} placeholder="Name" /><div className="grid grid-cols-2 gap-4"><input type="email" className="w-full p-3 bg-stone-50 rounded-xl border text-sm" value={newMarket.host_email} onChange={e => setNewMarket({...newMarket, host_email: e.target.value})} placeholder="Email" /><input type="tel" className="w-full p-3 bg-stone-50 rounded-xl border text-sm" value={newMarket.host_phone} onChange={e => setNewMarket({...newMarket, host_phone: e.target.value})} placeholder="Phone" /></div></div>
            </div>
            <button type="submit" className="w-full bg-[#7a967a] text-[#fdfbf7] py-4 rounded-2xl font-bold uppercase tracking-widest text-xs">Confirm Booking</button>
          </form>
        </div>
      )}

      {/* CONTACT POPOUT */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[160] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-[#7a967a] rounded-full flex items-center justify-center mx-auto mb-4 text-white"><Users size={32}/></div>
            <h3 className="text-xl font-bold mb-6">{selectedContact.host_name || "Organizer"}</h3>
            <div className="space-y-3">
              <a href={`tel:${selectedContact.host_phone}`} className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl"><Phone size={18} className="text-[#7a967a]"/><div className="text-left"><p className="text-[10px] font-bold text-stone-400 uppercase">Call</p><p className="font-bold text-sm">{selectedContact.host_phone || 'None'}</p></div></a>
              <a href={`mailto:${selectedContact.host_email}`} className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl"><Mail size={18} className="text-[#c2b280]"/><div className="text-left"><p className="text-[10px] font-bold text-stone-400 uppercase">Email</p><p className="font-bold text-sm truncate max-w-[150px]">{selectedContact.host_email || 'None'}</p></div></a>
            </div>
            <button onClick={() => setSelectedContact(null)} className="w-full mt-6 text-stone-400 font-bold text-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MarketCard({ market, onContactClick, onRefresh }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(market);

  // --- UPDATED: SENDS ALL HOST DATA TO SUPABASE ---
  async function handleUpdate() {
    const { error } = await supabase.from('markets').update({ 
      name: editData.name, 
      date: editData.date,
      location: editData.location,
      host_name: editData.host_name,
      host_email: editData.host_email,
      host_phone: editData.host_phone
    }).eq('id', market.id);
    
    if (!error) { 
      setIsEditing(false); 
      onRefresh(); 
    } else {
      alert("Error updating: " + error.message);
    }
  }

  if (isEditing) {
    return (
      <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] border-2 border-[#7a967a] shadow-xl space-y-3 animate-in fade-in zoom-in duration-200">
        <div>
          <label className="text-[9px] font-bold text-stone-400 uppercase ml-1">Market Details</label>
          <input className="w-full p-2 border rounded-lg text-sm mb-2" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="Name" />
          <div className="grid grid-cols-2 gap-2">
            <input className="w-full p-2 border rounded-lg text-sm" value={editData.date} onChange={e => setEditData({...editData, date: e.target.value})} placeholder="Date" />
            <input className="w-full p-2 border rounded-lg text-sm" value={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} placeholder="Location" />
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <label className="text-[9px] font-bold text-[#c2b280] uppercase ml-1">Host Details</label>
          <input className="w-full p-2 border rounded-lg text-sm mb-2" value={editData.host_name} onChange={e => setEditData({...editData, host_name: e.target.value})} placeholder="Host Name" />
          <div className="grid grid-cols-2 gap-2">
            <input className="w-full p-2 border rounded-lg text-sm" value={editData.host_email} onChange={e => setEditData({...editData, host_email: e.target.value})} placeholder="Host Email" />
            <input className="w-full p-2 border rounded-lg text-sm" value={editData.host_phone} onChange={e => setEditData({...editData, host_phone: e.target.value})} placeholder="Host Phone" />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={handleUpdate} className="flex-1 bg-[#7a967a] text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"><Save size={14}/> Save</button>
          <button onClick={() => setIsEditing(false)} className="flex-1 bg-stone-100 text-stone-400 py-2 rounded-xl text-xs font-bold">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border border-[#f1e6d2] shadow-sm hover:border-[#7a967a] transition-all group relative">
      <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100">
        <button onClick={() => setIsEditing(true)} className="p-2 text-[#c2b280] bg-stone-50 rounded-lg"><Edit2 size={16} /></button>
        <button onClick={async () => { if(confirm("Delete Market?")) { await supabase.from('markets').delete().eq('id', market.id); onRefresh(); } }} className="p-2 text-stone-300 bg-stone-50 rounded-lg hover:text-rose-500"><Trash2 size={16} /></button>
      </div>
      <span className="text-[10px] font-bold text-stone-300 uppercase block mb-1">{market.date}</span>
      <h3 className="text-lg sm:text-xl font-bold text-[#637a63] mb-4 pr-16 leading-tight">{market.name}</h3>
      <div className="space-y-2 mb-6 text-xs text-stone-500">
        <p className="flex items-center gap-2"><MapPin size={14} className="text-[#c2b280]"/> {market.location || 'Location TBD'}</p>
        <p className="flex items-center gap-2"><Users size={14} className="text-[#c2b280]"/> {market.host_name || "Organizer"}</p>
      </div>
      <button onClick={onContactClick} className="flex items-center gap-2 text-[10px] font-black text-[#c2b280] hover:text-[#7a967a] uppercase tracking-widest"><ExternalLink size={14}/> Contact Host</button>
    </div>
  );
}