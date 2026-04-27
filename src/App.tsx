/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';
import RideSelector from './components/RideSelector';
import Auth from './components/Auth';
import SupportChat from './components/SupportChat';
import { Location, RideType } from './types';
import { GoogleGenAI } from "@google/genai";
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Navigation, Loader2, CheckCircle2, MessageSquare } from 'lucide-react';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Simple Haversine distance calculation
const calculateDistance = (loc1: Location, loc2: Location) => {
  const R = 6371; // km
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [pickup, setPickup] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [distance, setDistance] = useState(0);
  const [travelTip, setTravelTip] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(false);
  const [selectedRide, setSelectedRide] = useState<RideType>('bike');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (pickup && destination) {
      const d = calculateDistance(pickup, destination);
      setDistance(d);
      fetchTravelTip(destination.name);
    } else {
      setDistance(0);
      setTravelTip(null);
    }
  }, [pickup, destination]);

  const fetchTravelTip = async (locationName: string) => {
    setLoadingTip(true);
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a local travel expert in Himachal Pradesh. Give a short, 1-2 sentence travel tip or fun fact about ${locationName} for someone visiting it. Keep it very concise and mountain-themed.`,
      });
      setTravelTip(response.text || null);
    } catch (error) {
      console.error('Error fetching travel tip:', error);
    } finally {
      setLoadingTip(false);
    }
  };

  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [showSupportChat, setShowSupportChat] = useState(false);

  const handleConfirmBooking = async () => {
    if (!user || !pickup || !destination) return;
    setBooking(true);
    try {
      const rideId = Math.random().toString(36).substr(2, 9);
      await addDoc(collection(db, 'rides'), {
        rideId,
        userId: user.uid,
        pickup,
        destination,
        distance,
        price: Math.max(50, Math.round(distance * 25)), // Using cab price for simplicity in logic
        status: 'pending',
        rideType: selectedRide,
        createdAt: serverTimestamp(),
      });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await addDoc(collection(db, 'transactions'), {
        transactionId: 'TX-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        userId: user.uid,
        rideId,
        amount: Math.max(50, Math.round(distance * 25)),
        status: 'success',
        createdAt: serverTimestamp(),
      });

      setBooked(true);
      setTimeout(() => {
        setBooked(false);
        setPickup(null);
        setDestination(null);
      }, 5000);
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setBooking(false);
    }
  };

  const handleLocationUpdate = (p: Location | null, d: Location | null) => {
    setPickup(p);
    setDestination(d);
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center text-white p-6">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="p-4 bg-emerald-500 rounded-2xl mb-4 shadow-2xl shadow-emerald-500/20"
        >
          <Loader2 size={40} />
        </motion.div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-60">Initializing Pahadi Ride...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth onSuccess={() => {}} />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 font-sans overflow-hidden text-slate-900">
      {/* Top Navigation Header */}
      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-8 border-b border-white/10 shrink-0 z-[2000]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-sm flex items-center justify-center transform rotate-45">
            <div className="w-4 h-4 bg-white rounded-full transform -rotate-45"></div>
          </div>
          <span className="text-xl font-bold tracking-tight font-display">PAHADI RIDE</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium opacity-80">
          <a href="#" className="hover:opacity-100 transition-opacity">Support</a>
          <a href="#" className="hover:opacity-100 transition-opacity">My Rides</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Safety</a>
        </nav>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] opacity-60 uppercase tracking-wider font-bold">Current Sector</p>
            <p className="text-sm font-semibold">Shimla, HP</p>
          </div>
          <div className="w-10 h-10 bg-slate-700 rounded-full border-2 border-emerald-500 overflow-hidden shadow-inner flex items-center justify-center">
            <span className="text-xs font-bold">HP</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar onLocationUpdate={handleLocationUpdate} distance={distance} />
        <AnimatePresence>
          {showSupportChat && <SupportChat onClose={() => setShowSupportChat(false)} />}
        </AnimatePresence>

        {/* Support FAB */}
        <button 
          onClick={() => setShowSupportChat(true)}
          className="fixed bottom-6 right-6 z-[2000] p-4 bg-slate-900 text-white rounded-full shadow-2xl hover:scale-110 transition-all group"
        >
          <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
        </button>
        
        <main className="flex-1 relative h-full bg-[#d9e2ec]">
          <MapComponent pickup={pickup} destination={destination} />
          
          {/* Floating Ride Options Bar */}
          <AnimatePresence>
            {pickup && destination && (
              <motion.div 
                initial={{ y: 100, x: '-50%', opacity: 0 }}
                animate={{ y: 0, x: '-50%', opacity: 1 }}
                exit={{ y: 100, x: '-50%', opacity: 0 }}
                className="absolute bottom-10 left-1/2 z-[2000] w-[90%] md:w-auto"
              >
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40 p-4">
                   <RideSelector 
                    selectedRide={selectedRide} 
                    onSelect={setSelectedRide} 
                    distance={distance}
                    isFloating={true}
                  />
                  <div className="mt-4">
                    <button 
                      onClick={handleConfirmBooking}
                      disabled={booking || booked}
                      className={`w-full text-white py-3.5 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${booked ? 'bg-emerald-500 shadow-emerald-200' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'}`}
                    >
                      {booking ? <Loader2 className="animate-spin" size={20} /> : (
                        booked ? <> <CheckCircle2 size={20} /> Ride Booked! </> : `Confirm ${selectedRide.toUpperCase()} Booking`
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Travel Tip Overlay */}
          <AnimatePresence>
            {travelTip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: '-50%', y: -20 }}
                animate={{ opacity: 1, scale: 1, x: '-50%', y: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: '-50%', y: -20 }}
                className="absolute top-8 left-1/2 z-[1500] w-[90%] md:w-auto max-w-[500px]"
              >
                <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-2xl border border-white/10 flex items-start gap-4">
                  <div className="p-2 bg-emerald-500 text-white rounded-lg flex-shrink-0 animate-pulse">
                    <Sparkles size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Local Insight</p>
                      <button onClick={() => setTravelTip(null)} className="text-white/30 hover:text-white transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-sm font-medium leading-relaxed italic opacity-90">
                      "{travelTip}"
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-8 bg-emerald-600 text-white flex items-center px-8 text-[9px] uppercase tracking-[0.2em] font-bold justify-between shrink-0 z-[2000]">
        <div className="hidden sm:block">5,402 Active Pahadi Drivers Across Himachal</div>
        <div className="flex gap-6 mx-auto sm:mx-0">
          <span>Shimla: Clear Skies</span>
          <span className="opacity-60">|</span>
          <span>Manali: High Demand</span>
          <span className="opacity-60">|</span>
          <span>Rohtang: Pass Open</span>
        </div>
      </footer>
    </div>
  );
}
