export function formatNumber(value, decimals = 1) {
  if (value === null || value === undefined || value === '' || isNaN(Number(value))) return '0';
  const num = Number(value);
  const dec = typeof decimals === 'number' ? decimals : 1;
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: dec,
  }).format(num);
}

export function formatRupiah(value) {
  if (value === null || value === undefined || value === '' || isNaN(Number(value))) return 'Rp 0';
  const num = Number(value);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
}

export const formatCurrency = formatRupiah;
export const formatRp = formatRupiah;

export function formatWeight(value) {
  return `${formatNumber(value, 1)} Kg`;
}

export function formatPercent(value) {
  return `${formatNumber(value, 2)}%`;
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateString);
  }
}

export function getStatusBadge(status) {
  switch (status) {
    case 'Siap Giling':
    case 'Siap Blending':
    case 'Selesai':
    case 'Lunas':
    case 'Lulus QC':
    case 'Siap Kirim':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold';
    case 'Sedang Cuci/Giling':
    case 'Dalam Proses Ekstrusi':
    case 'Dalam Proses':
    case 'DP':
    case 'Flakes Menipis':
    case 'Stok Kritis':
      return 'bg-violet-50 text-violet-700 border border-violet-200 font-semibold';
    case 'Hold':
    case 'Karantina':
      return 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold';
    case 'Belum Sortir':
    case 'Belum Bayar':
    case 'Belum Lunas':
    case 'Reject QC':
    case 'Habis Terolah':
    case 'Habis Terjual':
      return 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200 font-semibold';
  }
}
