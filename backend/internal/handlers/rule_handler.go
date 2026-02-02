package handlers

import (
	"net/http"
	"strconv"

	"sistem-pakar-jurusan/internal/models"
	"sistem-pakar-jurusan/internal/services"

	"github.com/gin-gonic/gin"
)

type RuleHandler struct {
	service *services.RuleService
}

func NewRuleHandler(service *services.RuleService) *RuleHandler {
	return &RuleHandler{service: service}
}

func (h *RuleHandler) GetAll(c *gin.Context) {
	ruleList, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data rules"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": ruleList})
}

func (h *RuleHandler) GetByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	rule, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Rule tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": rule})
}

func (h *RuleHandler) Create(c *gin.Context) {
	var req models.CreateRuleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	rule, err := h.service.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat rule"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": rule, "message": "Rule berhasil dibuat"})
}

func (h *RuleHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var req models.UpdateRuleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	rule, err := h.service.Update(id, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate rule"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": rule, "message": "Rule berhasil diupdate"})
}

func (h *RuleHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	if err := h.service.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus rule"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Rule berhasil dihapus"})
}
