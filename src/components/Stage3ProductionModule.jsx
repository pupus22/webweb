import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Flame,
  Layers,
  Sparkles,
  Scale,
  Settings,
  AlertCircle,
  X
} from 'lucide-react';
import {
  formatRupiah,
  formatNumber,
  formatWeight,
  formatPercent,
  formatDate,
  getStatusBadge
} from '../utils/formatters';

export default function Stage3ProductionModule({
  recalibratedProductionSPKs,
  setProductionSPKs,
  recalibratedPreProcessings,
  additives,
  costTariffs,
  onRequestDelete
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState('ALL');
  const [modalState, setModalState] = useState({ isOpen: false, item: null });

  // Filter available flakes batches with stock > 0
  const availableFlakesBatches = recalibratedPreProcessings.filter(
    p => p.remainingFlakesKg > 0 || (modalState.item && modalState.item.ingredients?.some(i => i.sourceId === p.id))
  );

  const handleSave = (formData) => {
    if (modalState.item) {
      setProductionSPKs(prev => prev.map(p => p.id === modalState.item.id ? { ...p, ...formData } : p));
    } else {
      const newId = `SPK-${String(Date.now()).slice(-4)}`;
      setProductionSPKs(prev => [
        {
          id: newId,
          ...formData
        },
        ...prev
      ]);
    }
    setModalState({ isOpen: false, item: null });
  };

  const filtered = recalibratedProductionSPKs.filter(spk => {
    const matchesSearch = `${spk.spkNo} ${spk.targetLotNo} ${spk.targetProductName} ${spk.targetColor} ${spk.polymerType} ${spk.extruderLine}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesMode = modeFilter === 'ALL' || spk.mode === modeFilter;
    return matchesSearch && matchesMode;
  });

  return (
    <div className="space-y-3">
      {/* Top Filter and Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari SPK, Lot, Produk, Mesin..."
              className="w-full bg-slate-950 border border-slate-700 rounded-md pl-8 pr-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-white focus:outline-hidden focus:border-purple-500"
          >
            <option value="ALL">Semua Mode</option>
            <option value="single">Single Flakes</option>
            <option value="multi_blend">Multi-Plastic Blending</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setModalState({ isOpen: true, item: null })}
            className="flex items-center space-x-1.5 px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 bg-purple-600 hover:bg-purple-500 text-white rounded-md font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Buat SPK Blending & Ekstrusi</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Flame className="w-4 h-4 text-purple-400" />
              <span>Tahap 3: Formulasi Blending & Ekstrusi Pelletizing (Compounding)</span>
            </h3>
            <p className="text-2xs text-slate-400">
              Mencampur cacahan flakes dengan aditif/masterbatch, melelehkan di extruder, filter kasa kawat, dan dicetak menjadi biji pelet.
            </p>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-2xs text-slate-400 block">Total SPK Terbit:</span>
            <span className="text-sm font-bold text-purple-400">{recalibratedProductionSPKs.length} Work Orders</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-2xs uppercase tracking-wider">
                <th className="py-2.5 px-3">No. SPK & Lot</th>
                <th className="py-2.5 px-3">Target Produk & Warna</th>
                <th className="py-2.5 px-3">Formulasi Resep Masuk</th>
                <th className="py-2.5 px-3">Parameter Mesin Extruder</th>
                <th className="py-2.5 px-3 text-right">Input (Kg)</th>
                <th className="py-2.5 px-3 text-right">Output Pelet (Kg)</th>
                <th className="py-2.5 px-3 text-right">Kerak / Purging</th>
                <th className="py-2.5 px-3 text-right">HPP Final / Kg</th>
                <th className="py-2.5 px-3 text-center">Status QC</th>
                <th className="py-2.5 px-3 text-center w-24 sticky right-0 bg-slate-900 shadow-md">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map(spk => (
                <tr key={spk.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-purple-400 block">{spk.spkNo}</span>
                    <span className="text-2xs text-white block">{spk.targetLotNo}</span>
                    <span className="text-2xs text-slate-500 font-sans">{formatDate(spk.date)}</span>
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="font-semibold text-white block truncate max-w-[200px]" title={spk.targetProductName}>
                      {spk.targetProductName}
                    </span>
                    <span className="text-2xs text-slate-400">
                      {spk.polymerType} • {spk.targetColor}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <div className="text-2xs space-y-0.5 max-w-[200px]">
                      {(spk.ingredients || []).map((ing, idx) => (
                        <div key={idx} className="flex justify-between text-slate-300">
                          <span className="truncate pr-1 text-slate-400">{ing.materialName}</span>
                          <span className="font-mono text-emerald-400 whitespace-nowrap">{formatNumber(ing.weightKg, 0)} Kg</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-2xs text-slate-300">
                    <span className="text-purple-300 font-medium block">{spk.extruderLine || 'Line Extruder'}</span>
                    <span className="text-slate-400 block">{spk.meshScreenSize || 'Mesh 80'}</span>
                    <span className="text-slate-500">{spk.cuttingMethod || 'Strand'}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {formatNumber(spk.totalInputMixKg, 1)} Kg
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                    <div>{formatNumber(spk.outputPelletKg, 1)} Kg</div>
                    <div className="text-2xs text-slate-400 font-sans font-normal">
                      ~{spk.bagCount} Sak @ {spk.bagWeightKg || 25} Kg
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-rose-400 font-bold block">
                      -{formatNumber(spk.wasteExtrusionKg, 1)} Kg
                    </span>
                    <span className="text-2xs px-1.5 py-0.2 rounded font-semibold bg-rose-950/80 text-rose-300 border border-rose-800">
                      {formatPercent(spk.wastePercentage)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-sky-400">
                    {formatRupiah(spk.hppFinalPelletPerKg)}
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <span className={`px-2 py-0.5 rounded-full text-2xs font-semibold ${getStatusBadge(spk.qcResult?.status)}`}>
                      {spk.qcResult?.status || 'Lulus QC'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center sticky right-0 bg-slate-900 shadow-md">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => setModalState({ isOpen: true, item: spk })}
                        className="p-1.5 min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
                        title="Edit SPK / Koreksi Timbangan Output Pelet"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRequestDelete({
                          title: `Hapus SPK ${spk.spkNo}`,
                          message: `Yakin ingin menghapus ${spk.spkNo}? Stok pelet di gudang jadi akan ditarik dan stok flakes akan dikembalikan.`,
                          onConfirm: () => setProductionSPKs(prev => prev.filter(x => x.id !== spk.id))
                        })}
                        className="p-1.5 min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-rose-200 flex items-center justify-center"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
                    Belum ada SPK formulasi ekstrusi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {modalState.isOpen && (
        <ProductionSPKFormModal
          item={modalState.item}
          availableFlakesBatches={availableFlakesBatches}
          additives={additives}
          defaultExtrusionRate={costTariffs.extrusionRatePerKg}
          onSave={handleSave}
          onClose={() => setModalState({ isOpen: false, item: null })}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Production SPK Form (Blending & Extrusion)
// -------------------------------------------------------------
function ProductionSPKFormModal({ item, availableFlakesBatches, additives, defaultExtrusionRate, onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const dateCode = today.replace(/-/g, '').slice(2);
  const defaultSpk = `SPK-${dateCode}-${String(Date.now()).slice(-3)}`;
  const defaultLot = `LOT-PP-${dateCode}-${String(Date.now()).slice(-2)}`;

  const [mode, setMode] = useState(item?.mode || 'multi_blend');
  const [formData, setFormData] = useState({
    spkNo: item?.spkNo || defaultSpk,
    date: item?.date || today,
    targetLotNo: item?.targetLotNo || defaultLot,
    targetProductName: item?.targetProductName || 'Pelet Biji Plastik PP Compounding Injeksi Super',
    targetColor: item?.targetColor || 'Hitam Doff Mengkilap',
    polymerType: item?.polymerType || 'PP',
    extruderLine: item?.extruderLine || 'Extruder Double Degassing Line 2',
    barrelTempCelsius: item?.barrelTempCelsius || 'Zone 1: 185°C | Zone 2: 205°C | Zone 3: 220°C | Die: 215°C',
    meshScreenSize: item?.meshScreenSize || 'Mesh 80 Ganda',
    cuttingMethod: item?.cuttingMethod || 'Strand Pelletizing (Tarik Untaian + Pisau Rotari)',
    operator: item?.operator || 'Regu Shift 1',
    status: item?.status || 'Selesai',
    extrusionRatePerKg: item?.extrusionRatePerKg !== undefined ? item.extrusionRatePerKg : defaultExtrusionRate,
    outputPelletKg: item?.outputPelletKg !== undefined ? item.outputPelletKg : (item ? 1000 : 0),
    bagWeightKg: item?.bagWeightKg || 25,
    mfiTest: item?.qcResult?.mfiTest || '14.5 g/10min',
    qcStatus: item?.qcResult?.status || 'Lulus QC',
    notes: item?.notes || ''
  });

  // Initial Ingredients Formulation
  const defaultFlakes = availableFlakesBatches[0];
  const initialIngredients = item?.ingredients && item.ingredients.length > 0
    ? item.ingredients.map(i => ({ ...i }))
    : [
        {
          sourceType: 'flakes',
          sourceId: defaultFlakes?.id || '',
          batchCode: defaultFlakes?.outputFlakesBatchNo || '',
          materialName: defaultFlakes?.flakesName || 'Flakes Bersih',
          weightKg: 950,
          unitCost: defaultFlakes?.hppFlakesPerKg || 10200
        },
        {
          sourceType: 'additive',
          sourceId: additives[0]?.id || '',
          batchCode: additives[0]?.code || '',
          materialName: additives[0]?.name || 'Masterbatch Hitam',
          weightKg: 50,
          unitCost: additives[0]?.unitPrice || 24000
        }
      ];

  const [ingredients, setIngredients] = useState(initialIngredients);

  const handleAddIngredient = (type = 'flakes') => {
    if (type === 'flakes') {
      const flk = availableFlakesBatches.find(f => !ingredients.some(i => i.sourceId === f.id)) || availableFlakesBatches[0];
      setIngredients(prev => [
        ...prev,
        {
          sourceType: 'flakes',
          sourceId: flk?.id || '',
          batchCode: flk?.outputFlakesBatchNo || '',
          materialName: flk?.flakesName || 'Cacahan Flakes',
          weightKg: 100,
          unitCost: flk?.hppFlakesPerKg || 10000
        }
      ]);
    } else {
      const adt = additives.find(a => !ingredients.some(i => i.sourceId === a.id)) || additives[0];
      setIngredients(prev => [
        ...prev,
        {
          sourceType: 'additive',
          sourceId: adt?.id || '',
          batchCode: adt?.code || '',
          materialName: adt?.name || 'Aditif',
          weightKg: 20,
          unitCost: adt?.unitPrice || 24000
        }
      ]);
    }
  };

  const handleUpdateIngredient = (index, field, value) => {
    setIngredients(prev => prev.map((ing, idx) => {
      if (idx !== index) return ing;
      if (field === 'sourceId') {
        if (ing.sourceType === 'flakes') {
          const flk = availableFlakesBatches.find(f => f.id === value);
          return {
            ...ing,
            sourceId: value,
            batchCode: flk?.outputFlakesBatchNo || '',
            materialName: flk?.flakesName || '',
            unitCost: flk?.hppFlakesPerKg || ing.unitCost
          };
        } else {
          const adt = additives.find(a => a.id === value);
          return {
            ...ing,
            sourceId: value,
            batchCode: adt?.code || '',
            materialName: adt?.name || '',
            unitCost: adt?.unitPrice || ing.unitCost
          };
        }
      }
      return {
        ...ing,
        [field]: value
      };
    }));
  };

  const handleRemoveIngredient = (index) => {
    if (ingredients.length <= 1) return;
    setIngredients(prev => prev.filter((_, idx) => idx !== index));
  };

  // Calculations
  const totalInputMixKg = ingredients.reduce((acc, i) => acc + (Number(i.weightKg) || 0), 0);
  const totalMaterialCost = ingredients.reduce((acc, i) => acc + ((Number(i.weightKg) || 0) * (Number(i.unitCost) || 0)), 0);
  const outputPelletKg = Number(formData.outputPelletKg) || 0;
  const extrusionRate = Number(formData.extrusionRatePerKg) || defaultExtrusionRate;
  const totalExtrusionCost = outputPelletKg * extrusionRate;
  const totalProductionCost = totalMaterialCost + totalExtrusionCost;
  const wasteKg = Math.max(0, totalInputMixKg - outputPelletKg);
  const wastePct = totalInputMixKg > 0 ? (wasteKg / totalInputMixKg) * 100 : 0;
  const isOutputExceedingInput = totalInputMixKg > 0 && outputPelletKg > totalInputMixKg;
  const hppFinal = outputPelletKg > 0 ? (totalProductionCost / outputPelletKg) : 0;
  const bagWeight = Number(formData.bagWeightKg) || 25;
  const bagCount = bagWeight > 0 ? Math.floor(outputPelletKg / bagWeight) : 0;

  // Check additive ratio guidance
  const additiveInputs = ingredients.filter(i => i.sourceType === 'additive');
  const totalAdditiveKg = additiveInputs.reduce((acc, i) => acc + (Number(i.weightKg) || 0), 0);
  const additiveRatioPct = totalInputMixKg > 0 ? (totalAdditiveKg / totalInputMixKg) * 100 : 0;
  const isAdditiveRatioHigh = additiveRatioPct > 15;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.spkNo || ingredients.length === 0 || outputPelletKg <= 0) return;
    if (isOutputExceedingInput) {
      alert(`Output pelet (${outputPelletKg} Kg) tidak boleh melebihi total input bahan (${totalInputMixKg} Kg)! Hukum kekekalan massa: pelet hasil = input bahan dikurangi susut/kerak/purging.`);
      return;
    }

    onSave({
      ...formData,
      mode,
      ingredients: ingredients.map(i => ({
        ...i,
        weightKg: Number(i.weightKg),
        unitCost: Number(i.unitCost),
        subtotalCost: Number(i.weightKg) * Number(i.unitCost)
      })),
      totalInputMixKg,
      totalMaterialCost,
      extrusionRatePerKg: extrusionRate,
      totalExtrusionCost,
      totalProductionCost,
      outputPelletKg,
      wasteExtrusionKg: wasteKg,
      wastePercentage: wastePct,
      hppFinalPelletPerKg: hppFinal,
      bagCount,
      qcResult: {
        mfiTest: formData.mfiTest,
        status: formData.qcStatus
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-3xl w-full my-6 overflow-hidden text-xs">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-white text-sm">
              {item ? `Koreksi SPK Ekstrusi: ${item.spkNo}` : 'Buat SPK Formulasi Blending & Ekstrusi Pelet'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Mode Switcher */}
          <div className="flex items-center space-x-2 p-1.5 bg-slate-950 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setMode('multi_blend')}
              className={`flex-1 py-2 px-3 rounded-md font-semibold text-xs transition flex items-center justify-center space-x-1.5 ${
                mode === 'multi_blend' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Plastic Blending (Campuran Flakes + Masterbatch / CaCO3)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`flex-1 py-2 px-3 rounded-md font-semibold text-xs transition flex items-center justify-center space-x-1.5 ${
                mode === 'single' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Single Flakes (100% 1 Jenis Cacahan Murni)</span>
            </button>
          </div>

          {/* SPK Header & Lot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">No. SPK *</label>
              <input
                required
                type="text"
                value={formData.spkNo}
                onChange={e => setFormData({ ...formData, spkNo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono uppercase focus:outline-hidden focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Kode Lot Pelet Jadi *</label>
              <input
                required
                type="text"
                value={formData.targetLotNo}
                onChange={e => setFormData({ ...formData, targetLotNo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-purple-400 font-mono font-bold uppercase focus:outline-hidden focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Tanggal *</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Mesin / Line Ekstruder</label>
              <input
                type="text"
                value={formData.extruderLine}
                onChange={e => setFormData({ ...formData, extruderLine: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-medium mb-1">Target Nama Biji Plastik *</label>
              <input
                required
                type="text"
                value={formData.targetProductName}
                onChange={e => setFormData({ ...formData, targetProductName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-medium focus:outline-hidden focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Warna Pelet</label>
              <input
                type="text"
                value={formData.targetColor}
                onChange={e => setFormData({ ...formData, targetColor: e.target.value })}
                placeholder="Hitam Doff, Putih Susu"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-purple-500"
              />
            </div>
          </div>

          {/* Recipe / Ingredients Input Table */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-2xs font-bold text-slate-300 uppercase tracking-wider block">
                  1. Formulasi Resep Bahan Masuk (Flakes Bersih & Additives)
                </span>
                <span className="text-2xs text-slate-400">
                  Ambil cacahan dari Gudang Flakes (Tahap 2) & tambahkan pewarna masterbatch / filler kalsium.
                </span>
              </div>
              {mode === 'multi_blend' && (
                <div className="flex space-x-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddIngredient('flakes')}
                    className="px-2.5 py-1 bg-sky-700 hover:bg-sky-600 text-white rounded text-2xs font-semibold"
                  >
                    + Flakes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddIngredient('additive')}
                    className="px-2.5 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded text-2xs font-semibold"
                  >
                    + Aditif/MB
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 mt-2">
              {ingredients.map((ing, idx) => {
                const ratio = totalInputMixKg > 0 ? (ing.weightKg / totalInputMixKg) * 100 : 0;
                return (
                  <div key={idx} className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-5">
                        <label className="block text-2xs text-slate-400 mb-0.5">
                          {ing.sourceType === 'flakes' ? 'Pilih Batch Cacahan Flakes' : 'Pilih Bahan Aditif / Pewarna'}
                        </label>
                        {ing.sourceType === 'flakes' ? (
                          <select
                            value={ing.sourceId}
                            onChange={e => handleUpdateIngredient(idx, 'sourceId', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs focus:outline-hidden"
                          >
                            <option value="">-- Pilih Flakes --</option>
                            {availableFlakesBatches.map(f => (
                              <option key={f.id} value={f.id}>
                                {f.outputFlakesBatchNo} - {f.flakesName} (Sisa: {formatNumber(f.remainingFlakesKg, 0)} Kg @ {formatRupiah(f.hppFlakesPerKg)})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={ing.sourceId}
                            onChange={e => handleUpdateIngredient(idx, 'sourceId', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-purple-300 text-xs focus:outline-hidden"
                          >
                            <option value="">-- Pilih Aditif --</option>
                            {additives.map(a => (
                              <option key={a.id} value={a.id}>
                                {a.code} - {a.name} ({formatRupiah(a.unitPrice)}/Kg)
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-2xs text-slate-400 mb-0.5">Berat Timbang (Kg) *</label>
                        <input
                          required
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={ing.weightKg}
                          onChange={e => handleUpdateIngredient(idx, 'weightKg', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono text-right text-xs focus:outline-hidden"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-2xs text-slate-400 mb-0.5">Subtotal Beban</label>
                        <div className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-right font-mono text-xs text-emerald-400">
                          {formatRupiah(ing.weightKg * ing.unitCost)}
                        </div>
                      </div>

                      <div className="sm:col-span-1 flex items-end justify-center">
                        {ingredients.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(idx)}
                            className="p-1 text-rose-400 hover:text-rose-200"
                            title="Hapus baris"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-2xs text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                      <span>Harga unit bahan: {formatRupiah(ing.unitCost)}/Kg</span>
                      <span className="text-purple-300 font-semibold">Rasio Resep: {formatPercent(ratio)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-xs font-semibold p-2 bg-slate-900 rounded border border-slate-800 font-mono">
              <span className="text-slate-300 font-sans">Total Input Formulasi:</span>
              <div className="space-x-3">
                <span className="text-white font-bold">{formatWeight(totalInputMixKg)}</span>
                <span className="text-emerald-400">{formatRupiah(totalMaterialCost)}</span>
              </div>
            </div>

            {isAdditiveRatioHigh && (
              <div className="p-2 rounded bg-amber-950/40 border border-amber-500/40 text-amber-300 text-2xs flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>
                  <strong>Info Formulasi:</strong> Rasio masterbatch/aditif ({formatPercent(additiveRatioPct)}) cukup tinggi. Pada umumnya pewarnaan biji pelet memakai 1% - 5% masterbatch.
                </span>
              </div>
            )}
          </div>

          {/* Extrusion Parameters */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-2xs font-bold text-slate-300 uppercase tracking-wider block">
              2. Parameter Mesin Extruder & Filter Kasa
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 text-2xs mb-1">Setting Suhu Barel (°C)</label>
                <input
                  type="text"
                  value={formData.barrelTempCelsius}
                  onChange={e => setFormData({ ...formData, barrelTempCelsius: e.target.value })}
                  placeholder="Zone 1: 185°C | Die: 215°C"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-2xs mb-1">Saringan Kasa (Mesh Screen)</label>
                <input
                  type="text"
                  value={formData.meshScreenSize}
                  onChange={e => setFormData({ ...formData, meshScreenSize: e.target.value })}
                  placeholder="Mesh 80 Ganda"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-2xs mb-1">Metode Pemotongan Pelet</label>
                <input
                  type="text"
                  value={formData.cuttingMethod}
                  onChange={e => setFormData({ ...formData, cuttingMethod: e.target.value })}
                  placeholder="Strand Pelletizing / Water-Ring"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Output Timbangan Pelet & HPP Final */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5 font-mono">
            <span className="text-2xs font-bold text-slate-300 uppercase tracking-wider block font-sans">
              3. Hasil Timbangan Akhir Pelet (Karung Sak) & HPP Final
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <div className="flex justify-between items-center mb-1 font-sans">
                  <label className="text-slate-400 text-2xs">Hasil Timbangan Pelet Bersih (Output Kg) *</label>
                  {totalInputMixKg > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, outputPelletKg: Math.round(totalInputMixKg * 0.955) }))}
                      className="text-2xs text-sky-400 hover:text-sky-300 underline"
                      title="Set timbangan estimasi susut ekstrusi 4.5%"
                    >
                      Estimasi Susut 4.5% ({Math.round(totalInputMixKg * 0.955)} Kg)
                    </button>
                  )}
                </div>
                <input
                  required
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.outputPelletKg || ''}
                  onChange={e => setFormData({ ...formData, outputPelletKg: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-purple-500 rounded px-2.5 py-1.5 text-emerald-400 font-bold text-base text-right focus:outline-hidden"
                />
                {totalInputMixKg > 0 && formData.outputPelletKg > totalInputMixKg && (
                  <p className="text-2xs text-rose-400 font-bold mt-1 font-sans bg-rose-950/40 p-1.5 rounded border border-rose-500/40">
                    ⚠️ Timbangan hasil ({formData.outputPelletKg} Kg) melebihi total input bahan ({totalInputMixKg} Kg)! Hukum kekekalan massa: output pelet tidak boleh melebihi bahan masuk.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-sans text-2xs mb-1">Kemasan Sak (Kg/Karung)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.bagWeightKg}
                  onChange={e => setFormData({ ...formData, bagWeightKg: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-right text-xs focus:outline-hidden"
                />
                <span className="text-2xs text-slate-400 block text-right mt-0.5">
                  = {bagCount} Sak @ {bagWeight} Kg
                </span>
              </div>

              <div>
                <label className="block text-slate-400 font-sans text-2xs mb-1">Tarif Ekstrusi (Rp/Kg)</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.extrusionRatePerKg}
                  onChange={e => setFormData({ ...formData, extrusionRatePerKg: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-right text-xs focus:outline-hidden"
                />
                <span className="text-2xs text-slate-400 block text-right mt-0.5">
                  Biaya Ekstrusi: {formatRupiah(totalExtrusionCost)}
                </span>
              </div>
            </div>

            {/* Calculations Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div>
                <span className="text-2xs text-slate-400 block font-sans">Kerak / Purging (Susut 2):</span>
                <span className="font-bold text-rose-400">-{formatWeight(wasteKg)}</span>
                <span className="text-2xs text-slate-400 block">({formatPercent(wastePct)})</span>
              </div>
              <div>
                <span className="text-2xs text-slate-400 block font-sans">Total Nilai Flakes & Aditif:</span>
                <span className="font-bold text-white">{formatRupiah(totalMaterialCost)}</span>
              </div>
              <div>
                <span className="text-2xs text-slate-400 block font-sans">Total Biaya Ekstrusi:</span>
                <span className="font-bold text-amber-300">{formatRupiah(totalProductionCost)}</span>
              </div>
              <div className="border-l border-slate-800 pl-2">
                <span className="text-2xs text-purple-400 block font-sans font-bold">HPP Final Pelet / Kg:</span>
                <span className="font-black text-purple-400 text-sm">{formatRupiah(hppFinal)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
            <span className="text-2xs text-slate-500">
              * Pelet yang selesai otomatis masuk ke Gudang Barang Jadi Biji Plastik (Tahap 4) siap jual.
            </span>
            <div className="flex space-x-2">
              <button type="button" onClick={onClose} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">Batal</button>
              <button type="submit" className="px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold">Simpan SPK Ekstrusi</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
