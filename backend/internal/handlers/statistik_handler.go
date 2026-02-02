package handlers

import (
	"net/http"

	"sistem-pakar-jurusan/internal/services"

	"github.com/gin-gonic/gin"
)

type StatistikHandler struct {
	service *services.StatistikService
}

func NewStatistikHandler(service *services.StatistikService) *StatistikHandler {
	return &StatistikHandler{service: service}
}

func (h *StatistikHandler) GetStatistics(c *gin.Context) {
	stats, err := h.service.GetStatistics()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil statistik"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}
