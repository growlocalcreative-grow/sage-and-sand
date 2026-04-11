"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Sprout, LogIn, UserPlus, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (isSigningUp) {
      // Create a new account
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert("Account created! You can now log in.");
    } else {
      // Log into existing account
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else router.push('/'); // Send them to the dashboard
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 border border-[#f1e6d2]">
        <div className="text-center mb-10">
          <div className="bg-[#7a967a] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
            <Sprout size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#637a63]">Sage & Sand</h1>
          <p className="text-stone-400 mt-2">Craft Business Management</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-stone-300" size={20} />
            <input 
              type="email" 
              required 
              className="w-full pl-12 pr-4 py-4 bg-stone-50 rounded-2xl border border-stone-100 outline-none focus:ring-2 focus:ring-[#7a967a]" 
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-stone-300" size={20} />
            <input 
              type="password" 
              required 
              className="w-full pl-12 pr-4 py-4 bg-stone-50 rounded-2xl border border-stone-100 outline-none focus:ring-2 focus:ring-[#7a967a]" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-[#7a967a] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#637a63] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? "Processing..." : isSigningUp ? <UserPlus size={20}/> : <LogIn size={20}/>}
            {isSigningUp ? "Create Workspace" : "Enter Workspace"}
          </button>
        </form>

        <button 
          onClick={() => setIsSigningUp(!isSigningUp)}
          className="w-full mt-6 text-stone-400 text-sm hover:text-[#7a967a] transition-colors"
        >
          {isSigningUp ? "Already have an account? Sign In" : "Need a teammate account? Sign Up"}
        </button>
      </div>
    </div>
  );
}