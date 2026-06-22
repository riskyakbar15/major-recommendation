package repository

import (
	"database/sql"
	"errors"
	"testing"
	"time"

	"sistem-pakar-jurusan/internal/models"

	"github.com/DATA-DOG/go-sqlmock"
)

func ruleRepoColumns() []string {
	return []string{
		"id", "kode_rule", "pertanyaan_id", "operator", "nilai_kondisi",
		"jurusan_id", "cf_rule", "is_active", "created_at", "updated_at",
		"pertanyaan_kode", "pertanyaan_teks", "jurusan_kode", "jurusan_nama",
	}
}

func TestRuleRepository_GetAll(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewRuleRepository(db)

	now := time.Now()
	rows := sqlmock.NewRows(ruleRepoColumns()).
		AddRow(1, "R1", 2, ">=", 0.5, 3, 0.8, true, now, now, "P2", "Suka matematika?", "TI", "Teknik Informatika")
	mock.ExpectQuery("FROM rules").WillReturnRows(rows)

	list, err := repo.GetAll()
	if err != nil {
		t.Fatalf("GetAll: %v", err)
	}
	if len(list) != 1 || list[0].KodeRule != "R1" || list[0].JurusanNama != "Teknik Informatika" {
		t.Errorf("unexpected list: %+v", list)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestRuleRepository_GetActive(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewRuleRepository(db)

	now := time.Now()
	rows := sqlmock.NewRows(ruleRepoColumns()).
		AddRow(1, "R1", 2, ">=", 0.5, 3, 0.8, true, now, now, "P2", "Suka matematika?", "TI", "Teknik Informatika")
	mock.ExpectQuery("WHERE r.is_active = TRUE").WillReturnRows(rows)

	list, err := repo.GetActive()
	if err != nil {
		t.Fatalf("GetActive: %v", err)
	}
	if len(list) != 1 || !list[0].IsActive {
		t.Errorf("unexpected list: %+v", list)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestRuleRepository_GetByID_NotFound(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewRuleRepository(db)

	mock.ExpectQuery("WHERE r.id").
		WithArgs(99).
		WillReturnError(sql.ErrNoRows)

	if _, err := repo.GetByID(99); !errors.Is(err, sql.ErrNoRows) {
		t.Fatalf("expected sql.ErrNoRows, got %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestRuleRepository_Create(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewRuleRepository(db)

	now := time.Now()
	mock.ExpectExec("INSERT INTO rules").
		WillReturnResult(sqlmock.NewResult(7, 1))
	mock.ExpectQuery("WHERE r.id").
		WithArgs(7).
		WillReturnRows(sqlmock.NewRows(ruleRepoColumns()).
			AddRow(7, "R1", 2, ">=", 0.5, 3, 0.8, true, now, now, "P2", "Suka matematika?", "TI", "Teknik Informatika"))

	rule, err := repo.Create(models.CreateRuleRequest{
		KodeRule: "R1", PertanyaanID: 2, Operator: ">=", NilaiKondisi: 0.5, JurusanID: 3, CFRule: 0.8,
	})
	if err != nil {
		t.Fatalf("Create: %v", err)
	}
	if rule.ID != 7 || rule.KodeRule != "R1" {
		t.Errorf("unexpected rule: %+v", rule)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestRuleRepository_Update(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewRuleRepository(db)

	now := time.Now()
	cf := 0.9
	active := false
	mock.ExpectExec("UPDATE rules SET").
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectQuery("WHERE r.id").
		WithArgs(7).
		WillReturnRows(sqlmock.NewRows(ruleRepoColumns()).
			AddRow(7, "R1", 2, ">=", 0.5, 3, 0.9, false, now, now, "P2", "Suka matematika?", "TI", "Teknik Informatika"))

	rule, err := repo.Update(7, models.UpdateRuleRequest{CFRule: &cf, IsActive: &active})
	if err != nil {
		t.Fatalf("Update: %v", err)
	}
	if rule.ID != 7 || rule.CFRule != 0.9 {
		t.Errorf("unexpected rule: %+v", rule)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestRuleRepository_Delete(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewRuleRepository(db)

	mock.ExpectExec("DELETE FROM rules WHERE id").
		WithArgs(7).
		WillReturnResult(sqlmock.NewResult(0, 1))

	if err := repo.Delete(7); err != nil {
		t.Fatalf("Delete: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestRuleRepository_GetByJurusanID(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewRuleRepository(db)

	now := time.Now()
	rows := sqlmock.NewRows(ruleRepoColumns()).
		AddRow(1, "R1", 2, ">=", 0.5, 3, 0.8, true, now, now, "P2", "Suka matematika?", "TI", "Teknik Informatika")
	mock.ExpectQuery("WHERE r.jurusan_id").
		WithArgs(3).
		WillReturnRows(rows)

	list, err := repo.GetByJurusanID(3)
	if err != nil {
		t.Fatalf("GetByJurusanID: %v", err)
	}
	if len(list) != 1 || list[0].JurusanID != 3 {
		t.Errorf("unexpected list: %+v", list)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}
