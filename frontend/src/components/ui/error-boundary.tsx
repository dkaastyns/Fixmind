import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertCircle, RefreshCcw, WifiOff, Home } from 'lucide-react'
import { Button } from './button'
import { GlassCard } from './glass-card'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in boundary:', error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      const isOffline = !navigator.onLine
      const errorMessage = this.state.error?.message || 'Terjadi kesalahan sistem yang tidak terduga.'

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <GlassCard className="w-full max-w-lg p-8 border border-white/60 bg-white/70 shadow-xl space-y-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-inner">
              {isOffline ? <WifiOff className="h-7 w-7 animate-pulse" /> : <AlertCircle className="h-7 w-7" />}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800">
                {isOffline ? 'Koneksi Terputus' : 'Aplikasi Mengalami Kendala'}
              </h3>
              <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
                Halaman ini gagal dimuat karena kesalahan berikut:
              </p>
              <div className="mt-2 bg-rose-50/50 border border-rose-100/60 rounded-xl p-3 text-left">
                <code className="text-xs text-rose-600 font-mono break-all font-semibold">
                  {errorMessage}
                </code>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3 text-left">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Saran Pemecahan Masalah:
              </h4>
              <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1.5 font-medium">
                {isOffline ? (
                  <>
                    <li>Pastikan kabel LAN terhubung atau Wi-Fi/paket data seluler Anda aktif.</li>
                    <li>Cobalah untuk membuka situs web lain untuk memverifikasi koneksi internet Anda.</li>
                    <li>Gunakan menu offline dasbor untuk melihat data lokal Anda.</li>
                  </>
                ) : (
                  <>
                    <li>Klik tombol <strong>Coba Lagi</strong> di bawah untuk memuat ulang komponen ini.</li>
                    <li>Muat ulang (Refresh) browser Anda sepenuhnya dengan menekan tombol F5 atau Ctrl+R.</li>
                    <li>Jika masalah berlanjut, hubungi administrator atau tim dukungan teknis.</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={this.handleRetry}
                className="flex-1 rounded-xl bg-[#ef629f] hover:bg-[#d8528b] text-white font-semibold flex items-center justify-center gap-1.5"
              >
                <RefreshCcw className="h-4 w-4" />
                Coba Lagi
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 rounded-xl font-semibold flex items-center justify-center gap-1.5"
              >
                <Home className="h-4 w-4" />
                Kembali ke Dasbor
              </Button>
            </div>
          </GlassCard>
        </div>
      )
    }

    return this.props.children
  }
}
