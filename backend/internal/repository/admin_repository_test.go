package repository

import (
	"database/sql"
	"errors"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
)

func newAdminRepoMock(t *testing.T) (*AdminRepository, sqlmock.Sqlmock, func()) {
	t.Helper()
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock.New: %v", err)
	}
	return NewAdminRepository(db), mock, func() { _ = db.Close() }
}

func adminColumns() []string {
	return []string{
		"id", "username", "password_hash", "nama",
		"refresh_token", "refresh_token_exp", "last_login",
		"created_at", "updated_at",
	}
}

func TestAdminRepository_GetByUsername(t *testing.T) {
	repo, mock, done := newAdminRepoMock(t)
	defer done()

	now := time.Now()
	rows := sqlmock.NewRows(adminColumns()).
		AddRow(1, "admin", "bcrypt-hash", "Administrator", nil, nil, nil, now, now)
	mock.ExpectQuery("FROM admin WHERE username").
		WithArgs("admin").
		WillReturnRows(rows)

	a, err := repo.GetByUsername("admin")
	if err != nil {
		t.Fatalf("GetByUsername: %v", err)
	}
	if a.ID != 1 || a.Username != "admin" || a.PasswordHash != "bcrypt-hash" || a.Nama != "Administrator" {
		t.Errorf("unexpected admin: %+v", a)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestAdminRepository_GetByUsername_NotFound(t *testing.T) {
	repo, mock, done := newAdminRepoMock(t)
	defer done()

	mock.ExpectQuery("FROM admin WHERE username").
		WithArgs("ghost").
		WillReturnError(sql.ErrNoRows)

	if _, err := repo.GetByUsername("ghost"); !errors.Is(err, sql.ErrNoRows) {
		t.Fatalf("expected sql.ErrNoRows, got %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestAdminRepository_GetByID(t *testing.T) {
	repo, mock, done := newAdminRepoMock(t)
	defer done()

	now := time.Now()
	rows := sqlmock.NewRows(adminColumns()).
		AddRow(5, "user5", "hash5", "User Five", nil, nil, nil, now, now)
	mock.ExpectQuery("FROM admin WHERE id").
		WithArgs(5).
		WillReturnRows(rows)

	a, err := repo.GetByID(5)
	if err != nil {
		t.Fatalf("GetByID: %v", err)
	}
	if a.ID != 5 || a.Username != "user5" {
		t.Errorf("unexpected admin: %+v", a)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestAdminRepository_GetByRefreshToken(t *testing.T) {
	repo, mock, done := newAdminRepoMock(t)
	defer done()

	now := time.Now()
	exp := now.Add(time.Hour)
	token := "stored-hash"
	rows := sqlmock.NewRows(adminColumns()).
		AddRow(2, "admin", "hash", "Admin", token, exp, now, now, now)
	mock.ExpectQuery("WHERE refresh_token").
		WithArgs("stored-hash").
		WillReturnRows(rows)

	a, err := repo.GetByRefreshToken("stored-hash")
	if err != nil {
		t.Fatalf("GetByRefreshToken: %v", err)
	}
	if a.ID != 2 || a.RefreshToken == nil || *a.RefreshToken != "stored-hash" {
		t.Errorf("unexpected admin: %+v", a)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestAdminRepository_UpdateRefreshToken(t *testing.T) {
	repo, mock, done := newAdminRepoMock(t)
	defer done()

	exp := time.Now().Add(time.Hour)
	mock.ExpectExec("UPDATE admin SET refresh_token").
		WithArgs("token-hash", exp, 1).
		WillReturnResult(sqlmock.NewResult(0, 1))

	if err := repo.UpdateRefreshToken(1, "token-hash", exp); err != nil {
		t.Fatalf("UpdateRefreshToken: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestAdminRepository_ClearRefreshToken(t *testing.T) {
	repo, mock, done := newAdminRepoMock(t)
	defer done()

	mock.ExpectExec("UPDATE admin SET refresh_token = NULL").
		WithArgs(3).
		WillReturnResult(sqlmock.NewResult(0, 1))

	if err := repo.ClearRefreshToken(3); err != nil {
		t.Fatalf("ClearRefreshToken: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestAdminRepository_UpdateLastLogin(t *testing.T) {
	repo, mock, done := newAdminRepoMock(t)
	defer done()

	mock.ExpectExec("UPDATE admin SET last_login").
		WithArgs(4).
		WillReturnResult(sqlmock.NewResult(0, 1))

	if err := repo.UpdateLastLogin(4); err != nil {
		t.Fatalf("UpdateLastLogin: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}
