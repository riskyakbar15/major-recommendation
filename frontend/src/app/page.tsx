"use client";

import Link from "next/link";
import {
  GraduationCap,
  Brain,
  Target,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                SiPakar Jurusan
              </span>
            </div>
            <Link
              href="/admin/login"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Temukan Jurusan Kuliah
            <span className="text-blue-600"> Terbaik Untukmu</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Sistem pakar berbasis AI yang membantu Anda menemukan jurusan kuliah
            yang paling sesuai dengan minat dan bakat menggunakan metode Forward
            Chaining dan Certainty Factor.
          </p>
          <Link
            href="/konsultasi"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Mulai Konsultasi
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
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
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
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
              "Ilmu Komunikasi",
              "Farmasi",
              "Arsitektur",
              "Teknik Elektro",
              "Pendidikan Guru SD",
              "Ekonomi Pembangunan",
              "Desain Komunikasi Visual",
              "Hubungan Internasional",
            ].map((jurusan) => (
              <div
                key={jurusan}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{jurusan}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Siap Menemukan Jurusan Impianmu?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Konsultasi gratis dan tanpa perlu mendaftar. Cukup jawab beberapa
              pertanyaan dan dapatkan rekomendasi jurusan terbaik.
            </p>
            <Link
              href="/konsultasi"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              Mulai Konsultasi Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>
            &copy; 2026 Sistem Pakar Bimbingan Jurusan Kuliah. All rights
            reserved.
          </p>
          <p className="text-sm mt-2">
            Dibuat dengan metode Forward Chaining dan Certainty Factor
          </p>
        </div>
      </footer>
    </div>
  );
}
