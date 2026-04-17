/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  MessageSquare, 
  TrendingUp, 
  Store, 
  AlertTriangle, 
  AlertCircle,
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Camera,
  Sparkles, 
  Send, 
  LogOut, 
  CreditCard, 
  Clock,
  Menu,
  X,
  ClipboardList,
  Truck,
  Utensils,
  Star,
  Zap,
  Users,
  Target,
  Shield,
  Heart,
  Map as MapIcon,
  Navigation,
  Globe,
  Activity,
  Award,
  Zap as ZapIcon,
  Hexagon
} from 'lucide-react';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
import { 
  BarChart, 
  ComposedChart,
  Line,
  Area,
  Legend,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import ReactMarkdown from 'react-markdown';

// --- Types ---
interface Outlet {
  id: string;
  name: string;
  location: string;
  revenue: number;
  churnRate: number;
  atRiskCustomers: number;
  lat: number;
  lng: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
  imageUrls: string[];
  margin: number;
  outreach: number;
  unitsSold: number;
  outletIds: string[];
}

interface Subscription {
  uid: string;
  plan: 'free_trial' | 'premium';
  trialEndsAt: string;
  isActive: boolean;
}

interface InventoryItem {
  id: string;
  name: string;
  stockLevel: number;
  unit: string;
  outletId: string;
}

interface Dealer {
  id: string;
  name: string;
  category: string;
  contact: string;
  rating: number;
}

interface Review {
  id: string;
  type: 'outlet' | 'product';
  targetId: string;
  rating: number;
  comment: string;
  date: string;
}

interface MenuInnovation {
  id: string;
  name: string;
  category: string;
  description: string;
  estimatedMargin: number;
  status: 'suggested' | 'testing' | 'approved';
}

interface Customer {
  id: string;
  email: string;
  churnProbability: number;
  lastVisit: string;
  totalSpend: number;
}

// --- Mock Data ---
const MOCK_OUTLETS: Outlet[] = [
  { id: '1', name: 'Koramangala', location: 'Bangalore', revenue: 420000, churnRate: 8.3, atRiskCustomers: 341, lat: 12.9345, lng: 77.6101 },
  { id: '2', name: 'Indiranagar', location: 'Bangalore', revenue: 380000, churnRate: 4.8, atRiskCustomers: 120, lat: 12.9719, lng: 77.6412 },
  { id: '3', name: 'Whitefield', location: 'Bangalore', revenue: 290000, churnRate: 3.1, atRiskCustomers: 85, lat: 12.9698, lng: 77.7500 },
  { id: '4', name: 'Bandra West', location: 'Mumbai', revenue: 550000, churnRate: 5.2, atRiskCustomers: 180, lat: 19.0596, lng: 72.8295 },
  { id: '5', name: 'Colaba', location: 'Mumbai', revenue: 480000, churnRate: 2.1, atRiskCustomers: 60, lat: 19.0176, lng: 72.8561 },
  { id: '6', name: 'T Nagar', location: 'Chennai', revenue: 320000, churnRate: 4.5, atRiskCustomers: 110, lat: 13.0396, lng: 80.2335 },
  { id: '7', name: 'Adyar', location: 'Chennai', revenue: 280000, churnRate: 3.8, atRiskCustomers: 95, lat: 13.0012, lng: 80.2565 },
];

const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Artisan Cold Brew', category: 'Beverages', imageUrl: 'https://picsum.photos/seed/coldbrew/400/400', imageUrls: ['https://picsum.photos/seed/cold1/400/400', 'https://picsum.photos/seed/cold2/400/400', 'https://picsum.photos/seed/cold3/400/400'], margin: 78, outreach: 85, unitsSold: 1200, outletIds: ['1', '2', '3', '4', '5'] },
  { id: 'p2', name: 'Dark Roast Bundle', category: 'Bundles', imageUrl: 'https://picsum.photos/seed/darkroast/400/400', imageUrls: ['https://picsum.photos/seed/dark1/400/400', 'https://picsum.photos/seed/dark2/400/400'], margin: 71, outreach: 65, unitsSold: 450, outletIds: ['1', '2', '4'] },
  { id: 'p3', name: 'Oat Milk Latte', category: 'Beverages', imageUrl: 'https://picsum.photos/seed/latte/400/400', imageUrls: ['https://picsum.photos/seed/latte1/400/400', 'https://picsum.photos/seed/latte2/400/400', 'https://picsum.photos/seed/latte3/400/400'], margin: 64, outreach: 92, unitsSold: 2100, outletIds: ['1', '2', '3', '4', '5'] },
  { id: 'p4', name: 'Hazelnut Croissant', category: 'Bakery', imageUrl: 'https://picsum.photos/seed/croissant/400/400', imageUrls: ['https://picsum.photos/seed/cross1/400/400', 'https://picsum.photos/seed/cross2/400/400'], margin: 38, outreach: 75, unitsSold: 800, outletIds: ['1', '2', '4'] },
  { id: 'p5', name: 'Matcha Green Tea', category: 'Beverages', imageUrl: 'https://picsum.photos/seed/matcha/400/400', imageUrls: ['https://picsum.photos/seed/matcha1/400/400', 'https://picsum.photos/seed/matcha2/400/400'], margin: 82, outreach: 45, unitsSold: 300, outletIds: ['2', '3'] },
];

const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Coffee Beans (Arabica)', stockLevel: 45, unit: 'kg', outletId: '1' },
  { id: 'i2', name: 'Whole Milk', stockLevel: 120, unit: 'L', outletId: '1' },
  { id: 'i3', name: 'Oat Milk', stockLevel: 30, unit: 'L', outletId: '1' },
  { id: 'i4', name: 'Sugar Syrup', stockLevel: 15, unit: 'L', outletId: '1' },
];

const MOCK_DEALERS: Dealer[] = [
  { id: 'd1', name: 'Estate Direct Coffee', category: 'Coffee', contact: '+91 98765 43210', rating: 4.8 },
  { id: 'd2', name: 'Dairy Fresh Co.', category: 'Dairy', contact: '+91 98765 43211', rating: 4.5 },
  { id: 'd3', name: 'Bakers Hub', category: 'Bakery Supplies', contact: '+91 98765 43212', rating: 4.2 },
];

const MOCK_REVIEWS: Review[] = [
  { id: 'r1', type: 'outlet', targetId: '1', rating: 5, comment: 'Best cold brew in Koramangala!', date: '2026-03-20T10:00:00Z' },
  { id: 'r2', type: 'product', targetId: 'p3', rating: 4, comment: 'Oat milk latte is super creamy.', date: '2026-03-21T14:30:00Z' },
  { id: 'r3', type: 'outlet', targetId: '2', rating: 3, comment: 'Service was a bit slow today.', date: '2026-03-22T09:15:00Z' },
];

const MOCK_INNOVATIONS: MenuInnovation[] = [
  { id: 'm1', name: 'Avocado Toast with Dukkah', category: 'Breakfast', description: 'Creamy avocado on sourdough with Egyptian spice mix.', estimatedMargin: 65, status: 'suggested' },
  { id: 'm2', name: 'Turmeric Latte', category: 'Beverages', description: 'Golden milk with honey and black pepper.', estimatedMargin: 85, status: 'testing' },
];

const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', email: 'aditya.sharma@example.com', churnProbability: 0.15, lastVisit: '2026-03-24T18:30:00Z', totalSpend: 12500 },
  { id: 'c2', email: 'priya.nair@example.com', churnProbability: 0.85, lastVisit: '2026-02-15T12:00:00Z', totalSpend: 8400 },
  { id: 'c3', email: 'vikram.seth@example.com', churnProbability: 0.45, lastVisit: '2026-03-10T15:45:00Z', totalSpend: 3200 },
  { id: 'c4', email: 'ananya.rao@example.com', churnProbability: 0.05, lastVisit: '2026-03-25T09:00:00Z', totalSpend: 1500 },
  { id: 'c5', email: 'karan.jain@example.com', churnProbability: 0.92, lastVisit: '2026-02-01T11:20:00Z', totalSpend: 500 },
  { id: 'c6', email: 'sneha.patel@example.com', churnProbability: 0.28, lastVisit: '2026-03-22T14:10:00Z', totalSpend: 9800 },
  { id: 'c7', email: 'rahul.das@example.com', churnProbability: 0.65, lastVisit: '2026-03-05T16:30:00Z', totalSpend: 11000 },
  { id: 'c8', email: 'ishita.gupta@example.com', churnProbability: 0.12, lastVisit: '2026-03-24T10:40:00Z', totalSpend: 4500 },
];

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab, user, isOpen, setIsOpen }: { activeTab: string, setActiveTab: (t: string) => void, user: User | null, isOpen: boolean, setIsOpen: (o: boolean) => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: ClipboardList },
    { id: 'dealers', label: 'Dealers', icon: Truck },
    { id: 'innovation', label: 'Innovation', icon: Utensils },
    { id: 'reviews', label: 'Feedback', icon: Star },
    { id: 'assistant', label: 'Strategy AI', icon: MessageSquare },
    { id: 'trends', label: 'Market', icon: TrendingUp },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-brand/20 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`
        w-64 bg-white border-r border-border h-screen flex flex-col p-8 fixed left-0 top-0 z-[70] transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <Hexagon size={40} strokeWidth={1.5} className="text-brand absolute inset-0" />
              <Utensils size={18} className="text-accent absolute z-10" />
            </div>
            <div>
              <h1 className="text-xl font-black text-brand tracking-tighter uppercase leading-none">RetailX</h1>
              <span className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Global</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-muted p-1 rounded-md hover:bg-paper">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded transition-all duration-150 text-sm font-medium ${
                activeTab === item.id 
                  ? 'bg-paper text-brand border-l-2 border-brand' 
                  : 'text-muted hover:text-brand hover:bg-paper/50'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-border">
          <div className="flex items-center gap-3 mb-6">
            <img 
              src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
              className="w-9 h-9 rounded-full border border-border"
              alt="Profile"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-brand truncate">{user?.displayName || 'User'}</p>
              <p className="text-[10px] text-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-3 px-4 py-2 text-muted hover:text-rose-600 transition-all rounded text-xs font-medium"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

const StatCard = ({ title, value, change, isPositive, icon: Icon, onClick }: any) => (
  <motion.div 
    onClick={onClick}
    whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative bg-white p-6 rounded-2xl shadow-sm border border-border flex flex-col gap-4 overflow-hidden group cursor-pointer"
  >
    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
      <Icon size={120} />
    </div>
    <div className="flex justify-between items-start relative z-10">
      <div className="w-10 h-10 rounded-xl bg-paper flex items-center justify-center text-brand">
        <Icon size={20} />
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {change}%
      </div>
    </div>
    <div className="relative z-10">
      <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">{title}</p>
      <h3 className="text-3xl font-black text-brand mt-1 tracking-tighter">{value}</h3>
    </div>
  </motion.div>
);

const StoreMap = ({ outlets }: { outlets: Outlet[] }) => {
  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-sm border border-border bg-paper relative z-0">
      <MapContainer 
        center={[15.3, 76.0]} 
        zoom={6} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {outlets.map((outlet) => (
          <Marker key={outlet.id} position={[outlet.lat, outlet.lng]}>
            <Popup>
              <div className="p-1">
                <h4 className="font-bold text-brand leading-none mb-1 text-sm">{outlet.name}</h4>
                <p className="text-[10px] text-muted font-medium mb-2">{outlet.location}</p>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-[8px] text-muted font-bold uppercase tracking-widest leading-none">Revenue</p>
                    <p className="text-xs font-black text-brand leading-none mt-0.5">₹{(outlet.revenue / 100000).toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-muted font-bold uppercase tracking-widest leading-none">Churn</p>
                    <p className="text-xs font-black text-rose-600 leading-none mt-0.5">{outlet.churnRate}%</p>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

const ChurnDashboard = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const renderModalContent = () => {
    if (activeModal === 'revenue') {
      const totalRev = MOCK_OUTLETS.reduce((sum, o) => sum + o.revenue, 0);
      const totalCost = totalRev * 0.58; // Mock 58% OPEX
      const totalProfit = totalRev - totalCost;

      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-paper p-6 rounded-2xl border border-border">
              <p className="text-[10px] text-muted font-bold tracking-widest uppercase mb-1">Gross Revenue</p>
              <p className="text-3xl font-black text-brand tracking-tighter">₹{(totalRev/100000).toFixed(1)}L</p>
            </div>
            <div className="bg-paper p-6 rounded-2xl border border-border">
              <p className="text-[10px] text-muted font-bold tracking-widest uppercase mb-1">Operating Costs</p>
              <p className="text-3xl font-black text-rose-600 tracking-tighter">₹{(totalCost/100000).toFixed(1)}L</p>
            </div>
            <div className="bg-brand p-6 rounded-2xl border border-brand text-white">
              <p className="text-[10px] text-white/50 font-bold tracking-widest uppercase mb-1">Net Profit</p>
              <p className="text-3xl font-black tracking-tighter">₹{(totalProfit/100000).toFixed(1)}L</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-paper border-b border-border">
                <tr>
                  <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Store Location</th>
                  <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Gross Rev</th>
                  <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Est. OPEX</th>
                  <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_OUTLETS.map(outlet => {
                  const oCost = outlet.revenue * 0.58;
                  const oProfit = outlet.revenue - oCost;
                  return (
                    <tr key={outlet.id} className="hover:bg-paper/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-brand text-sm">{outlet.name}</p>
                        <p className="text-[10px] text-muted">{outlet.location}</p>
                      </td>
                      <td className="p-4 text-right font-medium text-sm">₹{outlet.revenue.toLocaleString()}</td>
                      <td className="p-4 text-right font-medium text-sm text-rose-600">₹{oCost.toLocaleString()}</td>
                      <td className="p-4 text-right font-bold text-sm text-brand">₹{oProfit.toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeModal === 'churn') {
      const sortedOutlets = [...MOCK_OUTLETS].sort((a,b) => b.churnRate - a.churnRate);
      const totalAtRisk = MOCK_OUTLETS.reduce((sum, o) => sum + o.atRiskCustomers, 0);
      const avgChurn = (MOCK_OUTLETS.reduce((sum, o) => sum + o.churnRate, 0) / MOCK_OUTLETS.length).toFixed(1);

      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-gradient-to-br from-rose-500 to-rose-700 p-8 rounded-3xl text-white relative overflow-hidden shadow-lg shadow-rose-500/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 text-rose-100">
                  <AlertTriangle size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Critical Alert</span>
                </div>
                <h4 className="text-2xl font-black mb-2 leading-tight">Koramangala requires immediate intervention.</h4>
                <p className="text-rose-100 text-sm leading-relaxed max-w-md">Localized pricing competition is driving up attrition. Deploy targeted 14-day re-engagement campaigns immediately to mitigate projected losses.</p>
                <button className="mt-6 bg-white shrink-0 text-rose-600 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-50 transition-colors shadow-sm active:scale-95">
                  Deploy Campaign
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="bg-paper p-6 rounded-3xl border border-border flex-1 flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-5 text-brand group-hover:scale-110 transition-transform duration-500">
                  <Heart size={100} />
                </div>
                <p className="text-[10px] text-muted font-bold tracking-widest uppercase mb-1 relative z-10">Total At-Risk Profiles</p>
                <div className="flex items-baseline gap-2 relative z-10">
                  <p className="text-4xl font-black text-brand tracking-tighter">{totalAtRisk}</p>
                  <TrendingUp size={16} className="text-rose-500" />
                </div>
              </div>
              <div className="bg-surface p-6 rounded-3xl border border-border flex-1 flex flex-col justify-center shadow-sm relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-5 text-rose-600 group-hover:scale-110 transition-transform duration-500">
                  <Activity size={100} />
                </div>
                <p className="text-[10px] text-muted font-bold tracking-widest uppercase mb-1 relative z-10">Network Avg Churn</p>
                <p className="text-4xl font-black text-rose-600 tracking-tighter relative z-10">{avgChurn}%</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-4 px-2">Risk Distribution by Outlet</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedOutlets.map((outlet, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={outlet.id} 
                  className="p-5 border border-border rounded-2xl bg-white hover:shadow-md transition-all group relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${outlet.churnRate > 6 ? 'bg-rose-500' : outlet.churnRate > 4 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <div className="flex justify-between items-start mb-4 pl-2">
                    <div>
                      <p className="font-black text-brand text-base">{outlet.name}</p>
                      <p className="text-[10px] text-muted font-medium uppercase tracking-wider">{outlet.location}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-xl font-black tracking-tighter ${outlet.churnRate > 6 ? 'text-rose-600' : outlet.churnRate > 4 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {outlet.churnRate}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pl-2">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
                        <span className="text-muted">Current Trajectory</span>
                        <span className={outlet.churnRate > 6 ? 'text-rose-600' : outlet.churnRate > 4 ? 'text-amber-500' : 'text-emerald-500'}>
                          {outlet.churnRate > 6 ? 'Critical' : outlet.churnRate > 4 ? 'Elevated' : 'Stable'}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-paper rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(outlet.churnRate * 10, 100)}%` }}
                          transition={{ duration: 1, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                          className={`h-full rounded-full ${outlet.churnRate > 6 ? 'bg-gradient-to-r from-rose-400 to-rose-600' : outlet.churnRate > 4 ? 'bg-gradient-to-r from-amber-300 to-amber-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'}`}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-between items-center">
                       <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
                         <span className="text-ink text-sm mr-1">{outlet.atRiskCustomers}</span> At Risk
                       </p>
                       <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-accent uppercase tracking-widest flex items-center gap-1 hover:text-brand">
                         Action <ArrowUpRight size={12}/>
                       </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeModal === 'atRisk') {
      const highRisk = MOCK_CUSTOMERS.filter(c => c.churnProbability > 0.5).sort((a,b) => b.totalSpend - a.totalSpend);
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-sm text-muted">Showing top high-value customers with &gt;50% churn probability.</p>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-paper border-b border-border">
                <tr>
                  <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Customer Profile</th>
                  <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest text-center">Risk Score</th>
                  <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">LTV (Spend)</th>
                  <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {highRisk.map(cust => (
                  <tr key={cust.id} className="hover:bg-paper/50 transition-colors">
                    <td className="p-4 text-sm font-medium">{cust.email}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-paper rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${cust.churnProbability * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-rose-600">{Math.round(cust.churnProbability * 100)}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-right font-bold text-sm">₹{cust.totalSpend}</td>
                    <td className="p-4 text-right">
                      <button className="text-[10px] uppercase tracking-wider font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-md hover:bg-accent hover:text-white transition-colors">Send Offer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeModal === 'margin') {
      const topProducts = [...MOCK_PRODUCTS].sort((a,b) => b.margin - a.margin);
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topProducts.map(product => (
              <div key={product.id} className="bg-white border border-border rounded-xl p-4 flex gap-4 items-center">
                <div className="w-12 h-12 rounded-lg bg-paper overflow-hidden shrink-0 border border-border">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand">{product.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-brand text-white px-2 py-0.5 rounded font-black">{product.margin}% Margin</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return null;
  };

  const modalTitles: Record<string, string> = {
    revenue: 'Financial Balance Sheet',
    churn: 'Churn Risk Breakdown',
    atRisk: 'At-Risk Customer Registry',
    margin: 'Product Margin Analysis'
  };

  return (
    <>
      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Revenue" value="₹4.2L" change="12" isPositive={true} icon={TrendingUp} onClick={() => setActiveModal('revenue')} />
          <StatCard title="Churn Rate" value="8.3%" change="2.1" isPositive={false} icon={AlertTriangle} onClick={() => setActiveModal('churn')} />
          <StatCard title="At-Risk" value="341" change="5" isPositive={false} icon={Store} onClick={() => setActiveModal('atRisk')} />
          <StatCard title="Avg Margin" value="62%" change="4.5" isPositive={true} icon={Package} onClick={() => setActiveModal('margin')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-2xl shadow-sm border border-border relative overflow-hidden group"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors" />
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-sm font-bold text-brand uppercase tracking-widest">Churn Risk by Outlet</h3>
              <button className="text-accent text-xs font-bold flex items-center gap-1 hover:underline">
                Full Report <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-8">
              {MOCK_OUTLETS.map((outlet) => (
                <div key={outlet.id} className="space-y-3">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-bold text-brand">{outlet.name}</span>
                    <span className={`font-black ${outlet.churnRate > 6 ? 'text-rose-600' : outlet.churnRate > 4 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {outlet.churnRate}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-paper rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${outlet.churnRate * 10}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${outlet.churnRate > 6 ? 'bg-rose-500' : outlet.churnRate > 4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-2xl shadow-sm border border-border relative overflow-hidden group"
        >
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand/5 rounded-full blur-3xl group-hover:bg-brand/10 transition-colors" />
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-sm font-bold text-brand uppercase tracking-widest">Store Performance Matrix</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-1 bg-brand rounded-full" />
                  <span className="text-[9px] font-bold text-muted uppercase tracking-widest">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-1 bg-rose-500 rounded-full" />
                  <span className="text-[9px] font-bold text-muted uppercase tracking-widest">Churn Risk</span>
                </div>
              </div>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={MOCK_OUTLETS} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} 
                  />
                  <YAxis 
                    yAxisId="left"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    tickFormatter={(val) => `₹${val/1000}K`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#F43F5E', fontSize: 10, fontWeight: 700 }}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(8px)',
                      fontSize: '11px'
                    }}
                    itemStyle={{ fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="revenue" 
                    radius={[10, 10, 0, 0]} 
                    barSize={44}
                    fill="url(#barGradient)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="churnRate" 
                    stroke="#F43F5E" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#F43F5E', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-brand uppercase tracking-widest">Global Store Network</h3>
            <p className="text-[10px] text-muted font-bold mt-1 uppercase tracking-widest">Live status of active outlets across India</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-muted uppercase tracking-widest">Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[9px] font-bold text-muted uppercase tracking-widest">High Churn</span>
            </div>
          </div>
        </div>
        <div className="h-[450px]">
          <StoreMap outlets={MOCK_OUTLETS} />
        </div>
      </motion.div>

      {/* New Suggestions and Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-sm border border-border"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-brand uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-accent" /> AI Suggestions
            </h3>
            <button className="text-[10px] text-muted font-bold uppercase hover:text-brand transition-colors">View All</button>
          </div>
          <div className="space-y-4">
            {MOCK_INNOVATIONS.slice(0, 3).map(innovation => (
              <div key={innovation.id} className="p-4 rounded-xl border border-border bg-paper/50 hover:bg-paper transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-brand text-sm">{innovation.name}</h4>
                  <span className={`text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-sm ${innovation.status === 'suggested' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {innovation.status}
                  </span>
                </div>
                <p className="text-xs text-muted mb-3">{innovation.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1">
                    <TrendingUp size={12} className="text-emerald-500" /> +{innovation.estimatedMargin}% Margin
                  </span>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] uppercase font-bold text-accent flex items-center gap-1">
                    Implement <ArrowUpRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-2xl shadow-sm border border-border"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-brand uppercase tracking-widest flex items-center gap-2">
              <Star size={16} className="text-emerald-500" /> Recent Product Reviews
            </h3>
            <button className="text-[10px] text-muted font-bold uppercase hover:text-brand transition-colors">Analyze</button>
          </div>
          <div className="space-y-4">
            {MOCK_REVIEWS.filter(r => r.type === 'product').map(review => {
              const product = MOCK_PRODUCTS.find(p => p.id === review.targetId);
              return (
                <div key={review.id} className="p-4 rounded-xl border border-border bg-paper/50 flex gap-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border">
                    <img src={product?.imageUrl || 'https://picsum.photos/seed/coffee/100/100'} alt="Product" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-brand text-sm">{product?.name || 'Product'}</h4>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < review.rating ? 'fill-current' : 'text-border'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">"{review.comment}"</p>
                    <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-2">
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {/* Added an extra mock review to fill space since there's only one in MOCK_REVIEWS */}
            <div className="p-4 rounded-xl border border-border bg-paper/50 flex gap-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border">
                <img src={MOCK_PRODUCTS[0]?.imageUrl} alt="Product" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-brand text-sm">{MOCK_PRODUCTS[0]?.name}</h4>
                  <div className="flex text-amber-400">
                    <Star size={12} className="fill-current" />
                    <Star size={12} className="fill-current" />
                    <Star size={12} className="fill-current" />
                    <Star size={12} className="fill-current" />
                    <Star size={12} className="fill-current" />
                  </div>
                </div>
                <p className="text-xs text-muted leading-relaxed">"The new brew technique is brilliant. Highly recommended for the morning rush."</p>
                <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-2">Just now</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>

    <AnimatePresence>
      {activeModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink/60 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-paper w-full max-w-4xl max-h-[85vh] rounded-[2rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col"
          >
            <div className="p-6 lg:p-8 border-b border-border bg-white flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-xl lg:text-2xl font-black text-brand tracking-tight">{modalTitles[activeModal]}</h2>
                <p className="text-[10px] text-muted font-bold tracking-widest uppercase mt-1">Detailed Analytics View</p>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-10 h-10 rounded-full bg-paper hover:bg-border text-brand flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 lg:p-8 overflow-y-auto relative no-scrollbar">
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-[100px] pointer-events-none" />
              <div className="relative z-10">
                {renderModalContent()}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};


const ProductGallery = ({ images, productName }: { images: string[], productName: string }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square flex flex-col items-center justify-center text-muted bg-paper border border-border rounded-xl">
        <Package size={40} className="mb-2 opacity-20" />
        <span className="text-[10px] font-medium uppercase tracking-widest">No Photos Available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-paper shadow-sm">
        <AnimatePresence mode="wait">
          <motion.img 
            key={images[activeIndex]}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.2 }}
            src={images[activeIndex]} 
            alt={`${productName} view ${activeIndex + 1}`} 
            className="w-full h-full object-cover transition-transform group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        
        {images.length > 1 && (
          <>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-lg border border-border flex items-center justify-center text-brand opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-95"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-lg border border-border flex items-center justify-center text-brand opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-95"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        <label className="absolute top-3 right-3 bg-brand/40 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-xl backdrop-blur-md cursor-pointer border border-white/20 shadow-lg hover:bg-brand/60">
          <input type="file" className="hidden" accept="image/*" />
          <Camera size={14} className="text-white" />
        </label>
        
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 bg-black/20 backdrop-blur-sm rounded-full pointer-events-none">
            {images.map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-white w-4' : 'bg-white/50'}`} 
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {images.map((img, i) => (
          <button 
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`relative min-w-[64px] h-[64px] rounded-lg overflow-hidden border-2 transition-all shrink-0 ${i === activeIndex ? 'border-brand ring-2 ring-brand/20 scale-105' : 'border-paper hover:border-brand/40 opacity-70 hover:opacity-100'}`}
          >
            <img 
              src={img} 
              alt={`View ${i + 1}`} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </button>
        ))}
        <label className="min-w-[64px] h-[64px] rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted bg-paper hover:bg-white hover:border-brand/40 transition-all cursor-pointer group shrink-0">
          <input type="file" className="hidden" accept="image/*" multiple />
          <Camera size={18} className="group-hover:text-brand transition-colors" />
          <span className="text-[8px] font-bold uppercase mt-1">Add</span>
        </label>
      </div>
    </div>
  );
};

const ProductIntelligence = () => {
  const [activeFilter, setActiveFilter] = useState('margin');
  const [expandedId, setExpandedId] = useState<string|null>(null);

  const sortedProducts = useMemo(() => {
    return [...MOCK_PRODUCTS].sort((a, b) => {
      if (activeFilter === 'margin') return b.margin - a.margin;
      if (activeFilter === 'outreach') return b.outreach - a.outreach;
      return b.unitsSold - a.unitsSold;
    });
  }, [activeFilter]);

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-border w-full lg:w-fit overflow-x-auto no-scrollbar">
        {['margin', 'outreach', 'unitsSold'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`flex-1 lg:flex-none px-4 lg:px-6 py-2 rounded text-[10px] lg:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeFilter === filter ? 'bg-brand text-white shadow-sm' : 'text-muted hover:bg-paper'
            }`}
          >
            {filter === 'unitsSold' ? 'Volume' : filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {sortedProducts.map((product, idx) => {
          const isExpanded = expandedId === product.id;
          return (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-border overflow-hidden"
            >
              <div 
                className="p-4 lg:p-6 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 cursor-pointer hover:bg-paper/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : product.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-paper rounded flex items-center justify-center text-brand font-bold text-xs lg:text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-brand text-sm">{product.name}</h4>
                    <p className="text-[10px] text-muted font-medium uppercase tracking-tight">{product.category} • {product.outletIds.length} outlets</p>
                  </div>
                </div>
                
                <div className="flex-1 flex items-center justify-between lg:justify-end gap-6 lg:gap-8 lg:border-t-0 pt-0 lg:pt-0">
                  <div className="text-left lg:text-right">
                    <p className="text-[9px] text-muted font-bold uppercase tracking-widest mb-0.5">
                      {activeFilter === 'margin' ? 'Margin' : activeFilter === 'outreach' ? 'Outreach' : 'Units'}
                    </p>
                    <p className="text-base lg:text-lg font-bold text-brand">
                      {activeFilter === 'margin' ? `${product.margin}%` : activeFilter === 'outreach' ? `${product.outreach}/100` : product.unitsSold}
                    </p>
                  </div>
                  <div className="w-24 lg:w-32 h-1.5 bg-paper rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand rounded-full" 
                      style={{ width: `${activeFilter === 'margin' ? product.margin : activeFilter === 'outreach' ? product.outreach : (product.unitsSold / 2500) * 100}%` }}
                    />
                  </div>
                  <div className="hidden lg:block text-muted">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
                <div className="lg:hidden flex justify-center border-t border-border mt-2 pt-2 text-muted">
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-border bg-paper/20"
                  >
                    <div className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      <div className="md:col-span-4 lg:col-span-3">
                        <ProductGallery images={product.imageUrls} productName={product.name} />
                      </div>

                      <div className="md:col-span-8 lg:col-span-5 space-y-4">
                        <div>
                          <p className="text-[9px] text-muted font-bold uppercase tracking-widest mb-1">Product Details</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-brand/50 tracking-wider">Category:</span>
                            <span className="text-xs font-semibold text-brand">{product.category}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted font-bold uppercase tracking-widest mb-1">Performance Stats</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-3 rounded border border-border">
                              <p className="text-[8px] text-muted uppercase font-bold mb-1">Profitability</p>
                              <p className="text-sm font-black text-brand">{product.margin}%</p>
                            </div>
                            <div className="bg-white p-3 rounded border border-border">
                              <p className="text-[8px] text-muted uppercase font-bold mb-1">Total Outreach</p>
                              <p className="text-sm font-black text-brand">{product.outreach}/100</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:col-span-12 lg:col-span-4">
                        <p className="text-[9px] text-muted font-bold uppercase tracking-widest mb-2">Available At</p>
                        <div className="flex flex-wrap gap-2">
                          {product.outletIds.map(oId => {
                            const outlet = MOCK_OUTLETS.find(o => o.id === oId);
                            return (
                              <div key={oId} className="flex flex-col bg-white border border-border px-3 py-2 rounded shadow-sm min-w-[120px]">
                                <span className="text-[10px] font-bold text-brand">{outlet?.name}</span>
                                <span className="text-[8px] text-muted font-medium">{outlet?.location}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const AIStrategyAssistant = () => {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'segments'>('chat');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: `Hi! I've analyzed your ${MOCK_OUTLETS.length} outlets and current Indian cafe market trends. Here's what needs your attention today: \n\n**Market Signal Detected**: Specialty coffee demand in Bandra West is up 23% this quarter. Your Koramangala outlet is underpricing Cold Brew by ₹30 vs competitors. Raising price could add ₹2.4L/month with minimal churn risk.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const segments = useMemo(() => {
    const segmented = {
      vip: { name: 'VIP', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50', count: 0, strategy: 'Exclusive loyalty events and early access to new menu innovations.', items: [] as Customer[] },
      atRisk: { name: 'At Risk High-Value', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50', count: 0, strategy: 'Personalized concierge outreach and win-back offers with high-margin bundles.', items: [] as Customer[] },
      core: { name: 'Core Regulars', icon: Zap, color: 'text-brand', bg: 'bg-brand/5', count: 0, strategy: 'Referral program incentives and subscription upsell campaigns.', items: [] as Customer[] },
      reactive: { name: 'Price Sensitive', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50', count: 0, strategy: 'Value-driven bundles and seasonal inflation-beating substitution options.', items: [] as Customer[] },
    };

    MOCK_CUSTOMERS.forEach(c => {
      if (c.totalSpend > 8000 && c.churnProbability < 0.3) segmented.vip.items.push(c);
      else if (c.totalSpend > 5000 && c.churnProbability >= 0.5) segmented.atRisk.items.push(c);
      else if (c.totalSpend > 3000 && c.churnProbability < 0.5) segmented.core.items.push(c);
      else segmented.reactive.items.push(c);
    });

    segmented.vip.count = segmented.vip.items.length;
    segmented.atRisk.count = segmented.atRisk.items.length;
    segmented.core.count = segmented.core.items.length;
    segmented.reactive.count = segmented.reactive.items.length;

    return segmented;
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: `You are a business strategy assistant for a retail franchise. 
            Context: ${MOCK_OUTLETS.length} outlets across major Indian metros. 
            Outlets: ${JSON.stringify(MOCK_OUTLETS)}
            Core Insight: Koramangala has high churn (${MOCK_OUTLETS.find(o => o.name === 'Koramangala')?.churnRate}%). Top product is Artisan Cold Brew (78% margin).
            Current Task: Analyze trends and suggest inflation-beating ingredient substitutions.
            User Question: ${userMsg}` }] }
        ],
        config: {
          systemInstruction: "Provide concise, data-driven retail strategy recommendations. Use markdown for formatting. Focus on churn reduction, margin optimization, and inflation-beating ingredient substitutions."
        }
      });

      const response = await model;
      setMessages(prev => [...prev, { role: 'assistant', content: response.text || 'I encountered an error processing that.' }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to my brain right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border flex flex-col h-[calc(100vh-14rem)] overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-6">
          <div>
            <h3 className="text-sm font-bold text-brand uppercase tracking-widest">Strategy AI</h3>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live Analysis Active
            </p>
          </div>
          <div className="h-8 w-px bg-border hidden sm:block" />
          <div className="flex bg-paper p-1 rounded-lg">
            <button 
              onClick={() => setActiveSubTab('chat')}
              className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${activeSubTab === 'chat' ? 'bg-white text-brand shadow-sm' : 'text-muted hover:text-brand'}`}
            >
              Live Assistant
            </button>
            <button 
              onClick={() => setActiveSubTab('segments')}
              className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${activeSubTab === 'segments' ? 'bg-white text-brand shadow-sm' : 'text-muted hover:text-brand'}`}
            >
              Segments
            </button>
          </div>
        </div>
        <div className="text-muted">
          <Sparkles size={18} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        {activeSubTab === 'chat' ? (
          <div className="p-8 space-y-8">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-5 rounded-xl ${
                  msg.role === 'user' 
                    ? 'bg-brand text-white rounded-tr-none' 
                    : 'bg-paper text-ink rounded-tl-none border border-border'
                }`}>
                  <div className="prose prose-sm max-w-none text-inherit">
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-paper p-4 rounded-xl rounded-tl-none border border-border flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce delay-100" />
                  <div className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-brand uppercase tracking-widest">Customer Segmentation Strategy</h4>
              <p className="text-[11px] text-muted leading-relaxed">AI has identified 4 key segments based on spending habits and churn likelihood. Targeting these groups with tailored strategies can increase retention by up to 18%.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(segments).map(([key, segment]) => (
                <div key={key} className="bg-white p-6 rounded-xl border border-border space-y-4 hover:border-brand/30 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 ${segment.bg} ${segment.color} rounded-lg flex items-center justify-center`}>
                      <segment.icon size={20} />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Customers</p>
                      <p className="text-xl font-black text-brand">{segment.count}</p>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-brand">{segment.name}</h5>
                    <p className="text-[10px] font-medium text-muted mt-2 leading-relaxed">{segment.strategy}</p>
                  </div>
                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-[8px] font-bold text-muted uppercase tracking-widest">Retention Health</span>
                    <div className="w-24 h-1 bg-paper rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${segment.color.replace('text', 'bg')} rounded-full`}
                        style={{ width: `${key === 'vip' ? 95 : key === 'core' ? 80 : key === 'atRisk' ? 35 : 55}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-paper p-6 rounded-xl border border-border">
              <h5 className="text-[10px] font-bold text-brand uppercase tracking-widest mb-4">Top At-Risk High-Value Customers</h5>
              <div className="space-y-3">
                {segments.atRisk.items.slice(0, 3).map(customer => (
                  <div key={customer.id} className="bg-white p-3 rounded border border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-brand">{customer.email.split('@')[0].replace('.', ' ')}</p>
                      <p className="text-[9px] text-muted font-medium uppercase">{new Date(customer.lastVisit).toLocaleDateString()} • Spend: ₹{customer.totalSpend.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-rose-500 font-bold uppercase tracking-widest">Churn Prob.</p>
                      <p className="text-xs font-black text-rose-600">{(customer.churnProbability * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {activeSubTab === 'chat' && (
        <div className="p-6 border-t border-border bg-paper/30 shrink-0">
          <div className="flex gap-3">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your business strategy..."
              className="flex-1 bg-white border border-border rounded-lg px-5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={loading}
              className="bg-brand text-white px-5 rounded-lg hover:bg-ink transition-all disabled:opacity-50 flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SubscriptionGuard = ({ children, subscription }: { children: React.ReactNode, subscription: Subscription | null }) => {
  if (!subscription) return <div className="flex items-center justify-center h-screen"><Clock className="animate-spin text-indigo-500" /></div>;

  const trialExpired = new Date(subscription.trialEndsAt) < new Date() && subscription.plan === 'free_trial';

  if (trialExpired && !subscription.isActive) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 max-w-md text-center space-y-6"
        >
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto">
            <CreditCard size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Trial Expired</h2>
            <p className="text-gray-500 mt-2">Your 7-day free trial has ended. Upgrade to Premium to continue optimizing your franchise.</p>
          </div>
          <button className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/30 hover:bg-indigo-600 transition-all">
            Upgrade for ₹999/mo
          </button>
          <p className="text-xs text-gray-400">Cancel anytime. 30-day money back guarantee.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {subscription.plan === 'free_trial' && (
        <div className="fixed top-4 right-4 z-[60] bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-xs font-bold border border-amber-200 shadow-sm flex items-center gap-2">
          <Clock size={14} />
          Trial ends in {Math.ceil((new Date(subscription.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
        </div>
      )}
      {children}
    </>
  );
};

const MarketTrends = () => {
  const trends = [
    { title: 'Specialty Coffee', change: '+23%', trend: 'up', desc: 'Gen-Z cafe visits up 31% in Koramangala belt.' },
    { title: 'Plant-Based', change: '+18%', trend: 'up', desc: 'Oat & almond milk now expected at 74% of cafes.' },
    { title: 'Digital Orders', change: '+41%', trend: 'up', desc: 'Swiggy/Zomato cafe orders up 41% YoY.' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {trends.map((trend, idx) => (
        <motion.div 
          key={idx}
          whileHover={{ y: -4 }}
          className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-4"
        >
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-gray-900">{trend.title}</h4>
            <span className="text-emerald-500 font-bold text-sm">{trend.change}</span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">{trend.desc}</p>
          <div className="pt-4 border-t border-gray-50 flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            View Analysis <ChevronRight size={14} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const InventoryView = () => {
  const lowStockItems = MOCK_INVENTORY.filter(item => item.stockLevel < 40);

  return (
    <div className="space-y-8">
      {lowStockItems.length > 0 && (
        <div className="bg-rose-50 border border-rose-100 p-6 lg:p-8 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-rose-600 font-bold uppercase tracking-widest text-[10px]">
            <AlertCircle size={14} />
            Critical Stock Alerts
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockItems.map(item => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 rounded-xl border border-rose-100 flex items-center justify-between shadow-sm"
              >
                <div>
                  <p className="text-sm font-bold text-brand">{item.name}</p>
                  <p className="text-[10px] text-muted font-medium uppercase tracking-tight">{item.stockLevel} {item.unit} remaining</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-border">
        <h3 className="text-sm font-bold text-brand uppercase tracking-widest mb-8">Stock Levels (Outlet: Koramangala)</h3>
        <div className="overflow-x-auto -mx-6 lg:mx-0">
          <div className="inline-block min-w-full align-middle px-6 lg:px-0">
            <table className="w-full text-left">
              <thead>
                <tr className="text-muted text-[10px] uppercase tracking-widest border-b border-border">
                  <th className="pb-4 font-bold">Item</th>
                  <th className="pb-4 font-bold">Stock</th>
                  <th className="pb-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {MOCK_INVENTORY.map((item) => (
                  <tr key={item.id} className="border-b border-paper hover:bg-paper/30 transition-colors">
                    <td className="py-5 font-bold text-brand pr-4">
                      <div className="flex items-center gap-2">
                        {item.name}
                        {item.stockLevel < 40 && (
                          <span className="flex h-2 w-2 rounded-full bg-rose-500" title="Low Stock" />
                        )}
                      </div>
                    </td>
                    <td className="py-5 text-muted font-medium whitespace-nowrap pr-4">{item.stockLevel} {item.unit}</td>
                    <td className="py-5">
                      <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${item.stockLevel < 40 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                        {item.stockLevel < 40 ? 'Low' : 'OK'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const DealersView = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {MOCK_DEALERS.map((dealer) => (
      <div key={dealer.id} className="bg-white p-8 rounded-2xl shadow-sm border border-border space-y-6">
        <div className="flex justify-between items-start">
          <div className="text-muted">
            <Truck size={20} />
          </div>
          <div className="flex items-center gap-1 text-amber-600 font-bold text-xs">
            <Star size={14} fill="currentColor" /> {dealer.rating}
          </div>
        </div>
        <div>
          <h4 className="font-bold text-brand">{dealer.name}</h4>
          <p className="text-[10px] text-muted uppercase tracking-widest font-bold mt-1">{dealer.category}</p>
        </div>
        <p className="text-xs text-muted font-medium">{dealer.contact}</p>
        <button className="w-full py-3 bg-paper text-brand rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-border transition-all">
          Contact Dealer
        </button>
      </div>
    ))}
  </div>
);

const MenuInnovationView = () => (
  <div className="space-y-10">
    <div className="bg-brand p-10 rounded-2xl text-white flex items-center justify-between overflow-hidden relative">
      <div className="relative z-10 space-y-3">
        <h3 className="text-2xl font-bold tracking-tight">AI Menu Innovation</h3>
        <p className="text-muted text-sm max-w-md">Discover high-margin items and inflation-beating ingredient substitutions.</p>
      </div>
      <Sparkles size={140} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {MOCK_INNOVATIONS.map((item) => (
        <div key={item.id} className="bg-white p-8 rounded-2xl shadow-sm border border-border space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-brand">{item.name}</h4>
            <span className="px-3 py-1 bg-paper text-muted rounded text-[10px] font-bold uppercase tracking-widest border border-border">{item.status}</span>
          </div>
          <p className="text-xs text-muted leading-relaxed font-medium">{item.description}</p>
          <div className="flex justify-between items-center pt-6 border-t border-border">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <TrendingUp size={14} /> {item.estimatedMargin}% Margin
            </div>
            <button className="text-accent text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 hover:underline">
              Recipe <ChevronRight size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>

    <div className="bg-paper p-10 rounded-2xl border border-border space-y-8">
      <div className="flex items-center gap-3 text-brand">
        <Zap size={20} />
        <h4 className="text-sm font-bold uppercase tracking-widest">Inflation-Beating Substitutions</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-border">
          <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-2">Standard</p>
          <p className="text-brand font-bold">Imported Avocado</p>
          <div className="my-4 h-px bg-border relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
              <ArrowDownRight className="text-rose-500" size={14} />
            </div>
          </div>
          <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-2">AI Recommendation</p>
          <p className="text-brand font-bold">Local Raw Banana Puree</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-3 uppercase tracking-wider">Save 45% per unit</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-border">
          <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-2">Standard</p>
          <p className="text-brand font-bold">Premium Quinoa</p>
          <div className="my-4 h-px bg-border relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
              <ArrowDownRight className="text-rose-500" size={14} />
            </div>
          </div>
          <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-2">AI Recommendation</p>
          <p className="text-brand font-bold">Sprouted Local Millets</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-3 uppercase tracking-wider">Save 60% per unit</p>
        </div>
      </div>
    </div>
  </div>
);

const ReviewsView = () => (
  <div className="space-y-10">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
        <h3 className="text-sm font-bold text-brand uppercase tracking-widest mb-8">Outlet Ratings</h3>
        <div className="space-y-6">
          {MOCK_OUTLETS.map((outlet) => (
            <div key={outlet.id} className="flex justify-between items-center">
              <span className="text-brand font-bold text-sm">{outlet.name}</span>
              <div className="flex items-center gap-1 text-amber-600 font-bold text-xs">
                <Star size={14} fill="currentColor" /> {4.5 - (parseInt(outlet.id) * 0.2)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
        <h3 className="text-sm font-bold text-brand uppercase tracking-widest mb-8">Top Rated Items</h3>
        <div className="space-y-6">
          {MOCK_PRODUCTS.slice(0, 3).map((product) => (
            <div key={product.id} className="flex justify-between items-center">
              <span className="text-brand font-bold text-sm">{product.name}</span>
              <div className="flex items-center gap-1 text-amber-600 font-bold text-xs">
                <Star size={14} fill="currentColor" /> {4.8}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="space-y-6">
      <h3 className="text-sm font-bold text-brand uppercase tracking-widest">Recent Feedback</h3>
      <div className="grid grid-cols-1 gap-4">
        {MOCK_REVIEWS.map((review) => (
          <div key={review.id} className="bg-white p-8 rounded-2xl shadow-sm border border-border space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="flex text-amber-500">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                </div>
                <span className="text-[10px] text-muted font-bold uppercase tracking-widest">{new Date(review.date).toLocaleDateString()}</span>
              </div>
              <span className="text-[10px] font-bold text-brand uppercase tracking-widest border border-border px-2 py-0.5 rounded bg-paper">{review.type}</span>
            </div>
            <p className="text-sm text-brand font-medium leading-relaxed italic">"{review.comment}"</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Fetch or create subscription
        const subRef = doc(db, 'subscriptions', u.uid);
        const subSnap = await getDoc(subRef);
        
        if (subSnap.exists()) {
          setSubscription(subSnap.data() as Subscription);
        } else {
          const newSub: Subscription = {
            uid: u.uid,
            plan: 'free_trial',
            trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true
          };
          await setDoc(subRef, newSub);
          setSubscription(newSub);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-paper p-6">
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-sm w-full text-center space-y-12"
        >
          <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-brand/10">
            <Sparkles size={32} />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-brand tracking-tight">ChurnShield</h1>
            <p className="text-muted text-sm leading-relaxed">Predict churn, optimize margins, and grow your franchise with AI-driven intelligence.</p>
          </div>
          <button 
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white border border-border py-3.5 rounded-lg font-bold text-brand hover:bg-paper transition-all shadow-sm text-sm"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            Continue with Google
          </button>
          <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Enterprise Grade Intelligence</p>
        </motion.div>
      </div>
    );
  }

  return (
    <SubscriptionGuard subscription={subscription}>
      <div className="min-h-screen bg-paper lg:pl-64 relative overflow-hidden group/main">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        <main className="p-6 lg:p-12 max-w-6xl mx-auto relative z-10">
          <header className="mb-10 lg:mb-16 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div className="space-y-3 w-full animate-float">
              <div className="flex items-center justify-between lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-10 bg-brand rounded-full hidden lg:block" />
                  <h2 className="text-3xl lg:text-5xl font-black text-brand tracking-tighter uppercase shrink-0">
                    {activeTab === 'dashboard' && 'Overview'}
                    {activeTab === 'products' && 'Product Intelligence'}
                    {activeTab === 'inventory' && 'Inventory'}
                    {activeTab === 'dealers' && 'Dealer Network'}
                    {activeTab === 'innovation' && 'Innovation'}
                    {activeTab === 'reviews' && 'Feedback'}
                    {activeTab === 'assistant' && 'Strategy AI'}
                    {activeTab === 'trends' && 'Market Trends'}
                  </h2>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 bg-white border border-border rounded-xl text-brand shadow-lg"
                >
                  <Menu size={20} />
                </button>
              </div>
              <p className="text-muted text-xs lg:text-sm font-black uppercase tracking-[0.2em] leading-relaxed max-w-xl">
                {activeTab === 'dashboard' && `Optimizing churn across ${MOCK_OUTLETS.length} national hubs.`}
                {activeTab === 'products' && 'Real-time margin analysis & product outreach metrics.'}
                {activeTab === 'inventory' && 'Predictive stock management for supply chain resilience.'}
                {activeTab === 'dealers' && 'Strategic partnerships with verified ingredient producers.'}
                {activeTab === 'innovation' && 'AI-driven cost savings and recipe engineering.'}
                {activeTab === 'reviews' && 'High-velocity sentiment analysis across the brand ecosystem.'}
                {activeTab === 'assistant' && 'Enterprise-grade recommendations for regional expansion.'}
                {activeTab === 'trends' && 'Deep-dive into seasonal national consumer behavior.'}
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/60 shadow-xl shadow-brand/5 text-[10px] font-black text-brand uppercase tracking-[0.3em] flex items-center gap-3 group hover:bg-white transition-all">
              <div className="relative w-6 h-6 flex items-center justify-center -ml-2 text-accent">
                <Hexagon size={24} fill="currentColor" fillOpacity={0.1} strokeWidth={1.5} className="absolute inset-0" />
                <Utensils size={10} className="relative z-10" />
              </div>
              <div className="flex items-center gap-2">
                RetailX <span className="text-muted">|</span> <span className="text-emerald-600 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live</span>
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'dashboard' && <ChurnDashboard />}
              {activeTab === 'products' && <ProductIntelligence />}
              {activeTab === 'inventory' && <InventoryView />}
              {activeTab === 'dealers' && <DealersView />}
              {activeTab === 'innovation' && <MenuInnovationView />}
              {activeTab === 'reviews' && <ReviewsView />}
              {activeTab === 'assistant' && <AIStrategyAssistant />}
              {activeTab === 'trends' && <MarketTrends />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </SubscriptionGuard>
  );
}
