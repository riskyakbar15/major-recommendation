package services

import (
	"errors"
	"time"

	"sistem-pakar-jurusan/internal/auth"
	"sistem-pakar-jurusan/internal/config"
	"sistem-pakar-jurusan/internal/models"
	"sistem-pakar-jurusan/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid username or password")
	ErrInvalidRefreshToken = errors.New("invalid or expired refresh token")
)

type AuthService struct {
	adminRepo  *repository.AdminRepository
	jwtManager *auth.JWTManager
}

func NewAuthService(adminRepo *repository.AdminRepository, cfg *config.Config) *AuthService {
	jwtManager := auth.NewJWTManager(cfg.JWTSecret, cfg.JWTAccessExpire, cfg.JWTRefreshExpire)
	return &AuthService{
		adminRepo:  adminRepo,
		jwtManager: jwtManager,
	}
}

func (s *AuthService) Login(req models.LoginRequest) (*models.LoginResponse, error) {
	// Get admin by username
	admin, err := s.adminRepo.GetByUsername(req.Username)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	// Generate access token
	accessToken, expiresAt, err := s.jwtManager.GenerateAccessToken(admin.ID, admin.Username)
	if err != nil {
		return nil, err
	}

	// Generate refresh token
	refreshToken, refreshExp, err := s.jwtManager.GenerateRefreshToken()
	if err != nil {
		return nil, err
	}

	// Save refresh token to database
	if err := s.adminRepo.UpdateRefreshToken(admin.ID, refreshToken, refreshExp); err != nil {
		return nil, err
	}

	// Update last login
	if err := s.adminRepo.UpdateLastLogin(admin.ID); err != nil {
		return nil, err
	}

	return &models.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(time.Until(expiresAt).Seconds()),
		Admin:        *admin,
	}, nil
}

func (s *AuthService) RefreshToken(req models.RefreshTokenRequest) (*models.RefreshTokenResponse, error) {
	// Get admin by refresh token
	admin, err := s.adminRepo.GetByRefreshToken(req.RefreshToken)
	if err != nil {
		return nil, ErrInvalidRefreshToken
	}

	// Generate new access token
	accessToken, expiresAt, err := s.jwtManager.GenerateAccessToken(admin.ID, admin.Username)
	if err != nil {
		return nil, err
	}

	return &models.RefreshTokenResponse{
		AccessToken: accessToken,
		ExpiresIn:   int64(time.Until(expiresAt).Seconds()),
	}, nil
}

func (s *AuthService) Logout(adminID int) error {
	return s.adminRepo.ClearRefreshToken(adminID)
}

func (s *AuthService) GetAdminByID(id int) (*models.Admin, error) {
	return s.adminRepo.GetByID(id)
}
