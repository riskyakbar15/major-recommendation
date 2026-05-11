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
            <div className="space-y-4 mb-8">
              {hasil
                .sort((a, b) => a.ranking - b.ranking)
                .map((h) => (
                  <div
                    key={h.id}
                    className={`rounded-xl border-2 p-6 ${getRankBgColor(h.ranking)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">{getRankIcon(h.ranking)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {h.ranking}. {h.jurusan_nama}
                            </h3>
                            <span
                              className={`text-xs font-semibold px-3 py-1 rounded-full ${getCFColor(h.cf_final)}`}
                            >
                              {getCFLabel(h.cf_final)}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">
                            {h.jurusan_deskripsi}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Kepastian:</span>
                              <p className="font-semibold text-gray-900">
                                {(h.cf_final * 100).toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Kategori:</span>
                              <p className="font-semibold text-gray-900">
                                {h.jurusan_kategori}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* CTA */}
            <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
              <p className="text-gray-600 mb-4">
                Ingin mencoba konsultasi lagi dengan jawaban yang berbeda?
              </p>
              <Link
                href="/konsultasi"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Ulangi Konsultasi
              </Link>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
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
