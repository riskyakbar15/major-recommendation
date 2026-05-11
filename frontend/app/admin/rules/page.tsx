"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Search, Loader2, Filter } from "lucide-react";
import { adminApi } from "@/lib/api";
import { Rule, Jurusan, Pertanyaan, CreateRuleRequest } from "@/types";

export default function AdminRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);
  const [pertanyaanList, setPertanyaanList] = useState<Pertanyaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterJurusan, setFilterJurusan] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState<CreateRuleRequest>({
    jurusan_id: 0,
    pertanyaan_id: 0,
    operator: ">=",
    nilai_kondisi: 0.6,
    cf_rule: 0.8,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rulesRes, jurusanRes, pertanyaanRes] = await Promise.all([
        adminApi.getRules(),
        adminApi.getJurusan(),
        adminApi.getPertanyaan(),
      ]);
      setRules(rulesRes.data.data || []);
      setJurusanList(jurusanRes.data.data || []);
      setPertanyaanList(pertanyaanRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getJurusanName = (id: number) =>
    jurusanList.find((j) => j.id === id)?.nama || "-";
  const getPertanyaanText = (id: number) =>
    pertanyaanList.find((p) => p.id === id)?.teks || "-";
  const getPertanyaanKode = (id: number) =>
    pertanyaanList.find((p) => p.id === id)?.kode || "-";

  const handleOpenCreate = () => {
    setEditingRule(null);
    setFormData({
      jurusan_id: jurusanList[0]?.id || 0,
      pertanyaan_id: pertanyaanList[0]?.id || 0,
      operator: ">=",
      nilai_kondisi: 0.6,
      cf_rule: 0.8,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule: Rule) => {
    setEditingRule(rule);
    setFormData({
      jurusan_id: rule.jurusan_id,
      pertanyaan_id: rule.pertanyaan_id,
      operator: rule.operator,
      nilai_kondisi: rule.nilai_kondisi,
      cf_rule: rule.cf_rule,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingRule) {
        await adminApi.updateRule(editingRule.id, formData);
      } else {
        await adminApi.createRule(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus rule ini?")) return;
    setDeleteId(id);
    try {
      await adminApi.deleteRule(id);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || "Gagal menghapus data");
    } finally {
      setDeleteId(null);
    }
  };

  const filteredRules = rules.filter((r) => {
    const matchSearch =
      r.kode_rule.toLowerCase().includes(search.toLowerCase()) ||
      getPertanyaanKode(r.pertanyaan_id)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      getJurusanName(r.jurusan_id).toLowerCase().includes(search.toLowerCase());
    const matchJurusan =
      !filterJurusan || r.jurusan_id === parseInt(filterJurusan);
    return matchSearch && matchJurusan;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Rules</h1>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Rule
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
              placeholder="Cari rule..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <select
          value={filterJurusan}
          onChange={(e) => setFilterJurusan(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Jurusan</option>
          {jurusanList.map((j) => (
            <option key={j.id} value={j.id}>
              {j.nama}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {search || filterJurusan
              ? "Tidak ada rule yang cocok"
              : "Belum ada data rule"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Kode Rule
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Pertanyaan
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Jurusan
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Kondisi
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    CF Rule
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {rule.kode_rule}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="font-medium text-xs text-blue-600">
                        {getPertanyaanKode(rule.pertanyaan_id)}
                      </div>
                      <div className="text-xs">
                        {getPertanyaanText(rule.pertanyaan_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getJurusanName(rule.jurusan_id)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {rule.operator} {rule.nilai_kondisi}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {rule.cf_rule}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(rule)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          disabled={deleteId === rule.id}
                          className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        >
                          {deleteId === rule.id ? (
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
                {editingRule ? "Edit Rule" : "Tambah Rule"}
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
                  Jurusan
                </label>
                <select
                  value={formData.jurusan_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jurusan_id: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {jurusanList.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pertanyaan
                </label>
                <select
                  value={formData.pertanyaan_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pertanyaan_id: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {pertanyaanList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.kode} - {p.teks}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operator
                </label>
                <select
                  value={formData.operator}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      operator: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value=">=">&gt;=</option>
                  <option value="<=">&lt;=</option>
                  <option value="=">=</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nilai Kondisi
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={formData.nilai_kondisi}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nilai_kondisi: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CF Rule
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={formData.cf_rule}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cf_rule: parseFloat(e.target.value),
                    })
                  }
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
