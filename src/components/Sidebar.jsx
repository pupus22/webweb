import React from 'react';
import {
  LayoutDashboard,
  Truck,
  Waves,
  Flame,
  Boxes,
  TrendingUp,
  Database,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Layers,
  Scale
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  counts = {}
}) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard & Alur',
      shortLabel: 'Dashboard',
      icon: LayoutDashboard,
      badge: 'Flow',
      badgeColor: 'bg-indigo-900/60 text-indigo-300 border border-indigo-500/30',
      description: 'Pipeline 5 Tahap & KPI Susut'
    },
    {
      id: 'stage1',
      label: 'Tahap 1: Limbah Reject',
      shortLabel: 'T1: Reject',
      icon: Truck,
      step: '1',
      badge: counts.rawPurchases ? `${counts.rawPurchases}` : '0',
      badgeColor: 'bg-emerald-950 text-emerald-400 border border-emerald-500/30',
      description: 'Inbound Pembelian Bahan Kotor'
    },
    {
      id: 'stage2',
      label: 'Tahap 2: Sortir, Giling & Cuci',
      shortLabel: 'T2: Flakes',
      icon: Waves,
      step: '2',
      badge: counts.preProcessings ? `${counts.preProcessings}` : '0',
      badgeColor: 'bg-blue-950 text-blue-400 border border-blue-500/30',
      description: 'Pre-Processing Cacahan Kering'
    },
    {
      id: 'stage3',
      label: 'Tahap 3: Blending & Ekstrusi',
      shortLabel: 'T3: Ekstrusi',
      icon: Flame,
      step: '3',
      badge: counts.productionSPKs ? `${counts.productionSPKs}` : '0',
      badgeColor: 'bg-purple-950 text-purple-400 border border-purple-500/30',
      description: 'SPK Formulasi Resep & Pelet'
    },
    {
      id: 'stage4',
      label: 'Tahap 4: Gudang Biji Plastik',
      shortLabel: 'T4: Gudang',
      icon: Boxes,
      step: '4',
      badge: counts.finishedGoods ? `${counts.finishedGoods}` : '0',
      badgeColor: 'bg-amber-950 text-amber-400 border border-amber-500/30',
      description: 'QC, Pelet Sak @ 25Kg & Flakes'
    },
    {
      id: 'stage5',
      label: 'Tahap 5: Penjualan & DO',
      shortLabel: 'T5: Penjualan',
      icon: TrendingUp,
      step: '5',
      badge: counts.salesOrders ? `${counts.salesOrders}` : '0',
      badgeColor: 'bg-emerald-950 text-emerald-400 border border-emerald-500/30',
      description: 'Surat Jalan, DO & Analisis Margin'
    },
    {
      id: 'master',
      label: 'Master Data & Tarif Biaya',
      shortLabel: 'Master Data',
      icon: Database,
      badge: 'Setting',
      badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
      description: 'Polimer, Aditif, Kontak & Tarif'
    }
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (mobileOpen) setMobileOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className={`p-3.5 border-b border-slate-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-emerald-500 flex items-center justify-center shadow-md">
              <Boxes className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-black text-sm text-white tracking-tight flex items-center space-x-1.5">
                <span>PolyComp</span>
                <span className="text-2xs font-mono font-normal text-purple-400 bg-purple-950/80 px-1 py-0.2 rounded border border-purple-500/30">
                  ERP v2
                </span>
              </div>
              <div className="text-2xs text-slate-400 leading-tight">
                Plastics Recycling & Compounding
              </div>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-emerald-500 flex items-center justify-center shadow-md">
            <Boxes className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Alur Pipeline Workflow Indicator */}
      {!isCollapsed && (
        <div className="px-3.5 pt-3 pb-1">
          <div className="text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
            <span>Alur Pabrik Nyata</span>
            <span className="text-2xs text-emerald-400 font-mono">100% Editable</span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center rounded-lg transition text-left group min-h-[44px] ${
                isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2 space-x-3'
              } ${
                isActive
                  ? 'bg-purple-600/90 text-white shadow-md shadow-purple-900/30 border border-purple-400/40 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="relative shrink-0">
                <Icon className={`w-4 h-4 transition ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'}`} />
                {item.step && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-slate-900 text-purple-300 text-3xs font-mono font-bold flex items-center justify-center border border-slate-700">
                    {item.step}
                  </span>
                )}
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="text-xs font-semibold leading-snug">{item.label}</div>
                    <div className="text-3xs text-slate-400 leading-tight mt-0.5 group-hover:text-slate-300">
                      {item.description}
                    </div>
                  </div>
                  {item.badge && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-3xs font-mono font-bold shrink-0 ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Desktop Collapse Toggle */}
      <div className="hidden lg:flex p-2 border-t border-slate-800 justify-end">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition"
          title={isCollapsed ? 'Buka Sidebar' : 'Kecilkan Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (lg:) */}
      <aside
        className={`hidden lg:flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-200 shrink-0 select-none ${
          isCollapsed ? 'w-16' : 'w-72'
        }`}
      >
        {navContent}
      </aside>

      {/* Tablet & Mobile Slide-Over Drawer (< lg) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
