"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  Trophy,
  Medal,
  Award,
  GraduationCap,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { publicApi } from "@/lib/api";
import { Konsultasi, Hasil } from "@/types";

export default function HasilPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [konsultasi, setKonsultasi] = useState<Konsultasi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await publicApi.getConsultationResult(sessionId);
        setKonsultasi(response.data.data);
      } catch (err) {
        setError("Gagal memuat hasil konsultasi");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchResult();
    }
  }, [sessionId]);

  const getRankIcon = (ranking: number) => {
    switch (ranking) {
      case 1:
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 2:
        return <Medal className="h-8 w-8 text-gray-400" />;
      case 3:
        return <Award className="h-8 w-8 text-amber-600" />;
      default:
        return <GraduationCap className="h-8 w-8 text-blue-500" />;
    }
  };

  const getRankBgColor = (ranking: number) => {
    switch (ranking) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  const getCFLabel = (cf: number) => {
    if (cf >= 0.8) return "Sangat Yakin";
    if (cf >= 0.6) return "Yakin";
    if (cf >= 0.4) return "Cukup Yakin";
    if (cf >= 0.3) return "Kurang Yakin";
    return "Tidak Yakin";
  };

  const getCFColor = (cf: number) => {
    if (cf >= 0.8) return "text-green-600 bg-green-100";
    if (cf >= 0.6) return "text-blue-600 bg-blue-100";
    if (cf >= 0.4) return "text-yellow-600 bg-yellow-100";
    return "text-orange-600 bg-orange-100";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat hasil konsultasi...</p>
        </div>
      </div>
    );
  }

  if (error || !konsultasi) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Hasil Tidak Ditemukan
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "Konsultasi tidak ditemukan atau sudah kadaluarsa."}
          </p>
          <Link
            href="/konsultasi"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Mulai Konsultasi Baru
          </Link>
        </div>
      </div>
    );
  }

  const hasil = konsultasi.hasil || [];
  const hasResults = hasil.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Hasil Konsultasi</h1>
          <p className="text-gray-600 mt-2">Session ID: {sessionId}</p>
        </div>

        {hasResults ? (
          <>
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">
                  Analisis Selesai!
                </h3>
                <p className="text-green-700">
                  Berdasarkan jawaban Anda, berikut adalah {hasil.length}{" "}
                  jurusan yang paling sesuai dengan minat dan bakat Anda.
                </p>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {hasil.map((h: Hasil) => (
                <div
                  key={h.jurusan_id}
                  className={`rounded-2xl border-2 p-6 transition-shadow hover:shadow-lg ${getRankBgColor(h.ranking)}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getRankIcon(h.ranking)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {h.jurusan_nama}
                        </h2>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            h.jurusan_kategori === "SAINTEK"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {h.jurusan_kategori}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {h.jurusan_deskripsi}
                      </p>

                      {/* CF Bar */}
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Tingkat Kesesuaian
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getCFColor(h.cf_final)}`}
                            >
                              {getCFLabel(h.cf_final)}
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                              {(h.cf_final * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className={`h-4 rounded-full transition-all duration-500 ${
                              h.cf_final >= 0.8
                                ? "bg-green-500"
                                : h.cf_final >= 0.6
                                  ? "bg-blue-500"
                                  : h.cf_final >= 0.4
                                    ? "bg-yellow-500"
                                    : "bg-orange-500"
                            }`}
                            style={{
                              width: `${h.cf_final * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-center">
                      <span className="block text-4xl font-bold text-gray-400">
                        #{h.ranking}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Info about CF calculation */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                Tentang Tingkat Kesesuaian
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Tingkat kesesuaian dihitung menggunakan metode{" "}
                <strong>Certainty Factor (CF)</strong> yang mengkombinasikan
                jawaban Anda dengan aturan pakar.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="bg-white rounded p-2">
                  <span className="font-medium text-green-600">80-100%:</span>{" "}
                  Sangat Yakin
                </div>
                <div className="bg-white rounded p-2">
                  <span className="font-medium text-blue-600">60-79%:</span>{" "}
                  Yakin
                </div>
                <div className="bg-white rounded p-2">
                  <span className="font-medium text-yellow-600">40-59%:</span>{" "}
                  Cukup Yakin
                </div>
                <div className="bg-white rounded p-2">
                  <span className="font-medium text-orange-600">30-39%:</span>{" "}
                  Kurang Yakin
                </div>
              </div>
            </div>
          </>
        ) : (
          /* No Results */
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Tidak Ditemukan Jurusan yang Sesuai
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Berdasarkan jawaban Anda, tidak ada jurusan yang memiliki tingkat
              kesesuaian minimal 30%. Silakan ulangi konsultasi dengan jawaban
              yang lebih sesuai dengan kondisi Anda.
            </p>
            <Link
              href="/konsultasi"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Ulangi Konsultasi
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Link>
          <Link
            href="/konsultasi"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Konsultasi Lagi
          </Link>
        </div>
      </div>
    </div>
  );
}
