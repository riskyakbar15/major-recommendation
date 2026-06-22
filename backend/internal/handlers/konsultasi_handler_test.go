package handlers

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"sistem-pakar-jurusan/internal/models"

	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func TestValidateConsultationRequest(t *testing.T) {
	tests := []struct {
		name    string
		req     models.ConsultationRequest
		wantErr bool
	}{
		{
			name: "valid answers",
			req: models.ConsultationRequest{Jawaban: []models.JawabanInput{
				{PertanyaanID: 1, Nilai: 0},
				{PertanyaanID: 2, Nilai: 0.25},
				{PertanyaanID: 3, Nilai: 0.5},
				{PertanyaanID: 4, Nilai: 0.75},
				{PertanyaanID: 5, Nilai: 1},
			}},
			wantErr: false,
		},
		{
			name:    "empty is allowed at this layer",
			req:     models.ConsultationRequest{Jawaban: nil},
			wantErr: false,
		},
		{
			name: "non-positive question id",
			req: models.ConsultationRequest{Jawaban: []models.JawabanInput{
				{PertanyaanID: 0, Nilai: 0.5},
			}},
			wantErr: true,
		},
		{
			name: "negative question id",
			req: models.ConsultationRequest{Jawaban: []models.JawabanInput{
				{PertanyaanID: -3, Nilai: 0.5},
			}},
			wantErr: true,
		},
		{
			name: "duplicate question",
			req: models.ConsultationRequest{Jawaban: []models.JawabanInput{
				{PertanyaanID: 1, Nilai: 0},
				{PertanyaanID: 1, Nilai: 0.5},
			}},
			wantErr: true,
		},
		{
			name: "value not in allowed set",
			req: models.ConsultationRequest{Jawaban: []models.JawabanInput{
				{PertanyaanID: 1, Nilai: 0.3},
			}},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := validateConsultationRequest(tt.req)
			if (err != nil) != tt.wantErr {
				t.Fatalf("validateConsultationRequest() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func performCreate(body string) *httptest.ResponseRecorder {
	// Validation/binding failures are rejected before the service is invoked,
	// so a nil service is safe for these error-path tests.
	h := NewKonsultasiHandler(nil)
	r := gin.New()
	r.POST("/konsultasi", h.Create)

	req := httptest.NewRequest(http.MethodPost, "/konsultasi", bytes.NewReader([]byte(body)))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func TestCreate_InvalidJSON(t *testing.T) {
	if code := performCreate("{").Code; code != http.StatusBadRequest {
		t.Fatalf("code = %d, want 400", code)
	}
}

func TestCreate_EmptyJawaban(t *testing.T) {
	if code := performCreate(`{"jawaban":[]}`).Code; code != http.StatusBadRequest {
		t.Fatalf("code = %d, want 400", code)
	}
}

func TestCreate_InvalidNilai(t *testing.T) {
	body := `{"jawaban":[{"pertanyaan_id":1,"nilai":0.3}]}`
	if code := performCreate(body).Code; code != http.StatusBadRequest {
		t.Fatalf("code = %d, want 400", code)
	}
}

func TestCreate_DuplicateQuestion(t *testing.T) {
	body := `{"jawaban":[{"pertanyaan_id":1,"nilai":0},{"pertanyaan_id":1,"nilai":0.5}]}`
	if code := performCreate(body).Code; code != http.StatusBadRequest {
		t.Fatalf("code = %d, want 400", code)
	}
}

func TestGetBySessionID_EmptyParam(t *testing.T) {
	h := NewKonsultasiHandler(nil)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/", nil)

	h.GetBySessionID(c)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("code = %d, want 400", w.Code)
	}
}
