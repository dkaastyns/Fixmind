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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 py-12 px-4">
      {/* Background Image with slow zoom animation */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 3, ease: 'easeOut' }}
        className="absolute inset-0 z-0"
      >
        <img
          src="/new-bg_dprd.jpg"
          alt="Latar Belakang DPRD"
          className="h-full w-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />
        
        {/* AI Glowing Orbs */}
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }} 
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#F9D141]/10 rounded-full filter blur-[120px] pointer-events-none" 
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, -40, 0] }} 
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full filter blur-[100px] pointer-events-none" 
        />
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }} 
          transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
          className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-[#ffd043]/5 rounded-full filter blur-[120px] pointer-events-none" 
        />

        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/90" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl">
        <header className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center justify-center">
            <Link to="/" className="max-w-[240px] sm:max-w-[280px]">
              <img src="/jdih-logo.png" alt="JDIH Kota Semarang" className="w-full h-auto object-contain [filter:drop-shadow(0_0_8px_rgba(255,255,255,0.8))]" />
            </Link>
          </div>
          <Link to="/signup">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Button variant="ghost" size="sm" className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Kembali
              </Button>
            </motion.div>
          </Link>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-dark p-8 md:p-12 shadow-2xl border-white/10 bg-slate-950/45 backdrop-blur-xl rounded-3xl">
            <div className="mb-10 text-center">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-gold shadow-md">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                Ketentuan Layanan
              </h1>
              <p className="mt-2 text-sm text-slate-400 font-medium">
                Terakhir Diperbarui: Juli 2026
              </p>
              <div className="mx-auto mt-4 h-1 w-20 rounded-full gradient-gold" />
            </div>

            <div className="space-y-8">
              {sections.map((section, idx) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ delay: idx * 0.1, duration: 0.5, type: "spring", stiffness: 100 }}
                  whileHover={{ x: 6, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                  className="group flex gap-4 rounded-2xl p-4 transition-colors cursor-pointer"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ffd043]/10 text-[#ffd043] group-hover:bg-[#ffd043] group-hover:text-slate-950 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <section.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 mb-2">
                      {section.title}
                    </h2>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 border-t border-white/10 pt-8 text-center">
              <p className="text-sm text-slate-400 mb-6 font-medium">
                Dengan mencentang persetujuan saat mendaftar, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan di atas.
              </p>
              <Link to="/signup">
                <motion.button 
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 h-11 text-base font-bold text-white gradient-gold shadow-[0_4px_15px_rgba(228,181,43,0.3)] hover:opacity-95 transition-all duration-300 rounded-xl cursor-pointer"
                >
                  Saya Setuju & Daftar Sekarang
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        <footer className="mt-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} FixMind. Hak Cipta Dilindungi Undang-Undang.
        </footer>
      </div>
    </div>
  )
}
