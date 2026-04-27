
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Search, Navigation, User, ChevronRight, Menu, Bell, History, Settings, HelpCircle, LogOut, Mountain, Map as MapIcon, Compass, Zap, CreditCard, TrendingUp } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Location, RideType } from '../types';
import RideSelector from './RideSelector';
import Payment from './Payment';
import AdminDashboard from './AdminDashboard';
import SupportChat from './SupportChat';

const MOCK_LOCATIONS: Location[] = [
  { name: 'Shimla Mall Road', lat: 31.1048, lng: 77.1734 },
  { name: 'Jakhoo Temple', lat: 31.1051, lng: 77.1852 },
  { name: 'Kufri Nature Park', lat: 31.0967, lng: 77.2728 },
  { name: 'Christ Church', lat: 31.1044, lng: 77.1741 },
  { name: 'Summer Hill', lat: 31.1098, lng: 77.1292 },
  { name: 'Manali Mall Road', lat: 32.2396, lng: 77.1887 },
  { name: 'Solang Valley', lat: 32.3166, lng: 77.1583 },
  { name: 'Rohtang Pass', lat: 32.3716, lng: 77.2466 },
];

interface SidebarProps {
  onLocationUpdate: (pickup: Location | null, destination: Location | null) => void;
  distance: number;
}

const Sidebar: React.FC<SidebarProps> = ({ onLocationUpdate, distance }) => {
  const [pickup, setPickup] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [selectedRide, setSelectedRide] = useState<RideType>('bike');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeInput, setActiveInput] = useState<'pickup' | 'destination' | null>(null);
  const [showPayments, setShowPayments] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const currentUser = auth.currentUser;

  const filteredLocations = MOCK_LOCATIONS.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLocation = (loc: Location) => {
    if (activeInput === 'pickup') {
      setPickup(loc);
      onLocationUpdate(loc, destination);
    } else {
      setDestination(loc);
      onLocationUpdate(pickup, loc);
    }
    setActiveInput(null);
    setSearchQuery('');
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const isAdmin = currentUser?.email === "vansh61924@gmail.com";

  const menuItems = [
    ...(isAdmin ? [{ icon: TrendingUp, label: 'Admin Panel', onClick: () => { setShowAdmin(true); setIsMenuOpen(false); } }] : []),
    { icon: CreditCard, label: 'Payments', onClick: () => { setShowPayments(true); setIsMenuOpen(false); } },
    { icon: History, label: 'Your Rides', onClick: () => {} },
    { icon: Bell, label: 'Notifications', onClick: () => {} },
    { icon: Settings, label: 'Settings', onClick: () => {} },
    { icon: HelpCircle, label: 'Support', onClick: () => { setShowSupport(true); setIsMenuOpen(false); } },
    { icon: LogOut, label: 'Logout', onClick: handleLogout },
  ];

  return (
    <div className="w-full md:w-80 h-full flex flex-col bg-white border-r border-slate-200 z-[1000] relative">
      <AnimatePresence>
        {showPayments && <Payment onClose={() => setShowPayments(false)} />}
        {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
        {showSupport && <SupportChat onClose={() => setShowSupport(false)} />}
      </AnimatePresence>
      
      {/* Sidebar Content */}
      <div className="p-6 shrink-0">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1 font-display tracking-tight text-slate-900">Where to?</h1>
            <p className="text-slate-400 text-sm italic font-medium">Connecting the hills, one ride at a time.</p>
          </div>
        </div>

        {/* Input Card Updated */}
        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-500 rounded-full"></div>
            <input
              type="text"
              placeholder="Enter pickup..."
              value={activeInput === 'pickup' ? searchQuery : (pickup?.name || '')}
              onFocus={() => setActiveInput('pickup')}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
              id="pickup-input"
            />
          </div>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-sm"></div>
            <input
              type="text"
              placeholder="Search destination..."
              value={activeInput === 'destination' ? searchQuery : (destination?.name || '')}
              onFocus={() => setActiveInput('destination')}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
              id="destination-input"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 hide-scrollbar pb-6">
        <AnimatePresence mode="wait">
          {activeInput ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-2 space-y-2"
            >
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Suggestions</h3>
              {filteredLocations.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => handleSelectLocation(loc)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all group border border-transparent hover:border-slate-100"
                  id={`suggestion-${loc.name}`}
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                    <MapIcon size={14} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm text-slate-600 group-hover:text-emerald-600">{loc.name}</div>
                    <div className="text-[9px] text-slate-400 uppercase font-black tracking-wider">HIMACHAL PROVINCE</div>
                  </div>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-2"
            >
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-3">Saved Places</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-50/50 rounded-md text-blue-600 shadow-sm">🏠</div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Home</p>
                    <p className="text-xs text-slate-400 font-medium">Jakhoo Temple Rd, Shimla</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                  <div className="w-10 h-10 flex items-center justify-center bg-purple-50/50 rounded-md text-purple-600 shadow-sm">💼</div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Work</p>
                    <p className="text-xs text-slate-400 font-medium">HP Secretariat, Shimla</p>
                  </div>
                </div>
              </div>
              
              {!pickup && !destination && (
                <div className="mt-12 flex flex-col items-center text-center px-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 transform rotate-6 border border-slate-100">
                    <Compass size={32} className="text-slate-200" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500 leading-relaxed italic">
                    Ready to explore the hills? <br/>Pin your pickup to start.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Menu / Safety Toggle */}
      <div className="p-6 pt-0">
         <button 
          onClick={() => setIsMenuOpen(true)}
          className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:border-emerald-200 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 group-hover:text-emerald-500 transition-colors">
              <Menu size={16} />
            </div>
            <span className="text-sm font-bold text-slate-600">Account & Safety</span>
          </div>
          <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Slideout Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1100]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 w-80 h-full bg-white z-[1200] shadow-2xl p-8"
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200">
                  <User size={32} className="text-slate-300" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{currentUser?.displayName || 'Pahadi User'}</h3>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold uppercase tracking-wider">
                    <Zap size={10} className="fill-current" /> Gold Member
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {menuItems.map((item) => (
                  <button 
                    key={item.label} 
                    onClick={item.onClick}
                    className="w-full flex items-center gap-4 text-slate-600 hover:text-emerald-600 transition-colors group"
                  >
                    <item.icon size={20} className="opacity-70 group-hover:opacity-100" />
                    <span className="font-semibold">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="absolute bottom-8 left-8 right-8 text-center">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.email}</p>
                 </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Exclusive Offer</p>
                  <p className="text-xs font-bold text-slate-700 leading-normal">Invite a friend to Pahadi Ride and get 50% off on your next trip to Manali!</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sidebar;
