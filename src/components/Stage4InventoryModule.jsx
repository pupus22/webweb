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
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveSubTab('pellets')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-semibold whitespace-nowrap transition min-h-[40px] md:min-h-0 ${
              activeSubTab === 'pellets'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Gudang Biji Plastik (Pelet Jadi)</span>
            <span className="px-1.5 py-0.2 rounded-full text-2xs bg-purple-900/60 text-purple-200 font-mono">
              {finishedGoodsPelletInventory.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('flakes')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-semibold whitespace-nowrap transition min-h-[40px] md:min-h-0 ${
              activeSubTab === 'flakes'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Gudang Cacahan Flakes Kering</span>
            <span className="px-1.5 py-0.2 rounded-full text-2xs bg-blue-900/60 text-blue-200 font-mono">
              {recalibratedPreProcessings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('opname')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-semibold whitespace-nowrap transition min-h-[40px] md:min-h-0 ${
              activeSubTab === 'opname'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Riwayat Stock Opname</span>
            <span className="px-1.5 py-0.2 rounded-full text-2xs bg-emerald-900/60 text-emerald-200 font-mono">
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
            className="flex items-center space-x-1.5 px-3 py-2 md:py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-semibold transition min-h-[40px] md:min-h-0 text-xs w-full md:w-auto justify-center"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>+ Catat Stock Opname Fisik</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-2xs text-slate-400 block uppercase font-medium">Stok Pelet Siap Kirim</span>
            <span className="text-lg font-bold text-white font-mono">{formatWeight(totalPelletKg)}</span>
            <span className="text-2xs text-purple-400 block mt-0.5 font-mono">
              ~ {formatNumber(totalPelletBags, 0)} Karung Sak (@ 25 Kg)
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-2xs text-slate-400 block uppercase font-medium">Nilai Aset Pelet Gudang</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">{formatRupiah(totalPelletValue)}</span>
            <span className="text-2xs text-slate-500 block mt-0.5">Dihitung otomatis dari HPP Final</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-2xs text-slate-400 block uppercase font-medium">Stok Flakes Kering (Buffer)</span>
            <span className="text-lg font-bold text-blue-400 font-mono">{formatWeight(totalFlakesKg)}</span>
            <span className="text-2xs text-slate-500 block mt-0.5">Siap Blending di Mesin Ekstruder</span>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-2xs text-slate-400 block uppercase font-medium">Nilai Aset Cacahan Flakes</span>
            <span className="text-lg font-bold text-sky-400 font-mono">{formatRupiah(totalFlakesValue)}</span>
            <span className="text-2xs text-slate-500 block mt-0.5">Dari Hasil Cuci & Giling Bersih</span>
          </div>
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Boxes className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: GUDANG PELET BIJI PLASTIK */}
      {activeSubTab === 'pellets' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-xs">
          {/* Filter Bar */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex flex-col md:flex-row items-center justify-between gap-2.5">
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari Lot Pelet, SPK, Polimer, Warna..."
                className="w-full bg-slate-950 border border-slate-700 rounded-md pl-8 pr-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 text-xs"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              <select
                value={qcFilter}
                onChange={e => setQcFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white focus:outline-hidden focus:border-purple-500 text-xs"
              >
                <option value="ALL">Semua Status QC</option>
                <option value="Lulus QC">Lulus QC</option>
                <option value="Karantina">Karantina / Hold</option>
              </select>

              <select
                value={polymerFilter}
                onChange={e => setPolymerFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white focus:outline-hidden focus:border-purple-500 text-xs"
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
                <tr className="border-b border-slate-800 bg-slate-950/70 text-2xs uppercase text-slate-400 font-semibold tracking-wider">
                  <th className="py-2.5 px-3">Kode Lot & SPK</th>
                  <th className="py-2.5 px-3">Produk & Warna</th>
                  <th className="py-2.5 px-3 text-center">Polimer</th>
                  <th className="py-2.5 px-3 text-center">QC Status & MFI</th>
                  <th className="py-2.5 px-3 text-right">Stok Pelet (Kg)</th>
                  <th className="py-2.5 px-3 text-center">Kemasan Sak</th>
                  <th className="py-2.5 px-3 text-right">HPP Pelet / Kg</th>
                  <th className="py-2.5 px-3 text-right">Nilai Aset (Rp)</th>
                  <th className="py-2.5 px-3 text-center">Kesiapan</th>
                  <th className="py-2.5 px-3 text-center sticky right-0 bg-slate-950/90 min-w-[210px]">Aksi & Pintasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredPellets.map((item) => (
                  <tr key={item.lotNo} className="hover:bg-slate-800/40 transition">
                    <td className="py-2 px-3">
                      <button
                        type="button"
                        onClick={() => onOpenTraceability && onOpenTraceability(item.lotNo)}
                        className="font-bold text-purple-400 hover:text-purple-300 hover:underline flex items-center space-x-1 text-left"
                        title="Klik untuk melacak silsilah batch hulu ke hilir"
                      >
                        <GitBranch className="w-3 h-3 shrink-0 text-purple-400" />
                        <span>{item.lotNo}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenTraceability && onOpenTraceability(item.spkNo)}
                        className="text-2xs text-slate-500 hover:text-slate-300 hover:underline block text-left"
                      >
                        SPK: {item.spkNo}
                      </button>
                    </td>

                    <td className="py-2 px-3 font-sans">
                      <div className="font-semibold text-white leading-snug">{item.productName}</div>
                      <div className="text-2xs text-slate-400">Warna: <span className="text-slate-300">{item.targetColor}</span></div>
                    </td>

                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-2xs font-semibold text-purple-300">
                        {item.polymerType}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-2xs font-semibold ${
                        item.qcStatus === 'Lulus QC'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                      }`}>
                        {item.qcStatus}
                      </span>
                      <div className="text-2xs text-slate-400 font-mono mt-0.5">
                        MFI: {item.mfi}
                      </div>
                    </td>

                    <td className="py-2 px-3 text-right">
                      <div className="font-bold text-white text-sm">{formatWeight(item.currentStockKg)}</div>
                      <div className="text-2xs text-slate-400">
                        Awal: {formatNumber(item.originalOutputKg, 0)} Kg
                      </div>
                    </td>

                    <td className="py-2 px-3 text-center">
                      <span className="font-bold text-amber-300 font-mono">
                        {item.availableBags} Sak
                      </span>
                      <div className="text-2xs text-slate-500 font-mono">
                        @ {item.bagWeightKg} Kg {item.sisaKg > 0 ? `+ ${item.sisaKg} Kg` : ''}
                      </div>
                    </td>

                    <td className="py-2 px-3 text-right">
                      <span className="font-bold text-purple-300">{formatRupiah(item.hppFinalPelletPerKg)}</span>
                    </td>

                    <td className="py-2 px-3 text-right">
                      <span className="font-bold text-emerald-400">{formatRupiah(item.totalAssetValue)}</span>
                    </td>

                    <td className="py-2 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-2xs font-semibold ${getStatusBadge(item.stockStatus)}`}>
                        {item.stockStatus}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-center sticky right-0 bg-slate-950/95 font-sans">
                      <div className="flex items-center justify-center flex-wrap gap-1">
                        {/* 1-Click Fast Workflow: Jual / Buat DO */}
                        {item.currentStockKg > 0 && onFastCreateSale && (
                          <button
                            onClick={() => onFastCreateSale(item)}
                            className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-2xs flex items-center space-x-1 shadow-xs transition"
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
                            className="px-2 py-1 rounded bg-amber-950/80 hover:bg-amber-900 text-amber-300 hover:text-white text-2xs flex items-center space-x-1 border border-amber-500/30 transition"
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
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Lacak Silsilah (Traceability) Batch Hulu ke Hilir"
                          >
                            <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                          </button>
                        )}

                        {/* QC Edit */}
                        <button
                          onClick={() => {
                            setEditingQcItem(item);
                            setQcModalOpen(true);
                          }}
                          className="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-2xs flex items-center space-x-0.5"
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
                          className="p-1 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-500/30"
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
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="Edit Spesifikasi Lot Pelet"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Hapus Lot */}
                        <button
                          onClick={() => handleDeleteLot(item)}
                          className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-rose-200"
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
                    <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-xs">
          <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari Batch Flakes, Polimer, Warna..."
                className="w-full bg-slate-950 border border-slate-700 rounded-md pl-8 pr-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 text-xs"
              />
            </div>
            <span className="text-2xs text-slate-400 hidden sm:inline">
              Buffer bahan bersih siap compounding / ekstrusi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-2xs uppercase text-slate-400 font-semibold tracking-wider">
                  <th className="py-2.5 px-3">Kode Batch Flakes</th>
                  <th className="py-2.5 px-3">Nama Cacahan Flakes</th>
                  <th className="py-2.5 px-3 text-center">Polimer</th>
                  <th className="py-2.5 px-3">Warna Flakes</th>
                  <th className="py-2.5 px-3 text-right">Sisa Stok (Kg)</th>
                  <th className="py-2.5 px-3 text-right">HPP Flakes / Kg</th>
                  <th className="py-2.5 px-3 text-right">Nilai Aset Flakes</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center sticky right-0 bg-slate-950/90">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredFlakes.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2 px-3">
                      <button
                        type="button"
                        onClick={() => onOpenTraceability && onOpenTraceability(f.outputFlakesBatchNo)}
                        className="font-bold text-blue-400 hover:text-blue-300 hover:underline flex items-center space-x-1 text-left"
                        title="Klik untuk melihat silsilah batch flakes"
                      >
                        <GitBranch className="w-3 h-3 shrink-0 text-blue-400" />
                        <span>{f.outputFlakesBatchNo}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenTraceability && onOpenTraceability(f.rawBatchNo)}
                        className="text-2xs text-slate-500 hover:text-slate-300 hover:underline block text-left"
                      >
                        Reject: {f.rawBatchNo}
                      </button>
                    </td>

                    <td className="py-2 px-3 font-sans">
                      <div className="font-semibold text-white leading-snug">{f.flakesName}</div>
                      <div className="text-2xs text-slate-400">Kadar Air: &lt; 1% (Centrifugal)</div>
                    </td>

                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-2xs font-semibold text-blue-300">
                        {f.polymerCode}
                      </span>
                    </td>

                    <td className="py-2 px-3 font-sans text-slate-300">
                      {f.flakesColor}
                    </td>

                    <td className="py-2 px-3 text-right">
                      <div className="font-bold text-white">{formatWeight(f.remainingFlakesKg)}</div>
                      <div className="text-2xs text-slate-500">
                        Total Cuci: {formatNumber(f.outputFlakesKg, 0)} Kg
                      </div>
                    </td>

                    <td className="py-2 px-3 text-right">
                      <span className="font-bold text-sky-400">{formatRupiah(f.hppFlakesPerKg)}</span>
                    </td>

                    <td className="py-2 px-3 text-right">
                      <span className="font-bold text-emerald-400">{formatRupiah(f.assetValue)}</span>
                    </td>

                    <td className="py-2 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-2xs font-semibold ${getStatusBadge(f.flakesStockStatus)}`}>
                        {f.flakesStockStatus}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-center sticky right-0 bg-slate-950/90 font-sans">
                      <div className="flex items-center justify-center space-x-1">
                        {f.remainingFlakesKg > 0 && onFastCreateSPK && (
                          <button
                            onClick={() => onFastCreateSPK(f)}
                            className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-2xs flex items-center space-x-1 shadow-xs transition"
                            title="Buat SPK Blending Ekstrusi menggunakan flakes ini"
                          >
                            <Zap className="w-3 h-3 text-amber-300" />
                            <span>Buat SPK</span>
                          </button>
                        )}
                        {onOpenTraceability && (
                          <button
                            onClick={() => onOpenTraceability(f.outputFlakesBatchNo)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Lacak Silsilah Batch Flakes"
                          >
                            <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredFlakes.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500 font-sans">
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-xs">
          <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <span className="font-semibold text-white text-xs">
              Log Penyesuaian Timbangan Fisik & Stock Opname Gudang
            </span>
            <button
              onClick={() => {
                setEditingOpname(null);
                setOpnameModalOpen(true);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold text-xs flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Opname Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-2xs uppercase text-slate-400 font-semibold tracking-wider">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Target Lot / Batch</th>
                  <th className="py-2.5 px-3 text-right">Stok Buku (Kg)</th>
                  <th className="py-2.5 px-3 text-right">Fisik Riil (Kg)</th>
                  <th className="py-2.5 px-3 text-right">Selisih (+/- Kg)</th>
                  <th className="py-2.5 px-3">Alasan / Keterangan</th>
                  <th className="py-2.5 px-3">PIC Penimbang</th>
                  <th className="py-2.5 px-3 text-center sticky right-0 bg-slate-950/90">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {stockAdjustments.map((adj) => (
                  <tr key={adj.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2 px-3 text-slate-300 font-sans">{formatDate(adj.date)}</td>
                    <td className="py-2 px-3">
                      <button
                        type="button"
                        onClick={() => onOpenTraceability && onOpenTraceability(adj.targetLotNo)}
                        className="font-bold text-purple-400 hover:text-purple-300 hover:underline flex items-center space-x-1 text-left"
                      >
                        <GitBranch className="w-3 h-3 text-purple-400" />
                        <span>{adj.targetLotNo}</span>
                      </button>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400">{formatWeight(adj.bookStockKg || 0)}</td>
                    <td className="py-2 px-3 text-right font-bold text-white">{formatWeight(adj.actualStockKg || 0)}</td>
                    <td className="py-2 px-3 text-right font-bold">
                      <span className={adj.deltaKg < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {adj.deltaKg > 0 ? `+${adj.deltaKg}` : adj.deltaKg} Kg
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-300 font-sans">{adj.reason || '-'}</td>
                    <td className="py-2 px-3 text-slate-400 font-sans">{adj.pic || '-'}</td>
                    <td className="py-2 px-3 text-center sticky right-0 bg-slate-950/90 font-sans">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => {
                            setEditingOpname(adj);
                            setOpnameModalOpen(true);
                          }}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="Edit Catatan Opname"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onRequestDelete({
                            title: 'Hapus Penyesuaian Opname',
                            message: `Yakin ingin menghapus catatan penyesuaian untuk lot ${adj.targetLotNo}? Stok sistem akan dikembalikan ke saldo semula.`,
                            onConfirm: () => setStockAdjustments(prev => prev.filter(x => x.id !== adj.id))
                          })}
                          className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-rose-200"
                          title="Hapus"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {stockAdjustments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-xs">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">
              {item ? 'Koreksi Catatan Opname' : 'Input Penyesuaian Stock Opname Fisik'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 font-sans">
          <div>
            <label className="block text-slate-400 text-2xs mb-1">Pilih Lot Biji Plastik Pelet *</label>
            <select
              required
              value={formData.targetLotNo}
              onChange={e => handleLotChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-xs focus:outline-hidden focus:border-emerald-500"
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
              <label className="block text-slate-400 text-2xs mb-1">Tanggal Opname *</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-white text-xs focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-2xs mb-1">PIC / Petugas Penimbang</label>
              <input
                type="text"
                value={formData.pic}
                onChange={e => setFormData({ ...formData, pic: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-white text-xs focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div>
              <label className="block text-slate-400 text-2xs mb-1">Stok Sistem / Buku (Kg)</label>
              <input
                readOnly
                type="number"
                value={formData.bookStockKg}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-400 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-emerald-400 text-2xs font-semibold mb-1">Timbangan Fisik Riil (Kg) *</label>
              <input
                required
                type="number"
                step="0.1"
                value={formData.actualStockKg}
                onChange={e => setFormData({ ...formData, actualStockKg: e.target.value })}
                className="w-full bg-slate-900 border border-emerald-500 rounded px-2 py-1.5 text-white font-mono font-bold text-xs focus:outline-hidden"
              />
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 font-sans">Selisih Stok (Delta):</span>
            <span className={`font-bold text-sm ${deltaKg < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {deltaKg > 0 ? `+${deltaKg}` : deltaKg} Kg
            </span>
          </div>

          <div>
            <label className="block text-slate-400 text-2xs mb-1">Alasan Penyesuaian *</label>
            <input
              required
              type="text"
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Misal: Karung sobek / Kalibrasi timbangan / Koreksi fisik"
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-white text-xs focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden text-xs">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-white text-sm">Update QC Lot: {item.lotNo}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 font-sans">
          <div>
            <label className="block text-slate-400 text-2xs mb-1">Status Pengujian QC *</label>
            <select
              value={qcStatus}
              onChange={e => setQcStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-hidden focus:border-purple-500"
            >
              <option value="Lulus QC">Lulus QC (Siap Dijual / Kirim)</option>
              <option value="Karantina">Karantina / Hold (Perlu Evaluasi Ulang)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-2xs mb-1">Hasil Uji MFI / Flow Rate</label>
            <input
              type="text"
              value={mfi}
              onChange={e => setMfi(e.target.value)}
              placeholder="Misal: 14.2 g/10min @ 230°C"
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">Batal</button>
            <button type="submit" className="px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold">Simpan Status QC</button>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-xs">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <Pencil className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-white text-sm">Edit Spesifikasi Lot: {item.lotNo}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 font-sans">
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Kode Lot:</span>
            <span className="font-mono font-bold text-purple-400">{item.lotNo}</span>
          </div>

          <div>
            <label className="block text-slate-400 text-2xs mb-1">Nama Produk Biji Plastik *</label>
            <input
              required
              type="text"
              value={formData.productName}
              onChange={e => setFormData({ ...formData, productName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-2xs mb-1">Warna Pelet *</label>
            <input
              required
              type="text"
              value={formData.targetColor}
              onChange={e => setFormData({ ...formData, targetColor: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-2xs mb-1">Timbangan Output (Kg) *</label>
              <input
                required
                type="number"
                step="0.1"
                value={formData.outputPelletKg}
                onChange={e => setFormData({ ...formData, outputPelletKg: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-xs focus:outline-hidden focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-2xs mb-1">Kemasan Sak (Kg/Karung)</label>
              <input
                type="number"
                value={formData.bagWeightKg}
                onChange={e => setFormData({ ...formData, bagWeightKg: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-xs focus:outline-hidden focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-2xs mb-1">Status QC</label>
              <select
                value={formData.qcStatus}
                onChange={e => setFormData({ ...formData, qcStatus: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-white text-xs focus:outline-hidden focus:border-purple-500"
              >
                <option value="Lulus QC">Lulus QC</option>
                <option value="Karantina">Karantina</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-2xs mb-1">MFI Flow Rate</label>
              <input
                type="text"
                value={formData.mfi}
                onChange={e => setFormData({ ...formData, mfi: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-white text-xs focus:outline-hidden focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">Batal</button>
            <button type="submit" className="px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold">Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </div>
  );
}
