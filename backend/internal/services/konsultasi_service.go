package services

import (
	"context"
	"database/sql"
	"fmt"
	"log"

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

	// Get active rules first so the transaction only covers database writes.
	rules, err := s.ruleRepo.GetActive()
	if err != nil {
		log.Printf("consultation service: failed to load active rules: %v", err)
		return nil, fmt.Errorf("failed to load active rules: %w", err)
	}

	if len(req.Jawaban) == 0 {
		log.Printf("consultation service: empty answer set received")
		return nil, err
	}

	// Process consultation using expert system
	hasil := expert.ProcessConsultation(rules, req.Jawaban)

	var konsultasi *models.Konsultasi

	// Use transaction if database connection is available, otherwise fall back to non-transactional
	if s.db != nil {
		ctx := context.Background()
		tx, err := s.db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelReadCommitted})
		if err != nil {
			log.Printf("consultation service: failed to begin transaction: %v", err)
			return nil, fmt.Errorf("failed to begin transaction: %w", err)
		}
		defer func() {
			_ = tx.Rollback()
		}()

		// Create konsultasi record within transaction
		konsultasi, err = s.konsultasiRepo.CreateTx(ctx, tx, sessionID, ipAddress)
		if err != nil {
			log.Printf("consultation service: failed to create consultation session_id=%s ip=%s: %v", sessionID, ipAddress, err)
			return nil, fmt.Errorf("failed to create consultation record: %w", err)
		}

		// Save answers within transaction
		if err := s.konsultasiRepo.SaveJawabanTx(ctx, tx, konsultasi.ID, req.Jawaban); err != nil {
			log.Printf("consultation service: failed to save answers consultation_id=%d session_id=%s: %v", konsultasi.ID, sessionID, err)
			return nil, fmt.Errorf("failed to save consultation answers: %w", err)
		}

		// Save results within the same transaction when we have recommendations
		if len(hasil) > 0 {
			if err := s.konsultasiRepo.SaveHasilTx(ctx, tx, konsultasi.ID, hasil); err != nil {
				log.Printf("consultation service: failed to save results consultation_id=%d session_id=%s: %v", konsultasi.ID, sessionID, err)
				return nil, fmt.Errorf("failed to save consultation results: %w", err)
			}
		}

		if err := tx.Commit(); err != nil {
			log.Printf("consultation service: failed to commit transaction consultation_id=%d session_id=%s: %v", konsultasi.ID, sessionID, err)
			return nil, fmt.Errorf("failed to commit consultation transaction: %w", err)
		}
	} else {
		// Fallback: non-transactional approach (backward compatible)
		konsultasi, err = s.konsultasiRepo.Create(sessionID, ipAddress)
		if err != nil {
			log.Printf("consultation service: failed to create consultation session_id=%s ip=%s: %v", sessionID, ipAddress, err)
			return nil, fmt.Errorf("failed to create consultation record: %w", err)
		}

		// Save answers
		if err := s.konsultasiRepo.SaveJawaban(konsultasi.ID, req.Jawaban); err != nil {
			log.Printf("consultation service: failed to save answers consultation_id=%d session_id=%s: %v", konsultasi.ID, sessionID, err)
			return nil, fmt.Errorf("failed to save consultation answers: %w", err)
		}

		if len(hasil) > 0 {
			if err := s.konsultasiRepo.SaveHasil(konsultasi.ID, hasil); err != nil {
				log.Printf("consultation service: failed to save results consultation_id=%d session_id=%s: %v", konsultasi.ID, sessionID, err)
				return nil, fmt.Errorf("failed to save consultation results: %w", err)
			}
		}
	}

	// Check if we have any results
	if len(hasil) == 0 {
		return &models.ConsultationResponse{
			SessionID: sessionID,
			Hasil:     []models.Hasil{},
			Message:   "Tidak ditemukan jurusan yang sesuai dengan profil Anda. Silakan ulangi pengisian dengan jawaban yang lebih sesuai.",
		}, nil
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
