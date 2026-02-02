// Types for Sistem Pakar Jurusan

export interface Jurusan {
  id: number;
  kode: string;
  nama: string;
  deskripsi: string;
  kategori: "SAINTEK" | "SOSHUM";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  prospek_kerja: string;
}

export interface CreateJurusanRequest {
  kode: string;
  nama: string;
  kategori: "SAINTEK" | "SOSHUM";
  deskripsi: string;
  prospek_kerja: string;
  is_active: boolean;
}

export interface Pertanyaan {
  id: number;
  kode: string;
  teks: string;
  kategori: "minat" | "bakat";
  sub_kategori: string;
  urutan: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePertanyaanRequest {
  kode: string;
  teks: string;
  kategori: "minat" | "bakat";
  urutan: number;
}

export interface Rule {
  id: number;
  kode_rule: string;
  pertanyaan_id: number;
  operator: ">=" | "<=" | "=";
  nilai_kondisi: number;
  jurusan_id: number;
  cf_rule: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  pertanyaan_kode?: string;
  pertanyaan_teks?: string;
  jurusan_kode?: string;
  jurusan_nama?: string;
}

export interface CreateRuleRequest {
  jurusan_id: number;
  pertanyaan_id: number;
  operator: ">=" | "<=" | "=" | string;
  nilai_kondisi: number;
  cf_rule: number;
}

export interface Jawaban {
  pertanyaan_id: number;
  nilai: number;
}

export interface Hasil {
  id?: number;
  konsultasi_id?: number;
  jurusan_id: number;
  cf_final: number;
  ranking: number;
  jurusan_kode?: string;
  jurusan_nama?: string;
  jurusan_deskripsi?: string;
  jurusan_kategori?: string;
}

export interface Konsultasi {
  id: number;
  session_id: string;
  ip_address: string;
  created_at: string;
  jawaban?: JawabanDetail[];
  hasil?: Hasil[];
}

export interface JawabanDetail {
  id: number;
  konsultasi_id: number;
  pertanyaan_id: number;
  nilai: number;
  pertanyaan_teks?: string;
}

export interface ConsultationRequest {
  jawaban: Jawaban[];
}

export interface ConsultationResponse {
  session_id: string;
  hasil: Hasil[];
  message?: string;
}

export interface Admin {
  id: number;
  username: string;
  nama: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  admin: Admin;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Statistics {
  total_consultations: number;
  today_consultations: number;
  week_consultations: number;
  month_consultations: number;
  total_jurusan: number;
  active_jurusan: number;
  top_jurusan: TopJurusan[];
  daily_stats: DailyStat[];
}

export interface TopJurusan {
  nama: string;
  count: number;
  avg_cf: number;
}

export interface DailyStat {
  date: string;
  count: number;
}

// Answer option type for questionnaire
export interface AnswerOption {
  label: string;
  value: number;
}

export const ANSWER_OPTIONS: AnswerOption[] = [
  { label: "Sangat Tidak Setuju", value: 0.0 },
  { label: "Tidak Setuju", value: 0.25 },
  { label: "Netral", value: 0.5 },
  { label: "Setuju", value: 0.75 },
  { label: "Sangat Setuju", value: 1.0 },
];
