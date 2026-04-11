"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Clock, Calendar, Plus, Trash2, Loader2, 
  AlertTriangle, Edit3, X, CheckSquare 
} from 'lucide-react';

export default function ProductionPlanner() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // NEW: Tracking if we are editing an existing project
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
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
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('target_date', { ascending: true });

    if (!error) setProjects(data || []);
    setLoading(false);
  }

  // --- THE DUAL SAVE FUNCTION (Add & Update) ---
  async function handleSaveProject(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please log in!");

    let result;

    if (editingId) {
      // UPDATE existing project
      result = await supabase
        .from('projects')
        .update({ ...formData })
        .eq('id', editingId)
        .select();
    } else {
      // INSERT new project
      result = await supabase
        .from('projects')
        .insert([{ ...formData, user_id: user.id }])
        .select();
    }

    if (!result.error) {
      fetchProjects(); // Refresh the list
      closeModal();
    } else {
      alert("Error saving: " + result.error.message);
    }
  }

  const openEditModal = (project: any) => {
    setEditingId(project.id);
    setFormData({
      product_name: project.product_name,
      quantity_needed: project.quantity_needed,
      days_per_item: project.days_per_item,
      target_date: project.target_date
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ product_name: '', quantity_needed: 1, days_per_item: 1, target_date: '' });
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this production goal?")) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) setProjects(projects.filter(p => p.id !== id));
  };

  // --- MATH ENGINE ---
  const calculateStartDate = (targetDate: string, qty: number, days: number) => {
    const target = new Date(targetDate);
    const totalProductionDays = qty * days;
    const start = new Date(target);
    start.setDate(target.getDate() - totalProductionDays);
    return start;
  };

  const getStatus = (startDate: Date) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    if (startDate < today) return { label: 'Behind', color: 'text-rose-500 bg-rose-50' };
    if (startDate.getTime() === today.getTime()) return { label: 'Start Today', color: 'text-amber-600 bg-amber-50' };
    return { label: 'On Track', color: 'text-sage-600 bg-sage-50' };
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen text-stone-800">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#637a63]">Production Planner</h1>
          <p className="text-stone-400 text-sm italic">Backward scheduling for Sage & Sand</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#f1e6d2] text-[#637a63] px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#e7d9c1] transition-all shadow-sm"
        >
          <Plus size={20} /> New Project
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-[#7a967a]" /></div>
        ) : projects.map((project) => {
          const startDate = calculateStartDate(project.target_date, project.quantity_needed, project.days_per_item);
          const status = getStatus(startDate);

          return (
            <div key={project.id} className="bg-white p-6 rounded-[2.5rem] border border-[#f1e6d2] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-[#7a967a] transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-[#637a63]">{project.product_name}</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-[10px] font-bold text-stone-300 uppercase">Quantity</p>
                    <p className="font-bold">{project.quantity_needed}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-stone-300 uppercase">Days / Item</p>
                    <p className="font-bold">{project.days_per_item}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-stone-300 uppercase">Start Date</p>
                    <p className="font-bold text-[#7a967a]">{startDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-stone-300 uppercase">Deadline</p>
                    <p className="font-bold text-stone-500">{new Date(project.target_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(project)} className="p-3 text-[#c2b280] bg-stone-50 rounded-xl hover:bg-[#c2b280] hover:text-white transition-all">
                  <Edit3 size={18} />
                </button>
                <button onClick={() => deleteProject(project.id)} className="p-3 text-stone-300 bg-stone-50 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}

        {!loading && projects.length === 0 && (
           <div className="text-center py-20 bg-white border-2 border-dashed border-[#f1e6d2] rounded-[3rem]">
              <Calendar className="mx-auto text-stone-200 mb-2" size={40} />
              <p className="text-stone-400">No production goals set yet.</p>
           </div>
        )}
      </div>

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <form onSubmit={handleSaveProject} className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden p-10 space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-[#637a63]">{editingId ? 'Edit Project' : 'New Project'}</h3>
                <button type="button" onClick={closeModal}><X className="text-stone-300 hover:text-stone-500" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-stone-400 uppercase ml-1">What are you making?</label>
                <input required value={formData.product_name} onChange={e => setFormData({...formData, product_name: e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl border border-stone-100 outline-none focus:ring-2 focus:ring-[#7a967a]" placeholder="e.g. Lavender Sachets" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase ml-1">How many?</label>
                  <input type="number" required value={formData.quantity_needed} onChange={e => setFormData({...formData, quantity_needed: parseInt(e.target.value)})} className="w-full p-4 bg-stone-50 rounded-2xl border border-stone-100 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase ml-1">Days per unit</label>
                  <input type="number" required value={formData.days_per_item} onChange={e => setFormData({...formData, days_per_item: parseInt(e.target.value)})} className="w-full p-4 bg-stone-50 rounded-2xl border border-stone-100 outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-stone-400 uppercase ml-1">Market Date</label>
                <input type="date" required value={formData.target_date} onChange={e => setFormData({...formData, target_date: e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl border border-stone-100 outline-none" />
              </div>
            </div>

            <div className="pt-4">
              {/* THE SAGE FILL & SAND TEXT BUTTON */}
              <button 
                type="submit" 
                className="w-full bg-[#7a967a] text-[#fdfbf7] py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#7a967a]/30 hover:bg-[#637a63] transition-all active:scale-95"
              >
                {editingId ? 'Update Goal' : 'Launch Goal'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}