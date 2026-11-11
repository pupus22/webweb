import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Cog,
  Layers,
  Scale,
  Sparkles,
  Flame,
  AlertCircle,
  X
} from 'lucide-react';
import { formatRupiah, formatNumber, formatWeight, formatPercent, formatDate, getStatusBadge } from '../utils/formatters';

export default function ProductionModule({
  recalibratedProductions,
  setProductions,
  recalibratedPurchases,
  plasticTypes,
  costComponents,
  onRequestDelete
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState('ALL');
  const [modalState, setModalState] = useState({ isOpen: false, item: null });

  const defaultOpCost = costComponents.reduce((acc, c) => acc + (Number(c.ratePerKg) || 0), 0) || 1750;

  const handleSaveProduction = (formData) => {
    if (modalState.item) {
      setProductions(prev => prev.map(p => p.id === modalState.item.id ? { ...p, ...formData } : p));
    } else {
      const newId = `PRD-${String(Date.now()).slice(-4)}`;
      setProductions(prev => [
        {
          id: newId,
          ...formData
        },
        ...prev
      ]);
    }
    setModalState({ isOpen: false, item: null });
  };

  const filteredProductions = recalibratedProductions.filter(p => {
    const matchesSearch = `${p.spkNo} ${p.targetProductName} ${p.targetColor} ${p.targetType} ${p.operator} ${p.machine}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesMode = modeFilter === 'ALL' || p.mode === modeFilter;
    return matchesSearch && matchesMode;
  });

  return (
    <div className="space-y-3">
      {/* Top Filter and Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No. SPK, Produk, Warna, Mesin..."
              className="w-full bg-slate-950 border border-slate-700 rounded-md pl-8 pr-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
          >
            <option value="ALL">Semua Mode</option>
            <option value="single">Single Material</option>
            <option value="multi_blend">Multi-Plastic Blending</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setModalState({ isOpen: true, item: null })}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-md font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Buat SPK Blending Baru</span>
          </button>
        </div>
      </div>

      {/* High-density productions table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-2xs uppercase tracking-wider">
                <th className="py-2.5 px-3">No. SPK & Tgl</th>
                <th className="py-2.5 px-3">Mode & Target Produk</th>
                <th className="py-2.5 px-3">Komposisi Bahan Masuk</th>
                <th className="py-2.5 px-3 text-right">Total Input (Kg)</th>
                <th className="py-2.5 px-3 text-right">Hasil Pelet (Kg)</th>
                <th className="py-2.5 px-3 text-right">Susut (Loss)</th>
                <th className="py-2.5 px-3 text-right">HPP / Kg</th>
                <th className="py-2.5 px-3 text-right">Total Biaya SPK</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredProductions.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2 px-3">
                    <div className="font-mono font-bold text-amber-400">{prod.spkNo}</div>
                    <div className="text-2xs text-slate-400">{formatDate(prod.date)}</div>
                    <div className="text-2xs text-slate-400 truncate max-w-[120px]">{prod.machine || '-'}</div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-semibold text-white">{prod.targetProductName}</div>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className={`px-1.5 py-0.2 rounded text-2xs font-semibold ${
                        prod.mode === 'multi_blend'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        {prod.mode === 'multi_blend' ? 'Blending' : 'Single'}
                      </span>
                      <span className="text-2xs text-slate-400 font-medium">Warna: {prod.targetColor || '-'}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="text-2xs space-y-0.5 max-w-[220px]">
                      {(prod.inputs || []).map((inp, idx) => {
                        const ratio = prod.totalInputKg > 0 ? (inp.weightUsedKg / prod.totalInputKg) * 100 : 0;
                        return (
                          <div key={idx} className="flex justify-between items-center text-slate-300">
                            <span className="truncate pr-1 text-slate-400">{inp.materialName || inp.batchNo}</span>
                            <span className="font-mono text-emerald-400 whitespace-nowrap">
                              {formatNumber(inp.weightUsedKg, 0)} Kg ({formatPercent(ratio)})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-300">
                    {formatNumber(prod.totalInputKg, 1)} Kg
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                    <div>{formatNumber(prod.outputKg, 1)} Kg</div>
                    <div className="text-2xs text-slate-400 font-sans font-normal">
                      ~{prod.bagCount || Math.floor(prod.outputKg / (prod.bagWeightKg || 25))} Karung @ {prod.bagWeightKg || 25} Kg
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right font-mono">
                    <div className="text-rose-400 font-semibold">-{formatNumber(prod.shrinkageKg, 1)} Kg</div>
                    <span className={`px-1.5 py-0.2 rounded text-2xs font-semibold inline-block mt-0.5 ${
                      prod.shrinkagePercent > 6
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {formatPercent(prod.shrinkagePercent)}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-sky-400">
                    {formatRupiah(prod.hppPerKg)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-white">
                    <div className="font-semibold">{formatRupiah(prod.totalProductionCost)}</div>
                    <div className="text-2xs text-slate-400">
                      Olah: {formatRupiah(prod.totalOperationalCost)}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-2xs font-medium ${getStatusBadge(prod.status)}`}>
                      {prod.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => setModalState({ isOpen: true, item: prod })}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Edit SPK / Koreksi Komposisi & Timbangan Hasil"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRequestDelete({
                          title: `Hapus SPK ${prod.spkNo}`,
                          message: `Yakin ingin menghapus ${prod.spkNo}? Stok pelet di gudang barang jadi akan ditarik dan stok bahan baku akan dikembalikan.`,
                          onConfirm: () => setProductions(prev => prev.filter(x => x.id !== prod.id))
                        })}
                        className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-rose-200"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProductions.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
                    Tidak ditemukan data SPK produksi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Modal */}
      {modalState.isOpen && (
        <ProductionFormModal
          item={modalState.item}
          recalibratedPurchases={recalibratedPurchases}
          plasticTypes={plasticTypes}
          defaultOpCost={defaultOpCost}
          onSave={handleSaveProduction}
          onClose={() => setModalState({ isOpen: false, item: null })}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------
// Sub-Modal: Production Form Modal (Single & Multi-Plastic Blending)
// -----------------------------------------------------------------
function ProductionFormModal({ item, recalibratedPurchases, plasticTypes, defaultOpCost, onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const defaultSpk = `SPK-${today.replace(/-/g, '').slice(2)}-${String(Date.now()).slice(-3)}`;

  const availablePurchases = recalibratedPurchases.filter(p => p.remainingKg > 0 || (item && item.inputs?.some(i => i.purchaseBatchId === p.id)));

  const [mode, setMode] = useState(item?.mode || 'multi_blend');
  const [formData, setFormData] = useState({
    spkNo: item?.spkNo || defaultSpk,
    date: item?.date || today,
    targetProductName: item?.targetProductName || 'Pelet Biji Plastik PP Compounding',
    targetColor: item?.targetColor || 'Hitam Doff',
    targetType: item?.targetType || 'PP',
    operator: item?.operator || 'Regu Shift 1',
    machine: item?.machine || 'Extruder Line 1',
    status: item?.status || 'Selesai',
    operationalCostPerKg: item?.operationalCostPerKg !== undefined ? item.operationalCostPerKg : defaultOpCost,
    outputKg: item?.outputKg !== undefined ? item.outputKg : 1000,
    bagWeightKg: item?.bagWeightKg || 25,
    notes: item?.notes || ''
  });

  // Inputs composition array
  const initialInputs = item?.inputs && item.inputs.length > 0
    ? item.inputs.map(inp => ({
        purchaseBatchId: inp.purchaseBatchId || '',
        plasticTypeId: inp.plasticTypeId || '',
        batchNo: inp.batchNo || '',
        materialName: inp.materialName || '',
        weightUsedKg: inp.weightUsedKg || 0,
        costPerKg: inp.costPerKg || 0
      }))
    : [
        {
          purchaseBatchId: availablePurchases[0]?.id || '',
          plasticTypeId: availablePurchases[0]?.plasticTypeId || '',
          batchNo: availablePurchases[0]?.batchNo || '',
          materialName: availablePurchases[0]?.plasticName || 'Bahan Baku',
          weightUsedKg: 1050,
          costPerKg: availablePurchases[0]?.pricePerKg || 8500
        }
      ];

  const [inputs, setInputs] = useState(initialInputs);

  // Switch mode helper
  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'single' && inputs.length > 1) {
      setInputs([inputs[0]]);
    }
  };

  // Add ingredient row (for multi-blend)
  const handleAddIngredient = () => {
    const defaultBatch = availablePurchases.find(p => !inputs.some(i => i.purchaseBatchId === p.id)) || availablePurchases[0];
    setInputs(prev => [
      ...prev,
      {
        purchaseBatchId: defaultBatch?.id || '',
        plasticTypeId: defaultBatch?.plasticTypeId || '',
        batchNo: defaultBatch?.batchNo || '',
        materialName: defaultBatch?.plasticName || 'Bahan Campuran',
        weightUsedKg: 100,
        costPerKg: defaultBatch?.pricePerKg || 8000
      }
    ]);
  };

  // Update ingredient row
  const handleUpdateIngredient = (index, field, value) => {
    setInputs(prev => prev.map((inp, idx) => {
      if (idx !== index) return inp;
      if (field === 'purchaseBatchId') {
        const found = recalibratedPurchases.find(p => p.id === value);
        return {
          ...inp,
          purchaseBatchId: value,
          batchNo: found?.batchNo || '',
          materialName: found ? `${found.batchNo} (${found.plasticName})` : '',
          plasticTypeId: found?.plasticTypeId || inp.plasticTypeId,
          costPerKg: found?.pricePerKg || inp.costPerKg
        };
      }
      return {
        ...inp,
        [field]: value
      };
    }));
  };

  // Remove ingredient row
  const handleRemoveIngredient = (index) => {
    if (inputs.length <= 1) return;
    setInputs(prev => prev.filter((_, idx) => idx !== index));
  };

  // Live calculations
  const totalInputKg = inputs.reduce((acc, i) => acc + (Number(i.weightUsedKg) || 0), 0);
  const totalMaterialCost = inputs.reduce((acc, i) => acc + ((Number(i.weightUsedKg) || 0) * (Number(i.costPerKg) || 0)), 0);
  const outputKg = Number(formData.outputKg) || 0;
  const opCostPerKg = Number(formData.operationalCostPerKg) || 0;
  const totalOpCost = outputKg * opCostPerKg;
  const totalProductionCost = totalMaterialCost + totalOpCost;
  const shrinkageKg = Math.max(0, totalInputKg - outputKg);
  const shrinkagePercent = totalInputKg > 0 ? (shrinkageKg / totalInputKg) * 100 : 0;
  const hppPerKg = outputKg > 0 ? (totalProductionCost / outputKg) : 0;
  const bagCount = Math.floor(outputKg / (formData.bagWeightKg || 25));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.spkNo || inputs.length === 0 || outputKg <= 0) return;

    const payload = {
      ...formData,
      mode,
      inputs: inputs.map(i => ({
        ...i,
        weightUsedKg: Number(i.weightUsedKg),
        costPerKg: Number(i.costPerKg),
        subtotalCost: Number(i.weightUsedKg) * Number(i.costPerKg)
      })),
      totalInputKg,
      totalMaterialCost,
      operationalCostPerKg: opCostPerKg,
      totalOperationalCost: totalOpCost,
      totalProductionCost,
      outputKg,
      bagCount,
      shrinkageKg,
      shrinkagePercent,
      hppPerKg
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-w-3xl w-full my-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <Cog className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              {item ? `Koreksi SPK Produksi: ${item.spkNo}` : 'Buat SPK Produksi & Blending Baru'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
          {/* Mode Switcher */}
          <div className="flex items-center space-x-2 p-1.5 bg-slate-950 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => handleModeChange('multi_blend')}
              className={`flex-1 py-1.5 px-3 rounded-md font-semibold text-xs transition flex items-center justify-center space-x-1.5 ${
                mode === 'multi_blend'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Plastic Blending (Campuran Campur & Aditif)</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('single')}
              className={`flex-1 py-1.5 px-3 rounded-md font-semibold text-xs transition flex items-center justify-center space-x-1.5 ${
                mode === 'single'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Single Material (1 Batch Reject Murni)</span>
            </button>
          </div>

          {/* SPK Header Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">No. SPK *</label>
              <input
                type="text"
                required
                value={formData.spkNo}
                onChange={e => setFormData({ ...formData, spkNo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono uppercase focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Tanggal Produksi *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Mesin / Line Extruder</label>
              <input
                type="text"
                value={formData.machine}
                onChange={e => setFormData({ ...formData, machine: e.target.value })}
                placeholder="misal: Extruder Line 1"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Operator / Shift</label>
              <input
                type="text"
                value={formData.operator}
                onChange={e => setFormData({ ...formData, operator: e.target.value })}
                placeholder="misal: Shift 1 - Joko"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* Target Product Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-medium mb-1">Target Nama Biji Plastik *</label>
              <input
                type="text"
                required
                value={formData.targetProductName}
                onChange={e => setFormData({ ...formData, targetProductName: e.target.value })}
                placeholder="misal: Pelet Biji Plastik PP Hitam Injection Grade"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Warna Pelet</label>
              <input
                type="text"
                value={formData.targetColor}
                onChange={e => setFormData({ ...formData, targetColor: e.target.value })}
                placeholder="Hitam Doff, Putih Susu, Natural"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* Recipe / Ingredients Input Section */}
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xs font-bold text-slate-300 uppercase tracking-wider block">
                  Komposisi Resep Bahan Masuk (Input Formulation)
                </span>
                <span className="text-2xs text-slate-400">
                  {mode === 'multi_blend'
                    ? 'Campurkan beberapa batch bahan reject + masterbatch aditif secara proporsional.'
                    : '1 Batch bahan baku reject langsung dilelehkan dan dicetak pelet.'}
                </span>
              </div>
              {mode === 'multi_blend' && (
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Campuran / Aditif</span>
                </button>
              )}
            </div>

            <div className="space-y-2 mt-2">
              {inputs.map((inp, idx) => {
                const ratio = totalInputKg > 0 ? (inp.weightUsedKg / totalInputKg) * 100 : 0;
                const matchedPurchase = recalibratedPurchases.find(p => p.id === inp.purchaseBatchId);
                const isOverStock = matchedPurchase && inp.weightUsedKg > (matchedPurchase.remainingKg + (item ? (item.inputs?.find(x => x.purchaseBatchId === inp.purchaseBatchId)?.weightUsedKg || 0) : 0));

                return (
                  <div key={idx} className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-5">
                        <label className="block text-2xs text-slate-400 mb-0.5">Pilih Batch Bahan Baku</label>
                        <select
                          value={inp.purchaseBatchId}
                          onChange={e => handleUpdateIngredient(idx, 'purchaseBatchId', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-white text-xs focus:outline-hidden focus:border-amber-500"
                        >
                          <option value="">-- Pilih Batch --</option>
                          {availablePurchases.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.batchNo} - {p.plasticName} (Sisa: {formatNumber(p.remainingKg, 0)} Kg @ {formatRupiah(p.pricePerKg)})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-2xs text-slate-400 mb-0.5">Berat Pakai (Kg) *</label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          required
                          value={inp.weightUsedKg}
                          onChange={e => handleUpdateIngredient(idx, 'weightUsedKg', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-white font-mono text-right text-xs focus:outline-hidden focus:border-amber-500"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-2xs text-slate-400 mb-0.5">Subtotal Bahan</label>
                        <div className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-right font-mono text-xs text-emerald-400">
                          {formatRupiah(inp.weightUsedKg * inp.costPerKg)}
                        </div>
                      </div>

                      <div className="sm:col-span-1 flex items-end justify-center pt-3 sm:pt-0">
                        {inputs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(idx)}
                            className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded"
                            title="Hapus baris bahan ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-2xs text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>
                        Harga beli batch: <strong>{formatRupiah(inp.costPerKg)}/Kg</strong>
                        {isOverStock && (
                          <span className="text-rose-400 font-semibold ml-2">⚠️ Melebihi stok sisa batch!</span>
                        )}
                      </span>
                      <span className="font-semibold text-purple-300">
                        Rasio Resep: {formatPercent(ratio)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Input Summary */}
            <div className="flex justify-between items-center text-xs font-semibold p-2 bg-slate-900/90 rounded border border-slate-800 mt-2">
              <span className="text-slate-300">Total Input Bahan Masuk:</span>
              <div className="space-x-3 font-mono">
                <span className="text-white font-bold">{formatWeight(totalInputKg)}</span>
                <span className="text-emerald-400">{formatRupiah(totalMaterialCost)}</span>
              </div>
            </div>
          </div>

          {/* Output & Operational Costs */}
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-3">
            <span className="text-2xs font-bold text-slate-300 uppercase tracking-wider block">
              Hasil Timbangan Pelet & Biaya Olah
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Hasil Biji Plastik Bersih (Output Kg) *</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={formData.outputKg}
                  onChange={e => setFormData({ ...formData, outputKg: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-emerald-600/50 rounded px-2.5 py-1.5 text-emerald-400 font-mono font-bold text-base text-right focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Kemasan Sak (Kg/Karung)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    value={formData.bagWeightKg}
                    onChange={e => setFormData({ ...formData, bagWeightKg: Number(e.target.value) })}
                    className="w-20 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-right focus:outline-hidden focus:border-amber-500"
                  />
                  <span className="text-slate-400 font-mono">
                    = {bagCount} Karung
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Tarif Biaya Olah Pabrik (Rp/Kg)</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.operationalCostPerKg}
                  onChange={e => setFormData({ ...formData, operationalCostPerKg: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-right focus:outline-hidden focus:border-amber-500"
                />
                <span className="text-2xs text-slate-400 block text-right mt-0.5">
                  Total Biaya Olah: {formatRupiah(totalOpCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Live Automatic KPI Recalibration Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/60 font-mono">
            <div>
              <span className="text-2xs text-slate-400 block font-sans">Susut / Waste (Loss)</span>
              <span className="text-sm font-bold text-rose-400">
                -{formatWeight(shrinkageKg)}
              </span>
              <span className="text-2xs text-slate-400 block font-sans">
                ({formatPercent(shrinkagePercent)})
              </span>
            </div>

            <div>
              <span className="text-2xs text-slate-400 block font-sans">Total Biaya Bahan</span>
              <span className="text-sm font-bold text-white">
                {formatRupiah(totalMaterialCost)}
              </span>
            </div>

            <div>
              <span className="text-2xs text-slate-400 block font-sans">Total Beban SPK</span>
              <span className="text-sm font-bold text-amber-300">
                {formatRupiah(totalProductionCost)}
              </span>
            </div>

            <div className="border-l border-emerald-800/80 pl-3">
              <span className="text-2xs text-emerald-400 block font-sans font-bold">HPP Otomatis / Kg</span>
              <span className="text-base font-extrabold text-emerald-400">
                {formatRupiah(hppPerKg)}
              </span>
              <span className="text-2xs text-slate-400 block font-sans">per 1 Kg Pelet</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-2xs text-slate-400">
              * SPK selesai otomatis menciptakan batch pelet siap jual di Gudang Barang Jadi.
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-sm"
              >
                {item ? 'Simpan SPK & Rekalibrasi HPP' : 'Simpan SPK Produksi'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
