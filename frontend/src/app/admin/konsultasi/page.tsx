"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Loader2,
  Calendar,
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

  useEffect(() => {
    fetchKonsultasi();
  }, [page]);

  const fetchKonsultasi = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getConsultations(page, 20);
      setKonsultasiList(response.data.data || []);
      setTotalPages(response.data.total_pages || 1);
    } catch (error) {
      console.error("Failed to fetch konsultasi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (konsultasi: Konsultasi) => {
    setLoadingDetail(true);
    setDetailModal({ ...konsultasi, hasil: [], jawaban: [] });
    try {
      const response = await adminApi.getConsultationDetail(konsultasi.id);
      setDetailModal(response.data.data);
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
    <div>
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              : "Belum ada riwayat konsultasi"}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waktu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredKonsultasi.map((konsultasi) => (
                    <tr key={konsultasi.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm">
                          {konsultasi.session_id.substring(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(konsultasi.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {konsultasi.ip_address}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleViewDetail(konsultasi)}
                          className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Halaman {page} dari {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setDetailModal(null)}
            />
            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detail Konsultasi
                </h3>
                <button
                  onClick={() => setDetailModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close detail modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {loadingDetail ? (
                <div className="py-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-gray-500">Session ID</dt>
                        <dd className="font-mono">{detailModal.session_id}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Waktu</dt>
                        <dd>{formatDate(detailModal.created_at)}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Hasil */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Hasil Rekomendasi
                    </h4>
                    {detailModal.hasil && detailModal.hasil.length > 0 ? (
                      <div className="space-y-2">
                        {detailModal.hasil.map((h, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                                  idx === 0
                                    ? "bg-yellow-100 text-yellow-700"
                                    : idx === 1
                                      ? "bg-gray-200 text-gray-700"
                                      : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <span className="font-medium">
                                {h.jurusan_nama}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${h.cf_final * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-600">
                                {(h.cf_final * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Tidak ada hasil</p>
                    )}
                  </div>

                  {/* Jawaban */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Jawaban Pengguna
                    </h4>
                    {detailModal.jawaban && detailModal.jawaban.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {detailModal.jawaban.map((j, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 text-sm border-b border-gray-100"
                          >
                            <span className="text-gray-600">
                              {j.pertanyaan_teks || `Pertanyaan ${idx + 1}`}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                j.nilai >= 0.8
                                  ? "bg-green-100 text-green-700"
                                  : j.nilai >= 0.5
                                    ? "bg-blue-100 text-blue-700"
                                    : j.nilai >= 0.25
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                              }`}
                            >
                              {j.nilai.toFixed(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Tidak ada data jawaban
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setDetailModal(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
