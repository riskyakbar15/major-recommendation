package services

import (
	"sistem-pakar-jurusan/internal/models"
	"sistem-pakar-jurusan/internal/repository"
)

type RuleService struct {
	repo *repository.RuleRepository
}

func NewRuleService(repo *repository.RuleRepository) *RuleService {
	return &RuleService{repo: repo}
}

func (s *RuleService) GetAll() ([]models.Rule, error) {
	return s.repo.GetAll()
}

func (s *RuleService) GetActive() ([]models.Rule, error) {
	return s.repo.GetActive()
}

func (s *RuleService) GetByID(id int) (*models.Rule, error) {
	return s.repo.GetByID(id)
}

func (s *RuleService) Create(req models.CreateRuleRequest) (*models.Rule, error) {
	return s.repo.Create(req)
}

func (s *RuleService) Update(id int, req models.UpdateRuleRequest) (*models.Rule, error) {
	return s.repo.Update(id, req)
}

func (s *RuleService) Delete(id int) error {
	return s.repo.Delete(id)
}

func (s *RuleService) GetByJurusanID(jurusanID int) ([]models.Rule, error) {
	return s.repo.GetByJurusanID(jurusanID)
}
