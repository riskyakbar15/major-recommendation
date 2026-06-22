package repository

import (
	"database/sql"
	"errors"
	"testing"
	"time"

	"sistem-pakar-jurusan/internal/models"

	"github.com/DATA-DOG/go-sqlmock"
)

func pertanyaanColumns() []string {
	return []string{"id", "kode", "teks", "kategori", "sub_kategori", "urutan", "is_active", "created_at", "updated_at"}
}

func TestPertanyaanRepository_GetAll(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewPertanyaanRepository(db)

	now := time.Now()
	rows := sqlmock.NewRows(pertanyaanColumns()).
		AddRow(1, "P1", "Suka matematika?", "minat", "sains", 1, true, now, now).
		AddRow(2, "P2", "Suka menggambar?", "bakat", "seni", 2, true, now, now)
	mock.ExpectQuery("FROM pertanyaan ORDER BY urutan").WillReturnRows(rows)

	list, err := repo.GetAll()
	if err != nil {
		t.Fatalf("GetAll: %v", err)
	}
	if len(list) != 2 || list[0].Kode != "P1" || list[1].SubKategori != "seni" {
		t.Errorf("unexpected list: %+v", list)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestPertanyaanRepository_GetActive(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewPertanyaanRepository(db)

	now := time.Now()
	rows := sqlmock.NewRows(pertanyaanColumns()).
		AddRow(1, "P1", "Suka matematika?", "minat", "", 1, true, now, now)
	mock.ExpectQuery("FROM pertanyaan WHERE is_active = TRUE").WillReturnRows(rows)

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

func TestPertanyaanRepository_GetByID_NotFound(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewPertanyaanRepository(db)

	mock.ExpectQuery("FROM pertanyaan WHERE id").
		WithArgs(99).
		WillReturnError(sql.ErrNoRows)

	if _, err := repo.GetByID(99); !errors.Is(err, sql.ErrNoRows) {
		t.Fatalf("expected sql.ErrNoRows, got %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestPertanyaanRepository_Create(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewPertanyaanRepository(db)

	now := time.Now()
	mock.ExpectExec("INSERT INTO pertanyaan").
		WillReturnResult(sqlmock.NewResult(5, 1))
	mock.ExpectQuery("FROM pertanyaan WHERE id").
		WithArgs(5).
		WillReturnRows(sqlmock.NewRows(pertanyaanColumns()).
			AddRow(5, "P1", "Suka matematika?", "minat", "sains", 1, true, now, now))

	p, err := repo.Create(models.CreatePertanyaanRequest{
		Kode: "P1", Teks: "Suka matematika?", Kategori: "minat", SubKategori: "sains", Urutan: 1,
	})
	if err != nil {
		t.Fatalf("Create: %v", err)
	}
	if p.ID != 5 || p.Kode != "P1" {
		t.Errorf("unexpected pertanyaan: %+v", p)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestPertanyaanRepository_Update(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewPertanyaanRepository(db)

	now := time.Now()
	urutan := 3
	active := false
	mock.ExpectExec("UPDATE pertanyaan SET").
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectQuery("FROM pertanyaan WHERE id").
		WithArgs(8).
		WillReturnRows(sqlmock.NewRows(pertanyaanColumns()).
			AddRow(8, "P1", "Teks baru", "minat", "sains", 3, false, now, now))

	p, err := repo.Update(8, models.UpdatePertanyaanRequest{Teks: "Teks baru", Urutan: &urutan, IsActive: &active})
	if err != nil {
		t.Fatalf("Update: %v", err)
	}
	if p.ID != 8 || p.Teks != "Teks baru" {
		t.Errorf("unexpected pertanyaan: %+v", p)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestPertanyaanRepository_Delete(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewPertanyaanRepository(db)

	mock.ExpectExec("DELETE FROM pertanyaan WHERE id").
		WithArgs(4).
		WillReturnResult(sqlmock.NewResult(0, 1))

	if err := repo.Delete(4); err != nil {
		t.Fatalf("Delete: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}
