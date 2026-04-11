import React from 'react';
import { 
  Plus, Sparkles, Hammer, History, 
  ArrowUpRight, TrendingUp, Users 
} from 'lucide-react';

export default function Home() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#637a63]">Sage & Sand Hub</h1>
          <p className="text-stone-500">Workspace shared with **Daughter**</p>
        </div>
        <div className="flex -space-x-2">
          {/* Teammate Avatars Placeholder */}
          <div className="w-10 h-10 rounded-full border-2 border-white bg-sage-600 flex items-center justify-center text-white text-xs font-bold">ME</div>
          <div className="w-10 h-10 rounded-full border-2 border-white bg-[#c2b280] flex items-center justify-center text-white text-xs font-bold">D</div>
        </div>
      </header>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard label="In Stock" value="24" icon={<Hammer size={20}/>} color="text-emerald-600" />
        <StatCard label="Sales This Week" value="$140" icon={<TrendingUp size={20}/>} color="text-[#c2b280]" />
        <StatCard label="Pending Tasks" value="5" icon={<History size={20}/>} color="text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* QUICK PRODUCTION LOG */}
        <section className="bg-white p-8 rounded-3xl border border-[#f1e6d2] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#f4f7f4] p-2 rounded-lg text-[#637a63]">
                <Sparkles size={24} />
              </div>
              <h2 className="text-xl font-bold text-[#637a63]">Production Log</h2>
            </div>
          </div>
          
          <p className="text-sm text-stone-500 mb-6 font-medium">Quickly add finished items to your stock:</p>
          
          <div className="space-y-4">
            <ProductionItem name="Sage Crochet Stuffy" stock={12} />
            <ProductionItem name="Sandstone Beaded Bracelet" stock={8} />
            <ProductionItem name="Miniature Planter" stock={4} />
            
            <button className="w-full mt-4 py-3 border-2 border-dashed border-[#f1e6d2] rounded-xl text-stone-400 hover:text-[#7a967a] hover:border-[#7a967a] transition-all text-sm font-semibold">
              + Add another product to quick-log
            </button>
          </div>
        </section>

        {/* TEAM ACTIVITY FEED */}
        <section className="bg-white p-8 rounded-3xl border border-[#f1e6d2] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#fdfbf7] p-2 rounded-lg text-[#c2b280]">
              <Users size={24} />
            </div>
            <h2 className="text-xl font-bold text-[#637a63]">Team Activity</h2>
          </div>

          <div className="space-y-6">
            <ActivityItem 
              user="Daughter" 
              action="updated stock for" 
              target="Sage Yarn" 
              time="2 hours ago" 
            />
            <ActivityItem 
              user="You" 
              action="completed task" 
              target="Pack for Saturday Market" 
              time="5 hours ago" 
            />
            <ActivityItem 
              user="Daughter" 
              action="added new product" 
              target="Velvet Scrunchies" 
              time="Yesterday" 
            />
          </div>
        </section>

      </div>
    </div>
  );
}

// Small helper for Stats
function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#f1e6d2] shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-stone-50 ${color}`}>{icon}</div>
      <div>
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  );
}

// Small helper for Production Items
function ProductionItem({ name, stock }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#fdfbf7] rounded-2xl border border-[#f1e6d2]">
      <div>
        <p className="font-bold text-[#637a63]">{name}</p>
        <p className="text-xs text-stone-400">Current Stock: {stock}</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-lg bg-white border border-[#f1e6d2] flex items-center justify-center text-[#637a63] hover:bg-[#7a967a] hover:text-white transition-colors">-</button>
        <span className="w-8 text-center font-bold text-[#637a63]">0</span>
        <button className="w-8 h-8 rounded-lg bg-white border border-[#f1e6d2] flex items-center justify-center text-[#637a63] hover:bg-[#7a967a] hover:text-white transition-colors">+</button>
      </div>
    </div>
  );
}

// Small helper for Activity
function ActivityItem({ user, action, target, time }: any) {
  return (
    <div className="flex gap-4">
      <div className="w-2 h-2 rounded-full bg-[#c2b280] mt-2 shrink-0"></div>
      <div>
        <p className="text-sm text-stone-600">
          <span className="font-bold text-[#637a63]">{user}</span> {action} <span className="italic">"{target}"</span>
        </p>
        <p className="text-xs text-stone-400 mt-1">{time}</p>
      </div>
    </div>
  );
}