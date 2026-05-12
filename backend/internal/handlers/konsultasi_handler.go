package handlers

import (
	"log"
	"net/http"
	"strconv"

	"sistem-pakar-jurusan/internal/models"
	"sistem-pakar-jurusan/internal/services"

	"github.com/gin-gonic/gin"
)

type KonsultasiHandler struct {
	service *services.KonsultasiService
}

var allowedAnswerValues = map[float64]struct{}{
	0.0:  {},
	0.25: {},
	0.5:  {},
	0.75: {},
	1.0:  {},
}

func NewKonsultasiHandler(service *services.KonsultasiService) *KonsultasiHandler {
	return &KonsultasiHandler{service: service}
}

func (h *KonsultasiHandler) Create(c *gin.Context) {
	var req models.ConsultationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("consultation create: invalid payload from ip=%s: %v", c.ClientIP(), err)
		respondConsultationError(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := validateConsultationRequest(req); err != nil {
		log.Printf("consultation create: validation failed from ip=%s answers=%d: %v", c.ClientIP(), len(req.Jawaban), err)
		respondConsultationError(c, http.StatusBadRequest, err.Error())
		return
	}

	// Get client IP
	ipAddress := c.ClientIP()

	response, err := h.service.Create(req, ipAddress)
	if err != nil {
		log.Printf("consultation create: processing failed from ip=%s answers=%d: %v", ipAddress, len(req.Jawaban), err)
		respondConsultationError(c, http.StatusInternalServerError, "Gagal memproses konsultasi")
		return
	}

	c.JSON(http.StatusOK, response)
}

func validateConsultationRequest(req models.ConsultationRequest) error {
	seenQuestions := make(map[int]struct{}, len(req.Jawaban))

	for _, jawaban := range req.Jawaban {
		if jawaban.PertanyaanID <= 0 {
			return &validationError{message: "Pertanyaan ID harus valid"}
		}

		if _, exists := seenQuestions[jawaban.PertanyaanID]; exists {
			return &validationError{message: "Setiap pertanyaan hanya boleh dijawab satu kali"}
		}
		seenQuestions[jawaban.PertanyaanID] = struct{}{}

		if _, allowed := allowedAnswerValues[jawaban.Nilai]; !allowed {
			return &validationError{message: "Nilai jawaban harus salah satu dari 0, 0.25, 0.5, 0.75, atau 1"}
		}
	}

	return nil
}

func respondConsultationError(c *gin.Context, status int, message string) {
	c.JSON(status, gin.H{"error": message})
}

type validationError struct {
	message string
}

func (e *validationError) Error() string {
	return e.message
}

func (h *KonsultasiHandler) GetBySessionID(c *gin.Context) {
	sessionID := c.Param("sessionId")
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Session ID tidak valid"})
		return
	}

	konsultasi, err := h.service.GetBySessionID(sessionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Konsultasi tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": konsultasi})
}

func (h *KonsultasiHandler) GetAllAdmin(c *gin.Context) {
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parameter page tidak valid"})
		return
	}

	limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parameter limit tidak valid"})
		return
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	konsultasiList, total, err := h.service.GetAll(page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data konsultasi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  konsultasiList,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (h *KonsultasiHandler) GetDetailAdmin(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	konsultasi, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Konsultasi tidak ditemukan"})
		return
	}

	// Get full details including jawaban and hasil
	fullKonsultasi, err := h.service.GetBySessionID(konsultasi.SessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil detail konsultasi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": fullKonsultasi})
}
