package models

import "time"

type Admin struct {
	ID              int        `json:"id"`
	Username        string     `json:"username"`
	PasswordHash    string     `json:"-"`
	Nama            string     `json:"nama"`
	RefreshToken    *string    `json:"-"`
	RefreshTokenExp *time.Time `json:"-"`
	LastLogin       *time.Time `json:"last_login"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
	Admin        Admin  `json:"admin"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type RefreshTokenResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int64  `json:"expires_in"`
}
