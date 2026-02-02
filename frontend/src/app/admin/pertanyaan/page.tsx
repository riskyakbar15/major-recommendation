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

  const filteredPertanyaan = pertanyaanList
    .filter((p) => {
      const matchSearch =
        p.teks.toLowerCase().includes(search.toLowerCase()) ||
        p.kode.toLowerCase().includes(search.toLowerCase());
      const matchKategori = !filterKategori || p.kategori === filterKategori;
      return matchSearch && matchKategori;
    })
    .sort((a, b) => a.urutan - b.urutan);

  const minatCount = pertanyaanList.filter(
    (p) => p.kategori === "minat",
  ).length;
  const bakatCount = pertanyaanList.filter(
    (p) => p.kategori === "bakat",
  ).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Kelola Pertanyaan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {minatCount} pertanyaan minat, {bakatCount} pertanyaan bakat
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Pertanyaan
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pertanyaan..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Kategori"
          >
            <option value="">Semua Kategori</option>
            <option value="minat">Minat</option>
            <option value="bakat">Bakat</option>
          </select>
        </div>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pertanyaan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPertanyaan.map((pertanyaan) => (
                  <tr key={pertanyaan.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-gray-400">
                        <GripVertical className="h-4 w-4 mr-1" />
                        <span className="text-sm">{pertanyaan.urutan}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {pertanyaan.kode}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-gray-900 line-clamp-2">
                        {pertanyaan.teks}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pertanyaan.kategori === "minat"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {pertanyaan.kategori === "minat" ? "Minat" : "Bakat"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenEdit(pertanyaan)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-1"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pertanyaan.id)}
                        disabled={deleteId === pertanyaan.id}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Hapus"
                      >
                        {deleteId === pertanyaan.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingPertanyaan ? "Edit Pertanyaan" : "Tambah Pertanyaan"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kode
                    </label>
                    <input
                      type="text"
                      value={formData.kode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          kode: e.target.value.toUpperCase(),
                        })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="P001"
                    />
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
                          urutan: parseInt(e.target.value) || 1,
                        })
                      }
                      min={1}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1"
                    />
                  </div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Kategori"
                  >
                    <option value="minat">Minat</option>
                    <option value="bakat">Bakat</option>
                  </select>
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
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Apakah Anda menyukai..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {saving && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingPertanyaan ? "Simpan" : "Tambah"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
