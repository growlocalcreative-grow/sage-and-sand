"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Calendar as CalendarIcon, MapPin, Search, Plus, Users, 
  ExternalLink, CheckCircle2, Truck, Trash2, Edit2, 
  Save, X, Phone, Mail, PlusCircle 
} from 'lucide-react';

export default function MarketCalendar() {
  // 1. STATE MANAGEMENT
  const [view, setView] = useState<'schedule' | 'checklist'>('schedule');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [markets, setMarkets] = useState<any[]>([]);

  // STATE FOR THE ADD MARKET FORM
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMarket, setNewMarket] = useState({
    name: '',
    date: '',
    location: '',
    host_name: '',
    host_email: '',
    host_phone: ''
  });

  // Checklist State (Packing List)
  const [newItemText, setNewItemText] = useState("");
  const [checkItems, setCheckItems] = useState([
    { id: 1, label: "Square Reader (Charged!)", checked: true },
    { id: 2, label: "Tablecloths & Displays", checked: false },
    { id: 3, label: "Sage & Sand Business Cards", checked: false },
  ]);

  // 2. FETCH DATA ON LOAD
  useEffect(() => {
    fetchMarkets();
  }, []);

  async function fetchMarkets() {
    setLoading(true);
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .order('date', { ascending: true });

    if (error) console.error('Error fetching markets:', error.message);
    else setMarkets(data || []);
    setLoading(false);
  }

  // --- THE UPDATED AUTOMATION FUNCTION ---
  async function handleAddMarket(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // A. Get current user for security
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please log in first!");
      setLoading(false);
      return;
    }

    // B. Step 1: Save the Market
    const { data: marketData, error: marketError } = await supabase
      .from('markets')
      .insert([{ ...newMarket, user_id: user.id }])
      .select();

    if (marketError) {
      alert("Error saving market: " + marketError.message);
    } else if (marketData) {
      const newMarketId = marketData[0].id;

      // C. Step 2: Create Automatic Tasks for this market
      const templateTasks = [
        { 
          title: `Pack displays for ${newMarket.name}`, 
          owner: 'me', 
          market_id: newMarketId, 
          user_id: user.id 
        },
        { 
          title: `Charge Square reader`, 
          owner: 'all', 
          market_id: newMarketId, 
          user_id: user.id 
        },
        { 
          title: `Post 'See you there!' to socials`, 
          owner: 'daughter', 
          market_id: newMarketId, 
          user_id: user.id 
        }
      ];

      const { error: taskError } = await supabase
        .from('tasks')
        .insert(templateTasks);

      if (taskError) console.error("Auto-task error:", taskError);

      // D. Step 3: Update local screen and reset form
      setMarkets([...markets, marketData[0]]);
      setIsAddModalOpen(false);
      setNewMarket({ name: '', date: '', location: '', host_name: '', host_email: '', host_phone: '' });
    }
    setLoading(false);
  }

  // CLOUD FUNCTIONS (Delete & Update)
  async function deleteMarket(id: string) {
    if (!confirm("Are you sure? This will also remove all linked tasks.")) return;
    const { error } = await supabase.from('markets').delete().eq('id', id);
    if (!error) setMarkets(markets.filter(m => m.id !== id));
  }

  async function updateMarket(id: string, updatedData: any) {
    const { error } = await supabase.from('markets').update(updatedData).eq('id', id);
    if (!error) setMarkets(markets.map(m => m.id === id ? { ...m, ...updatedData } : m));
  }

  // CHECKLIST LOGIC
  const toggleCheckItem = (id: number) => {
    setCheckItems(checkItems.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const addCheckItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    setCheckItems([...checkItems, { id: Date.now(), label: newItemText, checked: false }]);
    setNewItemText("");
  };

  const progressPercent = Math.round((checkItems.filter(i => i.checked).length / checkItems.length) * 100);

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen relative text-stone-800">
      
      {/* HEADER */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#637a63]">Market Hub</h1>
          <div className="flex bg-[#f1e6d2]/30 p-1 rounded-xl mt-4 w-fit border border-[#f1e6d2]">
            <button onClick={() => setView('schedule')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${view === 'schedule' ? 'bg-white text-[#637a63] shadow-sm' : 'text-stone-400'}`}>12-Month Schedule</button>
            <button onClick={() => setView('checklist')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${view === 'checklist' ? 'bg-white text-[#637a63] shadow-sm' : 'text-stone-400'}`}>Market Day Checklist</button>
          </div>
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#7a967a] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-[#7a967a]/20 hover:bg-[#637a63] flex items-center gap-2"
        >
          <Plus size={20} /> Book Market
        </button>
      </header>

      {/* LOADING SPINNER */}
      {loading && view === 'schedule' && (
        <div className="flex flex-col items-center justify-center py-20 text-[#7a967a]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7a967a] mb-4"></div>
          <p className="font-medium animate-pulse text-sm">Syncing with Sage & Sand Cloud...</p>
        </div>
      )}

      {/* VIEW 1: SCHEDULE */}
      {!loading && view === 'schedule' && (
        <div className="space-y-10 animate-in fade-in duration-500">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input type="text" placeholder="Search saved markets..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#f1e6d2] outline-none bg-white focus:ring-2 focus:ring-[#7a967a]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {markets.map(market => (
              <MarketCard 
                key={market.id} 
                market={market} 
                onDelete={() => deleteMarket(market.id)}
                onUpdate={(data: any) => updateMarket(market.id, data)}
                onContactClick={() => setSelectedContact(market)}
              />
            ))}
            
            {markets.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-[#f1e6d2] rounded-[2.5rem]">
                 <p className="text-stone-400">Your cloud calendar is empty. Add a market to get started!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: CHECKLIST */}
      {view === 'checklist' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#f1e6d2] shadow-sm">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-2xl font-bold text-[#637a63] flex items-center gap-3"><Truck size={28}/> Load-In Status</h3>
                <p className="text-stone-400 text-sm mt-1">{checkItems.filter(i => i.checked).length} of {checkItems.length} items packed</p>
              </div>
              <span className="text-3xl font-black text-[#7a967a]">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#7a967a] transition-all duration-700" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <form onSubmit={addCheckItem} className="flex gap-2">
            <input value={newItemText} onChange={(e) => setNewItemText(e.target.value)} type="text" placeholder="Add to list..." className="flex-1 p-4 rounded-2xl border border-[#f1e6d2] outline-none bg-white shadow-sm" />
            <button type="submit" className="bg-[#7a967a] text-white p-4 rounded-2xl hover:bg-[#637a63] transition-all"><PlusCircle size={24} /></button>
          </form>

          <div className="bg-white rounded-[2.5rem] border border-[#f1e6d2] shadow-sm divide-y divide-stone-50">
            {checkItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-5 hover:bg-[#fdfbf7] transition-colors group">
                <button onClick={() => toggleCheckItem(item.id)} className="flex items-center gap-4 flex-1 text-left">
                  <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${item.checked ? 'bg-[#7a967a] border-[#7a967a]' : 'border-stone-200'}`}>
                    {item.checked && <CheckCircle2 size={16} className="text-white" />}
                  </div>
                  <span className={`font-medium ${item.checked ? 'text-stone-300 line-through' : 'text-stone-600'}`}>{item.label}</span>
                </button>
                <button onClick={() => setCheckItems(checkItems.filter(i => i.id !== item.id))} className="opacity-0 group-hover:opacity-100 p-2 text-rose-300 hover:text-rose-500"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* THE BOOK MARKET MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <form 
            onSubmit={handleAddMarket} 
            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
          >
            <div className="bg-[#7a967a] p-6 text-white flex justify-between items-center text-xl font-bold">
              <h3>Book New Market</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)}><X size={20}/></button>
            </div>

            <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Market Name</label>
                  <input required className="w-full p-3 mt-1 bg-stone-50 rounded-xl border border-stone-100 outline-none focus:ring-2 focus:ring-[#7a967a]" value={newMarket.name} onChange={e => setNewMarket({...newMarket, name: e.target.value})} placeholder="e.g. Christmas Fair" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Date</label>
                  <input required type="text" className="w-full p-3 mt-1 bg-stone-50 rounded-xl border border-stone-100 outline-none" value={newMarket.date} onChange={e => setNewMarket({...newMarket, date: e.target.value})} placeholder="Dec 25" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Location</label>
                  <input className="w-full p-3 mt-1 bg-stone-50 rounded-xl border border-stone-100 outline-none" value={newMarket.location} onChange={e => setNewMarket({...newMarket, location: e.target.value})} placeholder="City Hall" />
                </div>
              </div>

              <div className="border-t border-stone-100 pt-6 mt-2">
                <p className="text-[10px] font-bold text-[#c2b280] uppercase mb-4 tracking-widest text-center">Host Contact Details</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Host Name</label>
                    <input className="w-full p-3 bg-stone-50 rounded-xl border border-stone-100 outline-none" value={newMarket.host_name} onChange={e => setNewMarket({...newMarket, host_name: e.target.value})} placeholder="Organizer Name" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Email</label>
                      <input type="email" className="w-full p-3 bg-stone-50 rounded-xl border border-stone-100 outline-none" value={newMarket.host_email} onChange={e => setNewMarket({...newMarket, host_email: e.target.value})} placeholder="email@host.com" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Phone</label>
                      <input type="tel" className="w-full p-3 bg-stone-50 rounded-xl border border-stone-100 outline-none" value={newMarket.host_phone} onChange={e => setNewMarket({...newMarket, host_phone: e.target.value})} placeholder="555-555-5555" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 pt-0">
              <button type="submit" className="w-full bg-[#7a967a] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#637a63] transition-all active:scale-95">
                Confirm & Save Market
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONTACT POPOUT MODAL */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-[#7a967a] p-8 text-white text-center relative">
              <button onClick={() => setSelectedContact(null)} className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full"><X size={20} /></button>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"><Users size={40} /></div>
              <h3 className="text-2xl font-bold">{selectedContact.host_name || "No Name"}</h3>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">Organizer</p>
            </div>
            <div className="p-8 space-y-4 text-center">
              <a href={`tel:${selectedContact.host_phone}`} className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl hover:bg-[#f4f7f4] group">
                <div className="bg-white p-2 rounded-lg text-[#7a967a] shadow-sm group-hover:bg-[#7a967a] group-hover:text-white transition-colors"><Phone size={20} /></div>
                <div className="text-left"><p className="text-[10px] font-bold text-stone-400 uppercase leading-none mb-1">Call</p><p className="text-[#637a63] font-bold">{selectedContact.host_phone || 'None'}</p></div>
              </a>
              <a href={`mailto:${selectedContact.host_email}`} className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl hover:bg-[#f4f7f4] group">
                <div className="bg-white p-2 rounded-lg text-[#c2b280] shadow-sm group-hover:bg-[#c2b280] group-hover:text-white transition-colors"><Mail size={20} /></div>
                <div className="text-left"><p className="text-[10px] font-bold text-stone-400 uppercase leading-none mb-1">Email</p><p className="text-[#637a63] font-bold truncate max-w-[150px]">{selectedContact.host_email || 'None'}</p></div>
              </a>
              <button onClick={() => setSelectedContact(null)} className="w-full pt-4 text-stone-400 text-sm font-bold hover:text-stone-600">Close Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// MARKET CARD COMPONENT
function MarketCard({ market, onDelete, onUpdate, onContactClick }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(market);

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-3xl border-2 border-[#7a967a] shadow-xl space-y-4">
        <input className="w-full p-3 border rounded-xl text-sm outline-none" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="Market Name" />
        <input className="w-full p-3 border rounded-xl text-sm outline-none" value={editData.date} onChange={e => setEditData({...editData, date: e.target.value})} placeholder="Date" />
        <input className="w-full p-3 border rounded-xl text-sm outline-none" value={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} placeholder="Location" />
        <div className="flex gap-2">
          <button onClick={handleSave} className="flex-1 bg-[#7a967a] text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1"><Save size={14}/> Save</button>
          <button onClick={() => setIsEditing(false)} className="flex-1 bg-stone-100 text-stone-500 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1"><X size={14}/> Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-[#f1e6d2] shadow-sm hover:border-[#7a967a] transition-all group relative">
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setIsEditing(true)} className="p-2 bg-[#fdfbf7] text-[#c2b280] rounded-lg hover:bg-[#c2b280] hover:text-white transition-colors shadow-sm"><Edit2 size={14} /></button>
        <button onClick={onDelete} className="p-2 bg-rose-50 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-colors shadow-sm"><Trash2 size={14} /></button>
      </div>
      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">{market.date}</span>
      <h3 className="text-xl font-bold text-[#637a63] mb-4">{market.name}</h3>
      <div className="space-y-3 mb-6">
        <p className="text-xs text-stone-500 flex items-center gap-2 font-medium"><MapPin size={14} className="text-[#c2b280]" /> {market.location}</p>
        <p className="text-xs text-stone-500 flex items-center gap-2 font-medium"><Users size={14} className="text-[#c2b280]" /> {market.host_name || "Unknown Host"}</p>
      </div>
      <button onClick={onContactClick} className="flex items-center gap-2 text-[10px] font-black text-[#c2b280] hover:text-[#7a967a] transition-colors uppercase tracking-[0.15em]"><ExternalLink size={14}/> Contact Host</button>
    </div>
  );
}