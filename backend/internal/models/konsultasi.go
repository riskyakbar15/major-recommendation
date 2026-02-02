package models

import "time"

type Konsultasi struct {
	ID        int       `json:"id"`
	SessionID string    `json:"session_id"`
	IPAddress string    `json:"ip_address"`
	CreatedAt time.Time `json:"created_at"`

	// Related data
	Jawaban []Jawaban `json:"jawaban,omitempty"`
	Hasil   []Hasil   `json:"hasil,omitempty"`
}

type Jawaban struct {
	ID           int     `json:"id"`
	KonsultasiID int     `json:"konsultasi_id"`
	PertanyaanID int     `json:"pertanyaan_id"`
	Nilai        float64 `json:"nilai"`

	// Joined fields
	PertanyaanTeks string `json:"pertanyaan_teks,omitempty"`
}

type Hasil struct {
	ID           int     `json:"id"`
	KonsultasiID int     `json:"konsultasi_id"`
	JurusanID    int     `json:"jurusan_id"`
	CFFinal      float64 `json:"cf_final"`
	Ranking      int     `json:"ranking"`

	// Joined fields
	JurusanKode      string `json:"jurusan_kode,omitempty"`
	JurusanNama      string `json:"jurusan_nama,omitempty"`
	JurusanDeskripsi string `json:"jurusan_deskripsi,omitempty"`
	JurusanKategori  string `json:"jurusan_kategori,omitempty"`
}

type ConsultationRequest struct {
	Jawaban []JawabanInput `json:"jawaban" binding:"required"`
}

type JawabanInput struct {
	PertanyaanID int     `json:"pertanyaan_id" binding:"required"`
	Nilai        float64 `json:"nilai" binding:"required"`
}

type ConsultationResponse struct {
	SessionID string  `json:"session_id"`
	Hasil     []Hasil `json:"hasil"`
	Message   string  `json:"message,omitempty"`
}
