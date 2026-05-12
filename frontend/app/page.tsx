"use client";

import Link from "next/link";
import { GraduationCap, Brain, Target, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-xl font-semibold text-gray-900 tracking-tight">
                SiPakar Jurusan
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/konsultasi"
                className="text-sm text-blue-600 font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
              >
                Mulai Konsultasi
              </Link>
              <Link
                href="/admin/login"
                className="text-sm px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Temukan Jurusan Kuliah
              <span className="text-blue-600"> Terbaik Untukmu</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mb-6">
              Sistem pakar yang membantu Anda menemukan jurusan yang paling
              sesuai dengan minat dan bakat menggunakan Forward Chaining dan
              Certainty Factor — cepat, akurat, dan mudah digunakan.
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="/konsultasi"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition transform hover:-translate-y-0.5 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Mulai Konsultasi
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>

              <Link
                href="#how"
                className="inline-flex items-center px-5 py-3 bg-white text-gray-800 border border-gray-200 rounded-xl hover:shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label="Lompat ke bagian cara kerja"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <svg
              viewBox="0 0 600 400"
              className="w-full max-w-md"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
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

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <Brain className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Forward Chaining
            </h3>
            <p className="text-gray-600">
              Menggunakan metode inferensi berbasis data yang menganalisis
              jawaban Anda untuk menghasilkan rekomendasi jurusan yang tepat.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <Target className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Certainty Factor
            </h3>
            <p className="text-gray-600">
              Menghitung tingkat kepastian setiap rekomendasi dengan
              mempertimbangkan kekuatan jawaban dan aturan yang diterapkan.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <GraduationCap className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              15 Jurusan Populer
            </h3>
            <p className="text-gray-600">
              Mencakup jurusan-jurusan populer dari kelompok SAINTEK dan SOSHUM
              yang paling diminati di Indonesia.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div
          id="how"
          className="scroll-mt-24 bg-white rounded-2xl p-8 md:p-12 shadow-lg"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            Bagaimana Cara Kerjanya?
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
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
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Jurusan List */}
        <div className="mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            Jurusan yang Tersedia
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              "Teknik Informatika",
              "Kedokteran",
              "Hukum",
              "Manajemen",
              "Akuntansi",
              "Psikologi",
              "Teknik Sipil",
              "Biologi",
              "Ekonomi",
              "Desain Grafis",
              "Teknik Elektro",
              "Fisika",
              "Pendidikan",
              "Sastra Inggris",
              "Komunikasi",
            ].map((jurusan) => (
              <div
                key={jurusan}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <p className="text-sm font-medium text-gray-900">{jurusan}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Siap Memulai?</h2>
            <p className="text-xl opacity-90 mb-8">
              Temukan jurusan yang paling sesuai dengan minat dan bakat Anda
              hari ini!
            </p>
            <Link
              href="/konsultasi"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Mulai Konsultasi Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
