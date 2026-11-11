import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Global formatter fallbacks to prevent ReferenceError anywhere in runtime
window.formatNumber = (val, decimals = 1) =>
  Number(val || 0).toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: typeof decimals === 'number' ? decimals : 1,
  });

window.formatCurrency = (val) =>
  'Rp ' + Number(val || 0).toLocaleString('id-ID');

window.formatRupiah = (val) =>
  'Rp ' + Number(val || 0).toLocaleString('id-ID');

window.formatWeight = (val) =>
  Number(val || 0).toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }) + ' Kg';

window.formatPercent = (val) =>
  Number(val || 0).toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }) + '%';

window.formatDate = (val) => {
  if (!val) return '-';
  try {
    const dt = new Date(val);
    return isNaN(dt.getTime())
      ? val
      : dt.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
  } catch {
    return val;
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
