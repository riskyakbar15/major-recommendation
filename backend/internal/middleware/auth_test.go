package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"sistem-pakar-jurusan/internal/auth"

	"github.com/gin-gonic/gin"
)

const testSecret = "unit-test-secret"

func makeToken(t *testing.T, secret string, accessExpiry time.Duration) string {
	t.Helper()
	m := auth.NewJWTManager(secret, accessExpiry, time.Hour)
	token, _, err := m.GenerateAccessToken(7, "tester")
	if err != nil {
		t.Fatalf("GenerateAccessToken returned error: %v", err)
	}
	return token
}

func protectedEngine(secret string) *gin.Engine {
	r := gin.New()
	_ = r.SetTrustedProxies(nil)
	r.GET("/p", JWTAuth(secret), func(c *gin.Context) {
		id, _ := c.Get("admin_id")
		c.JSON(http.StatusOK, gin.H{"admin_id": id})
	})
	return r
}

func TestJWTAuth_NoToken(t *testing.T) {
	r := protectedEngine(testSecret)
	req := httptest.NewRequest(http.MethodGet, "/p", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("code = %d, want 401", w.Code)
	}
}

func TestJWTAuth_ValidHeaderToken(t *testing.T) {
	r := protectedEngine(testSecret)
	req := httptest.NewRequest(http.MethodGet, "/p", nil)
	req.Header.Set("Authorization", "Bearer "+makeToken(t, testSecret, time.Hour))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("code = %d, want 200", w.Code)
	}
}

func TestJWTAuth_ValidCookieToken(t *testing.T) {
	r := protectedEngine(testSecret)
	req := httptest.NewRequest(http.MethodGet, "/p", nil)
	req.AddCookie(&http.Cookie{Name: "access_token", Value: makeToken(t, testSecret, time.Hour)})
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("code = %d, want 200", w.Code)
	}
}

func TestJWTAuth_InvalidToken(t *testing.T) {
	r := protectedEngine(testSecret)
	req := httptest.NewRequest(http.MethodGet, "/p", nil)
	req.Header.Set("Authorization", "Bearer garbage.token.value")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("code = %d, want 401", w.Code)
	}
}

func TestJWTAuth_ExpiredToken(t *testing.T) {
	r := protectedEngine(testSecret)
	req := httptest.NewRequest(http.MethodGet, "/p", nil)
	req.Header.Set("Authorization", "Bearer "+makeToken(t, testSecret, -time.Minute))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("code = %d, want 401", w.Code)
	}
}

func newContextWithRequest(req *http.Request) *gin.Context {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	c.Request = req
	return c
}

func TestExtractToken_CookieTakesPrecedence(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.AddCookie(&http.Cookie{Name: "access_token", Value: "cookie-token"})
	req.Header.Set("Authorization", "Bearer header-token")

	if got := extractToken(newContextWithRequest(req)); got != "cookie-token" {
		t.Fatalf("extractToken = %q, want %q", got, "cookie-token")
	}
}

func TestExtractToken_HeaderFallback(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Authorization", "Bearer header-token")

	if got := extractToken(newContextWithRequest(req)); got != "header-token" {
		t.Fatalf("extractToken = %q, want %q", got, "header-token")
	}
}

func TestExtractToken_MalformedHeader(t *testing.T) {
	cases := []string{"header-token", "Basic abc", "Bearer", "Bearer a b"}
	for _, h := range cases {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("Authorization", h)
		if got := extractToken(newContextWithRequest(req)); got != "" {
			t.Errorf("extractToken(%q) = %q, want empty", h, got)
		}
	}
}

func TestExtractToken_None(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	if got := extractToken(newContextWithRequest(req)); got != "" {
		t.Fatalf("extractToken = %q, want empty", got)
	}
}
