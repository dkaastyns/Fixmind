import { HelpCircle } from 'lucide-react'

export function HelpTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-block ml-1.5 cursor-help text-slate-400 hover:text-slate-600 transition-colors">
      <HelpCircle className="h-3.5 w-3.5" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-950/95 text-white text-[10px] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg z-50 font-normal normal-case leading-normal backdrop-blur-sm border border-white/10">
        {text}
      </span>
    </span>
  )
}
