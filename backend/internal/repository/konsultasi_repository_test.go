package repository

import (
	"database/sql"
	"errors"
	"testing"
	"time"

	"sistem-pakar-jurusan/internal/models"

	"github.com/DATA-DOG/go-sqlmock"
)

func konsultasiColumns() []string {
	return []string{"id", "session_id", "ip_address", "created_at"}
}

func TestKonsultasiRepository_Create(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewKonsultasiRepository(db)

	now := time.Now()
	mock.ExpectExec("INSERT INTO konsultasi").
		WithArgs("sess-1", "127.0.0.1").
		WillReturnResult(sqlmock.NewResult(11, 1))
	mock.ExpectQuery("FROM konsultasi WHERE id").
		WithArgs(11).
		WillReturnRows(sqlmock.NewRows(konsultasiColumns()).
			AddRow(11, "sess-1", "127.0.0.1", now))

	k, err := repo.Create("sess-1", "127.0.0.1")
	if err != nil {
		t.Fatalf("Create: %v", err)
	}
	if k.ID != 11 || k.SessionID != "sess-1" {
		t.Errorf("unexpected konsultasi: %+v", k)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestKonsultasiRepository_GetByID_NotFound(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewKonsultasiRepository(db)

	mock.ExpectQuery("FROM konsultasi WHERE id").
		WithArgs(99).
		WillReturnError(sql.ErrNoRows)

	if _, err := repo.GetByID(99); !errors.Is(err, sql.ErrNoRows) {
		t.Fatalf("expected sql.ErrNoRows, got %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestKonsultasiRepository_GetBySessionID(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewKonsultasiRepository(db)

	now := time.Now()
	mock.ExpectQuery("FROM konsultasi WHERE session_id").
		WithArgs("sess-1").
		WillReturnRows(sqlmock.NewRows(konsultasiColumns()).
			AddRow(11, "sess-1", "127.0.0.1", now))
	mock.ExpectQuery("FROM jawaban j").
		WithArgs(11).
		WillReturnRows(sqlmock.NewRows([]string{"id", "konsultasi_id", "pertanyaan_id", "nilai", "teks"}).
			AddRow(1, 11, 2, 0.75, "Suka matematika?"))
	mock.ExpectQuery("FROM hasil h").
		WithArgs(11).
		WillReturnRows(sqlmock.NewRows([]string{"id", "konsultasi_id", "jurusan_id", "cf_final", "ranking", "kode", "nama", "deskripsi", "kategori"}).
			AddRow(1, 11, 3, 0.82, 1, "TI", "Teknik Informatika", "desc", "SAINTEK"))

	k, err := repo.GetBySessionID("sess-1")
	if err != nil {
		t.Fatalf("GetBySessionID: %v", err)
	}
	if len(k.Jawaban) != 1 || k.Jawaban[0].PertanyaanTeks != "Suka matematika?" {
		t.Errorf("unexpected jawaban: %+v", k.Jawaban)
	}
	if len(k.Hasil) != 1 || k.Hasil[0].JurusanNama != "Teknik Informatika" {
		t.Errorf("unexpected hasil: %+v", k.Hasil)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestKonsultasiRepository_SaveJawaban(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewKonsultasiRepository(db)

	mock.ExpectExec("INSERT INTO jawaban").
		WithArgs(11, 1, 0.5).
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectExec("INSERT INTO jawaban").
		WithArgs(11, 2, 1.0).
		WillReturnResult(sqlmock.NewResult(2, 1))

	err := repo.SaveJawaban(11, []models.JawabanInput{
		{PertanyaanID: 1, Nilai: 0.5},
		{PertanyaanID: 2, Nilai: 1.0},
	})
	if err != nil {
		t.Fatalf("SaveJawaban: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestKonsultasiRepository_SaveHasil(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewKonsultasiRepository(db)

	mock.ExpectExec("INSERT INTO hasil").
		WithArgs(11, 3, 0.82, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))

	err := repo.SaveHasil(11, []models.Hasil{
		{JurusanID: 3, CFFinal: 0.82, Ranking: 1},
	})
	if err != nil {
		t.Fatalf("SaveHasil: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestKonsultasiRepository_GetAll(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewKonsultasiRepository(db)

	now := time.Now()
	mock.ExpectQuery("COUNT\\(\\*\\) FROM konsultasi").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(2))
	mock.ExpectQuery("FROM konsultasi ORDER BY created_at DESC").
		WithArgs(10, 0).
		WillReturnRows(sqlmock.NewRows(konsultasiColumns()).
			AddRow(11, "sess-1", "127.0.0.1", now).
			AddRow(12, "sess-2", "127.0.0.2", now))

	list, total, err := repo.GetAll(10, 0)
	if err != nil {
		t.Fatalf("GetAll: %v", err)
	}
	if total != 2 || len(list) != 2 {
		t.Errorf("unexpected total=%d list=%d", total, len(list))
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}
