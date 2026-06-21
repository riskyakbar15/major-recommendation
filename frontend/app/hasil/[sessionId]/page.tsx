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
  Sparkles,
} from "lucide-react";
import { publicApi } from "@/lib/api";
import { Konsultasi } from "@/types";

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
      } catch {
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
        <div className="mb-8 animate-fade-up">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-4 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 mb-3">
            <Sparkles className="h-4 w-4" />
            Rekomendasi Jurusan
          </div>
          <h1 className="text-3xl font-bold text-gray-900 text-balance">
            Hasil Konsultasi
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-mono">
            Session ID: {sessionId}
          </p>
        </div>

        {hasResults ? (
          <>
            {/* Success Message */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8 flex items-start animate-fade-up">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-green-900">
                  Analisis Selesai!
                </h2>
                <p className="text-green-700">
                  Berdasarkan jawaban Anda, berikut adalah {hasil.length}{" "}
                  jurusan yang paling sesuai dengan minat dan bakat Anda.
                </p>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4 mb-8 stagger">
              {hasil
                .sort((a, b) => a.ranking - b.ranking)
                .map((h) => (
                  <div
                    key={h.id}
                    className={`rounded-2xl border-2 p-6 shadow-sm transition-transform hover:-translate-y-0.5 animate-fade-up ${getRankBgColor(h.ranking)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-white/70 shadow-inner">
                          {getRankIcon(h.ranking)}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {h.ranking}. {h.jurusan_nama}
                            </h3>
                            <span
                              className={`text-xs font-semibold px-3 py-1 rounded-full ${getCFColor(h.cf_final)}`}
                            >
                              {getCFLabel(h.cf_final)}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4">
                            {h.jurusan_deskripsi}
                          </p>

                          {/* Confidence bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-500">
                                Tingkat Kepastian
                              </span>
                              <span className="font-semibold text-gray-900">
                                {(h.cf_final * 100).toFixed(1)}%
                              </span>
                            </div>
                            <progress
                              className="progress-native"
                              value={Number((h.cf_final * 100).toFixed(1))}
                              max={100}
                              aria-label="Tingkat kepastian"
                            />
                          </div>

                          <div className="inline-flex items-center gap-2 rounded-lg bg-white/60 px-3 py-1.5 text-sm">
                            <span className="text-gray-500">Kategori:</span>
                            <span className="font-semibold text-gray-900">
                              {h.jurusan_kategori}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* CTA */}
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 shadow-sm animate-fade-up">
              <p className="text-gray-600 mb-4">
                Ingin mencoba konsultasi lagi dengan jawaban yang berbeda?
              </p>
              <Link
                href="/konsultasi"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition transform hover:-translate-y-0.5 shadow-lg shadow-blue-600/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Ulangi Konsultasi
              </Link>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm animate-fade-up">
            <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Belum Ada Hasil
            </h2>
            <p className="text-gray-600">
              Konsultasi Anda tidak menghasilkan rekomendasi. Silakan coba lagi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
