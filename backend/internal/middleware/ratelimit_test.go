package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func newLimiterEngine(limit int, window time.Duration) *gin.Engine {
	r := gin.New()
	_ = r.SetTrustedProxies(nil)
	r.Use(NewRateLimiter(limit, window))
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})
	return r
}

func doRequest(r *gin.Engine, ip string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.RemoteAddr = ip + ":12345"
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func TestRateLimiter_AllowsUpToLimit(t *testing.T) {
	r := newLimiterEngine(3, time.Minute)

	for i := 1; i <= 3; i++ {
		if code := doRequest(r, "10.0.0.1").Code; code != http.StatusOK {
			t.Fatalf("request %d: code = %d, want 200", i, code)
		}
	}

	if code := doRequest(r, "10.0.0.1").Code; code != http.StatusTooManyRequests {
		t.Fatalf("request over limit: code = %d, want 429", code)
	}
}

func TestRateLimiter_SetsRetryAfterHeader(t *testing.T) {
	r := newLimiterEngine(1, time.Minute)

	doRequest(r, "10.0.0.2") // consume the single allowed request
	w := doRequest(r, "10.0.0.2")

	if w.Code != http.StatusTooManyRequests {
		t.Fatalf("code = %d, want 429", w.Code)
	}
	if w.Header().Get("Retry-After") == "" {
		t.Error("expected Retry-After header to be set on 429 response")
	}
}

func TestRateLimiter_IsolatesPerIP(t *testing.T) {
	r := newLimiterEngine(1, time.Minute)

	if code := doRequest(r, "10.0.0.3").Code; code != http.StatusOK {
		t.Fatalf("first IP: code = %d, want 200", code)
	}
	// A different IP must not be affected by another IP's usage.
	if code := doRequest(r, "10.0.0.4").Code; code != http.StatusOK {
		t.Fatalf("second IP: code = %d, want 200", code)
	}
}

func TestRateLimiter_WindowReset(t *testing.T) {
	r := newLimiterEngine(1, 80*time.Millisecond)

	if code := doRequest(r, "10.0.0.5").Code; code != http.StatusOK {
		t.Fatalf("first request: code = %d, want 200", code)
	}
	if code := doRequest(r, "10.0.0.5").Code; code != http.StatusTooManyRequests {
		t.Fatalf("second request: code = %d, want 429", code)
	}

	time.Sleep(120 * time.Millisecond) // allow the fixed window to elapse

	if code := doRequest(r, "10.0.0.5").Code; code != http.StatusOK {
		t.Fatalf("after window reset: code = %d, want 200", code)
	}
}
