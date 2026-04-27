import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, User, Loader2, Mountain, MessageSquare } from 'lucide-react';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface SupportChatProps {
  onClose: () => void;
}

export default function SupportChat({ onClose }: SupportChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<'passenger' | 'rider'>('passenger');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [chatSession, setChatSession] = useState<any>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role || 'passenger');
        }
      }
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    // Initialize Chat Session
    const systemInstruction = userRole === 'rider' 
      ? "You are Pahadi Rider Support, an AI assistant for drivers/riders on the Pahadi Ride app in Himachal Pradesh. Your goal is to help riders with app navigation, earning queries, and provide safety tips for mountain driving. Be encouraging, professional, and use a friendly mountain-themed tone."
      : "You are Pahadi Support, an AI assistant for passengers on the Pahadi Ride app in Himachal Pradesh. Help users with booking rides, payment issues, and finding local attractions. Be polite, helpful, and use a friendly mountain-themed tone.";

    const session = genAI.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction,
      }
    });
    setChatSession(session);
    
    // Initial greeting
    setMessages([
      { role: 'model', text: `Jhulay! I'm your Pahadi Support assistant. How can I help you today, ${userRole === 'rider' ? 'Partner' : 'Friend'}?` }
    ]);
  }, [userRole]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatSession) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const result = await chatSession.sendMessage({ message: userMessage });
      setMessages(prev => [...prev, { role: 'model', text: result.text }]);
    } catch (error) {
      console.error('Support Chat Error:', error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered a bit of a landslide in my connection. Could you try again?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col h-[70vh]"
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-500 rounded-xl">
               <Bot size={20} />
             </div>
             <div>
               <h2 className="font-bold tracking-tight">Pahadi AI Support</h2>
               <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                 Always Online
               </div>
             </div>
          </div>
          <button onClick={onClose} className="p-2 transition-colors hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar bg-slate-50">
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-emerald-500 border border-slate-100'}`}>
                   {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                 </div>
                 <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 rounded-tr-none' : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none'}`}>
                   {msg.text}
                 </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="flex gap-3 max-w-[85%]">
                 <div className="w-8 h-8 rounded-lg bg-white text-emerald-500 border border-slate-100 flex items-center justify-center">
                   <Bot size={16} />
                 </div>
                 <div className="p-4 bg-white rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                    <Loader2 className="animate-spin text-emerald-500" size={20} />
                 </div>
               </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-3">
          <input 
            type="text" 
            placeholder="Ask me anything..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg"
          >
            <Send size={20} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
