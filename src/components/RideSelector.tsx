
import React from 'react';
import { motion } from 'motion/react';
import { Bike, Car, Truck, Zap, Users, Clock } from 'lucide-react';
import { RideOption, RideType } from '../types';

const RIDE_OPTIONS: RideOption[] = [
  {
    id: 'bike',
    name: 'Pahadi Bike',
    pricePerKm: 12,
    icon: 'bike',
    capacity: 1,
    eta: '3 min',
  },
  {
    id: 'auto',
    name: 'Auto Rickshaw',
    pricePerKm: 18,
    icon: 'zap',
    capacity: 3,
    eta: '5 min',
  },
  {
    id: 'cab',
    name: 'Pahadi Cab',
    pricePerKm: 25,
    icon: 'car',
    capacity: 4,
    eta: '8 min',
  },
  {
    id: 'luxury',
    name: 'Luxury SUV',
    pricePerKm: 45,
    icon: 'truck',
    capacity: 6,
    eta: '12 min',
  },
];

interface RideSelectorProps {
  selectedRide: RideType;
  onSelect: (ride: RideType) => void;
  distance: number;
  isFloating?: boolean;
}

const RideSelector: React.FC<RideSelectorProps> = ({ selectedRide, onSelect, distance, isFloating }) => {
  if (isFloating) {
    return (
      <div className="flex gap-4 md:flex-row flex-col">
        {RIDE_OPTIONS.map((ride) => (
          <motion.div
            key={ride.id}
            whileHover={{ y: -4 }}
            onClick={() => onSelect(ride.id)}
            className={`flex-1 p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
              selectedRide === ride.id
                ? 'border-emerald-500 bg-white shadow-md'
                : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200'
            }`}
          >
            <span className="text-2xl mb-2">
              {ride.id === 'bike' && '🏍️'}
              {ride.id === 'auto' && '🛺'}
              {ride.id === 'cab' && '🚗'}
              {ride.id === 'luxury' && '🏔️'}
            </span>
            <p className="font-bold text-xs text-slate-800 whitespace-nowrap">{ride.name.split(' ')[0]} {ride.name.split(' ')[1] || ''}</p>
            <p className="text-[10px] font-black text-emerald-500 mt-1 uppercase tracking-tighter">₹{Math.max(50, Math.round(distance * ride.pricePerKm))}</p>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 py-4">
      {/* Fallback for Sidebar if still used there */}
      {RIDE_OPTIONS.map((ride) => (
        <motion.button
          key={ride.id}
          whileHover={{ scale: 1.01 }}
          onClick={() => onSelect(ride.id)}
          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
            selectedRide === ride.id
              ? 'border-emerald-500 bg-emerald-50/20 shadow-sm'
              : 'border-slate-100 hover:border-emerald-100 bg-white'
          }`}
        >
// ... existing internal button content
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${selectedRide === ride.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {ride.id === 'bike' && <Bike size={18} />}
              {ride.id === 'auto' && <Zap size={18} />}
              {ride.id === 'cab' && <Car size={18} />}
              {ride.id === 'luxury' && <Truck size={18} />}
            </div>
            <div className="text-left leading-tight">
              <div className="font-bold text-slate-800 text-sm">{ride.name}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{ride.eta} • {ride.capacity} Seater</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`font-black text-base ${selectedRide === ride.id ? 'text-emerald-600' : 'text-slate-900'}`}>
              ₹{Math.max(50, Math.round(distance * ride.pricePerKm))}
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
};

export default RideSelector;
