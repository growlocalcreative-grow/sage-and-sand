"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, User, Trash2, Loader2, CheckCircle2, 
  Circle, MapPin, Edit3, Save, X 
} from 'lucide-react';

export default function TasksPage() {
  const [filter, setFilter] = useState<'all' | 'me' | 'daughter'>('all');
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select(`*, markets ( name )`)
      .order('created_at', { ascending: false });

    if (!error) setTasks(data || []);
    setLoading(false);
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    // FIX: Properly assign 'all' if the filter is set to Everyone
    const assignedOwner = filter === 'all' ? 'all' : filter;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ 
        title: newTaskTitle, 
        owner: assignedOwner, 
        user_id: user?.id 
      }])
      .select(`*, markets ( name )`);

    if (!error && data) {
      setTasks([data[0], ...tasks]);
      setNewTaskTitle("");
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.owner === filter || task.owner === 'all';
  });

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto min-h-screen text-stone-800 pb-20">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#637a63]">Team Tasks</h1>
        <p className="text-stone-400 text-xs sm:text-sm">Managing the Sage & Sand workflow</p>
      </header>

      <form onSubmit={addTask} className="flex gap-2 mb-8">
        <input 
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New task..." 
          className="flex-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#f1e6d2] outline-none focus:ring-2 focus:ring-[#7a967a] bg-white text-sm"
        />
        <button type="submit" className="bg-[#7a967a] text-[#fdfbf7] px-6 sm:px-8 rounded-xl sm:rounded-2xl font-bold hover:bg-[#637a63] transition-all shadow-md text-sm active:scale-95">
          Add
        </button>
      </form>

      <div className="flex bg-[#f1e6d2]/30 p-1 rounded-xl mb-8 w-fit border border-[#f1e6d2]">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${filter === 'all' ? 'bg-white text-[#637a63] shadow-sm' : 'text-stone-400'}`}>Everyone</button>
        <button onClick={() => setFilter('me')} className={`px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${filter === 'me' ? 'bg-white text-[#637a63] shadow-sm' : 'text-stone-400'}`}>Me</button>
        <button onClick={() => setFilter('daughter')} className={`px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${filter === 'daughter' ? 'bg-white text-[#637a63] shadow-sm' : 'text-stone-400'}`}>Daughter</button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-stone-300" /></div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} onRefresh={fetchTasks} setTasks={setTasks} allTasks={tasks} />
          ))
        )}
      </div>
    </div>
  );
}

function TaskItem({ task, onRefresh, setTasks, allTasks }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editOwner, setEditOwner] = useState(task.owner);

  async function toggleComplete() {
    const { error } = await supabase.from('tasks').update({ is_completed: !task.is_completed }).eq('id', task.id);
    if (!error) setTasks(allTasks.map((t: any) => t.id === task.id ? { ...t, is_completed: !t.is_completed } : t));
  }

  async function handleUpdate() {
    const { error } = await supabase.from('tasks').update({ title: editTitle, owner: editOwner }).eq('id', task.id);
    if (!error) { setIsEditing(false); onRefresh(); }
  }

  if (isEditing) {
    return (
      <div className="p-4 sm:p-5 bg-white border-2 border-[#7a967a] rounded-2xl sm:rounded-3xl shadow-lg animate-in fade-in zoom-in duration-200">
        <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-100 mb-4 outline-none text-sm" />
        <div className="flex justify-between items-center">
          <div className="flex gap-1.5">
            <OwnerButton active={editOwner === 'me'} onClick={() => setEditOwner('me')} label="Me" />
            <OwnerButton active={editOwner === 'daughter'} onClick={() => setEditOwner('daughter')} label="Daughter" />
            <OwnerButton active={editOwner === 'all'} onClick={() => setEditOwner('all')} label="All" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleUpdate} className="p-2 bg-[#7a967a] text-white rounded-lg"><Save size={18} /></button>
            <button onClick={() => setIsEditing(false)} className="p-2 bg-stone-100 text-stone-400 rounded-lg"><X size={18} /></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between p-4 sm:p-5 bg-white border border-[#f1e6d2] rounded-2xl sm:rounded-3xl shadow-sm group hover:border-[#7a967a] transition-all ${task.is_completed ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <button onClick={toggleComplete} className={`transition-all ${task.is_completed ? 'text-[#7a967a]' : 'text-stone-300'}`}>
          {task.is_completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
        </button>
        <div className="min-w-0">
          <h3 className={`font-bold text-[#637a63] text-sm sm:text-base truncate ${task.is_completed ? 'line-through text-stone-400' : ''}`}>{task.title}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-[9px] text-stone-400 uppercase font-black tracking-widest flex items-center gap-1">
              <User size={10} /> {task.owner === 'all' ? 'Everyone' : task.owner === 'me' ? 'Me' : 'Daughter'}
            </span>
            {task.markets?.name && (
              <span className="flex items-center gap-1 text-[9px] bg-[#fdfbf7] border border-[#f1e6d2] text-[#c2b280] px-1.5 py-0.5 rounded font-bold uppercase truncate max-w-[120px]"><MapPin size={10} /> {task.markets.name}</span>
            )}
          </div>
        </div>
      </div>

      {/* FIX: Icons visible on touch devices, hover only on desktop */}
      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity ml-2">
        <button onClick={() => setIsEditing(true)} className="p-2 text-stone-300 hover:text-[#7a967a]"><Edit3 size={18} /></button>
        <button onClick={async () => {
          if(confirm("Delete task?")) {
            await supabase.from('tasks').delete().eq('id', task.id);
            onRefresh();
          }
        }} className="p-2 text-stone-300 hover:text-rose-400"><Trash2 size={18} /></button>
      </div>
    </div>
  );
}

function OwnerButton({ active, onClick, label }: any) {
  return (
    <button type="button" onClick={onClick} className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'bg-[#f1e6d2] text-[#c2b280]' : 'bg-stone-50 text-stone-300'}`}>{label}</button>
  );
}