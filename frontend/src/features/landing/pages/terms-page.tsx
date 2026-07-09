import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  FileText,
  ShieldAlert,
  Server,
  UserCheck,
  Building,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'

const sections = [
  {
    icon: BookOpen,
    title: '1. Pendahuluan',
    content: 'Selamat datang di FixMind. Dengan mengakses dan menggunakan platform kami, Anda setuju untuk mematuhi dan terikat oleh Ketentuan Layanan ini. Aplikasi ini dibuat khusus untuk mempermudah pelaporan, pemantauan, dan pemeliharaan sarana dan prasarana di lingkungan Dewan Perwakilan Rakyat Daerah (DPRD) Kota Semarang.',
  },
  {
    icon: Server,
    title: '2. Layanan yang Tersedia',
    content: 'FixMind menyediakan beberapa layanan utama bagi seluruh pegawai dan pengelola fasilitas, termasuk:\n• Sistem Pelaporan Cerdas: Pengguna dapat mengunggah foto, deskripsi, lokasi ruangan, dan kategori kerusakan fasilitas.\n• Integrasi AI: Asisten cerdas kami membantu menganalisis laporan, mengelompokkan kategori, serta merekomendasikan tingkat prioritas perbaikan.\n• Pemantauan Real-time: Dashboard interaktif yang menunjukkan status perbaikan dari pengajuan baru, proses pengerjaan, hingga selesai.\n• Layanan Notifikasi: Pembaruan status laporan langsung yang dikirimkan ke pihak terkait secara instan.',
  },
  {
    icon: ShieldAlert,
    title: '3. Kebijakan & Kerahasiaan',
    content: 'Kami berkomitmen untuk melindungi informasi Anda:\n• Pengumpulan Data: Kami hanya mengumpulkan data yang diperlukan untuk identifikasi laporan seperti Nama, Email, Nomor Telepon, dan Kredensial Akun.\n• Penggunaan Data: Data laporan digunakan sepenuhnya untuk tujuan koordinasi perbaikan fasilitas.\n• Privasi: FixMind menjamin kerahasiaan identitas pelapor dalam pelaporan isu internal tertentu demi menjaga kenyamanan bekerja.',
  },
  {
    icon: UserCheck,
    title: '4. Kewajiban Pengguna',
    content: 'Sebagai pengguna terdaftar, Anda berkewajiban untuk:\n• Memberikan informasi laporan yang akurat, jujur, dan dapat dipertanggungjawabkan.\n• Tidak mengirimkan laporan palsu, spam, atau informasi yang mengandung unsur SARA dan pornografi.\n• Menjaga keamanan kata sandi akun Anda dan segera melaporkan jika mendeteksi penggunaan akun tanpa izin.',
  },
  {
    icon: Building,
    title: '5. Batasan Tanggung Jawab',
    content: 'Layanan FixMind disediakan "sebagaimana adanya". Pengelola platform berusaha sebaik mungkin untuk meminimalkan waktu henti (downtime) dan memperbaiki kendala teknis dengan cepat, namun tidak bertanggung jawab atas kerugian tidak langsung yang disebabkan oleh gangguan teknis sistem di luar kendali.',
  },
]

export function TermsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white py-12 px-4">
      {/* Background Image with slow zoom animation */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 3, ease: 'easeOut' }}
        className="absolute inset-0 z-0"
      >
        <img
          src="/bg-dprd.jpg"
          alt="Latar Belakang DPRD"
          className="h-full w-full object-cover"
        />
        {/* Light overlay */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[6px]" />
        
        {/* AI Glowing Orbs */}
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }} 
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#ef629f]/20 rounded-full mix-blend-multiply filter blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, -40, 0] }} 
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px]" 
        />
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }} 
          transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
          className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-purple-400/15 rounded-full mix-blend-multiply filter blur-[120px]" 
        />

        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/95" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-white shadow-sm p-1 border border-white/60">
              <img src="/logo.png" alt="Logo Semarang" className="h-full w-full object-contain" />
            </Link>
            <span className="text-lg font-bold text-slate-800">FixMind</span>
          </div>
          <Link to="/signup">
            <Button variant="ghost" size="sm" className="gap-2 bg-white/60 hover:bg-white text-slate-700 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Kembali
            </Button>
          </Link>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-8 md:p-12 shadow-2xl border-white/80 bg-white/85 backdrop-blur-xl rounded-3xl">
            <div className="mb-10 text-center">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-[#ef629f] to-[#eecda3] shadow-md">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                Ketentuan Layanan
              </h1>
              <p className="mt-2 text-sm text-slate-500 font-medium">
                Terakhir Diperbarui: Juli 2026
              </p>
              <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-[#ef629f] to-[#eecda3]" />
            </div>

            <div className="space-y-8">
              {sections.map((section, idx) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                  className="group flex gap-4 rounded-2xl p-4 transition-colors hover:bg-slate-500/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ef629f]/10 text-[#ef629f] group-hover:bg-[#ef629f] group-hover:text-white transition-colors duration-300">
                    <section.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-2">
                      {section.title}
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 border-t border-slate-200/50 pt-8 text-center">
              <p className="text-sm text-slate-500 mb-6 font-medium">
                Dengan mencentang persetujuan saat mendaftar, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan di atas.
              </p>
              <Link to="/signup">
                <Button className="px-8 h-11 text-base shadow-[0_0_20px_rgba(239,98,159,0.3)] hover:shadow-[0_0_30px_rgba(239,98,159,0.5)] hover:-translate-y-0.5 transition-all duration-300">
                  Saya Setuju & Daftar Sekarang
                </Button>
              </Link>
            </div>
          </GlassCard>
        </motion.div>

        <footer className="mt-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} FixMind. Hak Cipta Dilindungi Undang-Undang.
        </footer>
      </div>
    </div>
  )
}
