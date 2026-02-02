-- ================================================================
-- SISTEM PAKAR BIMBINGAN JURUSAN KULIAH
-- Database Schema
-- ================================================================

CREATE DATABASE IF NOT EXISTS sistem_pakar;
USE sistem_pakar;

-- ----------------------------------------------------------------
-- Tabel Jurusan (Majors)
-- ----------------------------------------------------------------
CREATE TABLE jurusan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    kode VARCHAR(10) UNIQUE NOT NULL,
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    kategori ENUM('SAINTEK', 'SOSHUM') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- Tabel Pertanyaan (Questions)
-- ----------------------------------------------------------------
CREATE TABLE pertanyaan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    kode VARCHAR(10) UNIQUE NOT NULL,
    teks TEXT NOT NULL,
    kategori ENUM('minat', 'bakat') NOT NULL,
    sub_kategori VARCHAR(50),
    urutan INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- Tabel Rules (Knowledge Base)
-- ----------------------------------------------------------------
CREATE TABLE rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    kode_rule VARCHAR(20) UNIQUE NOT NULL,
    pertanyaan_id INT NOT NULL,
    operator ENUM('>=', '<=', '=') NOT NULL DEFAULT '>=',
    nilai_kondisi DECIMAL(3,2) NOT NULL,
    jurusan_id INT NOT NULL,
    cf_rule DECIMAL(3,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pertanyaan_id) REFERENCES pertanyaan(id) ON DELETE CASCADE,
    FOREIGN KEY (jurusan_id) REFERENCES jurusan(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- Tabel Konsultasi (Consultation Sessions)
-- ----------------------------------------------------------------
CREATE TABLE konsultasi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(50) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- Tabel Jawaban (User Answers)
-- ----------------------------------------------------------------
CREATE TABLE jawaban (
    id INT PRIMARY KEY AUTO_INCREMENT,
    konsultasi_id INT NOT NULL,
    pertanyaan_id INT NOT NULL,
    nilai DECIMAL(3,2) NOT NULL,
    FOREIGN KEY (konsultasi_id) REFERENCES konsultasi(id) ON DELETE CASCADE,
    FOREIGN KEY (pertanyaan_id) REFERENCES pertanyaan(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- Tabel Hasil (Recommendation Results)
-- ----------------------------------------------------------------
CREATE TABLE hasil (
    id INT PRIMARY KEY AUTO_INCREMENT,
    konsultasi_id INT NOT NULL,
    jurusan_id INT NOT NULL,
    cf_final DECIMAL(5,4) NOT NULL,
    ranking INT NOT NULL,
    FOREIGN KEY (konsultasi_id) REFERENCES konsultasi(id) ON DELETE CASCADE,
    FOREIGN KEY (jurusan_id) REFERENCES jurusan(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- Tabel Admin (Admin Users)
-- ----------------------------------------------------------------
CREATE TABLE admin (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nama VARCHAR(100),
    refresh_token VARCHAR(255) NULL,
    refresh_token_exp TIMESTAMP NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- Indexes for better performance
-- ----------------------------------------------------------------
CREATE INDEX idx_rules_pertanyaan ON rules(pertanyaan_id);
CREATE INDEX idx_rules_jurusan ON rules(jurusan_id);
CREATE INDEX idx_jawaban_konsultasi ON jawaban(konsultasi_id);
CREATE INDEX idx_hasil_konsultasi ON hasil(konsultasi_id);
CREATE INDEX idx_konsultasi_session ON konsultasi(session_id);
CREATE INDEX idx_pertanyaan_urutan ON pertanyaan(urutan);
