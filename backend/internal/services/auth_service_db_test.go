package services

import (
	"database/sql"
	"errors"
	"testing"
	"time"

	"sistem-pakar-jurusan/internal/config"
	"sistem-pakar-jurusan/internal/models"
	"sistem-pakar-jurusan/internal/repository"

	"github.com/DATA-DOG/go-sqlmock"
	"golang.org/x/crypto/bcrypt"
)

func newAuthServiceMock(t *testing.T) (*AuthService, sqlmock.Sqlmock, func()) {
	t.Helper()
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock.New: %v", err)
	}
	cfg := &config.Config{
		JWTSecret:        "test-secret",
		JWTAccessExpire:  time.Hour,
		JWTRefreshExpire: 24 * time.Hour,
	}
	svc := NewAuthService(repository.NewAdminRepository(db), cfg)
	return svc, mock, func() { _ = db.Close() }
}

func bcryptHash(t *testing.T, password string) string {
	t.Helper()
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.MinCost)
	if err != nil {
		t.Fatalf("bcrypt: %v", err)
	}
	return string(hash)
}

func adminRow(t *testing.T, id int, username, password string) *sqlmock.Rows {
	t.Helper()
	now := time.Now()
	cols := []string{
		"id", "username", "password_hash", "nama",
		"refresh_token", "refresh_token_exp", "last_login",
		"created_at", "updated_at",
	}
	return sqlmock.NewRows(cols).
		AddRow(id, username, bcryptHash(t, password), "Administrator", nil, nil, nil, now, now)
}

func TestAuthService_Login_Success(t *testing.T) {
	svc, mock, done := newAuthServiceMock(t)
	defer done()

	mock.ExpectQuery("FROM admin WHERE username").
		WithArgs("admin").
		WillReturnRows(adminRow(t, 1, "admin", "secret123"))
	mock.ExpectExec("UPDATE admin SET refresh_token").
		WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), 1).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec("UPDATE admin SET last_login").
		WithArgs(1).
		WillReturnResult(sqlmock.NewResult(0, 1))

	resp, err := svc.Login(models.LoginRequest{Username: "admin", Password: "secret123"})
	if err != nil {
		t.Fatalf("Login returned error: %v", err)
	}
	if resp.AccessToken == "" || resp.RefreshToken == "" {
		t.Error("expected non-empty access and refresh tokens")
	}
	if resp.Admin.ID != 1 {
		t.Errorf("Admin.ID = %d, want 1", resp.Admin.ID)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestAuthService_Login_WrongPassword(t *testing.T) {
	svc, mock, done := newAuthServiceMock(t)
	defer done()

	mock.ExpectQuery("FROM admin WHERE username").
		WithArgs("admin").
		WillReturnRows(adminRow(t, 1, "admin", "secret123"))

	_, err := svc.Login(models.LoginRequest{Username: "admin", Password: "wrong"})
	if !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("expected ErrInvalidCredentials, got %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestAuthService_Login_UserNotFound(t *testing.T) {
	svc, mock, done := newAuthServiceMock(t)
	defer done()

	mock.ExpectQuery("FROM admin WHERE username").
		WithArgs("ghost").
		WillReturnError(sql.ErrNoRows)

	_, err := svc.Login(models.LoginRequest{Username: "ghost", Password: "secret123"})
	if !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("expected ErrInvalidCredentials, got %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestAuthService_RefreshToken_Success(t *testing.T) {
	svc, mock, done := newAuthServiceMock(t)
	defer done()

	// The service looks up the admin by the SHA-256 hash of the supplied token.
	mock.ExpectQuery("WHERE refresh_token").
		WithArgs(hashRefreshToken("raw-refresh-token")).
		WillReturnRows(adminRow(t, 1, "admin", "secret123"))

	resp, err := svc.RefreshToken(models.RefreshTokenRequest{RefreshToken: "raw-refresh-token"})
	if err != nil {
		t.Fatalf("RefreshToken returned error: %v", err)
	}
	if resp.AccessToken == "" {
		t.Error("expected non-empty access token")
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestAuthService_RefreshToken_Invalid(t *testing.T) {
	svc, mock, done := newAuthServiceMock(t)
	defer done()

	mock.ExpectQuery("WHERE refresh_token").
		WithArgs(hashRefreshToken("bad-token")).
		WillReturnError(sql.ErrNoRows)

	_, err := svc.RefreshToken(models.RefreshTokenRequest{RefreshToken: "bad-token"})
	if !errors.Is(err, ErrInvalidRefreshToken) {
		t.Fatalf("expected ErrInvalidRefreshToken, got %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestAuthService_Logout(t *testing.T) {
	svc, mock, done := newAuthServiceMock(t)
	defer done()

	mock.ExpectExec("UPDATE admin SET refresh_token = NULL").
		WithArgs(9).
		WillReturnResult(sqlmock.NewResult(0, 1))

	if err := svc.Logout(9); err != nil {
		t.Fatalf("Logout returned error: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}
