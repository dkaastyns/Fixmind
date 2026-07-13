/* eslint-disable react-hooks/set-state-in-effect */
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  isLoading?: boolean
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading,
}: DeleteConfirmationModalProps) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 text-center shadow-2xl border border-slate-100 z-10"
          >
            <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mb-1 text-base font-bold text-slate-800">{title}</h3>
            <p className="mb-5 text-xs text-slate-500 font-medium leading-relaxed">{description}</p>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 bg-rose-600 hover:bg-rose-700"
              >
                {isLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
