import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchAssets, fetchOverview } from '@/lib/api-client'
import { AnimatedGlassCard } from '@/components/ui/animated-glass-card'
import { EmptyState, PageHeader } from '@/components/ui/feedback'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth-store'
import { motion } from 'framer-motion'
import { Building2, CheckCircle2, ClipboardList, Search, Star } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function AdminDashboard() {
  const token = useAuthStore((s) => s.accessToken)!
  const user = useAuthStore((s) => s.user)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: () => fetchOverview(token),
  })

  const searchQuery = search.trim()
  const { data: assetSearchData, isFetching: isSearching } = useQuery({
    queryKey: ['assets', 'global-search', searchQuery],
    queryFn: () => fetchAssets(token, { search: searchQuery, limit: 12 }),
    enabled: searchQuery.length >= 2,
  })

  const stats = data?.data
  const searchResults = assetSearchData?.data ?? []

  const cards = [
    { label: 'Laporan Terbuka', value: stats?.openReports ?? '—', icon: ClipboardList, color: 'text-blue-500' },
    { label: 'Sedang Dikerjakan', value: stats?.inProgress ?? '—', icon: Building2, color: 'text-orange-500' },
    { label: 'Selesai (30h)', value: stats?.completedLast30Days ?? '—', icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Rata-rata Penilaian', value: stats?.avgRating != null ? stats.avgRating.toFixed(1) : '—', icon: Star, color: 'text-yellow-500' },
  ]

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title={`Selamat datang kembali, ${user?.fullName?.split(' ')[0] ?? 'Admin'}`}
        description="Ringkasan global aktivitas pemeliharaan fasilitas"
      />

      <motion.div 
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {cards.map((stat) => (
          <AnimatedGlassCard key={stat.label} className="p-5 flex items-center justify-between" variants={itemVariants}>
            <div>
              <p className="text-sm text-muted">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold text-gradient">
                {isLoading ? '...' : stat.value}
              </p>
            </div>
            <div className={`p-3 rounded-xl bg-white/40 backdrop-blur-sm ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </AnimatedGlassCard>
        ))}
      </motion.div>

      <AnimatedGlassCard className="space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-medium">Global Search Aset</h2>
            <p className="text-sm text-muted">Cari aset, ruangan, kode barang, nomor register, merk, dan type dari satu kotak pencarian.</p>
          </div>
          <div className="w-full max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari aset: AC, TOA, KMP-001, Ruang Paripurna..."
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {searchQuery.length < 2 ? (
          <p className="text-sm text-muted">Mulai ketik minimal 2 karakter untuk mencari aset.</p>
        ) : isSearching ? (
          <p className="text-sm text-muted">Mencari aset...</p>
        ) : searchResults.length === 0 ? (
          <EmptyState
            title="Tidak ada aset yang cocok"
            description="Coba gunakan kode barang, nama barang, nomor register, merk/type, atau nama ruangan."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {searchResults.map((asset) => (
              <div key={asset.id} className="rounded-2xl border border-white/30 bg-white/50 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{asset.namaBarang}</p>
                    <p className="text-xs text-muted mt-1">{asset.kodeBarang} · {asset.idpemda}</p>
                  </div>
                  <span className="rounded-full bg-[#ef629f]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#ef629f]">
                    {asset.status}
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-sm text-muted">
                  <p><span className="font-medium text-foreground">Merk/Type:</span> {asset.merkType}</p>
                  <p><span className="font-medium text-foreground">Register:</span> {asset.nomorRegister}</p>
                  <p><span className="font-medium text-foreground">Ruangan:</span> {asset.roomCode ?? asset.roomId}{asset.roomName ? ` - ${asset.roomName}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </AnimatedGlassCard>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        {stats?.byStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <AnimatedGlassCard className="h-full flex flex-col">
              <h2 className="text-lg font-medium mb-4">Laporan berdasarkan Status</h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(stats.byStatus).map(([name, value]) => {
                    const statusMap: Record<string, string> = {
                      PENDING: 'menunggu',
                      AI_ANALYSIS: 'analisis ai',
                      REVIEWED: 'ditinjau',
                      ASSIGNED: 'ditugaskan',
                      IN_PROGRESS: 'sedang dikerjakan',
                      COMPLETED: 'selesai',
                      CANCELLED: 'dibatalkan',
                      REJECTED: 'ditolak',
                    };
                    return { name: statusMap[name] ?? name.replace(/_/g, ' ').toLowerCase(), value };
                  })} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: 'rgba(255,255,255,0.4)' }}
                    />
                    <Bar dataKey="value" fill="url(#colorGradient)" radius={[6, 6, 0, 0]} barSize={40} />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF629F" />
                        <stop offset="100%" stopColor="#EECDA3" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </AnimatedGlassCard>
          </motion.div>
        )}

        {stats?.byPriority && Object.keys(stats.byPriority).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <AnimatedGlassCard className="h-full flex flex-col">
              <h2 className="text-lg font-medium mb-4">Laporan berdasarkan Prioritas</h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(stats.byPriority).map(([name, value]) => {
                        const priorityMap: Record<string, string> = {
                          LOW: 'Rendah',
                          MEDIUM: 'Sedang',
                          HIGH: 'Tinggi',
                          CRITICAL: 'Kritis'
                        };
                        return { name: priorityMap[name] ?? name, value, priority: name };
                      })}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {Object.entries(stats.byPriority).map(([key]) => {
                        const priorityColors: Record<string, string> = {
                          CRITICAL: '#EF4444', // Merah
                          HIGH: '#F97316',     // Orange
                          MEDIUM: '#EAB308',   // Kuning
                          LOW: '#22C55E',      // Hijau
                        };
                        const color = priorityColors[key] ?? '#8B5CF6';
                        return <Cell key={`cell-${key}`} fill={color} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
                      })}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </AnimatedGlassCard>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
