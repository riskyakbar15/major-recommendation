package repository

import (
	"database/sql"
	"time"

	"sistem-pakar-jurusan/internal/models"
)

type AdminRepository struct {
	db *sql.DB
}

func NewAdminRepository(db *sql.DB) *AdminRepository {
	return &AdminRepository{db: db}
}

func (r *AdminRepository) GetByUsername(username string) (*models.Admin, error) {
	query := `SELECT id, username, password_hash, COALESCE(nama, ''), refresh_token, refresh_token_exp, last_login, created_at, updated_at 
			  FROM admin WHERE username = ?`

	var a models.Admin
	err := r.db.QueryRow(query, username).Scan(&a.ID, &a.Username, &a.PasswordHash, &a.Nama, &a.RefreshToken, &a.RefreshTokenExp, &a.LastLogin, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &a, nil
}

func (r *AdminRepository) GetByID(id int) (*models.Admin, error) {
	query := `SELECT id, username, password_hash, COALESCE(nama, ''), refresh_token, refresh_token_exp, last_login, created_at, updated_at 
			  FROM admin WHERE id = ?`

	var a models.Admin
	err := r.db.QueryRow(query, id).Scan(&a.ID, &a.Username, &a.PasswordHash, &a.Nama, &a.RefreshToken, &a.RefreshTokenExp, &a.LastLogin, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &a, nil
}

func (r *AdminRepository) UpdateRefreshToken(id int, token string, exp time.Time) error {
	query := `UPDATE admin SET refresh_token = ?, refresh_token_exp = ? WHERE id = ?`
	_, err := r.db.Exec(query, token, exp, id)
	return err
}

func (r *AdminRepository) ClearRefreshToken(id int) error {
	query := `UPDATE admin SET refresh_token = NULL, refresh_token_exp = NULL WHERE id = ?`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *AdminRepository) UpdateLastLogin(id int) error {
	query := `UPDATE admin SET last_login = NOW() WHERE id = ?`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *AdminRepository) GetByRefreshToken(token string) (*models.Admin, error) {
	query := `SELECT id, username, password_hash, COALESCE(nama, ''), refresh_token, refresh_token_exp, last_login, created_at, updated_at 
			  FROM admin WHERE refresh_token = ? AND refresh_token_exp > NOW()`

	var a models.Admin
	err := r.db.QueryRow(query, token).Scan(&a.ID, &a.Username, &a.PasswordHash, &a.Nama, &a.RefreshToken, &a.RefreshTokenExp, &a.LastLogin, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &a, nil
}
