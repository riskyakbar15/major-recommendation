package auth

import (
	"encoding/hex"
	"errors"
	"testing"
	"time"
)

func TestGenerateAndValidateAccessToken(t *testing.T) {
	m := NewJWTManager("test-secret", time.Hour, 24*time.Hour)

	token, expiresAt, err := m.GenerateAccessToken(42, "admin")
	if err != nil {
		t.Fatalf("GenerateAccessToken returned error: %v", err)
	}
	if token == "" {
		t.Fatal("expected non-empty token")
	}
	if !expiresAt.After(time.Now()) {
		t.Fatalf("expected expiry in the future, got %v", expiresAt)
	}

	claims, err := m.ValidateAccessToken(token)
	if err != nil {
		t.Fatalf("ValidateAccessToken returned error: %v", err)
	}
	if claims.AdminID != 42 {
		t.Errorf("AdminID = %d, want 42", claims.AdminID)
	}
	if claims.Username != "admin" {
		t.Errorf("Username = %q, want %q", claims.Username, "admin")
	}
	if claims.Issuer != "sistem-pakar-jurusan" {
		t.Errorf("Issuer = %q, want %q", claims.Issuer, "sistem-pakar-jurusan")
	}
}

func TestValidateAccessToken_Expired(t *testing.T) {
	m := NewJWTManager("test-secret", -time.Minute, time.Hour)

	token, _, err := m.GenerateAccessToken(1, "a")
	if err != nil {
		t.Fatalf("GenerateAccessToken returned error: %v", err)
	}

	_, err = m.ValidateAccessToken(token)
	if !errors.Is(err, ErrExpiredToken) {
		t.Fatalf("expected ErrExpiredToken, got %v", err)
	}
}

func TestValidateAccessToken_WrongSecret(t *testing.T) {
	signer := NewJWTManager("secret-a", time.Hour, time.Hour)
	token, _, err := signer.GenerateAccessToken(1, "a")
	if err != nil {
		t.Fatalf("GenerateAccessToken returned error: %v", err)
	}

	verifier := NewJWTManager("secret-b", time.Hour, time.Hour)
	_, err = verifier.ValidateAccessToken(token)
	if !errors.Is(err, ErrInvalidToken) {
		t.Fatalf("expected ErrInvalidToken, got %v", err)
	}
}

func TestValidateAccessToken_Garbage(t *testing.T) {
	m := NewJWTManager("test-secret", time.Hour, time.Hour)

	_, err := m.ValidateAccessToken("not-a-jwt")
	if !errors.Is(err, ErrInvalidToken) {
		t.Fatalf("expected ErrInvalidToken, got %v", err)
	}
}

func TestGenerateRefreshToken(t *testing.T) {
	m := NewJWTManager("test-secret", time.Hour, 48*time.Hour)

	token, expiresAt, err := m.GenerateRefreshToken()
	if err != nil {
		t.Fatalf("GenerateRefreshToken returned error: %v", err)
	}
	// 32 random bytes hex-encoded => 64 hex characters.
	if len(token) != 64 {
		t.Errorf("token length = %d, want 64", len(token))
	}
	if _, err := hex.DecodeString(token); err != nil {
		t.Errorf("token is not valid hex: %v", err)
	}
	if !expiresAt.After(time.Now()) {
		t.Errorf("expected expiry in the future, got %v", expiresAt)
	}

	other, _, err := m.GenerateRefreshToken()
	if err != nil {
		t.Fatalf("GenerateRefreshToken returned error: %v", err)
	}
	if token == other {
		t.Error("expected two refresh tokens to differ")
	}
}
