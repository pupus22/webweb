import React, { useState, useEffect } from 'react';
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
  Clock,
  CheckCircle2,
  Bookmark,
  GitBranch,
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

const RECIPE_TEMPLATES = [
  {
    id: 'TPL-PP-BLK',
    title: 'Formula PP Hitam Injeksi (95% Flakes PP + 3% MB Hitam + 2% CaCO3)',
    productName: 'Pelet Biji Plastik PP Compounding Injeksi Super',
    polymerType: 'PP',
    targetColor: 'Hitam Doff Mengkilap',
    mesh: 'Mesh 80 Ganda',
    temp: 'Zone 1: 185°C | Zone 2: 205°C | Zone 3: 220°C | Die: 215°C',
    makeIngredients: (flakesList, additives) => {
      const flk = flakesList.find(f => f.polymerCode === 'PP') || flakesList[0];
      const mb = additives.find(a => a.code === 'MB-BLK') || additives[0];
      const ca = additives.find(a => a.code === 'FIL-CA') || additives[1] || additives[0];
      return [
        { sourceType: 'flakes', sourceId: flk?.id, batchCode: flk?.outputFlakesBatchNo, materialName: flk?.flakesName || 'Flakes PP Bersih', weightKg: 950, unitCost: flk?.hppFlakesPerKg || 10200 },
        { sourceType: 'additive', sourceId: mb?.id, batchCode: mb?.code, materialName: mb?.name || 'Masterbatch Hitam', weightKg: 30, unitCost: mb?.unitPrice || 24000 },
        { sourceType: 'additive', sourceId: ca?.id, batchCode: ca?.code, materialName: ca?.name || 'Filler CaCO3 Kalsium', weightKg: 20, unitCost: ca?.unitPrice || 6500 }
      ];
    }
  },
  {
    id: 'TPL-HD-BLW',
    title: 'Formula HDPE Blow Jerigen (98% Flakes HDPE + 2% MB Pewarna)',
    productName: 'Pelet HDPE Blow Moulding Jerigen Grade A',
    polymerType: 'HDPE',
    targetColor: 'Biru Cerah / Natural',
    mesh: 'Mesh 100 Halus',
    temp: 'Zone 1: 190°C | Zone 2: 210°C | Zone 3: 225°C | Die: 220°C',
    makeIngredients: (flakesList, additives) => {
      const flk = flakesList.find(f => f.polymerCode === 'HDPE') || flakesList[0];
      const mb = additives.find(a => a.code === 'MB-BLU') || additives[0];
      return [
        { sourceType: 'flakes', sourceId: flk?.id, batchCode: flk?.outputFlakesBatchNo, materialName: flk?.flakesName || 'Flakes HDPE Bersih', weightKg: 980, unitCost: flk?.hppFlakesPerKg || 10800 },
        { sourceType: 'additive', sourceId: mb?.id, batchCode: mb?.code, materialName: mb?.name || 'Masterbatch Pewarna', weightKg: 20, unitCost: mb?.unitPrice || 28000 }
      ];
    }
  },
  {
    id: 'TPL-LD-FLM',
    title: 'Formula LDPE Film Bening (97% Flakes LDPE + 3% Optical Brightener)',
    productName: 'Pelet LDPE Blown Film Kantong Bening',
    polymerType: 'LDPE',
    targetColor: 'Bening / Transparan',
    mesh: 'Mesh 120 Ekstra Halus',
    temp: 'Zone 1: 175°C | Zone 2: 195°C | Zone 3: 205°C | Die: 200°C',
    makeIngredients: (flakesList, additives) => {
      const flk = flakesList.find(f => f.polymerCode === 'LDPE') || flakesList[0];
      const ob = additives.find(a => a.code === 'ADT-OB') || additives[0];
      return [
        { sourceType: 'flakes', sourceId: flk?.id, batchCode: flk?.outputFlakesBatchNo, materialName: flk?.flakesName || 'Flakes LDPE Bening', weightKg: 970, unitCost: flk?.hppFlakesPerKg || 11500 },
        { sourceType: 'additive', sourceId: ob?.id, batchCode: ob?.code, materialName: ob?.name || 'Optical Brightener (OB-1)', weightKg: 30, unitCost: ob?.unitPrice || 35000 }
      ];
    }
  }
];

export default function Stage3ProductionModule({
  recalibratedProductionSPKs = [],
  setProductionSPKs,
  recalibratedPreProcessings = [],
  additives = [],
  costTariffs = {},
  onRequestDelete,
  onOpenTraceability,
  initialFlakesBatchId = null,
  onClearInitialFlakesBatchId
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalState, setModalState] = useState({ isOpen: false, item: null, preselectedFlakesId: null });
  const [weighingModalState, setWeighingModalState] = useState({ isOpen: false, item: null });

  // Handle fast-workflow auto open if triggered from Stage 2
  useEffect(() => {
    if (initialFlakesBatchId) {
      setModalState({ isOpen: true, item: null, preselectedFlakesId: initialFlakesBatchId });
      if (onClearInitialFlakesBatchId) onClearInitialFlakesBatchId();
    }
  }, [initialFlakesBatchId, onClearInitialFlakesBatchId]);

  // Filter available flakes batches with stock > 0
  const availableFlakesBatches = recalibratedPreProcessings.filter(
    p => p.remainingFlakesKg > 0 || (modalState.item && modalState.item.ingredients?.some(i => i.sourceId === p.id)) || (modalState.preselectedFlakesId === p.id)
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
    setModalState({ isOpen: false, item: null, preselectedFlakesId: null });
  };

  const handleSaveWeighing = (spkId, weighingData) => {
    setProductionSPKs(prev => prev.map(spk => {
      if (spk.id !== spkId) return spk;
      const outputPelletKg = Number(weighingData.outputPelletKg);
      const extrusionRate = Number(spk.extrusionRatePerKg || costTariffs.extrusionRatePerKg || 1850);
      const totalExtrusionCost = outputPelletKg * extrusionRate;
      const totalProductionCost = Number(spk.totalMaterialCost || 0) + totalExtrusionCost;
      const wasteKg = Math.max(0, Number(spk.totalInputMixKg || 0) - outputPelletKg);
      const wastePct = spk.totalInputMixKg > 0 ? (wasteKg / spk.totalInputMixKg) * 100 : 0;
      const hppFinal = outputPelletKg > 0 ? (totalProductionCost / outputPelletKg) : 0;
      const bagWeight = Number(weighingData.bagWeightKg || spk.bagWeightKg || 25);
      const bagCount = bagWeight > 0 ? Math.floor(outputPelletKg / bagWeight) : 0;

      return {
        ...spk,
        status: 'Selesai',
        outputPelletKg,
        wasteExtrusionKg: wasteKg,
        wastePercentage: wastePct,
        hppFinalPelletPerKg: hppFinal,
        bagWeightKg: bagWeight,
        bagCount,
        qcResult: {
          mfiTest: weighingData.mfiTest,
          status: weighingData.qcStatus
        }
      };
    }));
    setWeighingModalState({ isOpen: false, item: null });
  };

  const filtered = recalibratedProductionSPKs.filter(spk => {
    const matchesSearch = `${spk.spkNo} ${spk.targetLotNo} ${spk.targetProductName} ${spk.targetColor} ${spk.polymerType} ${spk.extruderLine}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesMode = modeFilter === 'ALL' || spk.mode === modeFilter;
    const matchesStatus = statusFilter === 'ALL' || spk.status === statusFilter;
    return matchesSearch && matchesMode && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-3.5 flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center space-x-2 w-full md:w-auto flex-wrap gap-y-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari SPK, Lot, Produk, Mesin..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2.5 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-violet-500 text-xs"
          >
            <option value="ALL">Semua Status SPK</option>
            <option value="Dalam Proses">⏳ Dalam Proses (Sedang Jalan)</option>
            <option value="Selesai">✓ Selesai Ditimbang</option>
          </select>

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-violet-500 text-xs"
          >
            <option value="ALL">Semua Mode</option>
            <option value="single">Single Flakes</option>
            <option value="multi_blend">Multi-Plastic Blending</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setModalState({ isOpen: true, item: null, preselectedFlakesId: null })}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition shadow-xs text-xs w-full sm:w-auto justify-center"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Terbitkan SPK Blending Baru</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden text-xs">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Flame className="w-4 h-4 text-violet-600" />
              <span>Tahap 3: Formulasi Blending & Ekstrusi Pelletizing (Compounding)</span>
            </h3>
            <p className="text-3xs text-slate-400 mt-0.5">
              Formulasi resep multi-bahan masuk hopper ekstruder berfilter kasa kawat, dicetak & ditimbang pelet bersihnya.
            </p>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-3xs text-slate-400 block">Total SPK Terbit:</span>
            <span className="text-sm font-bold text-violet-600">{recalibratedProductionSPKs.length} Work Orders</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 text-3xs uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">No. SPK & Lot</th>
                <th className="py-2.5 px-3">Target Produk & Warna</th>
                <th className="py-2.5 px-3">Formulasi Resep Masuk</th>
                <th className="py-2.5 px-3">Parameter Mesin Extruder</th>
                <th className="py-2.5 px-3 text-right">Input Bahan</th>
                <th className="py-2.5 px-3 text-right">Output Pelet (Kg)</th>
                <th className="py-2.5 px-3 text-right">Kerak / Purging</th>
                <th className="py-2.5 px-3 text-right">HPP Final / Kg</th>
                <th className="py-2.5 px-3 text-center">Status Produksi</th>
                <th className="py-2.5 px-3 text-center sticky right-0 bg-white/95">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {filtered.map(spk => {
                const isOngoing = spk.status === 'Dalam Proses';

                return (
                  <tr key={spk.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => onOpenTraceability && onOpenTraceability(spk.spkNo)}
                        className="font-bold text-violet-600 hover:text-violet-700 hover:underline font-mono text-left flex items-center space-x-1"
                        title="Lacak silsilah bahan & resep SPK ini"
                      >
                        <span>{spk.spkNo}</span>
                        <GitBranch className="w-3 h-3 text-violet-400" />
                      </button>
                      <button
                        onClick={() => onOpenTraceability && onOpenTraceability(spk.targetLotNo)}
                        className="text-3xs text-slate-500 font-mono hover:text-violet-600 block text-left"
                        title="Lacak lot ini"
                      >
                        {spk.targetLotNo}
                      </button>
                      <span className="text-3xs text-slate-400 font-sans block">{formatDate(spk.date)}</span>
                    </td>

                    <td className="py-2.5 px-3 font-sans">
                      <span className="font-semibold text-slate-800 block leading-snug">{spk.targetProductName}</span>
                      <span className="text-3xs text-slate-400 block mt-0.5">
                        {spk.polymerType} • {spk.targetColor}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-sans">
                      <div className="text-2xs space-y-0.5 max-w-[220px]">
                        {(spk.ingredients || []).map((ing, idx) => (
                          <div key={idx} className="flex justify-between text-slate-600 border-b border-slate-100 pb-0.5">
                            <span className="pr-1 text-slate-500 text-3xs truncate">{ing.materialName}</span>
                            <span className="font-mono text-violet-600 whitespace-nowrap text-3xs font-semibold">{formatNumber(ing.weightKg, 0)} Kg</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-sans text-2xs text-slate-600">
                      <span className="text-violet-700 font-medium block">{spk.extruderLine || 'Line Extruder'}</span>
                      <span className="text-slate-400 text-3xs block">{spk.meshScreenSize || 'Mesh 80'}</span>
                      <span className="text-slate-400 text-3xs">{spk.cuttingMethod || 'Strand'}</span>
                    </td>

                    <td className="py-2.5 px-3 text-right text-slate-700 font-bold">
                      {formatNumber(spk.totalInputMixKg, 1)} Kg
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {isOngoing ? (
                        <div>
                          <span className="text-amber-600 font-semibold text-3xs block">⏳ Sedang Proses</span>
                          <button
                            onClick={() => setWeighingModalState({ isOpen: true, item: spk })}
                            className="mt-1 px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-3xs shadow-2xs flex items-center space-x-1 ml-auto transition"
                            title="Timbang Pelet Hasil Selesai"
                          >
                            <Scale className="w-3 h-3" />
                            <span>Timbang Hasil</span>
                          </button>
                        </div>
                      ) : (
                        <div className="font-bold text-emerald-600">
                          <div>{formatNumber(spk.outputPelletKg, 1)} Kg</div>
                          <div className="text-3xs text-slate-400 font-sans font-normal">
                            ~{spk.bagCount} Sak @ {spk.bagWeightKg || 25} Kg
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {isOngoing ? (
                        <span className="text-slate-400 text-3xs italic font-sans">Menunggu Timbang</span>
                      ) : (
                        <>
                          <span className="text-rose-500 font-bold block">
                            -{formatNumber(spk.wasteExtrusionKg, 1)} Kg
                          </span>
                          <span className="text-3xs px-1.5 py-0.2 rounded font-semibold bg-rose-50 text-rose-600 border border-rose-100">
                            {formatPercent(spk.wastePercentage)}
                          </span>
                        </>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-violet-600">
                      {isOngoing ? (
                        <span className="text-slate-400 text-3xs italic font-sans font-normal">
                          Est. ~{formatRupiah((Number(spk.totalMaterialCost || 0) + (Number(spk.totalInputMixKg || 0) * 0.955 * 1850)) / (Number(spk.totalInputMixKg || 1) * 0.955))}
                        </span>
                      ) : (
                        formatRupiah(spk.hppFinalPelletPerKg)
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center font-sans">
                      {isOngoing ? (
                        <span className="px-2 py-0.5 rounded-full text-3xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center space-x-1 w-max mx-auto">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>Dalam Proses</span>
                        </span>
                      ) : (
                        <div>
                          <span className={`px-2 py-0.5 rounded-full text-3xs font-semibold ${getStatusBadge(spk.qcResult?.status)}`}>
                            {spk.qcResult?.status || 'Lulus QC'}
                          </span>
                          <div className="text-3xs text-slate-400 font-mono mt-0.5">
                            {spk.qcResult?.mfiTest || '-'}
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center sticky right-0 bg-white/95 font-sans">
                      <div className="flex items-center justify-center space-x-1">
                        {isOngoing && (
                          <button
                            onClick={() => setWeighingModalState({ isOpen: true, item: spk })}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                            title="Timbang Pelet Hasil & Selesaikan SPK"
                          >
                            <Scale className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setModalState({ isOpen: true, item: spk, preselectedFlakesId: null })}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                          title="Edit SPK / Koreksi Resep Formulasi"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRequestDelete({
                            title: `Hapus SPK ${spk.spkNo}`,
                            message: `Yakin ingin menghapus ${spk.spkNo}? Stok pelet di gudang jadi akan ditarik dan stok bahan baku akan dikembalikan.`,
                            onConfirm: () => setProductionSPKs(prev => prev.filter(x => x.id !== spk.id))
                          })}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-sans">
                    Belum ada SPK formulasi ekstrusi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form: Full SPK Formulation with Visual Recipe Simulator */}
      {modalState.isOpen && (
        <ProductionSPKFormModal
          item={modalState.item}
          availableFlakesBatches={availableFlakesBatches}
          preselectedFlakesId={modalState.preselectedFlakesId}
          additives={additives}
          defaultExtrusionRate={costTariffs.extrusionRatePerKg}
          onSave={handleSave}
          onClose={() => setModalState({ isOpen: false, item: null, preselectedFlakesId: null })}
        />
      )}

      {/* Modal Form: Quick Weighing & Completion */}
      {weighingModalState.isOpen && (
        <WeighingClosingModal
          spk={weighingModalState.item}
          onSave={(weighingData) => handleSaveWeighing(weighingModalState.item.id, weighingData)}
          onClose={() => setWeighingModalState({ isOpen: false, item: null })}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Production SPK Form (Blending & Extrusion with Recipe Templates)
// -------------------------------------------------------------
function ProductionSPKFormModal({ item, availableFlakesBatches = [], preselectedFlakesId = null, additives = [], defaultExtrusionRate = 1850, onSave, onClose }) {
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
    status: item?.status || 'Dalam Proses',
    extrusionRatePerKg: item?.extrusionRatePerKg !== undefined ? item.extrusionRatePerKg : defaultExtrusionRate,
    outputPelletKg: item?.outputPelletKg !== undefined ? item.outputPelletKg : (item ? 1000 : 0),
    bagWeightKg: item?.bagWeightKg || 25,
    mfiTest: item?.qcResult?.mfiTest || '14.5 g/10min',
    qcStatus: item?.qcResult?.status || 'Lulus QC',
    notes: item?.notes || ''
  });

  // Initial Ingredients Formulation
  const defaultFlakes = availableFlakesBatches.find(f => f.id === preselectedFlakesId) || availableFlakesBatches[0];
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

  // Apply Recipe Template handler
  const handleApplyTemplate = (templateId) => {
    const tpl = RECIPE_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;

    const newIngs = tpl.makeIngredients(availableFlakesBatches, additives);
    setIngredients(newIngs);
    setFormData(prev => ({
      ...prev,
      targetProductName: tpl.productName,
      polymerType: tpl.polymerType,
      targetColor: tpl.targetColor,
      meshScreenSize: tpl.mesh,
      barrelTempCelsius: tpl.temp
    }));
  };

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

  // Pre-extrusion Estimated HPP (assuming normal 4.5% shrinkage)
  const estimatedOutputPelletKg = Math.round(totalInputMixKg * 0.955);
  const estimatedExtrusionCost = estimatedOutputPelletKg * extrusionRate;
  const estimatedHPP = estimatedOutputPelletKg > 0 ? ((totalMaterialCost + estimatedExtrusionCost) / estimatedOutputPelletKg) : 0;

  // Additive check
  const additiveInputs = ingredients.filter(i => i.sourceType === 'additive');
  const totalAdditiveKg = additiveInputs.reduce((acc, i) => acc + (Number(i.weightKg) || 0), 0);
  const additiveRatioPct = totalInputMixKg > 0 ? (totalAdditiveKg / totalInputMixKg) * 100 : 0;
  const isAdditiveRatioHigh = additiveRatioPct > 15;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.spkNo || ingredients.length === 0) return;

    if (formData.status === 'Selesai') {
      if (outputPelletKg <= 0) {
        alert('Untuk status Selesai, silakan masukkan angka hasil timbangan pelet bersih.');
        return;
      }
      if (isOutputExceedingInput) {
        alert(`Output pelet (${outputPelletKg} Kg) tidak boleh melebihi total input bahan (${totalInputMixKg} Kg)!`);
        return;
      }
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
      totalExtrusionCost: formData.status === 'Selesai' ? totalExtrusionCost : 0,
      totalProductionCost: formData.status === 'Selesai' ? totalProductionCost : totalMaterialCost,
      outputPelletKg: formData.status === 'Selesai' ? outputPelletKg : 0,
      wasteExtrusionKg: formData.status === 'Selesai' ? wasteKg : 0,
      wastePercentage: formData.status === 'Selesai' ? wastePct : 0,
      hppFinalPelletPerKg: formData.status === 'Selesai' ? hppFinal : 0,
      bagCount: formData.status === 'Selesai' ? bagCount : 0,
      qcResult: {
        mfiTest: formData.mfiTest,
        status: formData.qcStatus
      }
    });
  };

  const ingredientColors = [
    'bg-violet-500',
    'bg-emerald-500',
    'bg-sky-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-indigo-500'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-3xl w-full my-6 overflow-hidden text-xs font-sans text-slate-800">
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-violet-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              {item ? `Koreksi SPK Ekstrusi: ${item.spkNo}` : 'Terbitkan SPK Formulasi Blending & Ekstrusi Pelet'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Status Selection: Ongoing vs Completed */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider block">
                Status Alur SPK Pabrik *
              </span>
              <p className="text-3xs text-slate-400">
                Pilih "Dalam Proses" jika ekstruder baru mau jalan, atau "Selesai" jika sudah ditimbang peletnya.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'Dalam Proses' })}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition ${
                  formData.status === 'Dalam Proses'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>⏳ Dalam Proses (Timbang Nanti)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'Selesai' })}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition ${
                  formData.status === 'Selesai'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>✓ Selesai & Langsung Timbang</span>
              </button>
            </div>
          </div>

          {/* Quick Recipe Template Selector */}
          <div className="p-3 rounded-xl bg-violet-50/50 border border-violet-100 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-violet-700 font-bold text-3xs">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Gunakan Template Resep Cepat (Pabrik Compounding Standar):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {RECIPE_TEMPLATES.map(tpl => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl.id)}
                  className="px-2.5 py-2 rounded-xl bg-white hover:bg-violet-50 border border-slate-200/80 text-left text-3xs transition shadow-2xs"
                  title={tpl.title}
                >
                  <strong className="text-violet-700 block truncate font-bold">{tpl.polymerType} - {tpl.targetColor}</strong>
                  <span className="text-slate-500 truncate block mt-0.5">{tpl.productName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SPK Header & Lot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1 text-2xs">No. SPK *</label>
              <input
                required
                type="text"
                value={formData.spkNo}
                onChange={e => setFormData({ ...formData, spkNo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-mono uppercase text-xs focus:bg-white focus:border-violet-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1 text-2xs">Kode Lot Pelet Jadi *</label>
              <input
                required
                type="text"
                value={formData.targetLotNo}
                onChange={e => setFormData({ ...formData, targetLotNo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-violet-700 font-mono font-bold uppercase text-xs focus:bg-white focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1 text-2xs">Tanggal Produksi *</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1 text-2xs">Operator / Regu Shift</label>
              <input
                type="text"
                value={formData.operator}
                onChange={e => setFormData({ ...formData, operator: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              />
            </div>
          </div>

          {/* Target Product Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-500 font-semibold mb-1 text-2xs">Target Nama Produk Biji Pelet *</label>
              <input
                required
                type="text"
                value={formData.targetProductName}
                onChange={e => setFormData({ ...formData, targetProductName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1 text-2xs">Warna Pelet Target *</label>
              <input
                required
                type="text"
                value={formData.targetColor}
                onChange={e => setFormData({ ...formData, targetColor: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              />
            </div>
          </div>

          {/* Formulation Simulator Section */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-800 uppercase text-3xs tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  <span>Komposisi Resep Masuk Hopper (Input Formulation)</span>
                </span>
                <span className="text-3xs text-slate-400">
                  Campurkan beberapa batch Flakes & Aditif pewarna / penguat sesuai pesanan.
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => handleAddIngredient('flakes')}
                  className="px-2.5 py-1 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 font-bold text-3xs transition"
                >
                  + Tambah Flakes
                </button>
                <button
                  type="button"
                  onClick={() => handleAddIngredient('additive')}
                  className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-3xs transition"
                >
                  + Tambah Aditif
                </button>
              </div>
            </div>

            {/* Visual Stacked Progress Bar */}
            {totalInputMixKg > 0 && (
              <div className="space-y-1">
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-200">
                  {ingredients.map((ing, idx) => {
                    const pct = totalInputMixKg > 0 ? (Number(ing.weightKg || 0) / totalInputMixKg) * 100 : 0;
                    return (
                      <div
                        key={idx}
                        className={`${ingredientColors[idx % ingredientColors.length]} h-full transition-all`}
                        style={{ width: `${pct}%` }}
                        title={`${ing.materialName}: ${formatPercent(pct)} (${ing.weightKg} Kg)`}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-3xs text-slate-500 font-mono">
                  <span>Rasio Bahan: {ingredients.map(i => `${i.materialName?.slice(0, 12)} (${totalInputMixKg > 0 ? ((i.weightKg / totalInputMixKg) * 100).toFixed(1) : 0}%)`).join(' • ')}</span>
                  <span>Total Input: <strong className="text-slate-800">{formatWeight(totalInputMixKg)}</strong></span>
                </div>
              </div>
            )}

            {/* Ingredients rows */}
            <div className="space-y-2">
              {ingredients.map((ing, index) => {
                const isFlakes = ing.sourceType === 'flakes';
                const subtotal = (Number(ing.weightKg) || 0) * (Number(ing.unitCost) || 0);
                const ratioPct = totalInputMixKg > 0 ? ((Number(ing.weightKg) || 0) / totalInputMixKg) * 100 : 0;

                return (
                  <div key={index} className="grid grid-cols-12 gap-2 p-2.5 bg-white rounded-xl border border-slate-200/80 items-center text-xs">
                    <div className="col-span-12 sm:col-span-5">
                      <label className="block text-3xs text-slate-400 font-semibold mb-0.5">
                        {isFlakes ? 'Pilih Batch Flakes Bersih' : 'Pilih Aditif / Filler / MB'}
                      </label>
                      <select
                        value={ing.sourceId}
                        onChange={e => handleUpdateIngredient(index, 'sourceId', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-mono text-2xs focus:bg-white"
                      >
                        {isFlakes ? (
                          availableFlakesBatches.map(f => (
                            <option key={f.id} value={f.id}>
                              {f.outputFlakesBatchNo} - {f.flakesName} ({formatNumber(f.remainingFlakesKg, 0)} Kg sisa)
                            </option>
                          ))
                        ) : (
                          additives.map(a => (
                            <option key={a.id} value={a.id}>
                              {a.code} - {a.name} ({formatRupiah(a.unitPrice)}/Kg)
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-3xs text-slate-400 font-semibold mb-0.5">Berat (Kg)</label>
                      <input
                        type="number"
                        min="1"
                        step="0.5"
                        value={ing.weightKg}
                        onChange={e => handleUpdateIngredient(index, 'weightKg', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-bold font-mono text-right text-xs focus:bg-white"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2 text-right">
                      <span className="block text-3xs text-slate-400 font-semibold mb-0.5">Rasio Resep</span>
                      <span className="font-mono font-bold text-violet-600 text-xs">{formatPercent(ratioPct)}</span>
                    </div>

                    <div className="col-span-3 sm:col-span-2 text-right">
                      <span className="block text-3xs text-slate-400 font-semibold mb-0.5">Subtotal Biaya</span>
                      <span className="font-mono font-bold text-slate-700 text-xs">{formatRupiah(subtotal)}</span>
                    </div>

                    <div className="col-span-1 text-center">
                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(index)}
                          className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Hapus Bahan Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Estimated HPP before Extruder runs */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono gap-2">
              <div>
                <span className="text-3xs text-slate-400 block font-sans">Kalkulasi Total Biaya Bahan Masuk:</span>
                <span className="font-bold text-slate-800 text-sm">{formatRupiah(totalMaterialCost)}</span>
              </div>
              <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-3 pt-2 sm:pt-0">
                <span className="text-3xs text-slate-400 block font-sans font-semibold text-violet-700">
                  Estimasi HPP Pelet Sebelum Jalan (Est. Susut ~4.5%):
                </span>
                <span className="font-black text-violet-700 text-sm">{formatRupiah(estimatedHPP)} / Kg</span>
              </div>
            </div>
          </div>

          {/* Section Timbangan Output (Jika Status Selesai) */}
          {formData.status === 'Selesai' && (
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3 font-mono">
              <span className="text-3xs font-bold text-emerald-800 uppercase tracking-wider block font-sans">
                Hasil Timbangan Pelet Jadi & QC Passed
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-emerald-800 font-sans text-3xs mb-1 font-semibold">Output Pelet (Kg) *</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    value={formData.outputPelletKg}
                    onChange={e => setFormData({ ...formData, outputPelletKg: e.target.value })}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-2.5 py-1.5 text-emerald-700 font-black text-right text-sm"
                  />
                  {isOutputExceedingInput && (
                    <span className="text-3xs text-rose-600 font-sans block mt-0.5 font-bold">
                      ⚠️ Melebihi input ({totalInputMixKg} Kg)
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-500 font-sans text-3xs mb-1 font-semibold">Kemasan Sak (Kg/Sak)</label>
                  <input
                    type="number"
                    value={formData.bagWeightKg}
                    onChange={e => setFormData({ ...formData, bagWeightKg: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-right text-xs"
                  />
                  <span className="text-3xs text-slate-400 font-sans block text-right mt-0.5">
                    = {bagCount} Sak
                  </span>
                </div>

                <div>
                  <label className="block text-slate-500 font-sans text-3xs mb-1 font-semibold">Tarif Olah Mesin / Kg</label>
                  <input
                    type="number"
                    value={formData.extrusionRatePerKg}
                    onChange={e => setFormData({ ...formData, extrusionRatePerKg: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-right text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-sans text-3xs mb-1 font-semibold">Uji MFI (g/10min)</label>
                  <input
                    type="text"
                    value={formData.mfiTest}
                    onChange={e => setFormData({ ...formData, mfiTest: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200 text-xs">
                <div>
                  <span className="text-3xs text-slate-400 block font-sans">Susut / Kerak:</span>
                  <span className="font-bold text-rose-600">-{formatWeight(wasteKg)} ({formatPercent(wastePct)})</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block font-sans">Total Biaya SPK:</span>
                  <span className="font-bold text-slate-800">{formatRupiah(totalProductionCost)}</span>
                </div>
                <div className="sm:col-span-2 text-right">
                  <span className="text-3xs text-slate-400 block font-sans font-semibold text-emerald-800">
                    HPP Final Pelet Masuk Gudang:
                  </span>
                  <span className="font-black text-emerald-700 text-base">{formatRupiah(hppFinal)} / Kg</span>
                </div>
              </div>
            </div>
          )}

          {/* Machine Line Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Mesin / Line Extruder</label>
              <input
                type="text"
                value={formData.extruderLine}
                onChange={e => setFormData({ ...formData, extruderLine: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Filter Screen Mesh</label>
              <input
                type="text"
                value={formData.meshScreenSize}
                onChange={e => setFormData({ ...formData, meshScreenSize: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Metode Pemotong (Pelletizer)</label>
              <input
                type="text"
                value={formData.cuttingMethod}
                onChange={e => setFormData({ ...formData, cuttingMethod: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              />
            </div>
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
              Simpan SPK Produksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Quick Weighing & SPK Completion Modal
// -------------------------------------------------------------
function WeighingClosingModal({ spk, onSave, onClose }) {
  const [outputKg, setOutputKg] = useState(spk?.outputPelletKg || Math.round((spk?.totalInputMixKg || 1000) * 0.955));
  const [bagWeightKg, setBagWeightKg] = useState(spk?.bagWeightKg || 25);
  const [qcStatus, setQcStatus] = useState(spk?.qcResult?.status || 'Lulus QC');
  const [mfiTest, setMfiTest] = useState(spk?.qcResult?.mfiTest || '14.2 g/10min @ 230°C');

  const totalInputMixKg = Number(spk?.totalInputMixKg || 0);
  const totalMaterialCost = Number(spk?.totalMaterialCost || 0);
  const outputPelletKg = Number(outputKg) || 0;
  const bagCount = Number(bagWeightKg) > 0 ? Math.floor(outputPelletKg / Number(bagWeightKg)) : 0;

  const wasteKg = Math.max(0, totalInputMixKg - outputPelletKg);
  const wastePct = totalInputMixKg > 0 ? (wasteKg / totalInputMixKg) * 100 : 0;
  const extrusionRate = Number(spk?.extrusionRatePerKg || 1850);
  const totalExtrusionCost = outputPelletKg * extrusionRate;
  const totalProductionCost = totalMaterialCost + totalExtrusionCost;
  const hppFinal = outputPelletKg > 0 ? (totalProductionCost / outputPelletKg) : 0;

  const isExceeded = outputPelletKg > totalInputMixKg;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (outputPelletKg <= 0) {
      alert('Masukkan hasil timbangan pelet bersih yang valid.');
      return;
    }
    if (isExceeded) {
      alert(`Output timbangan (${outputPelletKg} Kg) melebihi total input bahan masuk (${totalInputMixKg} Kg)!`);
      return;
    }

    onSave({
      outputPelletKg,
      bagWeightKg: Number(bagWeightKg),
      qcStatus,
      mfiTest
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden text-xs font-sans text-slate-800">
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              Input Timbangan Hasil Pelet & Selesaikan SPK
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {/* SPK Information banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-violet-700">{spk.spkNo}</span>
              <span className="font-mono text-3xs font-semibold text-slate-600">{spk.targetLotNo}</span>
            </div>
            <div className="font-semibold text-slate-800">{spk.targetProductName}</div>
            <div className="text-3xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200 font-mono">
              <span>Total Bahan Masuk: <strong className="text-slate-800">{formatWeight(totalInputMixKg)}</strong></span>
              <span>Mesin: {spk.extruderLine || 'Extruder Line'}</span>
            </div>
          </div>

          {/* Form penimbangan pelet */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-slate-600 text-2xs font-semibold">
                Hasil Timbangan Pelet Bersih (Output Kg) *
              </label>
              {totalInputMixKg > 0 && (
                <button
                  type="button"
                  onClick={() => setOutputKg(Math.round(totalInputMixKg * 0.955))}
                  className="text-3xs text-violet-600 hover:text-violet-700 underline font-medium"
                  title="Gunakan estimasi susut standar 4.5%"
                >
                  Est. Susut 4.5% ({Math.round(totalInputMixKg * 0.955)} Kg)
                </button>
              )}
            </div>
            <input
              required
              autoFocus
              type="number"
              min="0.1"
              step="0.1"
              value={outputKg}
              onChange={e => setOutputKg(e.target.value)}
              placeholder="Contoh: 960"
              className="w-full bg-slate-50 border border-emerald-300 rounded-xl px-3 py-2 text-emerald-700 font-bold font-mono text-lg text-right focus:bg-white focus:outline-none"
            />
            {isExceeded && (
              <p className="text-3xs text-rose-600 font-bold mt-1 bg-rose-50 p-1.5 rounded-lg border border-rose-200">
                ⚠️ Timbangan pelet ({outputPelletKg} Kg) melebihi input bahan ({totalInputMixKg} Kg)!
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Kemasan Sak (Kg/Karung)</label>
              <input
                type="number"
                min="1"
                value={bagWeightKg}
                onChange={e => setBagWeightKg(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-mono text-right text-xs focus:bg-white"
              />
              <span className="text-3xs text-slate-400 block font-mono text-right mt-0.5">
                = {bagCount} Sak (@ {bagWeightKg} Kg)
              </span>
            </div>

            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Status Pengujian QC</label>
              <select
                value={qcStatus}
                onChange={e => setQcStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              >
                <option value="Lulus QC">Lulus QC (Siap Dijual)</option>
                <option value="Karantina">Karantina / Hold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 text-2xs mb-1 font-semibold">Hasil Uji MFI / Flow Rate</label>
            <input
              type="text"
              value={mfiTest}
              onChange={e => setMfiTest(e.target.value)}
              placeholder="Misal: 14.2 g/10min @ 230°C"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
            />
          </div>

          {/* Live Preview Card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-3 gap-2 font-mono text-xs">
            <div>
              <span className="text-3xs text-slate-400 block font-sans">Susut / Kerak:</span>
              <span className="font-bold text-rose-600">-{formatWeight(wasteKg)}</span>
              <span className="text-3xs text-slate-400 block">({formatPercent(wastePct)})</span>
            </div>
            <div>
              <span className="text-3xs text-slate-400 block font-sans">Total Biaya Olah:</span>
              <span className="font-bold text-slate-800">{formatRupiah(totalProductionCost)}</span>
            </div>
            <div className="border-l border-slate-200 pl-2">
              <span className="text-3xs text-slate-400 font-sans font-semibold block text-violet-700">HPP Final / Kg:</span>
              <span className="font-black text-violet-700 text-sm">{formatRupiah(hppFinal)}</span>
            </div>
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
              Konfirmasi Selesai & Masukkan ke Gudang Pelet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
