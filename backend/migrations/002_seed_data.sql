-- ================================================================
-- SISTEM PAKAR BIMBINGAN JURUSAN KULIAH
-- Seed Data
-- ================================================================

USE sistem_pakar;

-- ----------------------------------------------------------------
-- Seed Admin (password: admin123)
-- Hash generated with bcrypt cost 10
-- ----------------------------------------------------------------
INSERT INTO admin (username, password_hash, nama) VALUES 
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDGFjIEcEqVQe/rYZLxMJMy1VXHvfy', 'Administrator');

-- ----------------------------------------------------------------
-- Seed Jurusan (15 Popular Majors)
-- ----------------------------------------------------------------
INSERT INTO jurusan (kode, nama, deskripsi, kategori) VALUES
('TI', 'Teknik Informatika', 'Jurusan yang mempelajari pengembangan perangkat lunak, pemrograman, algoritma, dan teknologi informasi. Cocok untuk yang suka logika, problem solving, dan teknologi.', 'SAINTEK'),
('KED', 'Kedokteran', 'Jurusan yang mempelajari ilmu kesehatan, anatomi tubuh manusia, diagnosis dan pengobatan penyakit. Membutuhkan dedikasi tinggi dan empati.', 'SAINTEK'),
('HKM', 'Hukum', 'Jurusan yang mempelajari sistem hukum, perundang-undangan, dan keadilan. Cocok untuk yang suka berargumentasi dan membela kebenaran.', 'SOSHUM'),
('MNJ', 'Manajemen', 'Jurusan yang mempelajari pengelolaan organisasi, kepemimpinan, dan strategi bisnis. Cocok untuk yang berjiwa pemimpin dan suka mengorganisir.', 'SOSHUM'),
('AKT', 'Akuntansi', 'Jurusan yang mempelajari pencatatan keuangan, audit, dan pelaporan finansial. Cocok untuk yang teliti dan suka bekerja dengan angka.', 'SOSHUM'),
('PSI', 'Psikologi', 'Jurusan yang mempelajari perilaku dan proses mental manusia. Cocok untuk yang suka memahami orang lain dan membantu menyelesaikan masalah psikologis.', 'SOSHUM'),
('TSP', 'Teknik Sipil', 'Jurusan yang mempelajari perencanaan dan konstruksi infrastruktur seperti jembatan, gedung, dan jalan. Cocok untuk yang suka matematika dan fisika.', 'SAINTEK'),
('IKM', 'Ilmu Komunikasi', 'Jurusan yang mempelajari komunikasi massa, jurnalistik, dan public relations. Cocok untuk yang komunikatif dan kreatif.', 'SOSHUM'),
('FAR', 'Farmasi', 'Jurusan yang mempelajari obat-obatan, komposisi kimia, dan cara kerja obat dalam tubuh. Cocok untuk yang suka kimia dan biologi.', 'SAINTEK'),
('ARS', 'Arsitektur', 'Jurusan yang mempelajari desain bangunan dan tata ruang. Cocok untuk yang kreatif, suka menggambar, dan memiliki sense of aesthetics.', 'SAINTEK'),
('TEL', 'Teknik Elektro', 'Jurusan yang mempelajari sistem kelistrikan, elektronika, dan telekomunikasi. Cocok untuk yang suka fisika dan teknologi.', 'SAINTEK'),
('PGD', 'Pendidikan Guru SD', 'Jurusan yang menyiapkan calon guru sekolah dasar. Cocok untuk yang sabar, suka anak-anak, dan memiliki jiwa pendidik.', 'SOSHUM'),
('EKP', 'Ekonomi Pembangunan', 'Jurusan yang mempelajari ekonomi makro, kebijakan pembangunan, dan analisis ekonomi. Cocok untuk yang suka menganalisis isu sosial ekonomi.', 'SOSHUM'),
('DKV', 'Desain Komunikasi Visual', 'Jurusan yang mempelajari desain grafis, ilustrasi, dan komunikasi visual. Cocok untuk yang kreatif dan memiliki kemampuan artistik.', 'SAINTEK'),
('HBI', 'Hubungan Internasional', 'Jurusan yang mempelajari politik global, diplomasi, dan hubungan antar negara. Cocok untuk yang tertarik isu global dan bahasa asing.', 'SOSHUM');

-- ----------------------------------------------------------------
-- Seed Pertanyaan (20 Questions - Minat & Bakat)
-- ----------------------------------------------------------------
INSERT INTO pertanyaan (kode, teks, kategori, sub_kategori, urutan) VALUES
-- Minat (8 pertanyaan)
('M01', 'Apakah Anda tertarik dengan teknologi, gadget, dan perkembangan digital terbaru?', 'minat', 'teknologi', 1),
('M02', 'Apakah Anda suka mempelajari tentang tubuh manusia, kesehatan, dan dunia medis?', 'minat', 'kesehatan', 2),
('M03', 'Apakah Anda senang membantu orang lain menyelesaikan masalah pribadi atau emosional mereka?', 'minat', 'sosial', 3),
('M04', 'Apakah Anda tertarik dengan dunia bisnis, kewirausahaan, dan cara menghasilkan uang?', 'minat', 'bisnis', 4),
('M05', 'Apakah Anda suka menggambar, mendesain, atau membuat karya seni visual?', 'minat', 'seni', 5),
('M06', 'Apakah Anda senang berbicara di depan umum, menulis artikel, atau membuat konten?', 'minat', 'komunikasi', 6),
('M07', 'Apakah Anda tertarik mengikuti berita politik, isu global, dan hubungan antar negara?', 'minat', 'global', 7),
('M08', 'Apakah Anda suka bereksperimen, melakukan penelitian, atau mencari tahu cara kerja sesuatu?', 'minat', 'riset', 8),

-- Bakat (12 pertanyaan)
('B01', 'Apakah Anda mudah memahami soal matematika, logika, dan pemecahan masalah?', 'bakat', 'logika', 9),
('B02', 'Apakah Anda mampu menjelaskan ide atau konsep dengan jelas kepada orang lain?', 'bakat', 'komunikasi', 10),
('B03', 'Apakah Anda teliti dan jarang membuat kesalahan dalam pekerjaan yang detail?', 'bakat', 'ketelitian', 11),
('B04', 'Apakah Anda bisa membayangkan objek 3D atau memvisualisasikan desain dalam pikiran?', 'bakat', 'spasial', 12),
('B05', 'Apakah Anda nyaman bekerja dalam tim dan berkolaborasi dengan orang lain?', 'bakat', 'interpersonal', 13),
('B06', 'Apakah Anda sering diminta memimpin kelompok, organisasi, atau kegiatan?', 'bakat', 'kepemimpinan', 14),
('B07', 'Apakah Anda sering menghasilkan ide-ide kreatif, unik, dan out-of-the-box?', 'bakat', 'kreativitas', 15),
('B08', 'Apakah Anda sabar mengerjakan tugas yang membutuhkan ketelitian dan waktu lama?', 'bakat', 'kesabaran', 16),
('B09', 'Apakah Anda suka menganalisis data, mencari pola, dan menarik kesimpulan?', 'bakat', 'analitis', 17),
('B10', 'Apakah Anda mampu tetap tenang dan berpikir jernih dalam situasi penuh tekanan?', 'bakat', 'ketahanan', 18),
('B11', 'Apakah Anda tertarik dan mudah mempelajari bahasa asing?', 'bakat', 'bahasa', 19),
('B12', 'Apakah Anda suka memecahkan teka-teki, puzzle, atau tantangan intelektual?', 'bakat', 'problem_solving', 20);

-- ----------------------------------------------------------------
-- Seed Rules (Knowledge Base - 60+ rules)
-- Format: IF pertanyaan_id >= nilai_kondisi THEN jurusan CF cf_rule
-- ----------------------------------------------------------------

-- Rules untuk Teknik Informatika (TI)
INSERT INTO rules (kode_rule, pertanyaan_id, operator, nilai_kondisi, jurusan_id, cf_rule) VALUES
('R001', 1, '>=', 0.75, 1, 0.85),  -- M01: tertarik teknologi -> TI
('R002', 9, '>=', 0.75, 1, 0.80),  -- B01: logika matematika -> TI
('R003', 20, '>=', 0.75, 1, 0.70), -- B12: problem solving -> TI
('R004', 17, '>=', 0.75, 1, 0.65), -- B09: analitis -> TI

-- Rules untuk Kedokteran (KED)
('R005', 2, '>=', 0.75, 2, 0.85),  -- M02: kesehatan -> KED
('R006', 11, '>=', 0.75, 2, 0.75), -- B03: ketelitian -> KED
('R007', 18, '>=', 0.75, 2, 0.70), -- B10: tahan tekanan -> KED
('R008', 8, '>=', 0.75, 2, 0.65),  -- M08: riset -> KED

-- Rules untuk Hukum (HKM)
('R009', 10, '>=', 0.75, 3, 0.80), -- B02: komunikasi -> HKM
('R010', 17, '>=', 0.75, 3, 0.75), -- B09: analitis -> HKM
('R011', 6, '>=', 0.75, 3, 0.70),  -- M06: berbicara publik -> HKM
('R012', 9, '>=', 0.75, 3, 0.60),  -- B01: logika -> HKM

-- Rules untuk Manajemen (MNJ)
('R013', 14, '>=', 0.75, 4, 0.85), -- B06: kepemimpinan -> MNJ
('R014', 4, '>=', 0.75, 4, 0.80),  -- M04: bisnis -> MNJ
('R015', 13, '>=', 0.75, 4, 0.70), -- B05: tim/interpersonal -> MNJ
('R016', 10, '>=', 0.75, 4, 0.65), -- B02: komunikasi -> MNJ

-- Rules untuk Akuntansi (AKT)
('R017', 11, '>=', 0.75, 5, 0.85), -- B03: ketelitian -> AKT
('R018', 9, '>=', 0.75, 5, 0.80),  -- B01: logika matematika -> AKT
('R019', 4, '>=', 0.75, 5, 0.70),  -- M04: bisnis -> AKT
('R020', 16, '>=', 0.75, 5, 0.65), -- B08: kesabaran -> AKT

-- Rules untuk Psikologi (PSI)
('R021', 3, '>=', 0.75, 6, 0.85),  -- M03: membantu orang -> PSI
('R022', 13, '>=', 0.75, 6, 0.75), -- B05: interpersonal -> PSI
('R023', 10, '>=', 0.75, 6, 0.70), -- B02: komunikasi -> PSI
('R024', 17, '>=', 0.75, 6, 0.60), -- B09: analitis -> PSI

-- Rules untuk Teknik Sipil (TSP)
('R025', 9, '>=', 0.75, 7, 0.85),  -- B01: logika matematika -> TSP
('R026', 12, '>=', 0.75, 7, 0.80), -- B04: spasial -> TSP
('R027', 8, '>=', 0.75, 7, 0.65),  -- M08: riset -> TSP
('R028', 11, '>=', 0.75, 7, 0.60), -- B03: ketelitian -> TSP

-- Rules untuk Ilmu Komunikasi (IKM)
('R029', 6, '>=', 0.75, 8, 0.85),  -- M06: komunikasi publik -> IKM
('R030', 10, '>=', 0.75, 8, 0.80), -- B02: menjelaskan ide -> IKM
('R031', 15, '>=', 0.75, 8, 0.75), -- B07: kreativitas -> IKM
('R032', 13, '>=', 0.75, 8, 0.65), -- B05: interpersonal -> IKM

-- Rules untuk Farmasi (FAR)
('R033', 2, '>=', 0.75, 9, 0.80),  -- M02: kesehatan -> FAR
('R034', 8, '>=', 0.75, 9, 0.80),  -- M08: riset/eksperimen -> FAR
('R035', 11, '>=', 0.75, 9, 0.75), -- B03: ketelitian -> FAR
('R036', 16, '>=', 0.75, 9, 0.65), -- B08: kesabaran -> FAR

-- Rules untuk Arsitektur (ARS)
('R037', 5, '>=', 0.75, 10, 0.85), -- M05: seni/desain -> ARS
('R038', 12, '>=', 0.75, 10, 0.85),-- B04: spasial -> ARS
('R039', 15, '>=', 0.75, 10, 0.75),-- B07: kreativitas -> ARS
('R040', 9, '>=', 0.75, 10, 0.60), -- B01: matematika -> ARS

-- Rules untuk Teknik Elektro (TEL)
('R041', 1, '>=', 0.75, 11, 0.80), -- M01: teknologi -> TEL
('R042', 9, '>=', 0.75, 11, 0.85), -- B01: matematika -> TEL
('R043', 8, '>=', 0.75, 11, 0.70), -- M08: riset -> TEL
('R044', 20, '>=', 0.75, 11, 0.65),-- B12: problem solving -> TEL

-- Rules untuk PGSD (PGD)
('R045', 3, '>=', 0.75, 12, 0.80), -- M03: membantu orang -> PGD
('R046', 10, '>=', 0.75, 12, 0.80),-- B02: komunikasi -> PGD
('R047', 16, '>=', 0.75, 12, 0.75),-- B08: kesabaran -> PGD
('R048', 13, '>=', 0.75, 12, 0.70),-- B05: interpersonal -> PGD

-- Rules untuk Ekonomi Pembangunan (EKP)
('R049', 17, '>=', 0.75, 13, 0.85),-- B09: analitis -> EKP
('R050', 4, '>=', 0.75, 13, 0.75), -- M04: bisnis -> EKP
('R051', 7, '>=', 0.75, 13, 0.70), -- M07: isu global -> EKP
('R052', 9, '>=', 0.75, 13, 0.65), -- B01: matematika -> EKP

-- Rules untuk DKV
('R053', 5, '>=', 0.75, 14, 0.90), -- M05: seni/desain -> DKV
('R054', 15, '>=', 0.75, 14, 0.85),-- B07: kreativitas -> DKV
('R055', 12, '>=', 0.75, 14, 0.70),-- B04: spasial -> DKV
('R056', 1, '>=', 0.75, 14, 0.60), -- M01: teknologi (tools) -> DKV

-- Rules untuk Hubungan Internasional (HBI)
('R057', 7, '>=', 0.75, 15, 0.90), -- M07: isu global -> HBI
('R058', 19, '>=', 0.75, 15, 0.80),-- B11: bahasa asing -> HBI
('R059', 10, '>=', 0.75, 15, 0.75),-- B02: komunikasi -> HBI
('R060', 17, '>=', 0.75, 15, 0.65);-- B09: analitis -> HBI
