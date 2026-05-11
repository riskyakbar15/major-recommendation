"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Loader2,
  GripVertical,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { Pertanyaan, CreatePertanyaanRequest } from "@/types";

export default function AdminPertanyaanPage() {
  const [pertanyaanList, setPertanyaanList] = useState<Pertanyaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPertanyaan, setEditingPertanyaan] = useState<Pertanyaan | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState<CreatePertanyaanRequest>({
    kode: "",
    teks: "",
    kategori: "minat",
    urutan: 1,
  });

  useEffect(() => {
    fetchPertanyaan();
  }, []);

  const fetchPertanyaan = async () => {
    try {
      const response = await adminApi.getPertanyaan();
      setPertanyaanList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch pertanyaan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPertanyaan(null);
    const maxUrutan =
      pertanyaanList.length > 0
        ? Math.max(...pertanyaanList.map((p) => p.urutan)) + 1
        : 1;
    setFormData({
      kode: "",
      teks: "",
      kategori: "minat",
      urutan: maxUrutan,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pertanyaan: Pertanyaan) => {
    setEditingPertanyaan(pertanyaan);
    setFormData({
      kode: pertanyaan.kode,
      teks: pertanyaan.teks,
      kategori: pertanyaan.kategori,
      urutan: pertanyaan.urutan,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPertanyaan) {
        await adminApi.updatePertanyaan(editingPertanyaan.id, formData);
      } else {
        await adminApi.createPertanyaan(formData);
      }
      setIsModalOpen(false);
      fetchPertanyaan();
    } catch (error: any) {
      alert(error.response?.data?.error || "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Yakin ingin menghapus pertanyaan ini? Rules terkait juga akan terhapus.",
      )
    )
      return;
    setDeleteId(id);
    try {
      await adminApi.deletePertanyaan(id);
      fetchPertanyaan();
    } catch (error: any) {
      alert(error.response?.data?.error || "Gagal menghapus data");
    } finally {
      setDeleteId(null);
    }
  };

  const filteredPertanyaan = pertanyaanList.filter((p) => {
    const matchSearch =
      p.kode.toLowerCase().includes(search.toLowerCase()) ||
      p.teks.toLowerCase().includes(search.toLowerCase());
    const matchKategori = !filterKategori || p.kategori === filterKategori;
    return matchSearch && matchKategori;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Pertanyaan</h1>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Pertanyaan
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pertanyaan..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Kategori</option>
          <option value="minat">Minat</option>
          <option value="bakat">Bakat</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          </div>
        ) : filteredPertanyaan.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {search || filterKategori
              ? "Tidak ada pertanyaan yang cocok"
              : "Belum ada data pertanyaan"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-20">
                    Urutan
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-24">
                    Kode
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Teks
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-24">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 w-20">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPertanyaan
                  .sort((a, b) => a.urutan - b.urutan)
                  .map((pertanyaan) => (
                    <tr key={pertanyaan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
                          {pertanyaan.urutan}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {pertanyaan.kode}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {pertanyaan.teks}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {pertanyaan.kategori}
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(pertanyaan)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(pertanyaan.id)}
                            disabled={deleteId === pertanyaan.id}
                            className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                          >
                            {deleteId === pertanyaan.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPertanyaan ? "Edit Pertanyaan" : "Tambah Pertanyaan"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode
                </label>
                <input
                  type="text"
                  value={formData.kode}
                  onChange={(e) =>
                    setFormData({ ...formData, kode: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teks Pertanyaan
                </label>
                <textarea
                  value={formData.teks}
                  onChange={(e) =>
                    setFormData({ ...formData, teks: e.target.value })
                  }
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  value={formData.kategori}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kategori: e.target.value as "minat" | "bakat",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="minat">Minat</option>
                  <option value="bakat">Bakat</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urutan
                </label>
                <input
                  type="number"
                  value={formData.urutan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      urutan: parseInt(e.target.value),
                    })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
