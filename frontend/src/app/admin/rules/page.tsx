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
      getJurusanName(r.jurusan_id)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      getPertanyaanKode(r.pertanyaan_id)
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchJurusan =
      !filterJurusan || r.jurusan_id.toString() === filterJurusan;
    return matchSearch && matchJurusan;
  });

  // Group rules by jurusan for display
  const groupedByJurusan = filteredRules.reduce(
    (acc, rule) => {
      const jurusanId = rule.jurusan_id;
      if (!acc[jurusanId]) {
        acc[jurusanId] = [];
      }
      acc[jurusanId].push(rule);
      return acc;
    },
    {} as Record<number, Rule[]>,
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Rules</h1>
          <p className="text-sm text-gray-500 mt-1">
            {rules.length} rules untuk {jurusanList.length} jurusan
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Rule
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
              placeholder="Cari rule..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterJurusan}
            onChange={(e) => setFilterJurusan(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Filter Jurusan"
          >
            <option value="">Semua Jurusan</option>
            {jurusanList.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rules by Jurusan */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
        </div>
      ) : Object.keys(groupedByJurusan).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
          {search || filterJurusan
            ? "Tidak ada rules yang cocok"
            : "Belum ada rules"}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByJurusan).map(([jurusanId, jurusanRules]) => (
            <div
              key={jurusanId}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">
                  {getJurusanName(parseInt(jurusanId))}
                </h3>
                <p className="text-sm text-gray-500">
                  {jurusanRules.length} rules
                </p>
              </div>
              <div className="divide-y divide-gray-200">
                {jurusanRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {getPertanyaanKode(rule.pertanyaan_id)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {rule.operator} {rule.nilai_kondisi}
                        </span>
                        <span className="text-sm text-gray-400">→</span>
                        <span className="text-sm font-medium text-blue-600">
                          CF: {rule.cf_rule}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {getPertanyaanText(rule.pertanyaan_id)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 ml-4">
                      <button
                        onClick={() => handleOpenEdit(rule)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        disabled={deleteId === rule.id}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Hapus"
                      >
                        {deleteId === rule.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

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
                  {editingRule ? "Edit Rule" : "Tambah Rule"}
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
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Filter Jurusan"
                  >
                    <option value="">Pilih Jurusan</option>
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
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Filter Pertanyaan"
                  >
                    <option value="">Pilih Pertanyaan</option>
                    {pertanyaanList.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.kode}] {p.teks.substring(0, 60)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Operator
                    </label>
                    <select
                      value={formData.operator}
                      onChange={(e) =>
                        setFormData({ ...formData, operator: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Operator"
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
                      value={formData.nilai_kondisi}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nilai_kondisi: parseFloat(e.target.value) || 0,
                        })
                      }
                      min={0}
                      max={1}
                      step={0.1}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Nilai Kondisi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CF Rule
                    </label>
                    <input
                      type="number"
                      value={formData.cf_rule}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cf_rule: parseFloat(e.target.value) || 0,
                        })
                      }
                      min={0}
                      max={1}
                      step={0.1}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="CF Rule"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p className="font-medium mb-1">Penjelasan Rule:</p>
                  <p>
                    Jika jawaban pertanyaan {formData.operator}{" "}
                    {formData.nilai_kondisi}, maka berkontribusi ke jurusan
                    dengan CF = {formData.cf_rule}
                  </p>
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
                    {editingRule ? "Simpan" : "Tambah"}
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
