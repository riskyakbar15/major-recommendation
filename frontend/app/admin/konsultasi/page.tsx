"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Loader2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Trophy,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { Konsultasi, Hasil, JawabanDetail } from "@/types";

interface KonsultasiDetail extends Konsultasi {
  hasil: Hasil[];
  jawaban: JawabanDetail[];
}

export default function AdminKonsultasiPage() {
  const [konsultasiList, setKonsultasiList] = useState<Konsultasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [detailModal, setDetailModal] = useState<KonsultasiDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchKonsultasi = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getConsultations(page, 20);
      setKonsultasiList(response.data.data || []);
      const calculatedTotalPages = Math.max(
        1,
        Math.ceil(response.data.total / response.data.limit),
      );
      setTotalPages(calculatedTotalPages);
    } catch (error) {
      console.error("Failed to fetch konsultasi:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchKonsultasi();
  }, [fetchKonsultasi]);

  const handleViewDetail = async (konsultasi: Konsultasi) => {
    setLoadingDetail(true);
    setDetailModal({ ...konsultasi, hasil: [], jawaban: [] });
    try {
      const response = await adminApi.getConsultationDetail(konsultasi.id);
      const detail = response.data.data;
      setDetailModal({
        ...detail,
        hasil: detail.hasil ?? [],
        jawaban: detail.jawaban ?? [],
      });
    } catch (error) {
      console.error("Failed to fetch detail:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredKonsultasi = konsultasiList.filter((k) =>
    k.session_id.toLowerCase().includes(search.toLowerCase()),
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Riwayat Konsultasi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lihat semua hasil konsultasi pengguna
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari session ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          </div>
        ) : filteredKonsultasi.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {search
              ? "Tidak ada konsultasi yang cocok"
              : "Belum ada data konsultasi"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Session ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredKonsultasi.map((konsultasi) => (
                  <tr key={konsultasi.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      {konsultasi.session_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {konsultasi.ip_address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(konsultasi.created_at)}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <button
                        type="button"
                        onClick={() => handleViewDetail(konsultasi)}
                        className="inline-flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Sebelumnya
          </button>
          <span className="text-gray-600">
            Halaman {page} dari {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Selanjutnya
            <ChevronRight className="h-5 w-5 ml-2" />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Detail Konsultasi
              </h2>
              <button
                type="button"
                title="Tutup"
                onClick={() => setDetailModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Informasi
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Session ID:</span>{" "}
                      {detailModal.session_id}
                    </p>
                    <p>
                      <span className="font-medium">IP Address:</span>{" "}
                      {detailModal.ip_address}
                    </p>
                    <p>
                      <span className="font-medium">Tanggal:</span>{" "}
                      {formatDate(detailModal.created_at)}
                    </p>
                  </div>
                </div>

                {/* Hasil */}
                {detailModal.hasil && detailModal.hasil.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Hasil Rekomendasi
                    </h3>
                    <div className="space-y-3">
                      {detailModal.hasil
                        .sort((a, b) => a.ranking - b.ranking)
                        .map((hasil, index) => (
                          <div
                            key={index}
                            className="p-3 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  {hasil.ranking <= 3 && (
                                    <Trophy className="h-4 w-4 text-yellow-500" />
                                  )}
                                  <p className="font-medium text-gray-900">
                                    {hasil.jurusan_nama}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  CF: {(hasil.cf_final * 100).toFixed(1)}%
                                </p>
                              </div>
                              <span className="text-sm font-semibold text-blue-600">
                                #{hasil.ranking}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
