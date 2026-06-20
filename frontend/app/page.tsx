"use client";

import Link from "next/link";
import {
  GraduationCap,
  Brain,
  Target,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Forward Chaining",
    desc: "Metode inferensi berbasis data yang menganalisis jawaban Anda untuk menghasilkan rekomendasi jurusan yang tepat.",
    accent: "bg-blue-100 text-blue-600",
  },
  {
    icon: Target,
    title: "Certainty Factor",
    desc: "Menghitung tingkat kepastian setiap rekomendasi dengan mempertimbangkan kekuatan jawaban dan aturan yang diterapkan.",
    accent: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: GraduationCap,
    title: "15 Jurusan Populer",
    desc: "Mencakup jurusan-jurusan populer dari kelompok SAINTEK dan SOSHUM yang paling diminati di Indonesia.",
    accent: "bg-indigo-100 text-indigo-600",
  },
];

const steps = [
  {
    step: 1,
    title: "Jawab Pertanyaan",
    desc: "Jawab 20 pertanyaan seputar minat dan bakat Anda",
  },
  {
    step: 2,
    title: "Analisis Sistem",
    desc: "Sistem menganalisis jawaban menggunakan Forward Chaining",
  },
  {
    step: 3,
    title: "Hitung Kepastian",
    desc: "Certainty Factor menghitung tingkat kesesuaian",
  },
  {
    step: 4,
    title: "Lihat Hasil",
    desc: "Dapatkan rekomendasi Top 3 jurusan terbaik untuk Anda",
  },
];

const stats = [
  { value: "15+", label: "Jurusan" },
  { value: "20", label: "Pertanyaan" },
  { value: "Top 3", label: "Rekomendasi" },
  { value: "100%", label: "Gratis" },
];

const jurusanList: { nama: string; kategori: "SAINTEK" | "SOSHUM" }[] = [
  { nama: "Teknik Informatika", kategori: "SAINTEK" },
  { nama: "Kedokteran", kategori: "SAINTEK" },
  { nama: "Hukum", kategori: "SOSHUM" },
  { nama: "Manajemen", kategori: "SOSHUM" },
  { nama: "Akuntansi", kategori: "SOSHUM" },
  { nama: "Psikologi", kategori: "SOSHUM" },
  { nama: "Teknik Sipil", kategori: "SAINTEK" },
  { nama: "Biologi", kategori: "SAINTEK" },
  { nama: "Ekonomi", kategori: "SOSHUM" },
  { nama: "Desain Grafis", kategori: "SOSHUM" },
  { nama: "Teknik Elektro", kategori: "SAINTEK" },
  { nama: "Fisika", kategori: "SAINTEK" },
  { nama: "Pendidikan", kategori: "SOSHUM" },
  { nama: "Sastra Inggris", kategori: "SOSHUM" },
  { nama: "Komunikasi", kategori: "SOSHUM" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-xl font-semibold text-gray-900 tracking-tight">
                SiPakar Jurusan
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/konsultasi"
                className="hidden sm:inline-flex text-sm text-gray-700 font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Mulai Konsultasi
              </Link>
              <Link
                href="/admin/login"
                className="text-sm px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-6">
              <Sparkles className="h-4 w-4" />
              Forward Chaining &amp; Certainty Factor
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-5 text-balance">
              Temukan Jurusan Kuliah
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}
                Terbaik Untukmu
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mb-8 leading-relaxed">
              Sistem pakar yang membantu Anda menemukan jurusan yang paling
              sesuai dengan minat dan bakat — cepat, akurat, dan mudah
              digunakan.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/konsultasi"
                className="inline-flex items-center px-6 py-3.5 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition transform hover:-translate-y-0.5 shadow-lg shadow-blue-600/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Mulai Konsultasi
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>

              <Link
                href="#how"
                className="inline-flex items-center px-5 py-3.5 bg-white text-gray-800 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label="Lompat ke bagian cara kerja"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Tanpa registrasi
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Hasil instan
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                100% gratis
              </span>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            {/* Atmospheric blobs */}
            <div
              aria-hidden="true"
              className="absolute -top-8 -right-4 h-56 w-56 rounded-full bg-blue-300/30 blur-3xl animate-blob-drift"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-indigo-300/30 blur-3xl animate-blob-drift [animation-delay:6s]"
            />
            <div className="relative animate-float">
              <svg
                viewBox="0 0 600 400"
                className="w-full max-w-md drop-shadow-xl"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Ilustrasi sistem rekomendasi jurusan"
              >
                <rect
                  x="20"
                  y="40"
                  width="260"
                  height="160"
                  rx="14"
                  fill="#EFF6FF"
                />
                <rect
                  x="320"
                  y="100"
                  width="260"
                  height="160"
                  rx="14"
                  fill="#EEF2FF"
                />
                <circle cx="180" cy="120" r="28" fill="#0369A1" />
                <circle cx="420" cy="180" r="22" fill="#7C3AED" />
                <path
                  d="M100 220c40-30 120-30 160 0"
                  stroke="#60A5FA"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-100 bg-white/80 px-6 py-6 text-center shadow-sm"
            >
              <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="mt-1 text-sm font-medium text-gray-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map(({ icon: Icon, title, desc, accent }) => (
            <div
              key={title}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
            >
              <div
                className={`w-14 h-14 ${accent} rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}
              >
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
              <p className="text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <section
          id="how"
          className="scroll-mt-24 bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Bagaimana Cara Kerjanya?
            </h2>
            <p className="mt-2 text-gray-500">
              Empat langkah sederhana menuju jurusan impianmu
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 md:gap-6">
            {steps.map((item, index) => (
              <div key={item.step} className="relative text-center">
                {index < steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent"
                  />
                )}
                <div className="relative z-10 w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-md shadow-blue-600/25">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Jurusan List */}
        <section className="mt-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Jurusan yang Tersedia
            </h2>
            <p className="mt-2 text-gray-500">
              Dari kelompok SAINTEK hingga SOSHUM
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {jurusanList.map(({ nama, kategori }) => (
              <div
                key={nama}
                className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all border border-gray-100"
              >
                <span
                  className={`inline-block mb-2 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                    kategori === "SAINTEK"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {kategori}
                </span>
                <p className="text-sm font-medium text-gray-900">{nama}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-24">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 md:p-14 text-center text-white shadow-xl shadow-blue-600/20">
            <div
              aria-hidden="true"
              className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/10 blur-2xl"
            />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Siap Memulai?
              </h2>
              <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Temukan jurusan yang paling sesuai dengan minat dan bakat Anda
                hari ini!
              </p>
              <Link
                href="/konsultasi"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 hover:-translate-y-0.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
              >
                Mulai Konsultasi Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center space-x-2 text-gray-700">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="font-semibold">SiPakar Jurusan</span>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} SiPakar Jurusan &mdash; Sistem
              Pakar Bimbingan Jurusan Kuliah.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
