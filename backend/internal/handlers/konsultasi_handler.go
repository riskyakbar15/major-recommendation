package handlers

import (
	"net/http"
	"strconv"

	"sistem-pakar-jurusan/internal/models"
	"sistem-pakar-jurusan/internal/services"

	"github.com/gin-gonic/gin"
)

type KonsultasiHandler struct {
	service *services.KonsultasiService
}

func NewKonsultasiHandler(service *services.KonsultasiService) *KonsultasiHandler {
	return &KonsultasiHandler{service: service}
}

func (h *KonsultasiHandler) Create(c *gin.Context) {
	var req models.ConsultationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate that we have answers
	if len(req.Jawaban) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Jawaban tidak boleh kosong"})
		return
	}

	// Get client IP
	ipAddress := c.ClientIP()

	response, err := h.service.Create(req, ipAddress)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses konsultasi"})
		return
	}

	c.JSON(http.StatusOK, response)
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
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

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
