import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Truck,
  Waves,
  Flame,
  Boxes,
  ShoppingBag,
  ExternalLink,
  Tag
} from 'lucide-react';
import { formatRupiah, formatWeight } from '../utils/formatters';

export default function GlobalSearchModal({
  isOpen,
  onClose,
  onNavigate,
  onOpenTraceability,
  database = {},
  recalibratedData = {}
}) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const rawPurchases = recalibratedData.recalibratedRawPurchases || [];
  const preProcessings = recalibratedData.recalibratedPreProcessings || [];
  const productionSPKs = recalibratedData.recalibratedProductionSPKs || [];
  const finishedGoods = recalibratedData.finishedGoodsPelletInventory || [];
  const salesOrders = recalibratedData.recalibratedSalesOrders || [];
  const contacts = database.contacts || [];

  const q = query.toLowerCase().trim();

  // Search Results grouped
  const matchedRaw = q ? rawPurchases.filter(r =>
    `${r.batchNo} ${r.supplierName} ${r.polymerName}`.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchedFlakes = q ? preProcessings.filter(f =>
    `${f.outputFlakesBatchNo} ${f.flakesName} ${f.polymerCode}`.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchedSPKs = q ? productionSPKs.filter(s =>
    `${s.spkNo} ${s.targetLotNo} ${s.targetProductName}`.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchedGoods = q ? finishedGoods.filter(g =>
    `${g.lotNo} ${g.productName} ${g.targetColor}`.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchedSales = q ? salesOrders.filter(s =>
    `${s.orderNo} ${s.customerName} ${s.targetLotNo}`.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const totalResults = matchedRaw.length + matchedFlakes.length + matchedSPKs.length + matchedGoods.length + matchedSales.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-3 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden text-xs">
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-800 p-3 flex items-center bg-slate-950">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari cepat Batch Reject, Flakes, No. SPK, Lot Pelet, Customer, DO... (Ctrl+K)"
            className="w-full bg-transparent pl-8 pr-16 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="absolute right-3 px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white text-3xs font-mono border border-slate-700"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-3 font-sans">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-slate-500">
              <p className="text-xs">Ketik kode batch, nomor SPK, nama produk, atau kontak customer/lapak...</p>
              <div className="flex justify-center gap-2 mt-2 text-3xs font-mono text-slate-400">
                <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">REJ-...</span>
                <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">FLK-...</span>
                <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">SPK-...</span>
                <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">LOT-...</span>
                <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">DO-...</span>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-slate-500">
              Tidak ditemukan data yang cocok dengan "{query}".
            </div>
          ) : (
            <>
              {/* Matched Lot Pelet */}
              {matchedGoods.length > 0 && (
                <div>
                  <div className="text-3xs uppercase tracking-wider font-bold text-amber-400 px-2 mb-1 flex items-center space-x-1">
                    <Boxes className="w-3.5 h-3.5" />
                    <span>Gudang Biji Pelet (Tahap 4)</span>
                  </div>
                  <div className="space-y-1">
                    {matchedGoods.map(g => (
                      <div
                        key={g.lotNo}
                        onClick={() => {
                          onNavigate('stage4');
                          onClose();
                        }}
                        className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-amber-400">{g.lotNo}</span>
                          <span className="text-white font-medium">{g.productName}</span>
                          <span className="text-2xs text-slate-400 font-mono">({formatWeight(g.currentStockKg)})</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenTraceability(g.lotNo);
                            onClose();
                          }}
                          className="px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 hover:bg-purple-800/60 border border-purple-500/30 text-3xs"
                        >
                          Lacak Silsilah
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched SPK */}
              {matchedSPKs.length > 0 && (
                <div>
                  <div className="text-3xs uppercase tracking-wider font-bold text-purple-400 px-2 mb-1 flex items-center space-x-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>SPK Ekstrusi (Tahap 3)</span>
                  </div>
                  <div className="space-y-1">
                    {matchedSPKs.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onNavigate('stage3');
                          onClose();
                        }}
                        className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-purple-400">{s.spkNo}</span>
                          <span className="text-white font-medium">{s.targetProductName}</span>
                          <span className="text-2xs text-slate-400">({s.status})</span>
                        </div>
                        <span className="text-3xs text-slate-500 group-hover:text-white flex items-center space-x-1">
                          <span>Buka Tahap 3</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Flakes */}
              {matchedFlakes.length > 0 && (
                <div>
                  <div className="text-3xs uppercase tracking-wider font-bold text-blue-400 px-2 mb-1 flex items-center space-x-1">
                    <Waves className="w-3.5 h-3.5" />
                    <span>Cacahan Flakes (Tahap 2)</span>
                  </div>
                  <div className="space-y-1">
                    {matchedFlakes.map(f => (
                      <div
                        key={f.id}
                        onClick={() => {
                          onNavigate('stage2');
                          onClose();
                        }}
                        className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-blue-400">{f.outputFlakesBatchNo}</span>
                          <span className="text-white font-medium">{f.flakesName}</span>
                          <span className="text-2xs text-slate-400">({formatWeight(f.remainingFlakesKg)})</span>
                        </div>
                        <span className="text-3xs text-slate-500 group-hover:text-white flex items-center space-x-1">
                          <span>Buka Tahap 2</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Reject */}
              {matchedRaw.length > 0 && (
                <div>
                  <div className="text-3xs uppercase tracking-wider font-bold text-emerald-400 px-2 mb-1 flex items-center space-x-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Pembelian Reject (Tahap 1)</span>
                  </div>
                  <div className="space-y-1">
                    {matchedRaw.map(r => (
                      <div
                        key={r.id}
                        onClick={() => {
                          onNavigate('stage1');
                          onClose();
                        }}
                        className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-emerald-400">{r.batchNo}</span>
                          <span className="text-white font-medium">{r.supplierName}</span>
                          <span className="text-2xs text-slate-400">({formatWeight(r.remainingKg)})</span>
                        </div>
                        <span className="text-3xs text-slate-500 group-hover:text-white flex items-center space-x-1">
                          <span>Buka Tahap 1</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Sales */}
              {matchedSales.length > 0 && (
                <div>
                  <div className="text-3xs uppercase tracking-wider font-bold text-emerald-400 px-2 mb-1 flex items-center space-x-1">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Surat Jalan & Penjualan (Tahap 5)</span>
                  </div>
                  <div className="space-y-1">
                    {matchedSales.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onNavigate('stage5');
                          onClose();
                        }}
                        className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-emerald-400">{s.orderNo}</span>
                          <span className="text-white font-medium">{s.customerName}</span>
                          <span className="text-2xs text-slate-400">({formatRupiah(s.netRevenue)})</span>
                        </div>
                        <span className="text-3xs text-slate-500 group-hover:text-white flex items-center space-x-1">
                          <span>Buka Tahap 5</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
