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
    <div className="space-y-3">
      {/* Subtab selection & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto">
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
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  active
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-2xs px-1.5 py-0.2 rounded-full ${active ? 'bg-emerald-800 text-white' : 'bg-slate-900 text-slate-400'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          {activeSubTab !== 'tariffs' && (
            <div className="relative w-full md:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari master data..."
                className="w-full bg-slate-950 border border-slate-700 rounded-md pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          )}

          {activeSubTab === 'polymers' && (
            <button
              onClick={() => setPolymerModal({ isOpen: true, item: null })}
              className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold whitespace-nowrap transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Polimer</span>
            </button>
          )}

          {activeSubTab === 'additives' && (
            <button
              onClick={() => setAdditiveModal({ isOpen: true, item: null })}
              className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold whitespace-nowrap transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Aditif</span>
            </button>
          )}

          {activeSubTab === 'contacts' && (
            <button
              onClick={() => setContactModal({ isOpen: true, item: null })}
              className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold whitespace-nowrap transition"
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-2xs uppercase">
                  <th className="py-2.5 px-3">Kode</th>
                  <th className="py-2.5 px-3">Nama Polimer</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">MFI Standar</th>
                  <th className="py-2.5 px-3">Wujud Default</th>
                  <th className="py-2.5 px-3">Karakter Fisik & Deskripsi</th>
                  <th className="py-2.5 px-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {polymers
                  .filter(p => `${p.code} ${p.name} ${p.category} ${p.description}`.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(pol => (
                    <tr key={pol.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2 px-3 font-mono font-bold text-emerald-400">{pol.code}</td>
                      <td className="py-2 px-3 font-semibold text-white">{pol.name}</td>
                      <td className="py-2 px-3 text-slate-300">{pol.category}</td>
                      <td className="py-2 px-3 font-mono text-purple-300">{pol.meltFlowIndex || '-'}</td>
                      <td className="py-2 px-3 text-slate-300">{pol.defaultForm}</td>
                      <td className="py-2 px-3 text-slate-400 text-2xs max-w-[260px] truncate" title={pol.description}>
                        {pol.description}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => setPolymerModal({ isOpen: true, item: pol })}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
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
                            className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-rose-200"
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-2xs uppercase">
                  <th className="py-2.5 px-3">Kode</th>
                  <th className="py-2.5 px-3">Nama Aditif / Masterbatch</th>
                  <th className="py-2.5 px-3">Fungsi Formulasi</th>
                  <th className="py-2.5 px-3 text-right">Harga Beli / Kg</th>
                  <th className="py-2.5 px-3">Deskripsi</th>
                  <th className="py-2.5 px-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {additives
                  .filter(a => `${a.code} ${a.name} ${a.function} ${a.description}`.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(adt => (
                    <tr key={adt.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2 px-3 font-mono font-bold text-purple-400">{adt.code}</td>
                      <td className="py-2 px-3 font-semibold text-white">{adt.name}</td>
                      <td className="py-2 px-3 text-slate-300">{adt.function}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                        {formatRupiah(adt.unitPrice)}
                      </td>
                      <td className="py-2 px-3 text-slate-400 text-2xs max-w-[280px] truncate" title={adt.description}>
                        {adt.description}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => setAdditiveModal({ isOpen: true, item: adt })}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
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
                            className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-rose-200"
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-2xs uppercase">
                  <th className="py-2.5 px-3">Kode & Nama Kontak</th>
                  <th className="py-2.5 px-3">Tipe</th>
                  <th className="py-2.5 px-3">PIC & Telepon</th>
                  <th className="py-2.5 px-3">Alamat Pabrik / Lapak</th>
                  <th className="py-2.5 px-3">Catatan Spesifikasi MFI / Warna</th>
                  <th className="py-2.5 px-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {contacts
                  .filter(c => `${c.code} ${c.name} ${c.type} ${c.pic} ${c.address} ${c.specNotes}`.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(cnt => (
                    <tr key={cnt.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2 px-3">
                        <span className="font-mono text-2xs text-slate-400 block">{cnt.code}</span>
                        <span className="font-semibold text-white">{cnt.name}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-2xs font-bold uppercase ${
                          cnt.type === 'supplier'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-sky-950 text-sky-300 border border-sky-800'
                        }`}>
                          {cnt.type === 'supplier' ? 'Supplier Lapak' : 'Customer Pabrik'}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-slate-200">{cnt.pic}</div>
                        <div className="font-mono text-slate-400 text-2xs">{cnt.phone}</div>
                      </td>
                      <td className="py-2 px-3 text-slate-300 text-2xs max-w-[200px] truncate" title={cnt.address}>
                        {cnt.address}
                      </td>
                      <td className="py-2 px-3 text-slate-300 text-2xs max-w-[240px] truncate" title={cnt.specNotes}>
                        {cnt.specNotes}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => setContactModal({ isOpen: true, item: cnt })}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
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
                            className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-rose-200"
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Tarif Biaya Operasional Pabrik per Kilogram (Live HPP Engine)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tarif ini menjadi komponen beban operasional yang otomatis mengkalkulasi HPP Cacahan Flakes di Tahap 2 dan HPP Biji Plastik di Tahap 3. Angka ini dapat diubah sewaktu-waktu sesuai tagihan listrik PLN atau upah borongan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tariff 1: Pre-Processing */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase">
                  Tahap 2: Biaya Sortir, Giling & Cuci (Rp / Kg)
                </span>
                <span className="text-2xs text-slate-500">Pre-Processing Rate</span>
              </div>
              <p className="text-2xs text-slate-400">
                Mencakup beban daya mesin crusher, motor pencucian drum sentrifugal, sirkulasi air, detergen, dan upah borongan pilah kotoran.
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-slate-400">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={costTariffs.preProcessingRatePerKg}
                  onChange={e => handleTariffChange('preProcessingRatePerKg', e.target.value)}
                  className="w-full bg-slate-900 border border-sky-500 rounded px-3 py-2 text-white font-mono font-bold text-base focus:outline-hidden"
                />
                <span className="text-xs font-mono text-slate-400">/ Kg Flakes</span>
              </div>
            </div>

            {/* Tariff 2: Extrusion Pelletizing */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase">
                  Tahap 3: Biaya Ekstrusi & Pelletizing (Rp / Kg)
                </span>
                <span className="text-2xs text-slate-500">Extrusion Rate</span>
              </div>
              <p className="text-2xs text-slate-400">
                Mencakup beban pemanas heater barel ekstruder, dinamo motor screw, penggantian mesh saringan kasa, dan operator mesin pelet.
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-slate-400">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={costTariffs.extrusionRatePerKg}
                  onChange={e => handleTariffChange('extrusionRatePerKg', e.target.value)}
                  className="w-full bg-slate-900 border border-purple-500 rounded px-3 py-2 text-white font-mono font-bold text-base focus:outline-hidden"
                />
                <span className="text-xs font-mono text-slate-400">/ Kg Pelet</span>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-xs">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <h3 className="font-bold text-white text-sm">{item ? 'Edit Master Polimer' : 'Tambah Jenis Polimer'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Kode Polimer *</label>
              <input
                required
                type="text"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="PP, HDPE, PET"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono uppercase focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Kategori Polimer</label>
              <input
                type="text"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                placeholder="Rigid, Film, Blow"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Nama Lengkap Polimer *</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Polypropylene (PP)"
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Melt Flow Index (MFI)</label>
              <input
                type="text"
                value={formData.meltFlowIndex}
                onChange={e => setFormData({ ...formData, meltFlowIndex: e.target.value })}
                placeholder="12 - 25"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Wujud Bawaan</label>
              <input
                type="text"
                value={formData.defaultForm}
                onChange={e => setFormData({ ...formData, defaultForm: e.target.value })}
                placeholder="Afalan / Karungan"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Deskripsi & Ciri Fisik</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Kegunaan produk akhir, karakteristik lelehan..."
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">Batal</button>
            <button type="submit" className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">Simpan Polimer</button>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-xs">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <h3 className="font-bold text-white text-sm">{item ? 'Edit Master Aditif' : 'Tambah Bahan Tambahan / Aditif'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Kode Aditif *</label>
              <input
                required
                type="text"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="MB-BLK, FLR-CA"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono uppercase focus:outline-hidden focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Harga Beli / Kg (Rp) *</label>
              <input
                required
                type="number"
                min="0"
                step="500"
                value={formData.unitPrice}
                onChange={e => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-right focus:outline-hidden focus:border-purple-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Nama Lengkap Aditif *</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Masterbatch Hitam Carbon 40%"
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Fungsi / Peran Formulasi</label>
            <input
              type="text"
              value={formData.function}
              onChange={e => setFormData({ ...formData, function: e.target.value })}
              placeholder="Pewarna, Pengisi CaCO3, Pencerah OB-1"
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Keterangan Teknis</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Kadar karbon, dosis anjuran % pemakaian..."
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-purple-500"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">Batal</button>
            <button type="submit" className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold">Simpan Aditif</button>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-xs">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <h3 className="font-bold text-white text-sm">{item ? `Edit Kontak: ${item.name}` : 'Tambah Kontak Baru'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Tipe Kontak *</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              >
                <option value="supplier">Supplier / Pengepul</option>
                <option value="customer">Customer / Pabrik</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-slate-400 mb-1">Nama Perusahaan / Lapak *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="UD Sumber Rejeki / PT Injeksi"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">PIC (Penanggung Jawab)</label>
              <input
                type="text"
                value={formData.pic}
                onChange={e => setFormData({ ...formData, pic: e.target.value })}
                placeholder="Bpk. Handoko"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">No. WhatsApp / Telepon</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0812-xxxx-xxxx"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Alamat Gudang / Pabrik</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Alamat penjemputan atau pengiriman barang"
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Catatan Spesifikasi (MFI / Warna Permintaan)</label>
            <textarea
              rows={2}
              value={formData.specNotes}
              onChange={e => setFormData({ ...formData, specNotes: e.target.value })}
              placeholder="Kebutuhan part injeksi, MFI 12-16, warna hitam solid, dsb."
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">Batal</button>
            <button type="submit" className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">Simpan Kontak</button>
          </div>
        </form>
      </div>
    </div>
  );
}
