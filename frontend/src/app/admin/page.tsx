"use client";

import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  FileQuestion,
  TrendingUp,
  Calendar,
  BarChart3,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { Statistics } from "@/types";

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
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Konsultasi</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.total_consultations || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">
              {stats?.today_consultations || 0}
            </span>
            <span className="text-gray-500 ml-1">hari ini</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Minggu Ini</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.week_consultations || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">7 hari terakhir</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Bulan Ini</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.month_consultations || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">Bulan berjalan</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Jurusan</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.total_jurusan || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="text-green-600 font-medium">
              {stats?.active_jurusan || 0}
            </span>
            <span className="text-gray-500 ml-1">aktif</span>
          </div>
        </div>
      </div>

      {/* Top Jurusan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Jurusan Terpopuler
          </h2>
          {stats?.top_jurusan && stats.top_jurusan.length > 0 ? (
            <div className="space-y-4">
              {stats.top_jurusan.map((jurusan, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 mr-3">
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
            <p className="text-gray-500 text-center py-8">
              Belum ada data konsultasi
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Aktivitas Harian (7 Hari Terakhir)
          </h2>
          {stats?.daily_stats && stats.daily_stats.length > 0 ? (
            <div className="space-y-3">
              {stats.daily_stats.map((stat, index) => (
                <div key={index} className="flex items-center">
                  <span className="w-24 text-sm text-gray-500">
                    {new Date(stat.date).toLocaleDateString("id-ID", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <div className="flex-1 mx-3">
                    <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (stat.count / Math.max(...stats.daily_stats.map((s) => s.count))) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-8 text-sm font-medium text-gray-900 text-right">
                    {stat.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Belum ada data aktivitas
            </p>
          )}
        </div>
      </div>

      {/* Quick Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          Informasi Sistem Pakar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium">Metode Inferensi</p>
            <p>Forward Chaining</p>
          </div>
          <div>
            <p className="font-medium">Perhitungan Kepastian</p>
            <p>Certainty Factor (CF)</p>
          </div>
          <div>
            <p className="font-medium">Threshold Minimum</p>
            <p>CF ≥ 0.3 (30%)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
