import { motion } from 'framer-motion'
import React from 'react'

export function PageTransitionSkeleton() {
  return (
    <div className="w-full h-full p-6 space-y-6">
      {/* Sleek Top Progress Loading Bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#ef629f] via-pink-400 to-[#ff9ebb] animate-pulse z-[200]" />
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-gray-200/60 dark:bg-gray-700/60 rounded-md animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>

      {/* Content Area Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-gray-200/50 dark:bg-gray-700/30 rounded-xl animate-pulse"
          />
        ))}
      </div>

      <div className="h-64 bg-gray-200/50 dark:bg-gray-700/30 rounded-xl animate-pulse w-full mt-6" />
    </div>
  )
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  )
}
