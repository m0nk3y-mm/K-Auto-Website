import React from 'react';
import { Search, Disc, Gauge, Zap, Droplet, ShieldCheck, Truck, CreditCard, ChevronRight } from 'lucide-react';
import { ProductCategory } from '../types';
import { POPULAR_CAR_MODELS } from '../data/initialData';

interface HeroProps {
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  selectedCarModel: string;
  onSelectCarModel: (model: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onFindPartsClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedCarModel,
  onSelectCarModel,
  searchQuery,
  onSearchChange,
  onFindPartsClick
}) => {
  const categoryTiles: { name: ProductCategory; label: string; icon: React.ReactNode }[] = [
    { name: 'Brakes', label: 'Brakes & Rotors', icon: <Disc className="w-4 h-4 text-red-500" /> },
    { name: 'Suspension', label: 'Suspension & Shocks', icon: <Gauge className="w-4 h-4 text-red-500" /> },
    { name: 'Engine', label: 'Engine & Intake', icon: <Zap className="w-4 h-4 text-red-500" /> },
    { name: 'Oils', label: 'Oils & Lubricants', icon: <Droplet className="w-4 h-4 text-red-500" /> },
    { name: 'Lighting', label: 'LED Headlamps', icon: <Zap className="w-4 h-4 text-red-500" /> },
    { name: 'Accessories', label: 'Chassis & Interior', icon: <ShieldCheck className="w-4 h-4 text-red-500" /> },
  ];

  return (
    <div className="relative border-b border-slate-800/80 bg-slate-950 overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-80 h-80 bg-slate-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        
        {/* Split Grid: Left Hero Copy & Vehicle Matcher / Right Featured Showcase Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            
            {/* Kicker */}
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="text-red-500 font-semibold tracking-wider uppercase">KAUTO MYANMAR</span>
              <span aria-hidden="true">·</span>
              <span>OEM & PERFORMANCE</span>
              <span aria-hidden="true">·</span>
              <span>MMK PRICING</span>
            </div>

            {/* Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-none text-balance">
              PRECISION AUTOMOTIVE PERFORMANCE & REPLACEMENT PARTS
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              OEM spec components and performance upgrades tailored for Myanmar roads. Filter by exact vehicle model, order with KPay or COD, with full stock tracking.
            </p>

            {/* Interactive Vehicle Model Compatibility Matcher */}
            <div id="vehicle-matcher" className="p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-xl shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                  Vehicle Fitment Matcher
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  Select your car model for guaranteed fit
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <label htmlFor="car-model-select" className="sr-only">Select Vehicle Model</label>
                  <select
                    id="car-model-select"
                    value={selectedCarModel}
                    onChange={(e) => onSelectCarModel(e.target.value)}
                    className="w-full h-11 px-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 font-sans cursor-pointer"
                  >
                    {POPULAR_CAR_MODELS.map((m) => (
                      <option key={m} value={m === 'All Vehicles' ? '' : m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search part name, OEM, or code..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="w-full h-11 pl-9 pr-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="text-xs text-zinc-400">
                  {selectedCarModel ? (
                    <span className="text-emerald-400">
                      Filtering for: <strong className="text-white font-medium">{selectedCarModel}</strong>
                    </span>
                  ) : (
                    <span>Showing parts for all compatible vehicles</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onFindPartsClick}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Filter Catalog</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Right Image Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-16/10 sm:aspect-16/9 lg:aspect-4/3 shadow-2xl">
              <img
                src="/src/assets/images/hero_automotive_parts_1793961736556.jpg"
                alt="Automotive Performance Brake Rotors and Intake Manifold"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-slate-950/80 backdrop-blur-md rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Brembo & Tein Authorized Catalog</p>
                  <p className="text-[11px] text-zinc-400">Track-tested performance & OEM spec spares</p>
                </div>
                <span className="font-mono text-red-400 font-semibold text-xs">
                  GENUINE PARTS
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Quick Category Segmented Buttons */}
        <div className="mt-10 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Browse by Component Category
            </p>
            {selectedCategory !== 'All' && (
              <button
                onClick={() => onSelectCategory('All')}
                className="text-xs text-red-400 hover:underline cursor-pointer"
              >
                Clear Category Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {categoryTiles.map((cat) => {
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => onSelectCategory(isActive ? 'All' : cat.name)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer border ${
                    isActive
                      ? 'bg-red-600/20 border-red-500 text-white font-semibold shadow-sm shadow-red-950'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span className="shrink-0">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trust Value Props Strip */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400 border-t border-slate-800/40 pt-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Genuine Auto Spares & Tested Fitment</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Fast Express to Yangon, Mandalay & All States</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
            <span>KBZPay, WavePay, AYA & Cash on Delivery</span>
          </div>
        </div>

      </div>
    </div>
  );
};
