package repository

import (
	"database/sql"
	"time"

	"sistem-pakar-jurusan/internal/models"
)

type KonsultasiRepository struct {
	db *sql.DB
}

func NewKonsultasiRepository(db *sql.DB) *KonsultasiRepository {
	return &KonsultasiRepository{db: db}
}

func (r *KonsultasiRepository) Create(sessionID, ipAddress string) (*models.Konsultasi, error) {
	query := `INSERT INTO konsultasi (session_id, ip_address) VALUES (?, ?)`

	result, err := r.db.Exec(query, sessionID, ipAddress)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return r.GetByID(int(id))
}

func (r *KonsultasiRepository) GetByID(id int) (*models.Konsultasi, error) {
	query := `SELECT id, session_id, COALESCE(ip_address, ''), created_at FROM konsultasi WHERE id = ?`

	var k models.Konsultasi
	err := r.db.QueryRow(query, id).Scan(&k.ID, &k.SessionID, &k.IPAddress, &k.CreatedAt)
	if err != nil {
		return nil, err
	}

	return &k, nil
}

func (r *KonsultasiRepository) GetBySessionID(sessionID string) (*models.Konsultasi, error) {
	query := `SELECT id, session_id, COALESCE(ip_address, ''), created_at FROM konsultasi WHERE session_id = ?`

	var k models.Konsultasi
	err := r.db.QueryRow(query, sessionID).Scan(&k.ID, &k.SessionID, &k.IPAddress, &k.CreatedAt)
	if err != nil {
		return nil, err
	}

	// Get jawaban
	jawabanQuery := `SELECT j.id, j.konsultasi_id, j.pertanyaan_id, j.nilai, p.teks
					 FROM jawaban j
					 JOIN pertanyaan p ON j.pertanyaan_id = p.id
					 WHERE j.konsultasi_id = ?
					 ORDER BY p.urutan`
	rows, err := r.db.Query(jawabanQuery, k.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var j models.Jawaban
		if err := rows.Scan(&j.ID, &j.KonsultasiID, &j.PertanyaanID, &j.Nilai, &j.PertanyaanTeks); err != nil {
			return nil, err
		}
		k.Jawaban = append(k.Jawaban, j)
	}

	// Get hasil
	hasilQuery := `SELECT h.id, h.konsultasi_id, h.jurusan_id, h.cf_final, h.ranking,
				   j.kode, j.nama, j.deskripsi, j.kategori
				   FROM hasil h
				   JOIN jurusan j ON h.jurusan_id = j.id
				   WHERE h.konsultasi_id = ?
				   ORDER BY h.ranking`
	rows2, err := r.db.Query(hasilQuery, k.ID)
	if err != nil {
		return nil, err
	}
	defer rows2.Close()

	for rows2.Next() {
		var h models.Hasil
		if err := rows2.Scan(&h.ID, &h.KonsultasiID, &h.JurusanID, &h.CFFinal, &h.Ranking,
			&h.JurusanKode, &h.JurusanNama, &h.JurusanDeskripsi, &h.JurusanKategori); err != nil {
			return nil, err
		}
		k.Hasil = append(k.Hasil, h)
	}

	return &k, nil
}

func (r *KonsultasiRepository) SaveJawaban(konsultasiID int, jawaban []models.JawabanInput) error {
	query := `INSERT INTO jawaban (konsultasi_id, pertanyaan_id, nilai) VALUES (?, ?, ?)`

	for _, j := range jawaban {
		_, err := r.db.Exec(query, konsultasiID, j.PertanyaanID, j.Nilai)
		if err != nil {
			return err
		}
	}

	return nil
}

func (r *KonsultasiRepository) SaveHasil(konsultasiID int, hasil []models.Hasil) error {
	query := `INSERT INTO hasil (konsultasi_id, jurusan_id, cf_final, ranking) VALUES (?, ?, ?, ?)`

	for _, h := range hasil {
		_, err := r.db.Exec(query, konsultasiID, h.JurusanID, h.CFFinal, h.Ranking)
		if err != nil {
			return err
		}
	}

	return nil
}

func (r *KonsultasiRepository) GetAll(limit, offset int) ([]models.Konsultasi, int, error) {
	countQuery := `SELECT COUNT(*) FROM konsultasi`
	var total int
	if err := r.db.QueryRow(countQuery).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := `SELECT id, session_id, COALESCE(ip_address, ''), created_at 
			  FROM konsultasi ORDER BY created_at DESC LIMIT ? OFFSET ?`

	rows, err := r.db.Query(query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var list []models.Konsultasi
	for rows.Next() {
		var k models.Konsultasi
		if err := rows.Scan(&k.ID, &k.SessionID, &k.IPAddress, &k.CreatedAt); err != nil {
			return nil, 0, err
		}
		list = append(list, k)
	}

	return list, total, nil
}

func (r *KonsultasiRepository) GetStatistics() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Total consultations
	var total int
	if err := r.db.QueryRow(`SELECT COUNT(*) FROM konsultasi`).Scan(&total); err != nil {
		return nil, err
	}
	stats["total_consultations"] = total

	// Today's consultations
	var today int
	todayQuery := `SELECT COUNT(*) FROM konsultasi WHERE DATE(created_at) = CURDATE()`
	if err := r.db.QueryRow(todayQuery).Scan(&today); err != nil {
		return nil, err
	}
	stats["today_consultations"] = today

	// This week's consultations
	var thisWeek int
	weekQuery := `SELECT COUNT(*) FROM konsultasi WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`
	if err := r.db.QueryRow(weekQuery).Scan(&thisWeek); err != nil {
		return nil, err
	}
	stats["week_consultations"] = thisWeek

	// This month's consultations
	var thisMonth int
	monthQuery := `SELECT COUNT(*) FROM konsultasi WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())`
	if err := r.db.QueryRow(monthQuery).Scan(&thisMonth); err != nil {
		return nil, err
	}
	stats["month_consultations"] = thisMonth

	// Top recommended majors
	topQuery := `SELECT j.nama, COUNT(h.id) as count, AVG(h.cf_final) as avg_cf
				 FROM hasil h
				 JOIN jurusan j ON h.jurusan_id = j.id
				 WHERE h.ranking = 1
				 GROUP BY j.id, j.nama
				 ORDER BY count DESC
				 LIMIT 5`
	rows, err := r.db.Query(topQuery)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	type TopJurusan struct {
		Nama   string  `json:"nama"`
		Count  int     `json:"count"`
		AvgCF  float64 `json:"avg_cf"`
	}
	var topJurusan []TopJurusan
	for rows.Next() {
		var t TopJurusan
		if err := rows.Scan(&t.Nama, &t.Count, &t.AvgCF); err != nil {
			return nil, err
		}
		topJurusan = append(topJurusan, t)
	}
	stats["top_jurusan"] = topJurusan

	// Consultations per day (last 7 days)
	dailyQuery := `SELECT DATE(created_at) as date, COUNT(*) as count
				   FROM konsultasi
				   WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
				   GROUP BY DATE(created_at)
				   ORDER BY date`
	rows2, err := r.db.Query(dailyQuery)
	if err != nil {
		return nil, err
	}
	defer rows2.Close()

	type DailyStat struct {
		Date  time.Time `json:"date"`
		Count int       `json:"count"`
	}
	var dailyStats []DailyStat
	for rows2.Next() {
		var d DailyStat
		if err := rows2.Scan(&d.Date, &d.Count); err != nil {
			return nil, err
		}
		dailyStats = append(dailyStats, d)
	}
	stats["daily_stats"] = dailyStats

	return stats, nil
}
