package services

import (
	"crypto/sha256"
	"encoding/hex"
	"testing"
)

func TestHashRefreshToken_Deterministic(t *testing.T) {
	if hashRefreshToken("some-token") != hashRefreshToken("some-token") {
		t.Fatal("expected the same input to hash to the same output")
	}
}

func TestHashRefreshToken_Distinct(t *testing.T) {
	if hashRefreshToken("token-a") == hashRefreshToken("token-b") {
		t.Fatal("expected different inputs to hash to different outputs")
	}
}

func TestHashRefreshToken_MatchesSHA256(t *testing.T) {
	sum := sha256.Sum256([]byte("token"))
	want := hex.EncodeToString(sum[:])

	got := hashRefreshToken("token")
	if got != want {
		t.Errorf("hashRefreshToken = %q, want %q", got, want)
	}
	// SHA-256 hex digest is always 64 characters.
	if len(got) != 64 {
		t.Errorf("hash length = %d, want 64", len(got))
	}
}
