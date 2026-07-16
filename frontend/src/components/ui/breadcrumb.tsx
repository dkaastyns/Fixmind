import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  to?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-4 bg-white/40 border border-white/50 backdrop-blur-sm px-3.5 py-2 rounded-xl w-fit shadow-sm">
      <Link to="/dashboard" className="hover:text-[#d9a416] transition-colors flex items-center gap-1">
        <Home className="h-3.5 w-3.5" />
        <span>Dasbor</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3 text-slate-300" />
          {item.to ? (
            <Link to={item.to} className="hover:text-[#d9a416] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-600 font-bold">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
