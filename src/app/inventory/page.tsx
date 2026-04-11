"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, Plus, Tag, Layers, X, Camera, Barcode, 
  Trash2, Loader2, Edit3, Save, Hammer, Utensils, MinusCircle, Ruler
} from 'lucide-react';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'materials'>('products');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataList, setDataList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [allMaterials, setAllMaterials] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    current_stock: 0,
    cost_or_price: 0,
    category: '',
    unit: 'items'
  });

  const [recipeRows, setRecipeRows] = useState<any[]>([]);

  useEffect(() => {
    fetchEverything();
  }, [activeTab]);

  async function fetchEverything() {
    setLoading(true);
    const table = activeTab === 'materials' ? 'materials' : 'products';
    const catType = activeTab === 'materials' ? 'material' : 'product';

    try {
      const [itemRes, catRes, matRes] = await Promise.all([
        supabase.from(table).select('*').order('name', { ascending: true }),
        supabase.from('categories').select('*').eq('type', catType),
        supabase.from('materials').select('id, name, unit') 
      ]);

      setDataList(itemRes.data || []);
      setCategories(catRes.data || []);
      setAllMaterials(matRes.data || []);
      
      if (catRes.data?.[0]) {
        setNewItem(prev => ({ ...prev, category: prev.category || catRes.data[0].name }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveItem(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const table = activeTab === 'materials' ? 'materials' : 'products';
    const dbData: any = { 
      name: newItem.name, 
      current_stock: Number(newItem.current_stock) || 0, 
      category: newItem.category, 
      user_id: user.id 
    };

    if (activeTab === 'materials') {
      dbData.unit_cost = Number(newItem.cost_or_price) || 0;
      dbData.unit = newItem.unit;
    } else {
      dbData.sale_price = Number(newItem.cost_or_price) || 0;
      dbData.description = newItem.description;
    }

    let result;
    if (editingId) {
      result = await supabase.from(table).update(dbData).eq('id', editingId).select();
    } else {
      result = await supabase.from(table).insert([dbData]).select();
    }

    if (!result.error && result.data) {
      const finalId = editingId || result.data[0].id;
      if (activeTab === 'products') {
        await supabase.from('product_recipes').delete().eq('product_id', finalId);
        const recipeToInsert = recipeRows.map(row => ({
          product_id: finalId,
          material_id: row.material_id,
          quantity_used: row.quantity_used,
          user_id: user.id
        }));
        if (recipeToInsert.length > 0) await supabase.from('product_recipes').insert(recipeToInsert);
      }
      fetchEverything();
      closeDrawer();
    }
    setLoading(false);
  }

  async function handleBatchProduce(product: any) {
    const amount = prompt(`How many "${product.name}" did you make?`, "1");
    if (!amount || isNaN(Number(amount))) return;
    const qtyMade = Number(amount);
    setLoading(true);
    
    const { data: recipe } = await supabase
      .from('product_recipes')
      .select('material_id, quantity_used')
      .eq('product_id', product.id);

    if (recipe) {
      for (const ingredient of recipe) {
        await supabase.rpc('decrement_material_stock', { 
          row_id: ingredient.material_id, 
          amount: ingredient.quantity_used * qtyMade 
        });
      }
    }

    await supabase.from('products').update({ current_stock: product.current_stock + qtyMade }).eq('id', product.id);
    alert(`Production logged! Materials updated.`);
    fetchEverything();
    setLoading(false);
  }

  const openEditDrawer = async (item: any) => {
    setEditingId(item.id);
    setNewItem({
      name: item.name,
      description: item.description || '',
      current_stock: item.current_stock,
      cost_or_price: activeTab === 'materials' ? item.unit_cost : item.sale_price,
      category: item.category,
      unit: item.unit || 'items'
    });
    if (activeTab === 'products') {
      const { data } = await supabase.from('product_recipes').select('*').eq('product_id', item.id);
      setRecipeRows(data || []);
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingId(null);
    setRecipeRows([]);
    setNewItem({ name: '', description: '', current_stock: 0, cost_or_price: 0, category: categories[0]?.name || '', unit: 'items' });
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen text-stone-800 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#637a63]">Inventory Ledger</h1>
          <p className="text-stone-400 text-xs sm:text-sm">Managing Sage & Sand {activeTab}</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)} 
          className="bg-[#f1e6d2] text-[#637a63] px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#e7d9c1] transition-all text-sm sm:text-base"
        >
          <Plus size={18} /> Add Item
        </button>
      </header>

      {/* TABS - Now using the Helper Component at the bottom */}
      <div className="flex bg-[#f1e6d2]/20 p-1 rounded-xl w-fit mb-8 border border-[#f1e6d2]">
        <TabButton 
          active={activeTab === 'products'} 
          onClick={() => setActiveTab('products')} 
          icon={<Tag size={16}/>} 
          label="Products" 
        />
        <TabButton 
          active={activeTab === 'materials'} 
          onClick={() => setActiveTab('materials')} 
          icon={<Layers size={16}/>} 
          label="Materials" 
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-[#f1e6d2] shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead className="bg-[#fdfbf7] border-b border-[#f1e6d2]">
            <tr>
              <th className="p-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Name</th>
              <th className="p-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Category</th>
              <th className="p-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Stock</th>
              <th className="p-4 text-right text-[10px] font-black text-stone-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {loading ? (
              <tr><td colSpan={4} className="p-10 text-center animate-pulse text-stone-400 italic">Syncing Ledger...</td></tr>
            ) : dataList.map((item) => (
              <tr key={item.id} className="hover:bg-[#fdfbf7] transition-colors group">
                <td className="p-4 font-bold text-[#637a63] text-sm sm:text-base">{item.name}</td>
                <td className="p-4 text-[10px] sm:text-xs font-bold text-stone-400 uppercase">{item.category}</td>
                <td className="p-4 font-mono font-bold text-stone-600 text-sm">
                  {item.current_stock} <span className="text-[10px] text-stone-400 font-normal lowercase">{activeTab === 'materials' ? item.unit : 'items'}</span>
                </td>
                <td className="p-4 text-right space-x-1">
                  {activeTab === 'products' && (
                    <button onClick={() => handleBatchProduce(item)} className="p-2 text-[#7a967a] hover:bg-[#f4f7f4] rounded-lg transition-all"><Hammer size={16} /></button>
                  )}
                  <button onClick={() => openEditDrawer(item)} className="p-2 text-stone-300 hover:text-[#7a967a] transition-colors"><Edit3 size={16}/></button>
                  <button onClick={async () => {
                    if(confirm("Delete item?")) {
                      await supabase.from(activeTab === 'materials' ? 'materials' : 'products').delete().eq('id', item.id);
                      fetchEverything();
                    }
                  }} className="p-2 text-stone-300 hover:text-rose-400 transition-colors"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DRAWER - Standardized padding for mobile */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[150] transform transition-transform duration-500 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <form onSubmit={handleSaveItem} className="h-full flex flex-col p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-[#f1e6d2] pb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#637a63]">{editingId ? 'Edit' : 'New'} {activeTab}</h2>
            <button type="button" onClick={closeDrawer} className="p-2 hover:bg-[#f1e6d2] rounded-full"><X size={24} /></button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            <div>
              <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">Name</label>
              <input required value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className="w-full p-3 sm:p-4 bg-stone-50 rounded-2xl border border-stone-100 outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">Stock Level</label>
                <input type="number" value={newItem.current_stock} onChange={(e) => setNewItem({...newItem, current_stock: parseFloat(e.target.value) || 0})} className="w-full p-3 sm:p-4 bg-stone-50 rounded-2xl border border-stone-100" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">{activeTab === 'materials' ? 'Unit Cost' : 'Price'}</label>
                <input type="number" step="0.01" value={newItem.cost_or_price} onChange={(e) => setNewItem({...newItem, cost_or_price: parseFloat(e.target.value) || 0})} className="w-full p-3 sm:p-4 bg-stone-50 rounded-2xl border border-stone-100" />
              </div>
            </div>

            {activeTab === 'materials' && (
              <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200 flex items-center gap-4">
                <Ruler className="text-sand-500" size={20} />
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Measured In</label>
                  <select 
                    value={newItem.unit} 
                    onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                    className="bg-transparent font-bold text-[#637a63] outline-none w-full text-sm"
                  >
                    <option value="items">Items (count)</option>
                    <option value="oz">Ounces (oz)</option>
                    <option value="yards">Yards (yd)</option>
                    <option value="feet">Feet (ft)</option>
                    <option value="grams">Grams (g)</option>
                  </select>
                </div>
              </div>
            )}

            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">Category</label>
            <select value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} className="w-full p-3 sm:p-4 bg-stone-50 rounded-2xl border border-stone-100 outline-none text-sm">
              {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>

            {activeTab === 'products' && (
               <div className="mt-8 p-4 sm:p-6 bg-[#fdfbf7] border border-[#f1e6d2] rounded-[1.5rem] sm:rounded-[2rem] space-y-4">
                  <div className="flex items-center gap-2 text-[#7a967a]">
                    <Utensils size={18} />
                    <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider">Product Recipe</h3>
                  </div>
                  {recipeRows.map((row, index) => {
                    const mat = allMaterials.find(m => m.id === row.material_id);
                    return (
                      <div key={index} className="flex gap-2 items-end bg-white p-2 sm:p-3 rounded-xl border border-stone-100 shadow-sm">
                        <div className="flex-1">
                          <select 
                            value={row.material_id} 
                            onChange={(e) => {
                              const newRows = [...recipeRows];
                              newRows[index].material_id = e.target.value;
                              setRecipeRows(newRows);
                            }}
                            className="w-full p-1 bg-transparent border-none text-xs sm:text-sm font-bold text-stone-600 outline-none"
                          >
                            <option value="">Select...</option>
                            {allMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                        </div>
                        <div className="w-20 text-right">
                          <div className="flex items-center gap-1">
                            <input 
                              type="number" 
                              value={row.quantity_used} 
                              onChange={(e) => {
                                const newRows = [...recipeRows];
                                newRows[index].quantity_used = parseFloat(e.target.value) || 0;
                                setRecipeRows(newRows);
                              }}
                              className="w-full bg-stone-50 rounded p-1 text-[10px] sm:text-xs text-right outline-none"
                            />
                            <span className="text-[9px] text-stone-400 font-bold">{mat?.unit || 'qty'}</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => setRecipeRows(recipeRows.filter((_, i) => i !== index))} className="text-rose-300 hover:text-rose-500 ml-1"><MinusCircle size={16}/></button>
                      </div>
                    );
                  })}
                  <button type="button" onClick={() => setRecipeRows([...recipeRows, { material_id: '', quantity_used: 1 }])} className="text-[10px] font-bold text-[#c2b280] hover:text-[#7a967a] transition-colors">+ Add Ingredient</button>
               </div>
            )}
          </div>

          <button type="submit" className="w-full bg-[#f1e6d2] text-[#637a63] py-4 sm:py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-md text-xs sm:text-sm">
            {editingId ? 'Update Ledger' : 'Save to Ledger'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-all duration-300 ${
        active 
        ? 'bg-[#f1e6d2] text-[#637a63] shadow-sm font-bold scale-105' 
        : 'text-stone-400 hover:text-sage-600'
      }`}
    >
      {icon} 
      <span className="text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-tight">
        {label}
      </span>
    </button>
  );
}