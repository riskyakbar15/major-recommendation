package repository

import (
	"database/sql"

	"sistem-pakar-jurusan/internal/models"
)

type JurusanRepository struct {
	db *sql.DB
}

func NewJurusanRepository(db *sql.DB) *JurusanRepository {
	return &JurusanRepository{db: db}
}

func (r *JurusanRepository) GetAll() ([]models.Jurusan, error) {
	query := `SELECT id, kode, nama, deskripsi, kategori, is_active, created_at, updated_at 
			  FROM jurusan ORDER BY nama`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jurusanList []models.Jurusan
	for rows.Next() {
		var j models.Jurusan
		err := rows.Scan(&j.ID, &j.Kode, &j.Nama, &j.Deskripsi, &j.Kategori, &j.IsActive, &j.CreatedAt, &j.UpdatedAt)
		if err != nil {
			return nil, err
		}
		jurusanList = append(jurusanList, j)
	}

	return jurusanList, nil
}

func (r *JurusanRepository) GetActive() ([]models.Jurusan, error) {
	query := `SELECT id, kode, nama, deskripsi, kategori, is_active, created_at, updated_at 
			  FROM jurusan WHERE is_active = TRUE ORDER BY nama`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jurusanList []models.Jurusan
	for rows.Next() {
		var j models.Jurusan
		err := rows.Scan(&j.ID, &j.Kode, &j.Nama, &j.Deskripsi, &j.Kategori, &j.IsActive, &j.CreatedAt, &j.UpdatedAt)
		if err != nil {
			return nil, err
		}
		jurusanList = append(jurusanList, j)
	}

	return jurusanList, nil
}

func (r *JurusanRepository) GetByID(id int) (*models.Jurusan, error) {
	query := `SELECT id, kode, nama, deskripsi, kategori, is_active, created_at, updated_at 
			  FROM jurusan WHERE id = ?`

	var j models.Jurusan
	err := r.db.QueryRow(query, id).Scan(&j.ID, &j.Kode, &j.Nama, &j.Deskripsi, &j.Kategori, &j.IsActive, &j.CreatedAt, &j.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &j, nil
}

func (r *JurusanRepository) Create(req models.CreateJurusanRequest) (*models.Jurusan, error) {
	query := `INSERT INTO jurusan (kode, nama, deskripsi, kategori) VALUES (?, ?, ?, ?)`

	result, err := r.db.Exec(query, req.Kode, req.Nama, req.Deskripsi, req.Kategori)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return r.GetByID(int(id))
}

func (r *JurusanRepository) Update(id int, req models.UpdateJurusanRequest) (*models.Jurusan, error) {
	query := `UPDATE jurusan SET kode = COALESCE(NULLIF(?, ''), kode), 
			  nama = COALESCE(NULLIF(?, ''), nama), 
			  deskripsi = COALESCE(NULLIF(?, ''), deskripsi), 
			  kategori = COALESCE(NULLIF(?, ''), kategori)`
	args := []interface{}{req.Kode, req.Nama, req.Deskripsi, req.Kategori}

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

func (r *JurusanRepository) Delete(id int) error {
	query := `DELETE FROM jurusan WHERE id = ?`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *JurusanRepository) GetByIDs(ids []int) ([]models.Jurusan, error) {
	if len(ids) == 0 {
		return []models.Jurusan{}, nil
	}

	query := `SELECT id, kode, nama, deskripsi, kategori, is_active, created_at, updated_at 
			  FROM jurusan WHERE id IN (?` + repeatPlaceholder(len(ids)-1) + `)`

	args := make([]interface{}, len(ids))
	for i, id := range ids {
		args[i] = id
	}

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jurusanList []models.Jurusan
	for rows.Next() {
		var j models.Jurusan
		err := rows.Scan(&j.ID, &j.Kode, &j.Nama, &j.Deskripsi, &j.Kategori, &j.IsActive, &j.CreatedAt, &j.UpdatedAt)
		if err != nil {
			return nil, err
		}
		jurusanList = append(jurusanList, j)
	}

	return jurusanList, nil
}

func repeatPlaceholder(n int) string {
	result := ""
	for i := 0; i < n; i++ {
		result += ", ?"
	}
	return result
}
