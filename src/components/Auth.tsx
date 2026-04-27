import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Mountain, ArrowRight, Loader2, AlertCircle, Car, Shield, Bike } from 'lucide-react';

interface AuthProps {
  onSuccess: () => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'passenger' | 'rider'>('passenger');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (showReset) {
        await sendPasswordResetEmail(auth, email);
        setResetSent(true);
      } else if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        onSuccess();
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(user, { displayName });
        
        // Create user doc in Firestore
        const userDoc: any = {
          uid: user.uid,
          email: user.email,
          displayName,
          role,
          createdAt: serverTimestamp(),
        };

        if (role === 'rider') {
          userDoc.vehicleNumber = vehicleNumber;
          userDoc.vehicleType = vehicleType;
        }

        await setDoc(doc(db, 'users', user.uid), userDoc);
        
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1544256718-3bcf237f3974?ixlib=rb-4.0.3&auto=format&fit=crop&w=2671&q=80')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="p-8 pb-4 text-center">
          <div className="inline-flex p-4 bg-emerald-500 rounded-2xl text-white mb-6 shadow-xl shadow-emerald-500/20">
            <Mountain size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 font-display tracking-tight">
            {showReset ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Join Pahadi Ride')}
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            {showReset 
              ? 'Enter your email to receive a reset link' 
              : (isLogin ? 'Login to continue your journey' : 'Himachal\'s local ride sharing app')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && !showReset && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {/* Role Toggle */}
                <div className="flex bg-slate-50 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setRole('passenger')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${role === 'passenger' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <User size={16} /> Passenger
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('rider')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${role === 'rider' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Car size={16} /> Rider / Driver
                  </button>
                </div>

                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>

                {role === 'rider' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Vehicle Number (e.g. HP 01 A 1234)"
                        required
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setVehicleType('car')}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${vehicleType === 'car' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-500'}`}
                      >
                        <Car size={20} />
                        <span className="font-bold text-xs uppercase tracking-wider">Car / Cab</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVehicleType('bike')}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${vehicleType === 'bike' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-500'}`}
                      >
                        <Bike size={20} />
                        <span className="font-bold text-xs uppercase tracking-wider">Bike / Scooter</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium"
            />
          </div>

          {!showReset && (
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium"
              />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">
              <AlertCircle size={14} className="mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resetSent && (
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold">
              Reset email sent! Check your inbox.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                {showReset ? 'Send Link' : (isLogin ? 'Login' : 'Sign Up')}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="flex flex-col gap-2 pt-2 text-center">
            {!showReset && (
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-slate-500 hover:text-emerald-600 font-medium transition-colors"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setShowReset(!showReset);
                setResetSent(false);
                setError(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
            >
              {showReset ? 'Back to Login' : 'Forgot Password?'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
