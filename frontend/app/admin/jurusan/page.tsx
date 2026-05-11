"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Search, Loader2, Check } from "lucide-react";
import { adminApi } from "@/lib/api";
import { Jurusan, CreateJurusanRequest } from "@/types";

export default function AdminJurusanPage() {
  const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJurusan, setEditingJurusan] = useState<Jurusan | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateJurusanRequest>({
    kode: "",
    nama: "",
    kategori: "SAINTEK",
    deskripsi: "",
    prospek_kerja: "",
    is_active: true,
  });

  useEffect(() => {
    fetchJurusan();
  }, []);

  const fetchJurusan = async () => {
    try {
      const response = await adminApi.getJurusan();
      setJurusanList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch jurusan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingJurusan(null);
    setFormData({
      kode: "",
      nama: "",
      kategori: "SAINTEK",
      deskripsi: "",
      prospek_kerja: "",
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (jurusan: Jurusan) => {
    setEditingJurusan(jurusan);
    setFormData({
      kode: jurusan.kode,
      nama: jurusan.nama,
      kategori: jurusan.kategori,
      deskripsi: jurusan.deskripsi,
      prospek_kerja: jurusan.prospek_kerja,
      is_active: jurusan.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingJurusan) {
        await adminApi.updateJurusan(editingJurusan.id, formData);
      } else {
        await adminApi.createJurusan(formData);
      }
      setIsModalOpen(false);
      fetchJurusan();
    } catch (error: any) {
      alert(error.response?.data?.error || "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus jurusan ini?")) return;
    setDeleteId(id);
    try {
      await adminApi.deleteJurusan(id);
      fetchJurusan();
    } catch (error: any) {
      alert(error.response?.data?.error || "Gagal menghapus data");
    } finally {
      setDeleteId(null);
    }
  };

  const filteredJurusan = jurusanList.filter(
    (j) =>
      j.nama.toLowerCase().includes(search.toLowerCase()) ||
      j.kode.toLowerCase().includes(search.toLowerCase()) ||
      j.kategori.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Jurusan</h1>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Jurusan
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari jurusan..."
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
        ) : filteredJurusan.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {search ? "Tidak ada jurusan yang cocok" : "Belum ada data jurusan"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Kode
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredJurusan.map((jurusan) => (
                  <tr key={jurusan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {jurusan.kode}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {jurusan.nama}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {jurusan.kategori}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {jurusan.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          <Check className="h-3 w-3 mr-1" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(jurusan)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(jurusan.id)}
                          disabled={deleteId === jurusan.id}
                          className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        >
                          {deleteId === jurusan.id ? (
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
                {editingJurusan ? "Edit Jurusan" : "Tambah Jurusan"}
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
                  Nama
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  required
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
                      kategori: e.target.value as "SAINTEK" | "SOSHUM",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SAINTEK">SAINTEK</option>
                  <option value="SOSHUM">SOSHUM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prospek Kerja
                </label>
                <textarea
                  value={formData.prospek_kerja}
                  onChange={(e) =>
                    setFormData({ ...formData, prospek_kerja: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_active"
                  className="ml-2 text-sm text-gray-700"
                >
                  Aktif
                </label>
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
