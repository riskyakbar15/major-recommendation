package services

import (
	"testing"

	"sistem-pakar-jurusan/internal/models"
	"sistem-pakar-jurusan/internal/repository"

	"github.com/DATA-DOG/go-sqlmock"
)

// ruleColumns mirrors the columns scanned by RuleRepository.GetActive.
func ruleColumns() []string {
	return []string{
		"id", "kode_rule", "pertanyaan_id", "operator", "nilai_kondisi",
		"jurusan_id", "cf_rule", "is_active", "created_at", "updated_at",
		"pertanyaan_kode", "pertanyaan_teks", "jurusan_kode", "jurusan_nama",
	}
}

func TestKonsultasiService_Create_EmptyAnswers(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock.New: %v", err)
	}
	defer db.Close()

	// Active rules are loaded first; an empty rule set is sufficient because the
	// empty-answer guard fires before any consultation records are written.
	mock.ExpectQuery("FROM rules").
		WillReturnRows(sqlmock.NewRows(ruleColumns()))

	ruleRepo := repository.NewRuleRepository(db)
	svc := NewKonsultasiService(nil, nil, ruleRepo, nil)

	_, err = svc.Create(models.ConsultationRequest{Jawaban: nil}, "127.0.0.1")
	if err == nil {
		t.Fatal("expected an error for empty answers, got nil")
	}
	if err.Error() != "jawaban tidak boleh kosong" {
		t.Fatalf("error = %q, want %q", err.Error(), "jawaban tidak boleh kosong")
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestKonsultasiService_Create_RuleLoadError(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock.New: %v", err)
	}
	defer db.Close()

	mock.ExpectQuery("FROM rules").
		WillReturnError(sqlDriverErr("connection reset"))

	ruleRepo := repository.NewRuleRepository(db)
	svc := NewKonsultasiService(nil, nil, ruleRepo, nil)

	_, err = svc.Create(
		models.ConsultationRequest{Jawaban: []models.JawabanInput{{PertanyaanID: 1, Nilai: 1}}},
		"127.0.0.1",
	)
	if err == nil {
		t.Fatal("expected an error when loading rules fails, got nil")
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

// sqlDriverErr is a tiny error helper to keep the rule-load failure test readable.
type sqlDriverErr string

func (e sqlDriverErr) Error() string { return string(e) }
