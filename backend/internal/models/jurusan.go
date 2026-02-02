package models

import "time"

type Jurusan struct {
	ID        int       `json:"id"`
	Kode      string    `json:"kode"`
	Nama      string    `json:"nama"`
	Deskripsi string    `json:"deskripsi"`
	Kategori  string    `json:"kategori"` // SAINTEK or SOSHUM
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateJurusanRequest struct {
	Kode      string `json:"kode" binding:"required"`
	Nama      string `json:"nama" binding:"required"`
	Deskripsi string `json:"deskripsi"`
	Kategori  string `json:"kategori" binding:"required"`
}

type UpdateJurusanRequest struct {
	Kode      string `json:"kode"`
	Nama      string `json:"nama"`
	Deskripsi string `json:"deskripsi"`
	Kategori  string `json:"kategori"`
	IsActive  *bool  `json:"is_active"`
}
