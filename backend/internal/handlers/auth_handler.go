package handlers

import (
	"net/http"

	"sistem-pakar-jurusan/internal/models"
	"sistem-pakar-jurusan/internal/services"

	"github.com/gin-gonic/gin"
)

const (
	accessTokenCookie  = "access_token"
	refreshTokenCookie = "refresh_token"
)

// CookieConfig holds the attributes applied to auth cookies.
type CookieConfig struct {
	Secure        bool
	AccessMaxAge  int // seconds
	RefreshMaxAge int // seconds
	Path          string
	Domain        string
}

type AuthHandler struct {
	service *services.AuthService
	cookie  CookieConfig
}

func NewAuthHandler(service *services.AuthService, cookie CookieConfig) *AuthHandler {
	if cookie.Path == "" {
		cookie.Path = "/"
	}
	return &AuthHandler{service: service, cookie: cookie}
}

// setAuthCookies writes the access and refresh tokens as HttpOnly cookies so
// they are never exposed to client-side JavaScript (mitigates token theft via XSS).
func (h *AuthHandler) setAuthCookies(c *gin.Context, accessToken, refreshToken string) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(accessTokenCookie, accessToken, h.cookie.AccessMaxAge, h.cookie.Path, h.cookie.Domain, h.cookie.Secure, true)
	if refreshToken != "" {
		c.SetCookie(refreshTokenCookie, refreshToken, h.cookie.RefreshMaxAge, h.cookie.Path, h.cookie.Domain, h.cookie.Secure, true)
	}
}

func (h *AuthHandler) clearAuthCookies(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(accessTokenCookie, "", -1, h.cookie.Path, h.cookie.Domain, h.cookie.Secure, true)
	c.SetCookie(refreshTokenCookie, "", -1, h.cookie.Path, h.cookie.Domain, h.cookie.Secure, true)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := h.service.Login(req)
	if err != nil {
		if err == services.ErrInvalidCredentials {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Username atau password salah"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Terjadi kesalahan server"})
		return
	}

	h.setAuthCookies(c, response.AccessToken, response.RefreshToken)

	// Tokens are delivered via HttpOnly cookies only; never in the response body.
	c.JSON(http.StatusOK, gin.H{
		"admin":      response.Admin,
		"expires_in": response.ExpiresIn,
	})
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	refreshToken, err := c.Cookie(refreshTokenCookie)
	if err != nil || refreshToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token tidak valid atau sudah expired"})
		return
	}

	response, err := h.service.RefreshToken(models.RefreshTokenRequest{RefreshToken: refreshToken})
	if err != nil {
		if err == services.ErrInvalidRefreshToken {
			h.clearAuthCookies(c)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token tidak valid atau sudah expired"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Terjadi kesalahan server"})
		return
	}

	// Rotate only the access token cookie; refresh token remains as-is.
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(accessTokenCookie, response.AccessToken, h.cookie.AccessMaxAge, h.cookie.Path, h.cookie.Domain, h.cookie.Secure, true)

	c.JSON(http.StatusOK, gin.H{"expires_in": response.ExpiresIn})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	adminID, exists := c.Get("admin_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if err := h.service.Logout(adminID.(int)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Terjadi kesalahan server"})
		return
	}

	h.clearAuthCookies(c)
	c.JSON(http.StatusOK, gin.H{"message": "Berhasil logout"})
}

func (h *AuthHandler) GetCurrentAdmin(c *gin.Context) {
	adminID, exists := c.Get("admin_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	admin, err := h.service.GetAdminByID(adminID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Terjadi kesalahan server"})
		return
	}

	c.JSON(http.StatusOK, admin)
}
