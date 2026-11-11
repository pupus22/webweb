import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    localStorage.removeItem('POLYCOMP_ERP_DATABASE_V2');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800/80 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-2 rounded-lg bg-rose-950 border border-rose-800">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Terjadi Kendala Tampilan (Crash Guard)</h2>
                <p className="text-xs text-rose-300">Aplikasi dicegah dari layar putih oleh ErrorBoundary.</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs font-mono text-rose-300 overflow-x-auto max-h-40">
              {this.state.error?.toString() || 'Unknown runtime error'}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
              >
                Muat Ulang Halaman
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Database & Muat Ulang</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
