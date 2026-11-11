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
      return 'bg-emerald-950/90 text-emerald-400 border border-emerald-800';
    case 'Sedang Cuci/Giling':
    case 'Dalam Proses Ekstrusi':
    case 'Dalam Proses':
    case 'DP':
    case 'Hold':
      return 'bg-amber-950/90 text-amber-300 border border-amber-800';
    case 'Belum Sortir':
    case 'Belum Bayar':
    case 'Belum Lunas':
    case 'Reject QC':
      return 'bg-rose-950/90 text-rose-300 border border-rose-800';
    default:
      return 'bg-slate-800 text-slate-300 border border-slate-700';
  }
}
