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
  Check
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export default function MasterDataModule({
  plasticTypes,
  setPlasticTypes,
  plasticForms,
  setPlasticForms,
  contacts,
  setContacts,
  costComponents,
  setCostComponents,
  onRequestDelete
}) {
  const [activeSubTab, setActiveSubTab] = useState('plastics');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [plasticModal, setPlasticModal] = useState({ isOpen: false, item: null });
  const [formModal, setFormModal] = useState({ isOpen: false, item: null });
  const [contactModal, setContactModal] = useState({ isOpen: false, item: null });
  const [costModal, setCostModal] = useState({ isOpen: false, item: null });

  // Subtabs
  const subTabs = [
    { id: 'plastics', label: 'Jenis & Polimer Plastik', icon: Layers, count: plasticTypes.length },
    { id: 'forms', label: 'Wujud Bahan Baku', icon: Sparkles, count: plasticForms.length },
    { id: 'contacts', label: 'Kontak (Supplier & Customer)', icon: Users, count: contacts.length },
    { id: 'costs', label: 'Komponen Tarif Biaya Olah', icon: Coins, count: costComponents.length },
  ];

  // -------------------------------------------------------------
  // PLASTIC TYPES CRUD HANDLERS
  // -------------------------------------------------------------
  const handleSavePlastic = (formData) => {
    if (plasticModal.item) {
      setPlasticTypes(prev => prev.map(p => p.id === plasticModal.item.id ? { ...p, ...formData } : p));
    } else {
      const newId = `PT-${String(Date.now()).slice(-4)}`;
      setPlasticTypes(prev => [...prev, { id: newId, ...formData }]);
    }
    setPlasticModal({ isOpen: false, item: null });
  };

  // -------------------------------------------------------------
  // PLASTIC FORMS CRUD HANDLERS
  // -------------------------------------------------------------
  const handleSaveForm = (formData) => {
    if (formModal.item) {
      setPlasticForms(prev => prev.map(f => f.id === formModal.item.id ? { ...f, ...formData } : f));
    } else {
      const newId = `PF-${String(Date.now()).slice(-4)}`;
      setPlasticForms(prev => [...prev, { id: newId, ...formData }]);
    }
    setFormModal({ isOpen: false, item: null });
  };

  // -------------------------------------------------------------
  // CONTACTS CRUD HANDLERS
  // -------------------------------------------------------------
  const handleSaveContact = (formData) => {
    if (contactModal.item) {
      setContacts(prev => prev.map(c => c.id === contactModal.item.id ? { ...c, ...formData } : c));
    } else {
      const prefix = formData.type === 'supplier' ? 'SUP' : (formData.type === 'customer' ? 'CUS' : 'CNT');
      const newId = `C-${String(Date.now()).slice(-4)}`;
      const newCode = formData.code || `${prefix}-${String(Date.now()).slice(-3)}`;
      setContacts(prev => [...prev, { id: newId, code: newCode, ...formData }]);
    }
    setContactModal({ isOpen: false, item: null });
  };

  // -------------------------------------------------------------
  // COST COMPONENTS CRUD HANDLERS
  // -------------------------------------------------------------
  const handleSaveCost = (formData) => {
    if (costModal.item) {
      setCostComponents(prev => prev.map(c => c.id === costModal.item.id ? { ...c, ...formData, ratePerKg: Number(formData.ratePerKg) } : c));
    } else {
      const newId = `CC-${String(Date.now()).slice(-4)}`;
      setCostComponents(prev => [...prev, { id: newId, ...formData, ratePerKg: Number(formData.ratePerKg) }]);
    }
    setCostModal({ isOpen: false, item: null });
  };

  return (
    <div className="space-y-3">
      {/* Subtab selection & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex flex-col md:flex-row items-center justify-between gap-2">
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
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${
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
          {activeSubTab === 'plastics' && (
            <button
              onClick={() => setPlasticModal({ isOpen: true, item: null })}
              className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold whitespace-nowrap transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Jenis</span>
            </button>
          )}
          {activeSubTab === 'forms' && (
            <button
              onClick={() => setFormModal({ isOpen: true, item: null })}
              className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold whitespace-nowrap transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Wujud</span>
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
          {activeSubTab === 'costs' && (
            <button
              onClick={() => setCostModal({ isOpen: true, item: null })}
              className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold whitespace-nowrap transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Komponen</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. PLASTIC TYPES TABLE */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'plastics' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-2xs uppercase tracking-wider">
                  <th className="py-2.5 px-3">Kode Polimer</th>
                  <th className="py-2.5 px-3">Nama Polimer / Bahan</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Wujud Default</th>
                  <th className="py-2.5 px-3">Deskripsi / Spesifikasi</th>
                  <th className="py-2.5 px-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {plasticTypes
                  .filter(p => `${p.code} ${p.name} ${p.category} ${p.description}`.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(pt => (
                    <tr key={pt.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2 px-3 font-mono font-bold text-emerald-400">{pt.code}</td>
                      <td className="py-2 px-3 font-semibold text-white">{pt.name}</td>
                      <td className="py-2 px-3 text-slate-300">{pt.category || '-'}</td>
                      <td className="py-2 px-3 text-slate-400">{pt.defaultForm || '-'}</td>
                      <td className="py-2 px-3 text-slate-400 text-xs">{pt.description || '-'}</td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => setPlasticModal({ isOpen: true, item: pt })}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Edit Jenis Plastik"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRequestDelete({
                              title: `Hapus Jenis Plastik ${pt.code}`,
                              message: `Yakin ingin menghapus ${pt.code} - ${pt.name}? Pastikan tidak ada transaksi yang terhubung.`,
                              onConfirm: () => setPlasticTypes(prev => prev.filter(x => x.id !== pt.id))
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
      {/* 2. PLASTIC FORMS TABLE */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'forms' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-2xs uppercase tracking-wider">
                  <th className="py-2.5 px-3">Nama Wujud Bahan Baku</th>
                  <th className="py-2.5 px-3">Keterangan Teknis & Kondisi Lapak</th>
                  <th className="py-2.5 px-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {plasticForms
                  .filter(f => `${f.name} ${f.description}`.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(pf => (
                    <tr key={pf.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2 px-3 font-semibold text-white">{pf.name}</td>
                      <td className="py-2 px-3 text-slate-300">{pf.description || '-'}</td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => setFormModal({ isOpen: true, item: pf })}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Edit Wujud"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRequestDelete({
                              title: `Hapus Wujud ${pf.name}`,
                              message: `Yakin ingin menghapus wujud bahan ${pf.name}?`,
                              onConfirm: () => setPlasticForms(prev => prev.filter(x => x.id !== pf.id))
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
      {/* 3. CONTACTS TABLE (SUPPLIER & CUSTOMER) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'contacts' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-2xs uppercase tracking-wider">
                  <th className="py-2.5 px-3">Kode & Nama Kontak</th>
                  <th className="py-2.5 px-3">Tipe</th>
                  <th className="py-2.5 px-3">PIC & No. Telepon</th>
                  <th className="py-2.5 px-3">Alamat / Lokasi Pabrik</th>
                  <th className="py-2.5 px-3">Catatan Spesifikasi / Request</th>
                  <th className="py-2.5 px-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {contacts
                  .filter(c => `${c.code} ${c.name} ${c.type} ${c.pic} ${c.address} ${c.specNotes}`.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(contact => (
                    <tr key={contact.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2 px-3">
                        <span className="font-mono text-2xs text-slate-400 block">{contact.code || contact.id}</span>
                        <span className="font-semibold text-white">{contact.name}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-2xs font-bold uppercase ${
                          contact.type === 'supplier'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : contact.type === 'customer'
                            ? 'bg-sky-950 text-sky-300 border border-sky-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {contact.type}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-slate-200 font-medium">{contact.pic || '-'}</div>
                        <div className="font-mono text-slate-400 text-2xs">{contact.phone || '-'}</div>
                      </td>
                      <td className="py-2 px-3 text-slate-300 max-w-[200px] truncate" title={contact.address}>
                        {contact.address || '-'}
                      </td>
                      <td className="py-2 px-3 text-slate-400 max-w-[240px] truncate" title={contact.specNotes}>
                        {contact.specNotes || '-'}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => setContactModal({ isOpen: true, item: contact })}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Edit Kontak"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRequestDelete({
                              title: `Hapus Kontak ${contact.name}`,
                              message: `Yakin ingin menghapus ${contact.name}?`,
                              onConfirm: () => setContacts(prev => prev.filter(x => x.id !== contact.id))
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
      {/* 4. COST COMPONENTS TABLE */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'costs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase">Tarif Biaya Operasional / Biaya Olah Pabrik</h4>
              <p className="text-2xs text-slate-400">Digunakan sebagai dasar kalkulasi HPP otomatis pada setiap SPK Produksi & Blending.</p>
            </div>
            <div className="text-right">
              <span className="text-2xs text-slate-400 block">Total Default Biaya Olah:</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {formatRupiah(costComponents.reduce((acc, c) => acc + (Number(c.ratePerKg) || 0), 0))} / Kg
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-2xs uppercase tracking-wider">
                  <th className="py-2.5 px-3">Nama Komponen Biaya</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3 text-right">Tarif / Kg</th>
                  <th className="py-2.5 px-3">Keterangan Rinci</th>
                  <th className="py-2.5 px-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {costComponents
                  .filter(c => `${c.name} ${c.category} ${c.notes}`.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(cost => (
                    <tr key={cost.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2 px-3 font-semibold text-white">{cost.name}</td>
                      <td className="py-2 px-3 text-slate-300 capitalize">{cost.category}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                        {formatRupiah(cost.ratePerKg)} / Kg
                      </td>
                      <td className="py-2 px-3 text-slate-400 text-xs">{cost.notes || '-'}</td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => setCostModal({ isOpen: true, item: cost })}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Edit Komponen Biaya"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRequestDelete({
                              title: `Hapus Komponen Biaya ${cost.name}`,
                              message: `Yakin ingin menghapus ${cost.name}?`,
                              onConfirm: () => setCostComponents(prev => prev.filter(x => x.id !== cost.id))
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

      {/* ============================================================= */}
      {/* PLASTIC TYPE MODAL */}
      {/* ============================================================= */}
      {plasticModal.isOpen && (
        <PlasticTypeFormModal
          item={plasticModal.item}
          plasticForms={plasticForms}
          onSave={handleSavePlastic}
          onClose={() => setPlasticModal({ isOpen: false, item: null })}
        />
      )}

      {/* ============================================================= */}
      {/* PLASTIC FORM MODAL */}
      {/* ============================================================= */}
      {formModal.isOpen && (
        <PlasticFormModal
          item={formModal.item}
          onSave={handleSaveForm}
          onClose={() => setFormModal({ isOpen: false, item: null })}
        />
      )}

      {/* ============================================================= */}
      {/* CONTACT MODAL */}
      {/* ============================================================= */}
      {contactModal.isOpen && (
        <ContactFormModal
          item={contactModal.item}
          onSave={handleSaveContact}
          onClose={() => setContactModal({ isOpen: false, item: null })}
        />
      )}

      {/* ============================================================= */}
      {/* COST COMPONENT MODAL */}
      {/* ============================================================= */}
      {costModal.isOpen && (
        <CostComponentFormModal
          item={costModal.item}
          onSave={handleSaveCost}
          onClose={() => setCostModal({ isOpen: false, item: null })}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------
// Sub-Modal 1: Plastic Type Form
// -----------------------------------------------------------------
function PlasticTypeFormModal({ item, plasticForms, onSave, onClose }) {
  const [formData, setFormData] = useState({
    code: item?.code || '',
    name: item?.name || '',
    category: item?.category || '',
    defaultForm: item?.defaultForm || (plasticForms[0]?.name || ''),
    description: item?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <h3 className="text-sm font-bold text-white">
            {item ? 'Edit Master Jenis Plastik' : 'Tambah Jenis Plastik Baru'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Kode Polimer *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="misal: PP, HDPE, PET"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono uppercase focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Kategori / Grade</label>
              <input
                type="text"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                placeholder="misal: Homopolymer, Rigid"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Nama Lengkap Polimer *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="misal: Polypropylene (PP)"
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Wujud Bahan Default</label>
            <select
              value={formData.defaultForm}
              onChange={e => setFormData({ ...formData, defaultForm: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
            >
              {plasticForms.map(f => (
                <option key={f.id} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Deskripsi & Catatan Spesifikasi</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ciri-ciri fisik, sumber bahan, kegunaan pencampuran..."
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">Batal</button>
            <button type="submit" className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">Simpan Data</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// Sub-Modal 2: Plastic Form Form
// -----------------------------------------------------------------
function PlasticFormModal({ item, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <h3 className="text-sm font-bold text-white">
            {item ? 'Edit Wujud Bahan Baku' : 'Tambah Wujud Bahan Baru'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Nama Wujud Bahan *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="misal: Afalan Karungan, Flakes Gilingan, Reject Pabrik"
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Keterangan / Kondisi Lapak</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Kadar air, perlakuan sortir atau mesin cuci..."
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">Batal</button>
            <button type="submit" className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">Simpan Data</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// Sub-Modal 3: Contact Form (Supplier/Customer)
// -----------------------------------------------------------------
function ContactFormModal({ item, onSave, onClose }) {
  const [formData, setFormData] = useState({
    code: item?.code || '',
    name: item?.name || '',
    type: item?.type || 'supplier',
    phone: item?.phone || '',
    address: item?.address || '',
    pic: item?.pic || '',
    specNotes: item?.specNotes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <h3 className="text-sm font-bold text-white">
            {item ? `Edit Kontak: ${item.name}` : 'Tambah Kontak Baru'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-slate-400 font-medium mb-1">Tipe Kontak *</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              >
                <option value="supplier">Supplier / Lapak</option>
                <option value="customer">Customer / Pabrik</option>
                <option value="both">Keduanya</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-slate-400 font-medium mb-1">Nama Perusahaan / Lapak *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="misal: UD Maju Plastik / PT Injeksi"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">PIC (Penanggung Jawab)</label>
              <input
                type="text"
                value={formData.pic}
                onChange={e => setFormData({ ...formData, pic: e.target.value })}
                placeholder="Nama PIC"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">No. Telepon / WhatsApp</label>
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
            <label className="block text-slate-400 font-medium mb-1">Alamat Gudang / Lapak / Pabrik</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Alamat lengkap lokasi pengiriman atau penjemputan"
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Catatan Spesifikasi & Request Khusus</label>
            <textarea
              rows={2}
              value={formData.specNotes}
              onChange={e => setFormData({ ...formData, specNotes: e.target.value })}
              placeholder="Kebutuhan MFI, mesh saringan, warna, syarat pembayaran, dll."
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

// -----------------------------------------------------------------
// Sub-Modal 4: Cost Component Form
// -----------------------------------------------------------------
function CostComponentFormModal({ item, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || 'electricity',
    ratePerKg: item?.ratePerKg || 0,
    unit: 'Rp/Kg',
    notes: item?.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <h3 className="text-sm font-bold text-white">
            {item ? 'Edit Komponen Biaya' : 'Tambah Komponen Biaya Olah'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Nama Komponen Biaya *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="misal: Listrik Mesin Extruder"
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Kategori Biaya</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              >
                <option value="electricity">Listrik & Energi</option>
                <option value="labor">Tenaga Kerja / Borongan</option>
                <option value="maintenance">Perawatan & Sparepart</option>
                <option value="overhead">Overhead & Utilitas</option>
                <option value="other">Lain-lain</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Tarif (Rp / Kg) *</label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={formData.ratePerKg}
                onChange={e => setFormData({ ...formData, ratePerKg: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-right focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Catatan Keterangan</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Rincian beban atau cara perhitungan..."
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">Batal</button>
            <button type="submit" className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">Simpan Tarif</button>
          </div>
        </form>
      </div>
    </div>
  );
}
