"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  BookOpen,
  TrendingUp,
  Calendar,
  BarChart3,
  Sparkles,
  Award,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { adminApi } from "@/lib/api";
import { Statistics } from "@/types";

const BAR_COLORS = ["#2563eb", "#4f46e5", "#6366f1", "#818cf8", "#a5b4fc"];

function formatDayLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.getStatistics();
        setStats(response.data.data);
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const dailyData = useMemo(
    () =>
      (stats?.daily_stats ?? []).map((d) => ({
        label: formatDayLabel(d.date),
        count: d.count,
      })),
    [stats],
  );

  const topData = useMemo(
    () =>
      (stats?.top_jurusan ?? []).map((j) => ({
        nama: j.nama,
        count: j.count,
        avg_cf: Number((j.avg_cf * 100).toFixed(1)),
      })),
    [stats],
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-1">
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-gradient-to-r from-primary-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          Ringkasan
        </div>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Pantau aktivitas konsultasi dan tren rekomendasi jurusan.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stagger mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Konsultasi</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.total_consultations ?? 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-sm">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="mr-1 h-4 w-4 text-emerald-500" />
            <span className="font-medium text-emerald-600">
              {stats?.today_consultations ?? 0}
            </span>
            <span className="ml-1 text-gray-500">hari ini</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Minggu Ini</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.week_consultations ?? 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">7 hari terakhir</div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Bulan Ini</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.month_consultations ?? 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
              <BarChart3 className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">Bulan berjalan</div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Jurusan</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.total_jurusan ?? 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="font-medium text-emerald-600">
              {stats?.active_jurusan ?? 0}
            </span>
            <span className="ml-1 text-gray-500">aktif</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Daily trend */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Tren Konsultasi (7 Hari)
            </h2>
          </div>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={dailyData}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                  }}
                  labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                  formatter={(value: number) => [
                    `${value} konsultasi`,
                    "Jumlah",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-gray-400">
              Belum ada data konsultasi
            </div>
          )}
        </div>

        {/* Top jurusan chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Jurusan Terpopuler
            </h2>
          </div>
          {topData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={topData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid
                  horizontal={false}
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="nama"
                  width={110}
                  tick={{ fontSize: 11, fill: "#475569" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                  }}
                  formatter={(value: number) => [
                    `${value} rekomendasi`,
                    "Jumlah",
                  ]}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
                  {topData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={BAR_COLORS[index % BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-gray-400">
              Belum ada data
            </div>
          )}
        </div>
      </div>

      {/* Top jurusan detail list */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Detail Jurusan Terpopuler
        </h2>
        {stats?.top_jurusan && stats.top_jurusan.length > 0 ? (
          <div className="space-y-3">
            {stats.top_jurusan.map((jurusan, index) => (
              <div
                key={index}
                className="flex items-center rounded-xl border border-gray-100 p-3 transition hover:bg-gray-50"
              >
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-indigo-600 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{jurusan.nama}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{jurusan.count} rekomendasi</span>
                    <span className="mx-2">•</span>
                    <span>Avg CF: {(jurusan.avg_cf * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-gray-500">Belum ada data</p>
        )}
      </div>
    </div>
  );
}
