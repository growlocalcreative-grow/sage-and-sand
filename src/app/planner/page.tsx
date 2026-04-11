"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Clock, Plus, Trash2, Loader2, Edit3, X, Calendar 
} from 'lucide-react';

export default function ProductionPlanner() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    product_name: '',
    quantity_needed: 1,
    days_per_item: 1,
    target_date: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    const { data, error } = await supabase.from('projects').select('*').order('target_date', { ascending: true });
    if (!error) setProjects(data || []);
    setLoading(false);
  }

  async function handleSaveProject(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please log in!");

    let result;
    if (editingId) {
      result = await supabase.from('projects').update({ ...formData }).eq('id', editingId).select();
    } else {
      result = await supabase.from('projects').insert([{ ...formData, user_id: user.id }]).select();
    }

    if (!result.error) { fetchProjects(); closeModal(); }
    else { alert("Error: " + result.error.message); }
  }

  const openEditModal = (project: any) => {
    setEditingId(project.id);
    setFormData({ product_name: project.product_name, quantity_needed: project.quantity_needed, days_per_item: project.days_per_item, target_date: project.target_date });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ product_name: '', quantity_needed: 1, days_per_item: 1, target_date: '' });
  };

  const calculateStartDate = (targetDate: string, qty: number, days: number) => {
    const target = new Date(targetDate);
    const start = new Date(target);
    start.setDate(target.getDate() - (qty * days));
    return start;
  };

  const getStatus = (startDate: Date) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    if (startDate < today) return { label: 'Behind', color: 'text-rose-500 bg-rose-50' };
    return { label: 'On Track', color: 'text-sage-600 bg-sage-50' };
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen text-stone-800 pb-20">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#637a63]">Production Planner</h1>
          <p className="text-stone-400 text-xs sm:text-sm italic">Sage & Sand Scheduling</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-[#f1e6d2] text-[#637a63] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#e7d9c1] text-sm active:scale-95 transition-all"
        >
          <Plus size={18} /> New Goal
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {loading ? (
          <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-stone-300" /></div>
        ) : projects.map((project) => {
          const startDate = calculateStartDate(project.target_date, project.quantity_needed, project.days_per_item);
          const status = getStatus(startDate);

          return (
            <div key={project.id} className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border border-[#f1e6d2] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-[#7a967a] transition-all relative">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg sm:text-xl font-bold text-[#637a63] truncate">{project.product_name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                </div>
                
                {/* Responsive Grid for stats - stacks on vertical tablet */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                  <div><p className="text-[9px] font-bold text-stone-300 uppercase">Qty</p><p className="font-bold text-xs sm:text-sm">{project.quantity_needed} items</p></div>
                  <div><p className="text-[9px] font-bold text-stone-300 uppercase">Days/Unit</p><p className="font-bold text-xs sm:text-sm">{project.days_per_item} days</p></div>
                  <div><p className="text-[9px] font-bold text-stone-300 uppercase tracking-tighter">Start By</p><p className="font-bold text-xs sm:text-sm text-[#7a967a]">{startDate.toLocaleDateString()}</p></div>
                  <div><p className="text-[9px] font-bold text-stone-300 uppercase tracking-tighter">Deadline</p><p className="font-bold text-xs sm:text-sm text-stone-500">{new Date(project.target_date).toLocaleDateString()}</p></div>
                </div>
              </div>

              {/* FIX: Icons visible on touch devices */}
              <div className="flex gap-2 self-end md:self-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(project)} className="p-2.5 text-[#c2b280] bg-stone-50 rounded-xl hover:bg-[#c2b280] hover:text-white"><Edit3 size={18} /></button>
                <button onClick={async () => {
                  if(confirm("Delete goal?")) {
                    await supabase.from('projects').delete().eq('id', project.id);
                    fetchProjects();
                  }
                }} className="p-2.5 text-stone-300 bg-stone-50 rounded-xl hover:bg-rose-500 hover:text-white"><Trash2 size={18} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <form onSubmit={handleSaveProject} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#637a63]">{editingId ? 'Edit Goal' : 'New Goal'}</h3>
              <button type="button" onClick={closeModal}><X className="text-stone-300" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-[10px] font-black text-stone-400 uppercase ml-1">Product Name</label><input required value={formData.product_name} onChange={e => setFormData({...formData, product_name: e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl border border-stone-100 outline-none focus:ring-2 focus:ring-[#7a967a] text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black text-stone-400 uppercase ml-1">How many?</label><input type="number" required value={formData.quantity_needed} onChange={e => setFormData({...formData, quantity_needed: parseInt(e.target.value)})} className="w-full p-4 bg-stone-50 rounded-2xl border border-stone-100 outline-none text-sm" /></div>
                <div><label className="text-[10px] font-black text-stone-400 uppercase ml-1">Days per unit</label><input type="number" required value={formData.days_per_item} onChange={e => setFormData({...formData, days_per_item: parseInt(e.target.value)})} className="w-full p-4 bg-stone-50 rounded-2xl border border-stone-100 outline-none text-sm" /></div>
              </div>
              <div><label className="text-[10px] font-black text-stone-400 uppercase ml-1">Market Date</label><input type="date" required value={formData.target_date} onChange={e => setFormData({...formData, target_date: e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl border border-stone-100 outline-none text-sm" /></div>
            </div>
            {/* SAGE FILL & SAND TEXT */}
            <button type="submit" className="w-full bg-[#7a967a] text-[#fdfbf7] py-4 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-[#637a63] transition-all text-xs sm:text-sm">
              {editingId ? 'Update Production' : 'Start Planning'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}