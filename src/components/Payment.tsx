import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Plus, Trash2, History, ChevronRight, X, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PaymentProps {
  onClose: () => void;
}

export default function Payment({ onClose }: PaymentProps) {
  const [cards, setCards] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingCard, setAddingCard] = useState(false);
  const [newCard, setNewCard] = useState({ number: '', expiry: '', cvc: '', brand: 'Visa' });
  const [activeTab, setActiveTab] = useState<'cards' | 'history'>('cards');

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (userId) {
      fetchCards();
      fetchTransactions();
    }
  }, [userId]);

  const fetchCards = async () => {
    if (!userId) return;
    const q = query(collection(db, `users/${userId}/paymentMethods`), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setCards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  const fetchTransactions = async () => {
    if (!userId) return;
    const q = query(collection(db, 'transactions'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    try {
      const last4 = newCard.number.slice(-4);
      await addDoc(collection(db, `users/${userId}/paymentMethods`), {
        cardId: Math.random().toString(36).substr(2, 9),
        last4,
        brand: newCard.brand,
        expiry: newCard.expiry,
        createdAt: serverTimestamp(),
      });
      setAddingCard(false);
      setNewCard({ number: '', expiry: '', cvc: '', brand: 'Visa' });
      fetchCards();
    } catch (error) {
      console.error('Error adding card:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!userId) return;
    try {
      await deleteDoc(doc(db, `users/${userId}/paymentMethods`, cardId));
      fetchCards();
    } catch (error) {
       console.error('Error deleting card:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
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
        className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col h-[80vh]"
      >
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">Wallet & Payments</h2>
            <p className="text-sm text-slate-500">Manage your secure payment methods</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-8 gap-6 border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('cards')}
            className={`pb-4 text-sm font-bold tracking-tight transition-all relative ${activeTab === 'cards' ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            Saved Cards
            {activeTab === 'cards' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`pb-4 text-sm font-bold tracking-tight transition-all relative ${activeTab === 'history' ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            Transaction History
            {activeTab === 'history' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-6 hide-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'cards' ? (
              <motion.div
                key="cards-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {loading ? (
                  <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>
                ) : cards.length > 0 ? (
                  cards.map(card => (
                    <div key={card.id} className="relative group p-6 bg-slate-900 rounded-3xl text-white shadow-xl overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                         <CreditCard size={120} />
                       </div>
                       <div className="flex justify-between items-start mb-10">
                         <div className="text-xl font-bold italic tracking-wider text-emerald-400">{card.brand}</div>
                         <button 
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-2 bg-white/10 rounded-lg hover:bg-red-500 transition-colors"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                       <div className="space-y-4">
                         <div className="text-2xl font-mono tracking-[0.2em]">•••• •••• •••• {card.last4}</div>
                         <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold opacity-60">
                           <span>Card Holder</span>
                           <span>Expires</span>
                         </div>
                         <div className="flex justify-between text-sm font-bold uppercase tracking-widest">
                           <span>SECURE USER</span>
                           <span>{card.expiry}</span>
                         </div>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-sm font-bold text-slate-400 italic">No saved cards found</p>
                  </div>
                )}

                {!addingCard ? (
                  <button 
                    onClick={() => setAddingCard(true)}
                    className="w-full py-4 border-2 border-dashed border-emerald-200 rounded-2xl text-emerald-600 font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all"
                  >
                    <Plus size={18} /> Add New Card
                  </button>
                ) : (
                  <motion.form 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onSubmit={handleAddCard}
                    className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-4 shadow-inner"
                  >
                    <div className="grid grid-cols-2 gap-4">
                       <input 
                        type="text" 
                        placeholder="Card Number" 
                        maxLength={16}
                        required
                        value={newCard.number}
                        onChange={e => setNewCard({...newCard, number: e.target.value})}
                        className="col-span-2 w-full p-3 bg-white rounded-xl text-sm font-bold border-transparent focus:border-emerald-500 transition-all"
                       />
                       <input 
                        type="text" 
                        placeholder="MM/YY" 
                        required
                        value={newCard.expiry}
                        onChange={e => setNewCard({...newCard, expiry: e.target.value})}
                        className="w-full p-3 bg-white rounded-xl text-sm font-bold border-transparent focus:border-emerald-500 transition-all"
                       />
                       <input 
                        type="password" 
                        placeholder="CVC" 
                        required
                        className="w-full p-3 bg-white rounded-xl text-sm font-bold border-transparent focus:border-emerald-500 transition-all"
                       />
                    </div>
                    <div className="flex gap-2">
                       <button type="submit" className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200">Save Card</button>
                       <button type="button" onClick={() => setAddingCard(false)} className="px-4 py-3 bg-white text-slate-400 font-bold rounded-xl border border-slate-200">Cancel</button>
                    </div>
                  </motion.form>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="history-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                {transactions.length > 0 ? (
                  transactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${tx.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 tracking-tight">RIDE PAYMENT</div>
                          <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{new Date(tx.createdAt?.seconds * 1000).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-slate-900">₹{tx.amount}</div>
                        <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">{tx.status}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center">
                    <History size={48} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-400 italic">No transactions found</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-8 pt-0 mt-auto">
          <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
             <div className="flex items-center gap-2 text-slate-400">
               <ShieldCheck size={18} className="text-emerald-500" />
               <span className="text-[10px] font-black uppercase tracking-widest">Secure 256-bit SSL Gateway</span>
             </div>
             <div className="flex gap-2">
                <div className="w-6 h-4 bg-slate-300 rounded-sm" />
                <div className="w-6 h-4 bg-slate-300 rounded-sm" />
                <div className="w-6 h-4 bg-slate-300 rounded-sm" />
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
