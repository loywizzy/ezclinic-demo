package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

type stat struct {
	Name  string `db:"name" json:"name"`
	Value int    `db:"value" json:"value"`
}

func Dashboard(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var stats []stat
		db.Select(&stats, "SELECT name,value FROM stats")
		c.JSON(http.StatusOK, stats)
	}
}
