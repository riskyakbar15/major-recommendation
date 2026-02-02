package models

import "time"

type Pertanyaan struct {
	ID          int       `json:"id"`
	Kode        string    `json:"kode"`
	Teks        string    `json:"teks"`
	Kategori    string    `json:"kategori"` // minat or bakat
	SubKategori string    `json:"sub_kategori"`
	Urutan      int       `json:"urutan"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreatePertanyaanRequest struct {
	Kode        string `json:"kode" binding:"required"`
	Teks        string `json:"teks" binding:"required"`
	Kategori    string `json:"kategori" binding:"required"`
	SubKategori string `json:"sub_kategori"`
	Urutan      int    `json:"urutan"`
}

type UpdatePertanyaanRequest struct {
	Kode        string `json:"kode"`
	Teks        string `json:"teks"`
	Kategori    string `json:"kategori"`
	SubKategori string `json:"sub_kategori"`
	Urutan      *int   `json:"urutan"`
	IsActive    *bool  `json:"is_active"`
}
