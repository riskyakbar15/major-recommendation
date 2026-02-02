package repository

import (
	"database/sql"

	"sistem-pakar-jurusan/internal/models"
)

type RuleRepository struct {
	db *sql.DB
}

func NewRuleRepository(db *sql.DB) *RuleRepository {
	return &RuleRepository{db: db}
}

func (r *RuleRepository) GetAll() ([]models.Rule, error) {
	query := `SELECT r.id, r.kode_rule, r.pertanyaan_id, r.operator, r.nilai_kondisi, 
			  r.jurusan_id, r.cf_rule, r.is_active, r.created_at, r.updated_at,
			  p.kode, p.teks, j.kode, j.nama
			  FROM rules r
			  JOIN pertanyaan p ON r.pertanyaan_id = p.id
			  JOIN jurusan j ON r.jurusan_id = j.id
			  ORDER BY r.kode_rule`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.Rule
	for rows.Next() {
		var rule models.Rule
		err := rows.Scan(&rule.ID, &rule.KodeRule, &rule.PertanyaanID, &rule.Operator, &rule.NilaiKondisi,
			&rule.JurusanID, &rule.CFRule, &rule.IsActive, &rule.CreatedAt, &rule.UpdatedAt,
			&rule.PertanyaanKode, &rule.PertanyaanTeks, &rule.JurusanKode, &rule.JurusanNama)
		if err != nil {
			return nil, err
		}
		list = append(list, rule)
	}

	return list, nil
}

func (r *RuleRepository) GetActive() ([]models.Rule, error) {
	query := `SELECT r.id, r.kode_rule, r.pertanyaan_id, r.operator, r.nilai_kondisi, 
			  r.jurusan_id, r.cf_rule, r.is_active, r.created_at, r.updated_at,
			  p.kode, p.teks, j.kode, j.nama
			  FROM rules r
			  JOIN pertanyaan p ON r.pertanyaan_id = p.id
			  JOIN jurusan j ON r.jurusan_id = j.id
			  WHERE r.is_active = TRUE AND p.is_active = TRUE AND j.is_active = TRUE
			  ORDER BY r.kode_rule`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.Rule
	for rows.Next() {
		var rule models.Rule
		err := rows.Scan(&rule.ID, &rule.KodeRule, &rule.PertanyaanID, &rule.Operator, &rule.NilaiKondisi,
			&rule.JurusanID, &rule.CFRule, &rule.IsActive, &rule.CreatedAt, &rule.UpdatedAt,
			&rule.PertanyaanKode, &rule.PertanyaanTeks, &rule.JurusanKode, &rule.JurusanNama)
		if err != nil {
			return nil, err
		}
		list = append(list, rule)
	}

	return list, nil
}

func (r *RuleRepository) GetByID(id int) (*models.Rule, error) {
	query := `SELECT r.id, r.kode_rule, r.pertanyaan_id, r.operator, r.nilai_kondisi, 
			  r.jurusan_id, r.cf_rule, r.is_active, r.created_at, r.updated_at,
			  p.kode, p.teks, j.kode, j.nama
			  FROM rules r
			  JOIN pertanyaan p ON r.pertanyaan_id = p.id
			  JOIN jurusan j ON r.jurusan_id = j.id
			  WHERE r.id = ?`

	var rule models.Rule
	err := r.db.QueryRow(query, id).Scan(&rule.ID, &rule.KodeRule, &rule.PertanyaanID, &rule.Operator, &rule.NilaiKondisi,
		&rule.JurusanID, &rule.CFRule, &rule.IsActive, &rule.CreatedAt, &rule.UpdatedAt,
		&rule.PertanyaanKode, &rule.PertanyaanTeks, &rule.JurusanKode, &rule.JurusanNama)
	if err != nil {
		return nil, err
	}

	return &rule, nil
}

func (r *RuleRepository) Create(req models.CreateRuleRequest) (*models.Rule, error) {
	query := `INSERT INTO rules (kode_rule, pertanyaan_id, operator, nilai_kondisi, jurusan_id, cf_rule) 
			  VALUES (?, ?, ?, ?, ?, ?)`

	result, err := r.db.Exec(query, req.KodeRule, req.PertanyaanID, req.Operator, req.NilaiKondisi, req.JurusanID, req.CFRule)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return r.GetByID(int(id))
}

func (r *RuleRepository) Update(id int, req models.UpdateRuleRequest) (*models.Rule, error) {
	query := `UPDATE rules SET kode_rule = COALESCE(NULLIF(?, ''), kode_rule), 
			  operator = COALESCE(NULLIF(?, ''), operator)`
	args := []interface{}{req.KodeRule, req.Operator}

	if req.PertanyaanID != nil {
		query += ", pertanyaan_id = ?"
		args = append(args, *req.PertanyaanID)
	}

	if req.NilaiKondisi != nil {
		query += ", nilai_kondisi = ?"
		args = append(args, *req.NilaiKondisi)
	}

	if req.JurusanID != nil {
		query += ", jurusan_id = ?"
		args = append(args, *req.JurusanID)
	}

	if req.CFRule != nil {
		query += ", cf_rule = ?"
		args = append(args, *req.CFRule)
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

func (r *RuleRepository) Delete(id int) error {
	query := `DELETE FROM rules WHERE id = ?`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *RuleRepository) GetByJurusanID(jurusanID int) ([]models.Rule, error) {
	query := `SELECT r.id, r.kode_rule, r.pertanyaan_id, r.operator, r.nilai_kondisi, 
			  r.jurusan_id, r.cf_rule, r.is_active, r.created_at, r.updated_at,
			  p.kode, p.teks, j.kode, j.nama
			  FROM rules r
			  JOIN pertanyaan p ON r.pertanyaan_id = p.id
			  JOIN jurusan j ON r.jurusan_id = j.id
			  WHERE r.jurusan_id = ? AND r.is_active = TRUE
			  ORDER BY r.kode_rule`

	rows, err := r.db.Query(query, jurusanID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.Rule
	for rows.Next() {
		var rule models.Rule
		err := rows.Scan(&rule.ID, &rule.KodeRule, &rule.PertanyaanID, &rule.Operator, &rule.NilaiKondisi,
			&rule.JurusanID, &rule.CFRule, &rule.IsActive, &rule.CreatedAt, &rule.UpdatedAt,
			&rule.PertanyaanKode, &rule.PertanyaanTeks, &rule.JurusanKode, &rule.JurusanNama)
		if err != nil {
			return nil, err
		}
		list = append(list, rule)
	}

	return list, nil
}
