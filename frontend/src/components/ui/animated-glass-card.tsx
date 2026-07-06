import { cn } from '@/lib/utils'
import { motion, type HTMLMotionProps } from 'framer-motion'

export function AnimatedGlassCard({
  className,
  children,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div 
      className={cn('glass glass-hover p-6', className)}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
