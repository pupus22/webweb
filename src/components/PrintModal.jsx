import React, { useState } from 'react';
import { Printer, X, FileText, Truck, Boxes } from 'lucide-react';
import { formatRupiah, formatNumber, formatWeight, formatDate } from '../utils/formatters';

export default function PrintModal({ sale, onClose }) {
  const [docType, setDocType] = useState('invoice'); // 'invoice' | 'do'

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-3xl w-full my-6 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Toolbar (No-Print) */}
        <div className="no-print flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDocType('invoice')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                docType === 'invoice'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Nota Penjualan (Invoice)</span>
            </button>
            <button
              onClick={() => setDocType('do')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                docType === 'do'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Surat Jalan (Delivery Order)</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Print PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="p-6 overflow-y-auto bg-white text-slate-900 font-sans print:p-0 print:m-0">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Boxes className="w-6 h-6 text-emerald-700" />
                <h1 className="text-xl font-black tracking-tight text-slate-900">POLYCOMP PLASTINDO UTAMA</h1>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">Pabrik Pengolahan & Compounding Biji Plastik Daur Ulang</p>
              <p className="text-xs text-slate-500">Jl. Industri Daur Ulang No. 88, Jawa Timur • Telp: (031) 8989-1234</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded bg-slate-900 text-white text-xs font-black uppercase tracking-wider">
                {docType === 'invoice' ? 'NOTA PENJUALAN' : 'SURAT JALAN (DO)'}
              </span>
              <p className="text-sm font-bold font-mono text-slate-900 mt-1">
                {docType === 'invoice' ? sale.invoiceNo : sale.doNo}
              </p>
              <p className="text-xs text-slate-600">Tanggal: {formatDate(sale.date)}</p>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-slate-200">
            <div>
              <span className="text-slate-500 font-bold uppercase block text-2xs mb-1">Tujuan Pengiriman / Customer:</span>
              <p className="font-bold text-sm text-slate-900">{sale.customerName}</p>
              <p className="text-slate-600">{sale.customerAddress || 'Alamat Pabrik Customer'}</p>
              <p className="text-slate-600">Telp: {sale.customerPhone || '-'}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-bold uppercase block text-2xs mb-1">Detail Ekspedisi / Armada:</span>
              <p className="text-slate-700">Driver / Sopir: <strong className="text-slate-900">{sale.driverName || '-'}</strong></p>
              <p className="text-slate-700 font-mono">No. Polisi Truk: <strong className="text-slate-900">{sale.vehicleNo || '-'}</strong></p>
              {docType === 'invoice' && (
                <p className="text-slate-700 mt-1">
                  Status Pembayaran: <strong className="uppercase">{sale.paymentStatus}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="py-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-700 text-2xs uppercase tracking-wider font-bold">
                  <th className="py-2 px-2 text-center w-10">No</th>
                  <th className="py-2 px-3">Kode Batch</th>
                  <th className="py-2 px-3">Deskripsi Produk Biji Plastik</th>
                  <th className="py-2 px-3 text-right">Kemasan</th>
                  <th className="py-2 px-3 text-right">Berat (Kg)</th>
                  {docType === 'invoice' && (
                    <>
                      <th className="py-2 px-3 text-right">Harga / Kg</th>
                      <th className="py-2 px-3 text-right">Total (Rp)</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                <tr>
                  <td className="py-3 px-2 text-center text-slate-500">1</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{sale.batchNo}</td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{sale.productName}</div>
                    <div className="text-2xs text-slate-500">{sale.notes || 'Kemasan karung zak tertutup rapi'}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">
                    {sale.bagCount || Math.floor(sale.qtyKg / 25)} Sak @ 25 Kg
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {formatNumber(sale.qtyKg, 1)} Kg
                  </td>
                  {docType === 'invoice' && (
                    <>
                      <td className="py-3 px-3 text-right font-mono text-slate-800">
                        {formatRupiah(sale.pricePerKg)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {formatRupiah(sale.subtotal)}
                      </td>
                    </>
                  )}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Section (For Invoice) */}
          {docType === 'invoice' && (
            <div className="border-t border-slate-200 pt-3 flex justify-end">
              <div className="w-64 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{formatRupiah(sale.subtotal)}</span>
                </div>
                {sale.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Diskon:</span>
                    <span>-{formatRupiah(sale.discount)}</span>
                  </div>
                )}
                {sale.shippingCost > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Ongkos Kirim:</span>
                    <span>+{formatRupiah(sale.shippingCost)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-300 pt-1.5">
                  <span>Total Tagihan:</span>
                  <span>{formatRupiah(sale.totalAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-12 text-center text-xs text-slate-700">
            <div>
              <p className="text-2xs text-slate-500 uppercase">Dibuat Oleh (Admin):</p>
              <div className="h-16"></div>
              <p className="font-bold border-t border-slate-300 pt-1 text-slate-900">( Bag. Penjualan )</p>
            </div>
            <div>
              <p className="text-2xs text-slate-500 uppercase">Sopir / Pengangkut:</p>
              <div className="h-16"></div>
              <p className="font-bold border-t border-slate-300 pt-1 text-slate-900">
                ( {sale.driverName || 'Sopir Truk'} )
              </p>
            </div>
            <div>
              <p className="text-2xs text-slate-500 uppercase">Diterima Customer:</p>
              <div className="h-16"></div>
              <p className="font-bold border-t border-slate-300 pt-1 text-slate-900">( Cap & Tanda Tangan )</p>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-3 border-t border-slate-200 text-center text-2xs text-slate-400">
            Barang yang sudah diterima dan ditimbang tidak dapat dikembalikan tanpa persetujuan tertulis dari manajemen.
          </div>
        </div>
      </div>
    </div>
  );
}
