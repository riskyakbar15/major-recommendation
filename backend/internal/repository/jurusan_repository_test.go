package repository

import (
	"database/sql"
	"errors"
	"testing"
	"time"

	"sistem-pakar-jurusan/internal/models"

	"github.com/DATA-DOG/go-sqlmock"
)

// newMockDB returns an *sql.DB backed by sqlmock plus a cleanup function.
// Shared by the repository tests in this package.
func newMockDB(t *testing.T) (*sql.DB, sqlmock.Sqlmock, func()) {
	t.Helper()
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock.New: %v", err)
	}
	return db, mock, func() { _ = db.Close() }
}

func jurusanColumns() []string {
	return []string{"id", "kode", "nama", "deskripsi", "kategori", "is_active", "created_at", "updated_at"}
}

func TestJurusanRepository_GetAll(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewJurusanRepository(db)

	now := time.Now()
	rows := sqlmock.NewRows(jurusanColumns()).
		AddRow(1, "TI", "Teknik Informatika", "desc", "SAINTEK", true, now, now).
		AddRow(2, "MJ", "Manajemen", "desc", "SOSHUM", true, now, now)
	mock.ExpectQuery("FROM jurusan ORDER BY nama").WillReturnRows(rows)

	list, err := repo.GetAll()
	if err != nil {
		t.Fatalf("GetAll: %v", err)
	}
	if len(list) != 2 || list[0].Kode != "TI" || list[1].Kategori != "SOSHUM" {
		t.Errorf("unexpected list: %+v", list)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestJurusanRepository_GetActive(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewJurusanRepository(db)

	now := time.Now()
	rows := sqlmock.NewRows(jurusanColumns()).
		AddRow(1, "TI", "Teknik Informatika", "desc", "SAINTEK", true, now, now)
	mock.ExpectQuery("FROM jurusan WHERE is_active = TRUE").WillReturnRows(rows)

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

func TestJurusanRepository_GetByID_NotFound(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewJurusanRepository(db)

	mock.ExpectQuery("FROM jurusan WHERE id").
		WithArgs(99).
		WillReturnError(sql.ErrNoRows)

	if _, err := repo.GetByID(99); !errors.Is(err, sql.ErrNoRows) {
		t.Fatalf("expected sql.ErrNoRows, got %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestJurusanRepository_Create(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewJurusanRepository(db)

	now := time.Now()
	mock.ExpectExec("INSERT INTO jurusan").
		WillReturnResult(sqlmock.NewResult(10, 1))
	mock.ExpectQuery("FROM jurusan WHERE id").
		WithArgs(10).
		WillReturnRows(sqlmock.NewRows(jurusanColumns()).
			AddRow(10, "TI", "Teknik Informatika", "desc", "SAINTEK", true, now, now))

	j, err := repo.Create(models.CreateJurusanRequest{
		Kode: "TI", Nama: "Teknik Informatika", Deskripsi: "desc", Kategori: "SAINTEK",
	})
	if err != nil {
		t.Fatalf("Create: %v", err)
	}
	if j.ID != 10 || j.Kode != "TI" {
		t.Errorf("unexpected jurusan: %+v", j)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestJurusanRepository_Update(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewJurusanRepository(db)

	now := time.Now()
	active := true
	mock.ExpectExec("UPDATE jurusan SET").
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectQuery("FROM jurusan WHERE id").
		WithArgs(3).
		WillReturnRows(sqlmock.NewRows(jurusanColumns()).
			AddRow(3, "TI", "Teknik Informatika", "desc", "SAINTEK", true, now, now))

	j, err := repo.Update(3, models.UpdateJurusanRequest{Nama: "Teknik Informatika", IsActive: &active})
	if err != nil {
		t.Fatalf("Update: %v", err)
	}
	if j.ID != 3 {
		t.Errorf("unexpected jurusan: %+v", j)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestJurusanRepository_Delete(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewJurusanRepository(db)

	mock.ExpectExec("DELETE FROM jurusan WHERE id").
		WithArgs(7).
		WillReturnResult(sqlmock.NewResult(0, 1))

	if err := repo.Delete(7); err != nil {
		t.Fatalf("Delete: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestJurusanRepository_GetByIDs(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewJurusanRepository(db)

	now := time.Now()
	rows := sqlmock.NewRows(jurusanColumns()).
		AddRow(1, "TI", "Teknik Informatika", "desc", "SAINTEK", true, now, now).
		AddRow(2, "MJ", "Manajemen", "desc", "SOSHUM", true, now, now)
	mock.ExpectQuery("FROM jurusan WHERE id IN").
		WithArgs(1, 2).
		WillReturnRows(rows)

	list, err := repo.GetByIDs([]int{1, 2})
	if err != nil {
		t.Fatalf("GetByIDs: %v", err)
	}
	if len(list) != 2 {
		t.Errorf("expected 2 rows, got %d", len(list))
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestJurusanRepository_GetByIDs_Empty(t *testing.T) {
	db, _, done := newMockDB(t)
	defer done()
	repo := NewJurusanRepository(db)

	// No query should be issued for an empty id slice.
	list, err := repo.GetByIDs(nil)
	if err != nil {
		t.Fatalf("GetByIDs: %v", err)
	}
	if len(list) != 0 {
		t.Errorf("expected empty result, got %d rows", len(list))
	}
}
