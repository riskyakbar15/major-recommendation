package repository

import (
	"database/sql"

	"sistem-pakar-jurusan/internal/models"
)

type PertanyaanRepository struct {
	db *sql.DB
}

func NewPertanyaanRepository(db *sql.DB) *PertanyaanRepository {
	return &PertanyaanRepository{db: db}
}

func (r *PertanyaanRepository) GetAll() ([]models.Pertanyaan, error) {
	query := `SELECT id, kode, teks, kategori, COALESCE(sub_kategori, ''), urutan, is_active, created_at, updated_at 
			  FROM pertanyaan ORDER BY urutan`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.Pertanyaan
	for rows.Next() {
		var p models.Pertanyaan
		err := rows.Scan(&p.ID, &p.Kode, &p.Teks, &p.Kategori, &p.SubKategori, &p.Urutan, &p.IsActive, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			return nil, err
		}
		list = append(list, p)
	}

	return list, nil
}

func (r *PertanyaanRepository) GetActive() ([]models.Pertanyaan, error) {
	query := `SELECT id, kode, teks, kategori, COALESCE(sub_kategori, ''), urutan, is_active, created_at, updated_at 
			  FROM pertanyaan WHERE is_active = TRUE ORDER BY urutan`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.Pertanyaan
	for rows.Next() {
		var p models.Pertanyaan
		err := rows.Scan(&p.ID, &p.Kode, &p.Teks, &p.Kategori, &p.SubKategori, &p.Urutan, &p.IsActive, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			return nil, err
		}
		list = append(list, p)
	}

	return list, nil
}

func (r *PertanyaanRepository) GetByID(id int) (*models.Pertanyaan, error) {
	query := `SELECT id, kode, teks, kategori, COALESCE(sub_kategori, ''), urutan, is_active, created_at, updated_at 
			  FROM pertanyaan WHERE id = ?`

	var p models.Pertanyaan
	err := r.db.QueryRow(query, id).Scan(&p.ID, &p.Kode, &p.Teks, &p.Kategori, &p.SubKategori, &p.Urutan, &p.IsActive, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &p, nil
}

func (r *PertanyaanRepository) Create(req models.CreatePertanyaanRequest) (*models.Pertanyaan, error) {
	query := `INSERT INTO pertanyaan (kode, teks, kategori, sub_kategori, urutan) VALUES (?, ?, ?, ?, ?)`

	result, err := r.db.Exec(query, req.Kode, req.Teks, req.Kategori, req.SubKategori, req.Urutan)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return r.GetByID(int(id))
}

func (r *PertanyaanRepository) Update(id int, req models.UpdatePertanyaanRequest) (*models.Pertanyaan, error) {
	query := `UPDATE pertanyaan SET kode = COALESCE(NULLIF(?, ''), kode), 
			  teks = COALESCE(NULLIF(?, ''), teks), 
			  kategori = COALESCE(NULLIF(?, ''), kategori), 
			  sub_kategori = COALESCE(NULLIF(?, ''), sub_kategori)`
	args := []interface{}{req.Kode, req.Teks, req.Kategori, req.SubKategori}

	if req.Urutan != nil {
		query += ", urutan = ?"
		args = append(args, *req.Urutan)
	}

	if req.IsActive != nil {
		query += ", is_active = ?"
		args = append(args, *req.IsActive)
	}

	query += " WHERE id = ?"
	args = append(args, id)

	_, err := r.db.Exec(query, args...)
	if err != nil {
		return nil, err
	}

	return r.GetByID(id)
}

func (r *PertanyaanRepository) Delete(id int) error {
	query := `DELETE FROM pertanyaan WHERE id = ?`
	_, err := r.db.Exec(query, id)
	return err
}
