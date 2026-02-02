package services

import (
	"sistem-pakar-jurusan/internal/repository"
)

type StatistikService struct {
	konsultasiRepo *repository.KonsultasiRepository
	jurusanRepo    *repository.JurusanRepository
}

func NewStatistikService(konsultasiRepo *repository.KonsultasiRepository, jurusanRepo *repository.JurusanRepository) *StatistikService {
	return &StatistikService{
		konsultasiRepo: konsultasiRepo,
		jurusanRepo:    jurusanRepo,
	}
}

func (s *StatistikService) GetStatistics() (map[string]interface{}, error) {
	stats, err := s.konsultasiRepo.GetStatistics()
	if err != nil {
		return nil, err
	}

	// Add jurusan count
	jurusanList, err := s.jurusanRepo.GetAll()
	if err != nil {
		return nil, err
	}
	stats["total_jurusan"] = len(jurusanList)

	// Count active jurusan
	activeJurusan, err := s.jurusanRepo.GetActive()
	if err != nil {
		return nil, err
	}
	stats["active_jurusan"] = len(activeJurusan)

	return stats, nil
}
