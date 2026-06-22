package repository

import (
	"context"
	"errors"
	"testing"
	"time"

	"sistem-pakar-jurusan/internal/models"

	"github.com/DATA-DOG/go-sqlmock"
)

func TestKonsultasiRepository_CreateTx(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewKonsultasiRepository(db)

	mock.ExpectBegin()
	mock.ExpectExec("INSERT INTO konsultasi").
		WithArgs("sess-1", "127.0.0.1").
		WillReturnResult(sqlmock.NewResult(11, 1))
	mock.ExpectCommit()

	tx, err := db.Begin()
	if err != nil {
		t.Fatalf("Begin: %v", err)
	}
	k, err := repo.CreateTx(context.Background(), tx, "sess-1", "127.0.0.1")
	if err != nil {
		t.Fatalf("CreateTx: %v", err)
	}
	if k.ID != 11 || k.SessionID != "sess-1" || k.IPAddress != "127.0.0.1" {
		t.Errorf("unexpected konsultasi: %+v", k)
	}
	if err := tx.Commit(); err != nil {
		t.Fatalf("Commit: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestKonsultasiRepository_SaveJawabanTx(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewKonsultasiRepository(db)

	mock.ExpectBegin()
	mock.ExpectExec("INSERT INTO jawaban").
		WithArgs(11, 1, 0.5).
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectExec("INSERT INTO jawaban").
		WithArgs(11, 2, 1.0).
		WillReturnResult(sqlmock.NewResult(2, 1))
	mock.ExpectCommit()

	tx, err := db.Begin()
	if err != nil {
		t.Fatalf("Begin: %v", err)
	}
	err = repo.SaveJawabanTx(context.Background(), tx, 11, []models.JawabanInput{
		{PertanyaanID: 1, Nilai: 0.5},
		{PertanyaanID: 2, Nilai: 1.0},
	})
	if err != nil {
		t.Fatalf("SaveJawabanTx: %v", err)
	}
	if err := tx.Commit(); err != nil {
		t.Fatalf("Commit: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestKonsultasiRepository_SaveJawabanTx_Error(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewKonsultasiRepository(db)

	mock.ExpectBegin()
	mock.ExpectExec("INSERT INTO jawaban").
		WithArgs(11, 1, 0.5).
		WillReturnError(errors.New("insert failed"))
	mock.ExpectRollback()

	tx, err := db.Begin()
	if err != nil {
		t.Fatalf("Begin: %v", err)
	}
	err = repo.SaveJawabanTx(context.Background(), tx, 11, []models.JawabanInput{
		{PertanyaanID: 1, Nilai: 0.5},
	})
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	if err := tx.Rollback(); err != nil {
		t.Fatalf("Rollback: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestKonsultasiRepository_SaveHasilTx(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewKonsultasiRepository(db)

	mock.ExpectBegin()
	mock.ExpectExec("INSERT INTO hasil").
		WithArgs(11, 3, 0.82, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectCommit()

	tx, err := db.Begin()
	if err != nil {
		t.Fatalf("Begin: %v", err)
	}
	err = repo.SaveHasilTx(context.Background(), tx, 11, []models.Hasil{
		{JurusanID: 3, CFFinal: 0.82, Ranking: 1},
	})
	if err != nil {
		t.Fatalf("SaveHasilTx: %v", err)
	}
	if err := tx.Commit(); err != nil {
		t.Fatalf("Commit: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestKonsultasiRepository_GetStatistics(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewKonsultasiRepository(db)

	now := time.Now()
	// Queries are matched in declaration order.
	mock.ExpectQuery("COUNT\\(\\*\\) FROM konsultasi").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(100))
	mock.ExpectQuery("DATE\\(created_at\\) = CURDATE\\(\\)").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(5))
	mock.ExpectQuery("created_at >= DATE_SUB").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(20))
	mock.ExpectQuery("MONTH\\(created_at\\)").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(50))
	mock.ExpectQuery("FROM hasil h").
		WillReturnRows(sqlmock.NewRows([]string{"nama", "count", "avg_cf"}).
			AddRow("Teknik Informatika", 30, 0.85).
			AddRow("Manajemen", 20, 0.78))
	mock.ExpectQuery("GROUP BY DATE\\(created_at\\)").
		WillReturnRows(sqlmock.NewRows([]string{"date", "count"}).
			AddRow(now, 3).
			AddRow(now, 7))

	stats, err := repo.GetStatistics()
	if err != nil {
		t.Fatalf("GetStatistics: %v", err)
	}
	if stats["total_consultations"] != 100 {
		t.Errorf("total_consultations = %v, want 100", stats["total_consultations"])
	}
	if stats["today_consultations"] != 5 {
		t.Errorf("today_consultations = %v, want 5", stats["today_consultations"])
	}
	if stats["week_consultations"] != 20 {
		t.Errorf("week_consultations = %v, want 20", stats["week_consultations"])
	}
	if stats["month_consultations"] != 50 {
		t.Errorf("month_consultations = %v, want 50", stats["month_consultations"])
	}
	if stats["top_jurusan"] == nil || stats["daily_stats"] == nil {
		t.Errorf("expected top_jurusan and daily_stats to be populated")
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestKonsultasiRepository_GetStatistics_Error(t *testing.T) {
	db, mock, done := newMockDB(t)
	defer done()
	repo := NewKonsultasiRepository(db)

	mock.ExpectQuery("COUNT\\(\\*\\) FROM konsultasi").
		WillReturnError(errors.New("db down"))

	if _, err := repo.GetStatistics(); err == nil {
		t.Fatal("expected error, got nil")
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}
