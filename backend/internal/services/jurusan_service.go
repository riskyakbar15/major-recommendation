package services

import (
	"sistem-pakar-jurusan/internal/models"
	"sistem-pakar-jurusan/internal/repository"
)

type JurusanService struct {
	repo *repository.JurusanRepository
}

func NewJurusanService(repo *repository.JurusanRepository) *JurusanService {
	return &JurusanService{repo: repo}
}

func (s *JurusanService) GetAll() ([]models.Jurusan, error) {
	return s.repo.GetAll()
}

func (s *JurusanService) GetActive() ([]models.Jurusan, error) {
	return s.repo.GetActive()
}

func (s *JurusanService) GetByID(id int) (*models.Jurusan, error) {
	return s.repo.GetByID(id)
}

func (s *JurusanService) Create(req models.CreateJurusanRequest) (*models.Jurusan, error) {
	return s.repo.Create(req)
}

func (s *JurusanService) Update(id int, req models.UpdateJurusanRequest) (*models.Jurusan, error) {
	return s.repo.Update(id, req)
}

func (s *JurusanService) Delete(id int) error {
	return s.repo.Delete(id)
}
