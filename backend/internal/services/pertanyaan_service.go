package services

import (
	"sistem-pakar-jurusan/internal/models"
	"sistem-pakar-jurusan/internal/repository"
)

type PertanyaanService struct {
	repo *repository.PertanyaanRepository
}

func NewPertanyaanService(repo *repository.PertanyaanRepository) *PertanyaanService {
	return &PertanyaanService{repo: repo}
}

func (s *PertanyaanService) GetAll() ([]models.Pertanyaan, error) {
	return s.repo.GetAll()
}

func (s *PertanyaanService) GetActive() ([]models.Pertanyaan, error) {
	return s.repo.GetActive()
}

func (s *PertanyaanService) GetByID(id int) (*models.Pertanyaan, error) {
	return s.repo.GetByID(id)
}

func (s *PertanyaanService) Create(req models.CreatePertanyaanRequest) (*models.Pertanyaan, error) {
	return s.repo.Create(req)
}

func (s *PertanyaanService) Update(id int, req models.UpdatePertanyaanRequest) (*models.Pertanyaan, error) {
	return s.repo.Update(id, req)
}

func (s *PertanyaanService) Delete(id int) error {
	return s.repo.Delete(id)
}
