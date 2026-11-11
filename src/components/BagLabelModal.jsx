import React from 'react';
import { Tag, Printer, X, Boxes, ShieldCheck, QrCode } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function BagLabelModal({ lot, onClose }) {
  if (!lot) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full my-6 overflow-hidden flex flex-col text-xs">
        {/* Toolbar */}
        <div className="no-print flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Label Karung Sak (25 Kg)</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-md text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Label Sak</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Bag Label Preview (Standard Industrial 10x15cm label) */}
        <div className="p-6 bg-slate-950 overflow-y-auto flex justify-center print:p-0 print:m-0 print:bg-white">
          <div className="w-[380px] bg-white text-black p-5 rounded-lg border-4 border-black shadow-lg font-sans print:border-2 print:shadow-none print:w-full">
            {/* Header */}
            <div className="flex items-center justify-between border-b-4 border-black pb-3">
              <div>
                <h1 className="text-base font-black tracking-wider uppercase text-black leading-none">
                  POLYCOMP PLASTINDO
                </h1>
                <p className="text-3xs font-bold uppercase tracking-tight text-gray-700 mt-0.5">
                  Recycled Plastic Pellets & Compounding
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 bg-black text-white text-2xs font-black uppercase">
                  GRADE SUPER
                </span>
              </div>
            </div>

            {/* Polymer Type & Lot Bar */}
            <div className="my-3 text-center border-b-2 border-black pb-3">
              <span className="text-3xs font-black tracking-widest text-gray-600 uppercase block">
                POLIMER & DESKRIPSI PRODUK:
              </span>
              <h2 className="text-lg font-black uppercase text-black tracking-tight leading-tight">
                {lot.productName || 'PELET BIJI PLASTIK'}
              </h2>
              <div className="inline-block px-3 py-1 mt-1 rounded bg-gray-100 border border-gray-400 font-mono text-xs font-bold text-black">
                {lot.polymerType} • {lot.targetColor || 'Hitam'}
              </div>
            </div>

            {/* Huge Lot Number for Floor Reading */}
            <div className="bg-gray-100 border-2 border-black p-2.5 text-center my-3 rounded">
              <span className="text-3xs font-black uppercase tracking-widest text-gray-700 block">
                NOMOR LOT PRODUKSI:
              </span>
              <span className="text-xl font-black font-mono tracking-wider text-black block">
                {lot.lotNo}
              </span>
              <span className="text-3xs font-mono text-gray-600 block mt-0.5">
                SPK: {lot.spkNo || '-'}
              </span>
            </div>

            {/* Specs & Net Weight */}
            <div className="grid grid-cols-2 gap-2 border-b-2 border-black pb-3 my-3">
              <div className="space-y-1">
                <div>
                  <span className="text-3xs font-bold text-gray-600 block">BERAT BERSIH (NETTO):</span>
                  <span className="text-lg font-black font-mono text-black leading-none">
                    25.00 Kg
                  </span>
                </div>
                <div>
                  <span className="text-3xs font-bold text-gray-600 block">HASIL UJI MFI:</span>
                  <span className="text-xs font-bold font-mono text-black">
                    {lot.mfi || '14.2 g/10min'}
                  </span>
                </div>
              </div>

              <div className="text-right flex flex-col justify-between items-end">
                {/* QC Passed Stamp */}
                <div className="border-2 border-emerald-700 bg-emerald-50 px-2.5 py-1 rounded text-center rotate-[-3deg]">
                  <span className="text-3xs font-black text-emerald-800 uppercase block leading-none">
                    QUALITY CONTROL
                  </span>
                  <span className="text-xs font-black text-emerald-900 uppercase tracking-wider block">
                    ✓ PASSED
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-3xs font-bold text-gray-600 block">TGL PRODUKSI:</span>
                  <span className="text-xs font-bold font-mono text-black">
                    {formatDate(lot.productionDate || new Date())}
                  </span>
                </div>
              </div>
            </div>

            {/* Barcode & Storage Warnings */}
            <div className="flex items-center justify-between pt-1">
              <div>
                {/* Visual Barcode Simulation */}
                <div className="flex items-center space-x-0.5 h-7">
                  <div className="w-1 h-full bg-black"></div>
                  <div className="w-0.5 h-full bg-black"></div>
                  <div className="w-1.5 h-full bg-black"></div>
                  <div className="w-0.5 h-full bg-black"></div>
                  <div className="w-1 h-full bg-black"></div>
                  <div className="w-2 h-full bg-black"></div>
                  <div className="w-0.5 h-full bg-black"></div>
                  <div className="w-1 h-full bg-black"></div>
                  <div className="w-1.5 h-full bg-black"></div>
                  <div className="w-0.5 h-full bg-black"></div>
                  <div className="w-1 h-full bg-black"></div>
                  <div className="w-0.5 h-full bg-black"></div>
                  <div className="w-2 h-full bg-black"></div>
                  <div className="w-1 h-full bg-black"></div>
                </div>
                <span className="text-3xs font-mono text-gray-600 block tracking-widest mt-0.5">
                  *{lot.lotNo}*
                </span>
              </div>

              <div className="text-right text-3xs text-gray-600 max-w-[170px] leading-tight">
                Simpan di tempat kering & tertutup. Hindari sinar matahari langsung. Standar industri daur ulang.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
