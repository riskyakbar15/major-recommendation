#Requires -Version 5.1
<#
.SYNOPSIS
    Menjalankan backend (Go) dan frontend (Next.js) sekaligus untuk pengembangan lokal.
.DESCRIPTION
    Membuka dua jendela PowerShell terpisah: satu untuk backend, satu untuk frontend.
    Tidak memerlukan Docker. Pastikan MySQL lokal sudah berjalan dan migrasi sudah dijalankan.
.EXAMPLE
    .\dev.ps1
#>

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"

# --- Validasi prasyarat ----------------------------------------------------
if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
    Write-Error "Go tidak ditemukan di PATH. Install Go terlebih dahulu: https://go.dev/dl/"
    exit 1
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm tidak ditemukan di PATH. Install Node.js terlebih dahulu: https://nodejs.org/"
    exit 1
}

# --- Cek konfigurasi env ---------------------------------------------------
$backendEnv = Join-Path $backendDir ".env"
if (-not (Test-Path $backendEnv)) {
    Write-Warning "backend/.env belum ada."
    Write-Warning "Salin dari template lalu isi JWT_SECRET:"
    Write-Warning "  Copy-Item backend/.env.example backend/.env"
}

$frontendEnv = Join-Path $frontendDir ".env.local"
if (-not (Test-Path $frontendEnv)) {
    Write-Warning "frontend/.env.local belum ada (opsional, default http://localhost:8080/api)."
}

# --- Install dependency frontend bila perlu --------------------------------
if (-not (Test-Path (Join-Path $frontendDir "node_modules"))) {
    Write-Host "Menginstall dependency frontend..." -ForegroundColor Cyan
    Push-Location $frontendDir
    npm install
    Pop-Location
}

# --- Jalankan kedua server -------------------------------------------------
Write-Host "Menjalankan backend di jendela baru..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendDir'; go run ."

Write-Host "Menjalankan frontend di jendela baru..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendDir'; npm run dev"

Write-Host ""
Write-Host "Kedua server berjalan di jendela terpisah." -ForegroundColor Yellow
Write-Host "  Backend : http://localhost:8080"
Write-Host "  Frontend: http://localhost:3000"
Write-Host "Tutup jendela masing-masing untuk menghentikan server."
