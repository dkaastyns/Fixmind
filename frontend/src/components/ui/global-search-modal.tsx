import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Search, X, ClipboardPlus, ArrowRightLeft, Loader2, Building2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchAssets } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { StatusBadge } from '@/components/ui/feedback'
import { Button } from '@/components/ui/button'

export function GlobalSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const token = useAuthStore((s) => s.accessToken)!
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const searchQuery = search.trim()

  const { data: assetSearchData, isLoading } = useQuery({
    queryKey: ['assets', 'global-search', searchQuery],
    queryFn: () => fetchAssets(token, { search: searchQuery, limit: 10 }),
    enabled: searchQuery.length >= 2,
  })

  useEffect(() => {
    if (isOpen) {
      setSearch('')
      // Small timeout to ensure the input is rendered before focusing
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const searchResults = assetSearchData?.data ?? []

  const handleReport = (roomId: string, assetId: string) => {
    onClose()
    navigate(`/dashboard/reports?openForm=true&roomId=${roomId}&assetId=${assetId}`)
  }

  const handleTransfer = (roomId: string, assetId: string) => {
    onClose()
    navigate(`/dashboard/asset-transfers?roomId=${roomId}&assetId=${assetId}`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[10vh]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/35 backdrop-blur-[4px]"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl border border-white/60 p-6 shadow-2xl flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-[#ef629f]" />
            <h3 className="text-lg font-semibold text-gray-900">Pencarian Aset Global</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input */}
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            ref={inputRef}
            type="text"
            className="flex h-11 w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 text-sm focus:border-[#ef629f] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10 transition-all text-slate-900 placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari AC, kursi, kode barang, register, merk, ruangan..."
          />
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto min-h-[200px] space-y-3 pr-1">
          {searchQuery.length < 2 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted">
              <Search className="h-8 w-8 mb-2 opacity-40 text-[#ef629f]" />
              <p className="text-sm font-medium">Mulai ketik minimal 2 karakter</p>
              <p className="text-xs mt-1">Cari berdasarkan kode, nama barang, merk, atau ruangan.</p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted">
              <Loader2 className="h-8 w-8 animate-spin mb-2 text-[#ef629f]/60" />
              <p className="text-sm font-medium">Mencari aset...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted">
              <X className="h-8 w-8 mb-2 opacity-40 text-danger" />
              <p className="text-sm font-medium">Tidak ada aset ditemukan</p>
              <p className="text-xs mt-1">Coba kata kunci lain atau periksa ejaan Anda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((asset) => (
                <div
                  key={asset.id}
                  className="rounded-2xl border border-white/50 bg-white/60 p-4 shadow-sm hover:bg-white/80 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-800 truncate">
                        {asset.namaBarang}
                      </p>
                      <StatusBadge status={asset.status} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted">
                      <p><span className="font-medium text-slate-600">Kode:</span> {asset.kodeBarang} · {asset.idpemda}</p>
                      <p><span className="font-medium text-slate-600">Merk:</span> {asset.merkType}</p>
                      <p><span className="font-medium text-slate-600">No Register:</span> {asset.nomorRegister}</p>
                      <p className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 inline text-[#ef629f]" />
                        <span className="font-medium text-slate-600">Ruang:</span> {asset.roomCode ?? asset.roomId}{asset.roomName ? ` - ${asset.roomName}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-9 gap-1 rounded-xl text-xs"
                      onClick={() => handleReport(asset.roomId, asset.id)}
                    >
                      <ClipboardPlus className="h-3.5 w-3.5" />
                      Lapor
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 gap-1 rounded-xl text-xs bg-[#ef629f] text-white hover:bg-[#ef629f]/90"
                      onClick={() => handleTransfer(asset.roomId, asset.id)}
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      Pindah
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
