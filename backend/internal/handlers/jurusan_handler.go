package handlers

import (
	"net/http"
	"strconv"

	"sistem-pakar-jurusan/internal/models"
	"sistem-pakar-jurusan/internal/services"

	"github.com/gin-gonic/gin"
)

type JurusanHandler struct {
	service *services.JurusanService
}

func NewJurusanHandler(service *services.JurusanService) *JurusanHandler {
	return &JurusanHandler{service: service}
}

func (h *JurusanHandler) GetAll(c *gin.Context) {
	jurusanList, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data jurusan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": jurusanList})
}

func (h *JurusanHandler) GetByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	jurusan, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Jurusan tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": jurusan})
}

func (h *JurusanHandler) Create(c *gin.Context) {
	var req models.CreateJurusanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	jurusan, err := h.service.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat jurusan"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": jurusan, "message": "Jurusan berhasil dibuat"})
}

func (h *JurusanHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var req models.UpdateJurusanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	jurusan, err := h.service.Update(id, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate jurusan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": jurusan, "message": "Jurusan berhasil diupdate"})
}

func (h *JurusanHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	if err := h.service.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus jurusan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Jurusan berhasil dihapus"})
}
