import React from 'react';
import {
  GitBranch,
  X,
  Truck,
  Waves,
  Flame,
  Boxes,
  ShoppingBag,
  ArrowDown,
  CheckCircle2,
  Calendar,
  Building2,
  Scale,
  FileText
} from 'lucide-react';
import {
  formatRupiah,
  formatNumber,
  formatWeight,
  formatPercent,
  formatDate
} from '../utils/formatters';

export default function TraceabilityModal({
  identifier,
  onClose,
  rawPurchases = [],
  preProcessings = [],
  productionSPKs = [],
  finishedGoods = [],
  salesOrders = []
}) {
  if (!identifier) return null;

  // Trace matching records across all 5 stages
  let matchedSPK = productionSPKs.find(
    s => s.spkNo === identifier || s.targetLotNo === identifier || s.id === identifier
  );

  let matchedLot = finishedGoods.find(
    g => g.lotNo === identifier || (matchedSPK && (g.lotNo === matchedSPK.targetLotNo || g.spkNo === matchedSPK.spkNo))
  );

  if (!matchedSPK && matchedLot) {
    matchedSPK = productionSPKs.find(s => s.targetLotNo === matchedLot.lotNo || s.spkNo === matchedLot.spkNo);
  }

  // Find associated flakes
  let matchedFlakesList = [];
  if (matchedSPK && Array.isArray(matchedSPK.ingredients)) {
    const flakesIds = matchedSPK.ingredients
      .filter(i => i.sourceType === 'flakes')
      .map(i => i.sourceId);
    matchedFlakesList = preProcessings.filter(p => flakesIds.includes(p.id) || flakesIds.includes(p.outputFlakesBatchNo));
  } else {
    const singleFlakes = preProcessings.find(
      p => p.outputFlakesBatchNo === identifier || p.id === identifier
    );
    if (singleFlakes) matchedFlakesList = [singleFlakes];
  }

  // Find associated raw reject purchases
  let matchedRawList = [];
  matchedFlakesList.forEach(flk => {
    const raw = rawPurchases.find(r => r.id === flk.rawPurchaseId || r.batchNo === flk.rawBatchNo);
    if (raw && !matchedRawList.some(x => x.id === raw.id)) {
      matchedRawList.push(raw);
    }
  });

  if (matchedRawList.length === 0) {
    const singleRaw = rawPurchases.find(r => r.batchNo === identifier || r.id === identifier);
    if (singleRaw) matchedRawList = [singleRaw];
  }

  // Find associated sales
  let matchedSalesList = [];
  const targetLotNo = matchedLot ? matchedLot.lotNo : (matchedSPK ? matchedSPK.targetLotNo : identifier);
  matchedSalesList = salesOrders.filter(s => s.targetLotNo === targetLotNo || s.orderNo === identifier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-3xl w-full my-6 overflow-hidden flex flex-col max-h-[90vh] text-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <span>Pohon Silsilah Batch & Traceability</span>
                <span className="font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800 text-xs">
                  {identifier}
                </span>
              </h3>
              <p className="text-2xs text-slate-400">
                Lacak jejak fisik dari Supplier Limbah → Sortir & Cuci → Mesin Ekstruder → Pelet Sak → Customer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tree Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 font-sans">
          {/* STEP 1: HULU - INBOUND RAW REJECT */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-900/60 space-y-2">
            <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800/80 pb-1.5">
              <div className="flex items-center space-x-1.5">
                <Truck className="w-4 h-4" />
                <span className="uppercase tracking-wider text-2xs">Tahap 1: Asal Bahan Baku Limbah Reject</span>
              </div>
              <span className="text-2xs font-mono font-normal text-slate-400">
                {matchedRawList.length} Batch Pengepul Terkait
              </span>
            </div>

            {matchedRawList.length > 0 ? (
              <div className="space-y-2">
                {matchedRawList.map(raw => (
                  <div key={raw.id} className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 bg-slate-900/80 rounded-lg border border-slate-800 text-2xs">
                    <div>
                      <span className="text-slate-500 block">Kode Batch Reject:</span>
                      <strong className="text-emerald-400 font-mono text-xs">{raw.batchNo}</strong>
                      <span className="text-slate-400 block">{raw.polymerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Supplier / Lapak:</span>
                      <strong className="text-white">{raw.supplierName}</strong>
                      <span className="text-slate-400 block">{formatDate(raw.date)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Timbangan Masuk:</span>
                      <span className="text-white font-mono">{formatWeight(raw.netWeight)} Netto</span>
                      <span className="text-rose-400 block font-mono">Susut: -{raw.deductionKg} Kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Harga Beli / Kg:</span>
                      <span className="text-white font-mono">{formatRupiah(raw.pricePerKg)}</span>
                      <span className="text-emerald-400 block font-mono">{formatRupiah(raw.totalAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 italic p-2 text-center text-2xs">
                Data asal reject tidak terlacak langsung (kemungkinan berasal dari stok awal sebelum sistem berjalan).
              </div>
            )}
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* STEP 2: PRE-PROCESSING (GILING & CUCI FLAKES) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-blue-900/60 space-y-2">
            <div className="flex items-center justify-between text-blue-400 font-bold border-b border-slate-800/80 pb-1.5">
              <div className="flex items-center space-x-1.5">
                <Waves className="w-4 h-4" />
                <span className="uppercase tracking-wider text-2xs">Tahap 2: Sortasi, Giling & Cuci Sentrifugal</span>
              </div>
              <span className="text-2xs font-mono font-normal text-slate-400">
                {matchedFlakesList.length} Batch Flakes Bersih
              </span>
            </div>

            {matchedFlakesList.length > 0 ? (
              <div className="space-y-2">
                {matchedFlakesList.map(flk => (
                  <div key={flk.id} className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 bg-slate-900/80 rounded-lg border border-slate-800 text-2xs">
                    <div>
                      <span className="text-slate-500 block">Batch Cacahan Flakes:</span>
                      <strong className="text-blue-400 font-mono text-xs">{flk.outputFlakesBatchNo}</strong>
                      <span className="text-slate-400 block">{flk.flakesName} ({flk.flakesColor})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Bahan Kotor Terpakai:</span>
                      <span className="text-white font-mono">{formatWeight(flk.rawUsedKg)}</span>
                      <span className="text-slate-400 block">Tgl: {formatDate(flk.date)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Output Bersih Kering:</span>
                      <strong className="text-emerald-400 font-mono">{formatWeight(flk.outputFlakesKg)}</strong>
                      <span className="text-rose-400 block font-mono">Susut Lumpur: -{formatPercent(flk.wastePercentage)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">HPP Flakes Bersih / Kg:</span>
                      <strong className="text-sky-300 font-mono text-xs">{formatRupiah(flk.hppFlakesPerKg)}</strong>
                      <span className="text-2xs text-slate-400 block">Kadar Air &lt; 1%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 italic p-2 text-center text-2xs">
                Data batch flakes bersih belum terhubung.
              </div>
            )}
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* STEP 3: BLENDING & EKSTRUSI PELLETIZING */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-900/60 space-y-2">
            <div className="flex items-center justify-between text-purple-400 font-bold border-b border-slate-800/80 pb-1.5">
              <div className="flex items-center space-x-1.5">
                <Flame className="w-4 h-4" />
                <span className="uppercase tracking-wider text-2xs">Tahap 3: Formulasi Blending & Mesin Ekstruder</span>
              </div>
              <span className="text-2xs font-mono font-normal text-slate-400">
                {matchedSPK ? matchedSPK.spkNo : 'SPK Terkait'}
              </span>
            </div>

            {matchedSPK ? (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-2xs">
                  <div>
                    <span className="text-slate-500 block">Nomor SPK & Mesin:</span>
                    <strong className="text-purple-400 font-mono">{matchedSPK.spkNo}</strong>
                    <span className="text-slate-400 block">{matchedSPK.extruderLine || 'Line Ekstruder'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Target Biji Plastik:</span>
                    <strong className="text-white">{matchedSPK.targetProductName}</strong>
                    <span className="text-slate-400 block">{matchedSPK.polymerType} • {matchedSPK.targetColor}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Parameter Filter Kasa:</span>
                    <span className="text-white font-mono">{matchedSPK.meshScreenSize || 'Mesh 80'}</span>
                    <span className="text-slate-400 block">{matchedSPK.barrelTempCelsius || '185°C - 215°C'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Susut Kerak & Purging:</span>
                    <span className="text-rose-400 font-bold font-mono">-{formatWeight(matchedSPK.wasteExtrusionKg || 0)}</span>
                    <span className="text-slate-400 block">({formatPercent(matchedSPK.wastePercentage || 0)})</span>
                  </div>
                </div>

                {/* Ingredients composition breakdown */}
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">
                    Resep Formulasi Bahan Masuk:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-2xs">
                    {(matchedSPK.ingredients || []).map((ing, idx) => (
                      <div key={idx} className="flex justify-between p-1 bg-slate-950/60 rounded border border-slate-800/80">
                        <span className="text-slate-300 font-medium">{ing.materialName}</span>
                        <span className="font-mono text-purple-300">{formatWeight(ing.weightKg)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 italic p-2 text-center text-2xs">
                Data SPK ekstrusi tidak ditemukan.
              </div>
            )}
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* STEP 4: GUDANG PELET (FINISHED GOODS) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-900/60 space-y-2">
            <div className="flex items-center justify-between text-amber-400 font-bold border-b border-slate-800/80 pb-1.5">
              <div className="flex items-center space-x-1.5">
                <Boxes className="w-4 h-4" />
                <span className="uppercase tracking-wider text-2xs">Tahap 4: QC & Gudang Biji Pelet Sak</span>
              </div>
              <span className="text-2xs font-mono font-normal text-slate-400">
                Lot: {targetLotNo}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-2xs p-2 bg-slate-900/80 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 block">Kode Lot Pelet:</span>
                <strong className="text-amber-400 font-mono text-xs">{targetLotNo}</strong>
                <span className="text-slate-400 block">{matchedSPK ? matchedSPK.polymerType : 'PLASTIC'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Status Pengujian QC:</span>
                <span className="inline-block px-2 py-0.5 rounded font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 text-3xs">
                  {matchedSPK?.qcResult?.status || 'Lulus QC'}
                </span>
                <span className="text-slate-400 block mt-0.5">MFI: {matchedSPK?.qcResult?.mfiTest || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Kemasan Karung Sak:</span>
                <strong className="text-white font-mono text-xs">
                  {matchedSPK ? Math.floor(matchedSPK.outputPelletKg / 25) : 0} Sak
                </strong>
                <span className="text-slate-400 block">@ 25 Kg Standard</span>
              </div>
              <div>
                <span className="text-slate-500 block">HPP Final Pelet / Kg:</span>
                <strong className="text-purple-400 font-mono text-xs">
                  {matchedSPK ? formatRupiah(matchedSPK.hppFinalPelletPerKg) : '-'}
                </strong>
                <span className="text-slate-400 block">Basis Biaya Bersih</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* STEP 5: HILIR - DISTRIBUSI PENJUALAN */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-900/60 space-y-2">
            <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800/80 pb-1.5">
              <div className="flex items-center space-x-1.5">
                <ShoppingBag className="w-4 h-4" />
                <span className="uppercase tracking-wider text-2xs">Tahap 5: Distribusi Pengiriman & Customer</span>
              </div>
              <span className="text-2xs font-mono font-normal text-slate-400">
                {matchedSalesList.length} Transaksi Surat Jalan
              </span>
            </div>

            {matchedSalesList.length > 0 ? (
              <div className="space-y-2">
                {matchedSalesList.map(so => (
                  <div key={so.id} className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 bg-slate-900/80 rounded-lg border border-slate-800 text-2xs">
                    <div>
                      <span className="text-slate-500 block">No. DO / Surat Jalan:</span>
                      <strong className="text-emerald-400 font-mono text-xs">{so.orderNo}</strong>
                      <span className="text-slate-400 block">{formatDate(so.date)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Customer Penerima:</span>
                      <strong className="text-white">{so.customerName}</strong>
                      <span className="text-slate-400 block truncate">{so.customerAddress || 'Gudang Customer'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Qty Kirim:</span>
                      <span className="text-white font-mono">{formatWeight(so.qtyKg)}</span>
                      <span className="text-amber-300 block font-mono font-semibold">{so.bagCount || Math.floor(so.qtyKg / 25)} Sak</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Ekspedisi / Armada:</span>
                      <span className="text-white font-mono font-bold">{so.truckPlate || 'Armada Pabrik'}</span>
                      <span className="text-slate-400 block">{so.driverName || 'Sopir Ekspedisi'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 italic p-2 text-center text-2xs">
                Lot ini masih tersimpan di gudang pelet (belum ada transaksi penjualan/pengiriman).
              </div>
            )}
          </div>
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
          >
            Tutup Silsilah
          </button>
        </div>
      </div>
    </div>
  );
}
