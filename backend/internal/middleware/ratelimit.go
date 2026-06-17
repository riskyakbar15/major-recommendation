package middleware

import (
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// rateLimiter implements a fixed-window, per-IP request limiter.
// It is intentionally dependency-free and suitable for protecting
// sensitive endpoints (e.g. login) against brute-force attempts.
type rateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
	limit    int
	window   time.Duration
}

type visitor struct {
	count    int
	expireAt time.Time
}

// NewRateLimiter returns a Gin middleware that allows at most `limit`
// requests per client IP within the given `window`. A background
// goroutine periodically evicts stale entries to bound memory usage.
func NewRateLimiter(limit int, window time.Duration) gin.HandlerFunc {
	rl := &rateLimiter{
		visitors: make(map[string]*visitor),
		limit:    limit,
		window:   window,
	}
	go rl.cleanup()
	return rl.middleware
}

func (rl *rateLimiter) middleware(c *gin.Context) {
	ip := c.ClientIP()
	now := time.Now()

	rl.mu.Lock()
	v, exists := rl.visitors[ip]
	if !exists || now.After(v.expireAt) {
		rl.visitors[ip] = &visitor{count: 1, expireAt: now.Add(rl.window)}
		rl.mu.Unlock()
		c.Next()
		return
	}

	if v.count >= rl.limit {
		retryAfter := int(time.Until(v.expireAt).Seconds()) + 1
		rl.mu.Unlock()
		c.Header("Retry-After", strconv.Itoa(retryAfter))
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "Terlalu banyak percobaan. Silakan coba lagi nanti."})
		c.Abort()
		return
	}

	v.count++
	rl.mu.Unlock()
	c.Next()
}

func (rl *rateLimiter) cleanup() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		now := time.Now()
		rl.mu.Lock()
		for ip, v := range rl.visitors {
			if now.After(v.expireAt) {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}
