export function formatRupiah(value) {
  if (value === null || value === undefined || isNaN(value)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatWeight(value) {
  return `${formatNumber(value, 2)} Kg`;
}

export function formatPercent(value) {
  return `${formatNumber(value, 2)}%`;
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function getStatusBadge(status) {
  switch (status) {
    case 'Siap Blending':
    case 'Selesai':
    case 'Lunas':
      return 'bg-emerald-950/80 text-emerald-400 border border-emerald-800';
    case 'Proses Cuci/Giling':
    case 'Dalam Proses':
    case 'DP':
      return 'bg-amber-950/80 text-amber-300 border border-amber-800';
    case 'Belum Sortir':
    case 'Belum Lunas':
      return 'bg-rose-950/80 text-rose-300 border border-rose-800';
    default:
      return 'bg-slate-800 text-slate-300 border border-slate-700';
  }
}
