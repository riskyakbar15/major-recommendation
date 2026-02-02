package models

import "time"

type Rule struct {
	ID            int       `json:"id"`
	KodeRule      string    `json:"kode_rule"`
	PertanyaanID  int       `json:"pertanyaan_id"`
	Operator      string    `json:"operator"` // >=, <=, =
	NilaiKondisi  float64   `json:"nilai_kondisi"`
	JurusanID     int       `json:"jurusan_id"`
	CFRule        float64   `json:"cf_rule"`
	IsActive      bool      `json:"is_active"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	// Joined fields
	PertanyaanKode string `json:"pertanyaan_kode,omitempty"`
	PertanyaanTeks string `json:"pertanyaan_teks,omitempty"`
	JurusanKode    string `json:"jurusan_kode,omitempty"`
	JurusanNama    string `json:"jurusan_nama,omitempty"`
}

type CreateRuleRequest struct {
	KodeRule     string  `json:"kode_rule" binding:"required"`
	PertanyaanID int     `json:"pertanyaan_id" binding:"required"`
	Operator     string  `json:"operator" binding:"required"`
	NilaiKondisi float64 `json:"nilai_kondisi" binding:"required"`
	JurusanID    int     `json:"jurusan_id" binding:"required"`
	CFRule       float64 `json:"cf_rule" binding:"required"`
}

type UpdateRuleRequest struct {
	KodeRule     string   `json:"kode_rule"`
	PertanyaanID *int     `json:"pertanyaan_id"`
	Operator     string   `json:"operator"`
	NilaiKondisi *float64 `json:"nilai_kondisi"`
	JurusanID    *int     `json:"jurusan_id"`
	CFRule       *float64 `json:"cf_rule"`
	IsActive     *bool    `json:"is_active"`
}
