import React, { useState } from 'react';
import {
  Boxes,
  Package,
  Layers,
  Search,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Filter,
  X,
  Scale,
  ShoppingCart,
  Tag,
  GitBranch,
  Printer,
  Sparkles,
  Zap
} from 'lucide-react';
import {
  formatRupiah,
  formatNumber,
  formatWeight,
  formatDate,
  getStatusBadge
} from '../utils/formatters';

export default function Stage4InventoryModule({
  finishedGoodsPelletInventory = [],
  recalibratedPreProcessings = [],
  stockAdjustments = [],
  setStockAdjustments,
  setProductionSPKs,
  onRequestDelete,
  onFastCreateSale,
  onOpenBagLabel,
  onOpenTraceability,
  onFastCreateSPK
}) {
  const [activeSubTab, setActiveSubTab] = useState('pellets'); // 'pellets' | 'flakes' | 'opname'
  const [searchQuery, setSearchQuery] = useState('');
  const [qcFilter, setQcFilter] = useState('ALL');
  const [polymerFilter, setPolymerFilter] = useState('ALL');

  // Modal states
  const [opnameModalOpen, setOpnameModalOpen] = useState(false);
  const [editingOpname, setEditingOpname] = useState(null);
  const [qcModalOpen, setQcModalOpen] = useState(false);
  const [editingQcItem, setEditingQcItem] = useState(null);
  const [editLotModalOpen, setEditLotModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState(null);

  // Summary Metrics
  const totalPelletKg = finishedGoodsPelletInventory.reduce((acc, x) => acc + (x.currentStockKg || 0), 0);
  const totalPelletBags = finishedGoodsPelletInventory.reduce((acc, x) => acc + (x.availableBags || 0), 0);
  const totalPelletValue = finishedGoodsPelletInventory.reduce((acc, x) => acc + (x.totalAssetValue || 0), 0);

  const totalFlakesKg = recalibratedPreProcessings.reduce((acc, x) => acc + (x.remainingFlakesKg || 0), 0);
  const totalFlakesValue = recalibratedPreProcessings.reduce((acc, x) => acc + (x.assetValue || 0), 0);

  // Filtered Pellets
  const filteredPellets = finishedGoodsPelletInventory.filter(item => {
    const textMatch = `${item.lotNo} ${item.spkNo} ${item.productName} ${item.targetColor} ${item.polymerType}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const qcMatch = qcFilter === 'ALL' || item.qcStatus === qcFilter;
    const polyMatch = polymerFilter === 'ALL' || item.polymerType === polymerFilter;
    return textMatch && qcMatch && polyMatch;
  });

  // Filtered Flakes
  const filteredFlakes = recalibratedPreProcessings.filter(item => {
    return `${item.outputFlakesBatchNo} ${item.flakesName} ${item.flakesColor} ${item.polymerCode}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  // Stock Opname Save
  const handleSaveOpname = (formData) => {
    if (editingOpname && editingOpname.id) {
      setStockAdjustments(prev => prev.map(a => a.id === editingOpname.id ? { ...a, ...formData } : a));
    } else {
      const newId = `ADJ-${String(Date.now()).slice(-4)}`;
      setStockAdjustments(prev => [{ id: newId, ...formData }, ...prev]);
    }
    setOpnameModalOpen(false);
    setEditingOpname(null);
  };

  // QC Update Save
  const handleSaveQc = (lotNo, qcStatus, mfi) => {
    setProductionSPKs(prev => prev.map(spk => {
      if ((spk.targetLotNo || spk.spkNo) === lotNo) {
        return {
          ...spk,
          qcResult: {
            ...spk.qcResult,
            status: qcStatus,
            mfiTest: mfi
          }
        };
      }
      return spk;
    }));
    setQcModalOpen(false);
    setEditingQcItem(null);
  };

  // Edit Lot Save
  const handleSaveLot = (updatedLot) => {
    setProductionSPKs(prev => prev.map(spk => {
      if ((spk.targetLotNo || spk.spkNo) === updatedLot.lotNo || spk.spkNo === updatedLot.spkNo) {
        return {
          ...spk,
          targetProductName: updatedLot.productName,
          targetColor: updatedLot.targetColor,
          outputPelletKg: Number(updatedLot.outputPelletKg),
          bagWeightKg: Number(updatedLot.bagWeightKg),
          qcResult: {
            ...spk.qcResult,
            status: updatedLot.qcStatus,
            mfiTest: updatedLot.mfi
          }
        };
      }
      return spk;
    }));
    setEditLotModalOpen(false);
    setEditingLot(null);
  };

  // Delete Lot
  const handleDeleteLot = (item) => {
    onRequestDelete({
      title: `Hapus Lot Pelet ${item.lotNo}`,
      message: `Yakin ingin menghapus lot biji pelet ${item.lotNo} (${item.productName})? Data SPK terkait (${item.spkNo}) akan dihapus dari sistem dan stok akan disesuaikan.`,
      onConfirm: () => {
        setProductionSPKs(prev => prev.filter(spk => (spk.targetLotNo || spk.spkNo) !== item.lotNo && spk.spkNo !== item.spkNo));
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Sub-Tab Navigation & Summary Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveSubTab('pellets')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition text-xs ${
              activeSubTab === 'pellets'
                ? 'bg-violet-50 text-violet-700 border border-violet-200 shadow-2xs'
                : 'bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200/70'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Gudang Biji Plastik (Pelet Jadi)</span>
            <span className="px-1.5 py-0.2 rounded-full text-3xs bg-violet-200/60 text-violet-800 font-mono font-bold">
              {finishedGoodsPelletInventory.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('flakes')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition text-xs ${
              activeSubTab === 'flakes'
                ? 'bg-violet-50 text-violet-700 border border-violet-200 shadow-2xs'
                : 'bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200/70'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Gudang Cacahan Flakes Kering</span>
            <span className="px-1.5 py-0.2 rounded-full text-3xs bg-slate-200 text-slate-700 font-mono font-bold">
              {recalibratedPreProcessings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('opname')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition text-xs ${
              activeSubTab === 'opname'
                ? 'bg-violet-50 text-violet-700 border border-violet-200 shadow-2xs'
                : 'bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200/70'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Riwayat Stock Opname</span>
            <span className="px-1.5 py-0.2 rounded-full text-3xs bg-slate-200 text-slate-700 font-mono font-bold">
              {stockAdjustments.length}
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => {
              setEditingOpname(null);
              setOpnameModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition shadow-xs text-xs w-full md:w-auto justify-center"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>+ Catat Stock Opname Fisik</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex items-center justify-between">
          <div>
            <span className="text-3xs text-slate-400 block uppercase font-semibold">Stok Pelet Siap Kirim</span>
            <span className="text-xl font-bold text-slate-800 font-mono">{formatWeight(totalPelletKg)}</span>
            <span className="text-3xs text-violet-600 font-medium block mt-0.5 font-mono">
              ~ {formatNumber(totalPelletBags, 0)} Karung Sak (@ 25 Kg)
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-100">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex items-center justify-between">
          <div>
            <span className="text-3xs text-slate-400 block uppercase font-semibold">Nilai Aset Pelet Gudang</span>
            <span className="text-xl font-bold text-emerald-600 font-mono">{formatRupiah(totalPelletValue)}</span>
            <span className="text-3xs text-slate-400 block mt-0.5">Dihitung otomatis dari HPP Final</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex items-center justify-between">
          <div>
            <span className="text-3xs text-slate-400 block uppercase font-semibold">Stok Flakes Kering</span>
            <span className="text-xl font-bold text-slate-800 font-mono">{formatWeight(totalFlakesKg)}</span>
            <span className="text-3xs text-slate-400 block mt-0.5">Siap Blending di Ekstruder</span>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex items-center justify-between">
          <div>
            <span className="text-3xs text-slate-400 block uppercase font-semibold">Nilai Aset Flakes</span>
            <span className="text-xl font-bold text-violet-600 font-mono">{formatRupiah(totalFlakesValue)}</span>
            <span className="text-3xs text-slate-400 block mt-0.5">Dari Hasil Cuci & Giling Bersih</span>
          </div>
          <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-100">
            <Boxes className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: GUDANG PELET BIJI PLASTIK */}
      {activeSubTab === 'pellets' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden text-xs">
          {/* Filter Bar */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-2.5">
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari Lot Pelet, SPK, Polimer, Warna..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-2.5 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 text-xs"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              <select
                value={qcFilter}
                onChange={e => setQcFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-violet-500 text-xs"
              >
                <option value="ALL">Semua Status QC</option>
                <option value="Lulus QC">Lulus QC</option>
                <option value="Karantina">Karantina / Hold</option>
              </select>

              <select
                value={polymerFilter}
                onChange={e => setPolymerFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-violet-500 text-xs"
              >
                <option value="ALL">Semua Polimer</option>
                <option value="PP">PP</option>
                <option value="HDPE">HDPE</option>
                <option value="LDPE">LDPE</option>
                <option value="LLDPE">LLDPE</option>
                <option value="PET">PET</option>
                <option value="ABS">ABS</option>
                <option value="HIPS">HIPS</option>
              </select>
            </div>
          </div>

          {/* High-density Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1050px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-3xs uppercase text-slate-400 font-semibold tracking-wider">
                  <th className="py-2.5 px-3">Kode Lot & SPK</th>
                  <th className="py-2.5 px-3">Produk & Warna</th>
                  <th className="py-2.5 px-3 text-center">Polimer</th>
                  <th className="py-2.5 px-3 text-center">QC Status & MFI</th>
                  <th className="py-2.5 px-3 text-right">Stok Pelet (Kg)</th>
                  <th className="py-2.5 px-3 text-center">Kemasan Sak</th>
                  <th className="py-2.5 px-3 text-right">HPP Pelet / Kg</th>
                  <th className="py-2.5 px-3 text-right">Nilai Aset (Rp)</th>
                  <th className="py-2.5 px-3 text-center">Kesiapan</th>
                  <th className="py-2.5 px-3 text-center sticky right-0 bg-white/95 min-w-[210px]">Aksi & Pintasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {filteredPellets.map((item) => (
                  <tr key={item.lotNo} className="hover:bg-slate-50/70 transition">
                    <td className="py-2 px-3">
                      <button
                        type="button"
                        onClick={() => onOpenTraceability && onOpenTraceability(item.lotNo)}
                        className="font-bold text-violet-600 hover:text-violet-700 hover:underline flex items-center space-x-1 text-left"
                        title="Klik untuk melacak silsilah batch hulu ke hilir"
                      >
                        <GitBranch className="w-3 h-3 shrink-0 text-violet-400" />
                        <span>{item.lotNo}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenTraceability && onOpenTraceability(item.spkNo)}
                        className="text-3xs text-slate-400 hover:text-slate-600 hover:underline block text-left"
                      >
                        SPK: {item.spkNo}
                      </button>
                    </td>

                    <td className="py-2 px-3 font-sans">
                      <div className="font-semibold text-slate-800 leading-snug">{item.productName}</div>
                      <div className="text-3xs text-slate-400">Warna: <span className="text-slate-600">{item.targetColor}</span></div>
                    </td>

                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-3xs font-bold text-slate-700">
                        {item.polymerType}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-3xs font-semibold ${
                        item.qcStatus === 'Lulus QC'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {item.qcStatus}
                      </span>
                      <div className="text-3xs text-slate-400 font-mono mt-0.5">
                        MFI: {item.mfi}
                      </div>
                    </td>

                    <td className="py-2 px-3 text-right">
                      <div className="font-bold text-slate-800 text-sm">{formatWeight(item.currentStockKg)}</div>
                      <div className="text-3xs text-slate-400">
                        Awal: {formatNumber(item.originalOutputKg, 0)} Kg
                      </div>
                    </td>

                    <td className="py-2 px-3 text-center">
                      <span className="font-bold text-slate-800 font-mono">
                        {item.availableBags} Sak
                      </span>
                      <div className="text-3xs text-slate-400 font-mono">
                        @ {item.bagWeightKg} Kg {item.sisaKg > 0 ? `+ ${item.sisaKg} Kg` : ''}
                      </div>
                    </td>

                    <td className="py-2 px-3 text-right">
                      <span className="font-bold text-violet-600">{formatRupiah(item.hppFinalPelletPerKg)}</span>
                    </td>

                    <td className="py-2 px-3 text-right">
                      <span className="font-bold text-emerald-600">{formatRupiah(item.totalAssetValue)}</span>
                    </td>

                    <td className="py-2 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-3xs font-semibold ${getStatusBadge(item.stockStatus)}`}>
                        {item.stockStatus}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-center sticky right-0 bg-white/95 font-sans">
                      <div className="flex items-center justify-center flex-wrap gap-1">
                        {/* 1-Click Fast Workflow: Jual / Buat DO */}
                        {item.currentStockKg > 0 && onFastCreateSale && (
                          <button
                            onClick={() => onFastCreateSale(item)}
                            className="px-2 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-3xs flex items-center space-x-1 shadow-2xs transition"
                            title="Buat Surat Jalan & Faktur Penjualan langsung untuk lot pelet ini"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>Jual / DO</span>
                          </button>
                        )}

                        {/* Cetak Label Karung Sak (25 Kg) */}
                        {onOpenBagLabel && (
                          <button
                            onClick={() => onOpenBagLabel(item)}
                            className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-3xs flex items-center space-x-1 border border-amber-200 transition"
                            title="Preview & Cetak Label Karung Sak 25 Kg"
                          >
                            <Tag className="w-3 h-3" />
                            <span>Label Sak</span>
                          </button>
                        )}

                        {/* Lacak Silsilah Batch */}
                        {onOpenTraceability && (
                          <button
                            onClick={() => onOpenTraceability(item.lotNo)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                            title="Lacak Silsilah (Traceability) Batch Hulu ke Hilir"
                          >
                            <GitBranch className="w-3.5 h-3.5 text-violet-500" />
                          </button>
                        )}

                        {/* QC Edit */}
                        <button
                          onClick={() => {
                            setEditingQcItem(item);
                            setQcModalOpen(true);
                          }}
                          className="px-1.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-3xs flex items-center space-x-0.5"
                          title="Koreksi QC & MFI"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>QC</span>
                        </button>

                        {/* Stock Opname Fisik */}
                        <button
                          onClick={() => {
                            setEditingOpname({
                              targetLotNo: item.lotNo,
                              bookStockKg: item.currentStockKg,
                              actualStockKg: item.currentStockKg,
                              date: new Date().toISOString().slice(0, 10),
                              pic: 'Mandor Gudang Pelet',
                              reason: 'Koreksi timbangan fisik sak'
                            });
                            setOpnameModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition"
                          title="Catat Stock Opname Lot Ini"
                        >
                          <Scale className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Data Lot Pelet */}
                        <button
                          onClick={() => {
                            setEditingLot(item);
                            setEditLotModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition"
                          title="Edit Spesifikasi Lot Pelet"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Hapus Lot */}
                        <button
                          onClick={() => handleDeleteLot(item)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 transition"
                          title="Hapus Lot Pelet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPellets.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400 font-sans">
                      Tidak ada data biji pelet di gudang barang jadi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GUDANG CACAHAN FLAKES */}
      {activeSubTab === 'flakes' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden text-xs">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari Batch Flakes, Polimer, Warna..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-2.5 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 text-xs"
              />
            </div>
            <span className="text-3xs text-slate-400 hidden sm:inline">
              Buffer bahan bersih siap compounding / ekstrusi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-3xs uppercase text-slate-400 font-semibold tracking-wider">
                  <th className="py-2.5 px-3">Kode Batch Flakes</th>
                  <th className="py-2.5 px-3">Nama Cacahan Flakes</th>
                  <th className="py-2.5 px-3 text-center">Polimer</th>
                  <th className="py-2.5 px-3">Warna Flakes</th>
                  <th className="py-2.5 px-3 text-right">Sisa Stok (Kg)</th>
                  <th className="py-2.5 px-3 text-right">HPP Flakes / Kg</th>
                  <th className="py-2.5 px-3 text-right">Nilai Aset Flakes</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center sticky right-0 bg-white/95">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {filteredFlakes.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2 px-3">
                      <button
                        type="button"
                        onClick={() => onOpenTraceability && onOpenTraceability(f.outputFlakesBatchNo)}
                        className="font-bold text-violet-600 hover:text-violet-700 hover:underline flex items-center space-x-1 text-left"
                        title="Klik untuk melihat silsilah batch flakes"
                      >
                        <GitBranch className="w-3 h-3 shrink-0 text-violet-400" />
                        <span>{f.outputFlakesBatchNo}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenTraceability && onOpenTraceability(f.rawBatchNo)}
                        className="text-3xs text-slate-400 hover:text-slate-600 hover:underline block text-left"
                      >
                        Reject: {f.rawBatchNo}
                      </button>
                    </td>

                    <td className="py-2 px-3 font-sans">
                      <div className="font-semibold text-slate-800 leading-snug">{f.flakesName}</div>
                      <div className="text-3xs text-slate-400">Kadar Air: &lt; 1% (Centrifugal)</div>
                    </td>

                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-3xs font-bold text-slate-700">
                        {f.polymerCode}
                      </span>
                    </td>

                    <td className="py-2 px-3 font-sans text-slate-600">
                      {f.flakesColor}
                    </td>

                    <td className="py-2 px-3 text-right">
                      <div className="font-bold text-slate-800">{formatWeight(f.remainingFlakesKg)}</div>
                      <div className="text-3xs text-slate-400">
                        Total Cuci: {formatNumber(f.outputFlakesKg, 0)} Kg
                      </div>
                    </td>

                    <td className="py-2 px-3 text-right">
                      <span className="font-bold text-violet-600">{formatRupiah(f.hppFlakesPerKg)}</span>
                    </td>

                    <td className="py-2 px-3 text-right">
                      <span className="font-bold text-emerald-600">{formatRupiah(f.assetValue)}</span>
                    </td>

                    <td className="py-2 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-3xs font-semibold ${getStatusBadge(f.flakesStockStatus)}`}>
                        {f.flakesStockStatus}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-center sticky right-0 bg-white/95 font-sans">
                      <div className="flex items-center justify-center space-x-1">
                        {f.remainingFlakesKg > 0 && onFastCreateSPK && (
                          <button
                            onClick={() => onFastCreateSPK(f)}
                            className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-3xs flex items-center space-x-1 shadow-2xs transition"
                            title="Buat SPK Blending Ekstrusi menggunakan flakes ini"
                          >
                            <Zap className="w-3 h-3 text-amber-300" />
                            <span>Buat SPK</span>
                          </button>
                        )}
                        {onOpenTraceability && (
                          <button
                            onClick={() => onOpenTraceability(f.outputFlakesBatchNo)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                            title="Lacak Silsilah Batch Flakes"
                          >
                            <GitBranch className="w-3.5 h-3.5 text-violet-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredFlakes.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 font-sans">
                      Tidak ada stok cacahan flakes kering di gudang.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: RIWAYAT STOCK OPNAME */}
      {activeSubTab === 'opname' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden text-xs">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs">
              Log Penyesuaian Timbangan Fisik & Stock Opname Gudang
            </span>
            <button
              onClick={() => {
                setEditingOpname(null);
                setOpnameModalOpen(true);
              }}
              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Opname Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-3xs uppercase text-slate-400 font-semibold tracking-wider">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Target Lot / Batch</th>
                  <th className="py-2.5 px-3 text-right">Stok Buku (Kg)</th>
                  <th className="py-2.5 px-3 text-right">Fisik Riil (Kg)</th>
                  <th className="py-2.5 px-3 text-right">Selisih (+/- Kg)</th>
                  <th className="py-2.5 px-3">Alasan / Keterangan</th>
                  <th className="py-2.5 px-3">PIC Penimbang</th>
                  <th className="py-2.5 px-3 text-center sticky right-0 bg-white/95">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {stockAdjustments.map((adj) => (
                  <tr key={adj.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2 px-3 text-slate-600 font-sans">{formatDate(adj.date)}</td>
                    <td className="py-2 px-3">
                      <button
                        type="button"
                        onClick={() => onOpenTraceability && onOpenTraceability(adj.targetLotNo)}
                        className="font-bold text-violet-600 hover:text-violet-700 hover:underline flex items-center space-x-1 text-left"
                      >
                        <GitBranch className="w-3 h-3 text-violet-400" />
                        <span>{adj.targetLotNo}</span>
                      </button>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-500">{formatWeight(adj.bookStockKg || 0)}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-800">{formatWeight(adj.actualStockKg || 0)}</td>
                    <td className="py-2 px-3 text-right font-bold">
                      <span className={adj.deltaKg < 0 ? 'text-rose-500' : 'text-emerald-600'}>
                        {adj.deltaKg > 0 ? `+${adj.deltaKg}` : adj.deltaKg} Kg
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 font-sans">{adj.reason || '-'}</td>
                    <td className="py-2 px-3 text-slate-500 font-sans">{adj.pic || '-'}</td>
                    <td className="py-2 px-3 text-center sticky right-0 bg-white/95 font-sans">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => {
                            setEditingOpname(adj);
                            setOpnameModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600"
                          title="Edit Catatan Opname"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRequestDelete({
                            title: 'Hapus Penyesuaian Opname',
                            message: `Yakin ingin menghapus catatan penyesuaian untuk lot ${adj.targetLotNo}? Stok sistem akan dikembalikan ke saldo semula.`,
                            onConfirm: () => setStockAdjustments(prev => prev.filter(x => x.id !== adj.id))
                          })}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {stockAdjustments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                      Belum ada catatan stock opname fisik.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: STOCK OPNAME FISIK */}
      {opnameModalOpen && (
        <OpnameModal
          item={editingOpname}
          availableLots={finishedGoodsPelletInventory}
          onSave={handleSaveOpname}
          onClose={() => {
            setOpnameModalOpen(false);
            setEditingOpname(null);
          }}
        />
      )}

      {/* MODAL: EDIT STATUS QC & MFI */}
      {qcModalOpen && editingQcItem && (
        <QcEditModal
          item={editingQcItem}
          onSave={handleSaveQc}
          onClose={() => {
            setQcModalOpen(false);
            setEditingQcItem(null);
          }}
        />
      )}

      {/* MODAL: EDIT DATA SPESIFIKASI LOT PELET */}
      {editLotModalOpen && editingLot && (
        <EditLotModal
          item={editingLot}
          onSave={handleSaveLot}
          onClose={() => {
            setEditLotModalOpen(false);
            setEditingLot(null);
          }}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Input & Edit Stock Opname Fisik
// -------------------------------------------------------------
function OpnameModal({ item, availableLots = [], onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const defaultLot = availableLots[0]?.lotNo || '';

  const [formData, setFormData] = useState({
    targetLotNo: item?.targetLotNo || defaultLot,
    date: item?.date || today,
    bookStockKg: item?.bookStockKg !== undefined ? item.bookStockKg : (availableLots.find(l => l.lotNo === defaultLot)?.currentStockKg || 0),
    actualStockKg: item?.actualStockKg !== undefined ? item.actualStockKg : (availableLots.find(l => l.lotNo === defaultLot)?.currentStockKg || 0),
    reason: item?.reason || 'Koreksi timbangan fisik timbangan jembatan/lantai',
    pic: item?.pic || 'Kepala Regu Gudang'
  });

  const handleLotChange = (selectedLot) => {
    const matched = availableLots.find(l => l.lotNo === selectedLot);
    setFormData(prev => ({
      ...prev,
      targetLotNo: selectedLot,
      bookStockKg: matched ? matched.currentStockKg : prev.bookStockKg,
      actualStockKg: matched ? matched.currentStockKg : prev.actualStockKg
    }));
  };

  const deltaKg = (Number(formData.actualStockKg) || 0) - (Number(formData.bookStockKg) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.targetLotNo) return;
    onSave({
      ...formData,
      bookStockKg: Number(formData.bookStockKg),
      actualStockKg: Number(formData.actualStockKg),
      deltaKg
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden text-xs text-slate-800">
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-violet-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              {item ? 'Koreksi Catatan Opname' : 'Input Penyesuaian Stock Opname Fisik'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 font-sans">
          <div>
            <label className="block text-slate-500 text-2xs mb-1 font-semibold">Pilih Lot Biji Plastik Pelet *</label>
            <select
              required
              value={formData.targetLotNo}
              onChange={e => handleLotChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-mono text-xs focus:bg-white focus:border-violet-500"
            >
              <option value="">-- Pilih Lot Pelet --</option>
              {availableLots.map(l => (
                <option key={l.lotNo} value={l.lotNo}>
                  {l.lotNo} - {l.productName} ({formatWeight(l.currentStockKg)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Tanggal Opname *</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">PIC / Petugas Penimbang</label>
              <input
                type="text"
                value={formData.pic}
                onChange={e => setFormData({ ...formData, pic: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <label className="block text-slate-500 text-3xs mb-1 font-semibold">Stok Buku (Kg)</label>
              <input
                readOnly
                type="number"
                value={formData.bookStockKg}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-emerald-700 text-3xs font-semibold mb-1">Timbangan Fisik Riil (Kg) *</label>
              <input
                required
                type="number"
                step="0.1"
                value={formData.actualStockKg}
                onChange={e => setFormData({ ...formData, actualStockKg: e.target.value })}
                className="w-full bg-white border border-emerald-300 rounded-lg px-2 py-1.5 text-emerald-700 font-mono font-black text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500 font-sans">Selisih Stok (Delta):</span>
            <span className={`font-bold text-sm ${deltaKg < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
              {deltaKg > 0 ? `+${deltaKg}` : deltaKg} Kg
            </span>
          </div>

          <div>
            <label className="block text-slate-500 text-2xs mb-1 font-semibold">Alasan Penyesuaian *</label>
            <input
              required
              type="text"
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Misal: Karung sobek / Kalibrasi timbangan / Koreksi fisik"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-xs"
            >
              Simpan Opname
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Edit Status QC & MFI Lot
// -------------------------------------------------------------
function QcEditModal({ item, onSave, onClose }) {
  const [qcStatus, setQcStatus] = useState(item.qcStatus || 'Lulus QC');
  const [mfi, setMfi] = useState(item.mfi || '12 - 14 g/10min');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item.lotNo, qcStatus, mfi);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-sm w-full overflow-hidden text-xs text-slate-800">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-violet-600" />
            <h3 className="font-bold text-slate-800 text-sm">Update QC Lot: {item.lotNo}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 font-sans">
          <div>
            <label className="block text-slate-500 text-2xs mb-1 font-semibold">Status Pengujian QC *</label>
            <select
              value={qcStatus}
              onChange={e => setQcStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
            >
              <option value="Lulus QC">Lulus QC (Siap Dijual / Kirim)</option>
              <option value="Karantina">Karantina / Hold (Perlu Evaluasi Ulang)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 text-2xs mb-1 font-semibold">Hasil Uji MFI / Flow Rate</label>
            <input
              type="text"
              value={mfi}
              onChange={e => setMfi(e.target.value)}
              placeholder="Misal: 14.2 g/10min @ 230°C"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-semibold">Batal</button>
            <button type="submit" className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold">Simpan Status QC</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Edit Lot Pelet (Full CRUD)
// -------------------------------------------------------------
function EditLotModal({ item, onSave, onClose }) {
  const [formData, setFormData] = useState({
    lotNo: item.lotNo,
    spkNo: item.spkNo,
    productName: item.productName || '',
    targetColor: item.targetColor || '',
    outputPelletKg: item.originalOutputKg || item.currentStockKg || 1000,
    bagWeightKg: item.bagWeightKg || 25,
    qcStatus: item.qcStatus || 'Lulus QC',
    mfi: item.mfi || '12 - 14 g/10min'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden text-xs text-slate-800">
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Pencil className="w-4 h-4 text-violet-600" />
            <h3 className="font-bold text-slate-800 text-sm">Edit Spesifikasi Lot: {item.lotNo}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 font-sans">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center text-xs">
            <span className="text-slate-500">Kode Lot:</span>
            <span className="font-mono font-bold text-violet-700">{item.lotNo}</span>
          </div>

          <div>
            <label className="block text-slate-500 text-2xs mb-1 font-semibold">Nama Produk Biji Plastik *</label>
            <input
              required
              type="text"
              value={formData.productName}
              onChange={e => setFormData({ ...formData, productName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-slate-500 text-2xs mb-1 font-semibold">Warna Pelet *</label>
            <input
              required
              type="text"
              value={formData.targetColor}
              onChange={e => setFormData({ ...formData, targetColor: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Timbangan Output (Kg) *</label>
              <input
                required
                type="number"
                step="0.1"
                value={formData.outputPelletKg}
                onChange={e => setFormData({ ...formData, outputPelletKg: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-mono text-xs focus:bg-white focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Kemasan Sak (Kg/Karung)</label>
              <input
                type="number"
                value={formData.bagWeightKg}
                onChange={e => setFormData({ ...formData, bagWeightKg: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-mono text-xs focus:bg-white focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Status QC</label>
              <select
                value={formData.qcStatus}
                onChange={e => setFormData({ ...formData, qcStatus: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              >
                <option value="Lulus QC">Lulus QC</option>
                <option value="Karantina">Karantina</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">MFI Flow Rate</label>
              <input
                type="text"
                value={formData.mfi}
                onChange={e => setFormData({ ...formData, mfi: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-semibold">Batal</button>
            <button type="submit" className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold">Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </div>
  );
}
