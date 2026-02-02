package handlers

import (
	"net/http"
	"strconv"

	"sistem-pakar-jurusan/internal/models"
	"sistem-pakar-jurusan/internal/services"

	"github.com/gin-gonic/gin"
)

type PertanyaanHandler struct {
	service *services.PertanyaanService
}

func NewPertanyaanHandler(service *services.PertanyaanService) *PertanyaanHandler {
	return &PertanyaanHandler{service: service}
}

// GetAll returns only active questions for public API
func (h *PertanyaanHandler) GetAll(c *gin.Context) {
	pertanyaanList, err := h.service.GetActive()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data pertanyaan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": pertanyaanList})
}

// GetAllAdmin returns all questions including inactive ones
func (h *PertanyaanHandler) GetAllAdmin(c *gin.Context) {
	pertanyaanList, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data pertanyaan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": pertanyaanList})
}

func (h *PertanyaanHandler) GetByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	pertanyaan, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pertanyaan tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": pertanyaan})
}

func (h *PertanyaanHandler) Create(c *gin.Context) {
	var req models.CreatePertanyaanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	pertanyaan, err := h.service.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat pertanyaan"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": pertanyaan, "message": "Pertanyaan berhasil dibuat"})
}

func (h *PertanyaanHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var req models.UpdatePertanyaanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	pertanyaan, err := h.service.Update(id, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate pertanyaan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": pertanyaan, "message": "Pertanyaan berhasil diupdate"})
}

func (h *PertanyaanHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	if err := h.service.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus pertanyaan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pertanyaan berhasil dihapus"})
}
