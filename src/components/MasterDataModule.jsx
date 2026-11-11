import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Users,
  Coins,
  Layers,
  Sparkles,
  X,
  Sliders,
  DollarSign
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export default function MasterDataModule({
  polymers,
  setPolymers,
  additives,
  setAdditives,
  contacts,
  setContacts,
  costTariffs,
  setCostTariffs,
  onRequestDelete
}) {
  const [activeSubTab, setActiveSubTab] = useState('polymers');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [polymerModal, setPolymerModal] = useState({ isOpen: false, item: null });
  const [additiveModal, setAdditiveModal] = useState({ isOpen: false, item: null });
  const [contactModal, setContactModal] = useState({ isOpen: false, item: null });

  // Subtabs
  const subTabs = [
    { id: 'polymers', label: 'Jenis Polimer Plastik', icon: Layers, count: polymers.length },
    { id: 'additives', label: 'Bahan Tambahan (Additives)', icon: Sparkles, count: additives.length },
    { id: 'contacts', label: 'Kontak Supplier & Customer', icon: Users, count: contacts.length },
    { id: 'tariffs', label: 'Tarif Biaya Operasional / Kg', icon: Coins, count: 2 },
  ];

  // 1. Polymers CRUD
  const handleSavePolymer = (formData) => {
    if (polymerModal.item) {
      setPolymers(prev => prev.map(p => p.id === polymerModal.item.id ? { ...p, ...formData } : p));
    } else {
      const newId = `POL-${String(Date.now()).slice(-4)}`;
      setPolymers(prev => [...prev, { id: newId, ...formData }]);
    }
    setPolymerModal({ isOpen: false, item: null });
  };

  // 2. Additives CRUD
  const handleSaveAdditive = (formData) => {
    if (additiveModal.item) {
      setAdditives(prev => prev.map(a => a.id === additiveModal.item.id ? { ...a, ...formData, unitPrice: Number(formData.unitPrice) } : a));
    } else {
      const newId = `ADT-${String(Date.now()).slice(-4)}`;
      setAdditives(prev => [...prev, { id: newId, ...formData, unitPrice: Number(formData.unitPrice) }]);
    }
    setAdditiveModal({ isOpen: false, item: null });
  };

  // 3. Contacts CRUD
  const handleSaveContact = (formData) => {
    if (contactModal.item) {
      setContacts(prev => prev.map(c => c.id === contactModal.item.id ? { ...c, ...formData } : c));
    } else {
      const newId = `CNT-${String(Date.now()).slice(-4)}`;
      const prefix = formData.type === 'supplier' ? 'SUP' : 'CUS';
      const newCode = formData.code || `${prefix}-${String(Date.now()).slice(-3)}`;
      setContacts(prev => [...prev, { id: newId, code: newCode, ...formData }]);
    }
    setContactModal({ isOpen: false, item: null });
  };

  // 4. Tariffs Update
  const handleTariffChange = (field, value) => {
    setCostTariffs(prev => ({
      ...prev,
      [field]: Number(value) || 0
    }));
  };

  return (
    <div className="space-y-4">
      {/* Subtab selection & Search */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {subTabs.map(tab => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id);
                  setSearchQuery('');
                }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  active
                    ? 'bg-violet-50 text-violet-700 border border-violet-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-violet-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span className={`text-3xs px-2 py-0.5 rounded-full font-bold ${active ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end">
          {activeSubTab !== 'tariffs' && (
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari master data..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-violet-500 focus:bg-white transition"
              />
            </div>
          )}

          {activeSubTab === 'polymers' && (
            <button
              onClick={() => setPolymerModal({ isOpen: true, item: null })}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold whitespace-nowrap shadow-xs shadow-violet-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Polimer</span>
            </button>
          )}

          {activeSubTab === 'additives' && (
            <button
              onClick={() => setAdditiveModal({ isOpen: true, item: null })}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold whitespace-nowrap shadow-xs shadow-violet-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Aditif</span>
            </button>
          )}

          {activeSubTab === 'contacts' && (
            <button
              onClick={() => setContactModal({ isOpen: true, item: null })}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold whitespace-nowrap shadow-xs shadow-violet-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Kontak</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. POLYMERS TABLE */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'polymers' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 text-3xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Nama Polimer</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">MFI Standar</th>
                  <th className="py-3 px-4">Wujud Default</th>
                  <th className="py-3 px-4">Karakter Fisik & Deskripsi</th>
                  <th className="py-3 px-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {polymers
                  .filter(p => `${p.code} ${p.name} ${p.category} ${p.description}`.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(pol => (
                    <tr key={pol.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-violet-600">{pol.code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{pol.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-3xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {pol.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 font-medium">{pol.meltFlowIndex || '-'}</td>
                      <td className="py-3 px-4 text-slate-600">{pol.defaultForm}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs max-w-[280px]" title={pol.description}>
                        {pol.description}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => setPolymerModal({ isOpen: true, item: pol })}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                            title="Edit Polimer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRequestDelete({
                              title: `Hapus Polimer ${pol.code}`,
                              message: `Yakin ingin menghapus ${pol.code} - ${pol.name}?`,
                              onConfirm: () => setPolymers(prev => prev.filter(x => x.id !== pol.id))
                            })}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. ADDITIVES TABLE */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'additives' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 text-3xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Nama Aditif / Masterbatch</th>
                  <th className="py-3 px-4">Fungsi Formulasi</th>
                  <th className="py-3 px-4 text-right">Harga Beli / Kg</th>
                  <th className="py-3 px-4">Deskripsi</th>
                  <th className="py-3 px-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {additives
                  .filter(a => `${a.code} ${a.name} ${a.function} ${a.description}`.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(adt => (
                    <tr key={adt.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-violet-600">{adt.code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{adt.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-3xs font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                          {adt.function}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                        {formatRupiah(adt.unitPrice)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs max-w-[280px]" title={adt.description}>
                        {adt.description}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => setAdditiveModal({ isOpen: true, item: adt })}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                            title="Edit Aditif"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRequestDelete({
                              title: `Hapus Aditif ${adt.name}`,
                              message: `Yakin ingin menghapus ${adt.name}?`,
                              onConfirm: () => setAdditives(prev => prev.filter(x => x.id !== adt.id))
                            })}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. CONTACTS TABLE */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'contacts' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 text-3xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Kode & Nama Kontak</th>
                  <th className="py-3 px-4">Tipe</th>
                  <th className="py-3 px-4">PIC & Telepon</th>
                  <th className="py-3 px-4">Alamat Pabrik / Lapak</th>
                  <th className="py-3 px-4">Catatan Spesifikasi MFI / Warna</th>
                  <th className="py-3 px-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts
                  .filter(c => `${c.code} ${c.name} ${c.type} ${c.pic} ${c.address} ${c.specNotes}`.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(cnt => (
                    <tr key={cnt.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono text-3xs text-slate-400 block">{cnt.code}</span>
                        <span className="font-semibold text-slate-800">{cnt.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-3xs font-semibold ${
                          cnt.type === 'supplier'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}>
                          {cnt.type === 'supplier' ? 'Supplier Lapak' : 'Customer Pabrik'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{cnt.pic}</div>
                        <div className="font-mono text-slate-400 text-3xs">{cnt.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs max-w-[220px]" title={cnt.address}>
                        {cnt.address}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs max-w-[240px]" title={cnt.specNotes}>
                        {cnt.specNotes}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => setContactModal({ isOpen: true, item: cnt })}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                            title="Edit Kontak"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRequestDelete({
                              title: `Hapus Kontak ${cnt.name}`,
                              message: `Yakin ingin menghapus kontak ${cnt.name}?`,
                              onConfirm: () => setContacts(prev => prev.filter(x => x.id !== cnt.id))
                            })}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. OPERATIONAL TARIFFS PER KG (LIVE EDITABLE) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'tariffs' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Tarif Biaya Operasional Pabrik per Kilogram (Live HPP Engine)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Tarif ini menjadi komponen beban operasional yang otomatis mengkalkulasi HPP Cacahan Flakes di Tahap 2 dan HPP Biji Plastik di Tahap 3. Angka ini dapat diubah sewaktu-waktu sesuai tagihan listrik PLN atau upah borongan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Tariff 1: Pre-Processing */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-700 uppercase">
                  Tahap 2: Biaya Sortir, Giling & Cuci (Rp / Kg)
                </span>
                <span className="text-3xs text-slate-400 font-medium">Pre-Processing Rate</span>
              </div>
              <p className="text-3xs text-slate-500 leading-relaxed">
                Mencakup beban daya mesin crusher, motor pencucian drum sentrifugal, sirkulasi air, detergen, dan upah borongan pilah kotoran.
              </p>
              <div className="flex items-center space-x-2 pt-2">
                <span className="text-xs font-mono font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={costTariffs.preProcessingRatePerKg}
                  onChange={e => handleTariffChange('preProcessingRatePerKg', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-mono font-bold text-lg focus:outline-hidden focus:border-sky-500 shadow-xs transition"
                />
                <span className="text-xs font-mono text-slate-500 font-medium whitespace-nowrap">/ Kg Flakes</span>
              </div>
            </div>

            {/* Tariff 2: Extrusion Pelletizing */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-700 uppercase">
                  Tahap 3: Biaya Ekstrusi & Pelletizing (Rp / Kg)
                </span>
                <span className="text-3xs text-slate-400 font-medium">Extrusion Rate</span>
              </div>
              <p className="text-3xs text-slate-500 leading-relaxed">
                Mencakup beban pemanas heater barel ekstruder, dinamo motor screw, penggantian mesh saringan kasa, dan operator mesin pelet.
              </p>
              <div className="flex items-center space-x-2 pt-2">
                <span className="text-xs font-mono font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={costTariffs.extrusionRatePerKg}
                  onChange={e => handleTariffChange('extrusionRatePerKg', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-mono font-bold text-lg focus:outline-hidden focus:border-violet-500 shadow-xs transition"
                />
                <span className="text-xs font-mono text-slate-500 font-medium whitespace-nowrap">/ Kg Pelet</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Polymer Modal */}
      {polymerModal.isOpen && (
        <PolymerFormModal
          item={polymerModal.item}
          onSave={handleSavePolymer}
          onClose={() => setPolymerModal({ isOpen: false, item: null })}
        />
      )}

      {/* Additive Modal */}
      {additiveModal.isOpen && (
        <AdditiveFormModal
          item={additiveModal.item}
          onSave={handleSaveAdditive}
          onClose={() => setAdditiveModal({ isOpen: false, item: null })}
        />
      )}

      {/* Contact Modal */}
      {contactModal.isOpen && (
        <ContactFormModal
          item={contactModal.item}
          onSave={handleSaveContact}
          onClose={() => setContactModal({ isOpen: false, item: null })}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Polymer
// -------------------------------------------------------------
function PolymerFormModal({ item, onSave, onClose }) {
  const [formData, setFormData] = useState({
    code: item?.code || '',
    name: item?.name || '',
    category: item?.category || '',
    meltFlowIndex: item?.meltFlowIndex || '',
    defaultForm: item?.defaultForm || '',
    description: item?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-100 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-xs">
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm">{item ? 'Edit Master Polimer' : 'Tambah Jenis Polimer'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Kode Polimer *</label>
              <input
                required
                type="text"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="PP, HDPE, PET"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono uppercase focus:outline-hidden focus:border-violet-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Kategori Polimer</label>
              <input
                type="text"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                placeholder="Rigid, Film, Blow"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-violet-500 focus:bg-white transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">Nama Lengkap Polimer *</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Polypropylene (PP)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-violet-500 focus:bg-white transition"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Melt Flow Index (MFI)</label>
              <input
                type="text"
                value={formData.meltFlowIndex}
                onChange={e => setFormData({ ...formData, meltFlowIndex: e.target.value })}
                placeholder="12 - 25"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-hidden focus:border-violet-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Wujud Bawaan</label>
              <input
                type="text"
                value={formData.defaultForm}
                onChange={e => setFormData({ ...formData, defaultForm: e.target.value })}
                placeholder="Afalan / Karungan"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-violet-500 focus:bg-white transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">Deskripsi & Ciri Fisik</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Kegunaan produk akhir, karakteristik lelehan..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-violet-500 focus:bg-white transition"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition">Batal</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-xs shadow-violet-200 transition">Simpan Polimer</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Additive
// -------------------------------------------------------------
function AdditiveFormModal({ item, onSave, onClose }) {
  const [formData, setFormData] = useState({
    code: item?.code || '',
    name: item?.name || '',
    function: item?.function || '',
    unitPrice: item?.unitPrice || 0,
    description: item?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-100 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-xs">
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm">{item ? 'Edit Master Aditif' : 'Tambah Bahan Tambahan / Aditif'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Kode Aditif *</label>
              <input
                required
                type="text"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="MB-BLK, FLR-CA"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono uppercase focus:outline-hidden focus:border-violet-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Harga Beli / Kg (Rp) *</label>
              <input
                required
                type="number"
                min="0"
                step="500"
                value={formData.unitPrice}
                onChange={e => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono text-right focus:outline-hidden focus:border-violet-500 focus:bg-white transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">Nama Lengkap Aditif *</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Masterbatch Hitam Carbon 40%"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-violet-500 focus:bg-white transition"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">Fungsi / Peran Formulasi</label>
            <input
              type="text"
              value={formData.function}
              onChange={e => setFormData({ ...formData, function: e.target.value })}
              placeholder="Pewarna, Pengisi CaCO3, Pencerah OB-1"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-violet-500 focus:bg-white transition"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">Keterangan Teknis</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Kadar karbon, dosis anjuran % pemakaian..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-violet-500 focus:bg-white transition"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition">Batal</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-xs shadow-violet-200 transition">Simpan Aditif</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Contact
// -------------------------------------------------------------
function ContactFormModal({ item, onSave, onClose }) {
  const [formData, setFormData] = useState({
    code: item?.code || '',
    name: item?.name || '',
    type: item?.type || 'supplier',
    phone: item?.phone || '',
    pic: item?.pic || '',
    address: item?.address || '',
    specNotes: item?.specNotes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-100 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-xs">
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm">{item ? `Edit Kontak: ${item.name}` : 'Tambah Kontak Baru'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Tipe Kontak *</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-violet-500 focus:bg-white transition"
              >
                <option value="supplier">Supplier / Pengepul</option>
                <option value="customer">Customer / Pabrik</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-slate-600 font-medium mb-1">Nama Perusahaan / Lapak *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="UD Sumber Rejeki / PT Injeksi"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-violet-500 focus:bg-white transition"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">PIC (Penanggung Jawab)</label>
              <input
                type="text"
                value={formData.pic}
                onChange={e => setFormData({ ...formData, pic: e.target.value })}
                placeholder="Bpk. Handoko"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-violet-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">No. WhatsApp / Telepon</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0812-xxxx-xxxx"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-hidden focus:border-violet-500 focus:bg-white transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">Alamat Gudang / Pabrik</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Alamat penjemputan atau pengiriman barang"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-violet-500 focus:bg-white transition"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">Catatan Spesifikasi (MFI / Warna Permintaan)</label>
            <textarea
              rows={2}
              value={formData.specNotes}
              onChange={e => setFormData({ ...formData, specNotes: e.target.value })}
              placeholder="Kebutuhan part injeksi, MFI 12-16, warna hitam solid, dsb."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-violet-500 focus:bg-white transition"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition">Batal</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-xs shadow-violet-200 transition">Simpan Kontak</button>
          </div>
        </form>
      </div>
    </div>
  );
}
