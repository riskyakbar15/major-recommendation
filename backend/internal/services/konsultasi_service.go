package services

import (
	"context"
	"database/sql"

	"sistem-pakar-jurusan/internal/expert"
	"sistem-pakar-jurusan/internal/models"
	"sistem-pakar-jurusan/internal/repository"

	"github.com/google/uuid"
)

type KonsultasiService struct {
	konsultasiRepo *repository.KonsultasiRepository
	pertanyaanRepo *repository.PertanyaanRepository
	ruleRepo       *repository.RuleRepository
	jurusanRepo    *repository.JurusanRepository
	db             *sql.DB
}

func NewKonsultasiService(
	konsultasiRepo *repository.KonsultasiRepository,
	pertanyaanRepo *repository.PertanyaanRepository,
	ruleRepo *repository.RuleRepository,
	jurusanRepo *repository.JurusanRepository,
) *KonsultasiService {
	return &KonsultasiService{
		konsultasiRepo: konsultasiRepo,
		pertanyaanRepo: pertanyaanRepo,
		ruleRepo:       ruleRepo,
		jurusanRepo:    jurusanRepo,
		db:             nil, // Will be set via SetDB if transaction support needed
	}
}

// SetDB sets the database connection for transactional operations
func (s *KonsultasiService) SetDB(db *sql.DB) {
	s.db = db
}

func (s *KonsultasiService) Create(req models.ConsultationRequest, ipAddress string) (*models.ConsultationResponse, error) {
	// Generate session ID
	sessionID := uuid.New().String()

	var konsultasi *models.Konsultasi
	var err error

	// Use transaction if database connection is available, otherwise fall back to non-transactional
	if s.db != nil {
		// Transactional approach: wrap all operations atomically
		ctx := context.Background()
		tx, err := s.db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelReadCommitted})
		if err != nil {
			return nil, err
		}
		defer func() {
			if err != nil {
				tx.Rollback()
			}
		}()

		// Create konsultasi record within transaction
		konsultasi, err = s.konsultasiRepo.CreateTx(ctx, tx, sessionID, ipAddress)
		if err != nil {
			return nil, err
		}

		// Save answers within transaction
		if err := s.konsultasiRepo.SaveJawabanTx(ctx, tx, konsultasi.ID, req.Jawaban); err != nil {
			return nil, err
		}

		// Commit transaction before processing expert system (no transaction needed for read-only expert processing)
		if err := tx.Commit(); err != nil {
			return nil, err
		}
		err = nil // Reset error for deferred rollback check
	} else {
		// Fallback: non-transactional approach (backward compatible)
		konsultasi, err = s.konsultasiRepo.Create(sessionID, ipAddress)
		if err != nil {
			return nil, err
		}

		// Save answers
		if err := s.konsultasiRepo.SaveJawaban(konsultasi.ID, req.Jawaban); err != nil {
			return nil, err
		}
	}

	// Get active rules
	rules, err := s.ruleRepo.GetActive()
	if err != nil {
		return nil, err
	}

	// Process consultation using expert system
	hasil := expert.ProcessConsultation(rules, req.Jawaban)

	// Check if we have any results
	if len(hasil) == 0 {
		return &models.ConsultationResponse{
			SessionID: sessionID,
			Hasil:     []models.Hasil{},
			Message:   "Tidak ditemukan jurusan yang sesuai dengan profil Anda. Silakan ulangi pengisian dengan jawaban yang lebih sesuai.",
		}, nil
	}

	// Save results
	if err := s.konsultasiRepo.SaveHasil(konsultasi.ID, hasil); err != nil {
		return nil, err
	}

	// Enrich hasil with jurusan details
	for i := range hasil {
		jurusan, err := s.jurusanRepo.GetByID(hasil[i].JurusanID)
		if err == nil {
			hasil[i].JurusanKode = jurusan.Kode
			hasil[i].JurusanNama = jurusan.Nama
			hasil[i].JurusanDeskripsi = jurusan.Deskripsi
			hasil[i].JurusanKategori = jurusan.Kategori
		}
	}

	return &models.ConsultationResponse{
		SessionID: sessionID,
		Hasil:     hasil,
	}, nil
}

func (s *KonsultasiService) GetBySessionID(sessionID string) (*models.Konsultasi, error) {
	return s.konsultasiRepo.GetBySessionID(sessionID)
}

func (s *KonsultasiService) GetAll(page, limit int) ([]models.Konsultasi, int, error) {
	offset := (page - 1) * limit
	return s.konsultasiRepo.GetAll(limit, offset)
}

func (s *KonsultasiService) GetByID(id int) (*models.Konsultasi, error) {
	return s.konsultasiRepo.GetByID(id)
}
