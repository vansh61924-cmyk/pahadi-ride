import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, Car, IndianRupee, TrendingUp, Filter, Download, 
  ArrowUpRight, ArrowDownRight, Calendar, UserCheck, MapPin, X, Loader2
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRiders: 0,
    totalPassengers: 0,
    totalRides: 0,
    totalRevenue: 0,
    activeRides: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentRides, setRecentRides] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch Users
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs.map(doc => doc.data());
      const riders = users.filter((u: any) => u.role === 'rider');
      const passengers = users.filter((u: any) => u.role === 'passenger');

      // Fetch Rides
      const ridesSnap = await getDocs(collection(db, 'rides'));
      const rides = ridesSnap.docs.map(doc => doc.data());

      // Fetch Transactions
      const txSnap = await getDocs(collection(db, 'transactions'));
      const txs = txSnap.docs.map(doc => doc.data());
      const revenue = txs.reduce((sum, tx: any) => sum + (tx.amount || 0), 0);

      // Process Stats
      setStats({
        totalUsers: users.length,
        totalRiders: riders.length,
        totalPassengers: passengers.length,
        totalRides: rides.length,
        totalRevenue: revenue,
        activeRides: rides.filter((r: any) => r.status === 'active' || r.status === 'pending').length
      });

      // Recent Activity
      setRecentUsers(users.slice(-5).reverse());
      setRecentRides(rides.slice(-5).reverse());

      // Mock Chart Data (Grouped by Day - in a real app you'd query this)
      const mockChart = [
        { name: 'Mon', rides: 12, revenue: 2400 },
        { name: 'Tue', rides: 19, revenue: 3800 },
        { name: 'Wed', rides: 15, revenue: 3100 },
        { name: 'Thu', rides: 22, revenue: 4500 },
        { name: 'Fri', rides: 30, revenue: 6200 },
        { name: 'Sat', rides: 45, revenue: 9500 },
        { name: 'Sun', rides: 38, revenue: 8100 },
      ];
      setChartData(mockChart);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444'];

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between">
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-[10px] font-bold ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            <span>{Math.abs(trend)}% from last week</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 ${color.replace('bg-', 'text-')}`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-6xl h-[90vh] bg-slate-50 rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <header className="bg-white p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-slate-900 text-white rounded-lg">
                <Users size={18} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">Pahadi Insights</h1>
            </div>
            <p className="text-sm text-slate-500">Overall report and management console</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={fetchAdminData} className="p-3 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors">
               <Calendar size={18} />
             </button>
             <button onClick={onClose} className="p-3 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200 transition-colors">
               <X size={20} />
             </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 hide-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="animate-spin text-emerald-500" size={40} />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Revenue" 
                  value={`₹${stats.totalRevenue.toLocaleString()}`} 
                  icon={IndianRupee} 
                  trend={12} 
                  color="bg-emerald-500" 
                />
                <StatCard 
                  title="Total Rides" 
                  value={stats.totalRides} 
                  icon={Car} 
                  trend={8} 
                  color="bg-blue-500" 
                />
                <StatCard 
                  title="Active Users" 
                  value={stats.totalUsers} 
                  icon={Users} 
                  trend={-2} 
                  color="bg-amber-500" 
                />
                <StatCard 
                  title="Live Rides" 
                  value={stats.activeRides} 
                  icon={TrendingUp} 
                  color="bg-rose-500" 
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="font-black text-slate-900 font-display">Revenue Growth</h3>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 7 Days</div>
                   </div>
                   <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#10b981" 
                            strokeWidth={4} 
                            dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                            activeDot={{ r: 8 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-100">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="font-black text-slate-900 font-display">User Distribution</h3>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role Breakdown</div>
                   </div>
                   <div className="h-[300px] flex items-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Riders', value: stats.totalRiders },
                              { name: 'Passengers', value: stats.totalPassengers },
                            ]}
                            innerRadius={80}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell key="riders" fill="#10b981" />
                            <Cell key="passengers" fill="#6366f1" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-4 pr-8">
                         <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <div className="text-xs font-bold text-slate-600">Riders ({stats.totalRiders})</div>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-indigo-500" />
                            <div className="text-xs font-bold text-slate-600">Passengers ({stats.totalPassengers})</div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Data Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
                <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
                   <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-black text-slate-900 font-display">New Registrations</h3>
                      <button className="text-xs font-bold text-emerald-600">View All</button>
                   </div>
                   <div className="divide-y divide-slate-50">
                      {recentUsers.map((user: any) => (
                        <div key={user.uid} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${user.role === 'rider' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                {user.displayName?.charAt(0) || 'U'}
                              </div>
                              <div>
                                 <div className="text-sm font-bold text-slate-900">{user.displayName}</div>
                                 <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{user.role} • {user.email}</div>
                              </div>
                           </div>
                           <div className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full uppercase">Verified</div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
                   <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-black text-slate-900 font-display">Recent Rides</h3>
                      <button className="text-xs font-bold text-emerald-600">Live Map</button>
                   </div>
                   <div className="divide-y divide-slate-50">
                      {recentRides.map((ride: any) => (
                        <div key={ride.rideId} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                                 <Car size={18} />
                              </div>
                              <div>
                                 <div className="text-sm font-bold text-slate-900">{ride.pickup.name} → {ride.destination.name}</div>
                                 <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">#{ride.rideId} • ₹{ride.price}</div>
                              </div>
                           </div>
                           <div className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${ride.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                             {ride.status}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <footer className="p-8 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">System Operational</span>
              </div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">Last Backup: 5 mins ago</div>
           </div>
           <div className="flex gap-2">
              <button className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center gap-2">
                 <Download size={16} /> Export CSV
              </button>
              <button className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
                 System Logs
              </button>
           </div>
        </footer>
      </motion.div>
    </div>
  );
}
