import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react'

interface LightboxImage {
  id: string
  url: string
  label?: string
}

interface ImageLightboxProps {
  images: LightboxImage[]
  initialIndex?: number
  onClose: () => void
}

export function ImageLightbox({ images, initialIndex = 0, onClose }: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)

  const current = images[index]

  const prev = useCallback(() => {
    setZoom(1)
    setIndex((i) => (i - 1 + images.length) % images.length)
  }, [images.length])

  const next = useCallback(() => {
    setZoom(1)
    setIndex((i) => (i + 1) % images.length)
  }, [images.length])

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.5, 4)), [])
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.5, 1)), [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === '+') zoomIn()
      if (e.key === '-') zoomOut()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next, onClose, zoomIn, zoomOut])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: 'rgba(5, 5, 15, 0.96)', backdropFilter: 'blur(20px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-white/90 font-medium text-sm">
              {index + 1} / {images.length}
            </span>
            {current.label && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 uppercase tracking-wider">
                {current.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              disabled={zoom <= 1}
              className="rounded-xl bg-white/10 p-2 text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
              title="Perkecil"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-white/60 text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={zoomIn}
              disabled={zoom >= 4}
              className="rounded-xl bg-white/10 p-2 text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
              title="Perbesar"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <a
              href={current.url}
              download
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
              title="Unduh"
            >
              <Download className="h-4 w-4" />
            </a>
            <button
              onClick={onClose}
              className="ml-2 rounded-xl bg-white/10 p-2 text-white hover:bg-red-500/60 transition-colors"
              title="Tutup (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main Image Area */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden px-20">
          {images.length > 1 && (
            <button
              onClick={prev}
              className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white shadow-lg hover:bg-white/25 active:scale-95 transition-all"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              className="flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.92, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.92, x: -40 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <motion.img
                src={current.url}
                alt={current.label ?? 'Foto bukti'}
                animate={{ scale: zoom }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onDoubleClick={() => (zoom > 1 ? setZoom(1) : zoomIn())}
                style={{
                  maxHeight: 'calc(100vh - 240px)',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  borderRadius: '16px',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                  cursor: zoom > 1 ? 'zoom-out' : 'zoom-in',
                  userSelect: 'none',
                }}
              />
            </motion.div>
          </AnimatePresence>

          {images.length > 1 && (
            <button
              onClick={next}
              className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white shadow-lg hover:bg-white/25 active:scale-95 transition-all"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-3 px-6 py-4 shrink-0">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => {
                  setIndex(i)
                  setZoom(1)
                }}
                style={{ width: 56, height: 56 }}
                className={`overflow-hidden rounded-xl border-2 transition-all ${
                  i === index
                    ? 'border-[#F9D141] opacity-100 scale-110 shadow-[0_0_14px_rgba(249,209,65,0.6)]'
                    : 'border-white/20 opacity-50 hover:opacity-80 hover:scale-105'
                }`}
              >
                <img src={img.url} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <p className="pb-4 text-center text-xs text-white/30">
          Klik dua kali untuk zoom &middot; Tekan panah kiri/kanan untuk navigasi &middot; Esc untuk menutup
        </p>
      </motion.div>
    </AnimatePresence>
  )
}
