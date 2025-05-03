package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

// Stat represents a dashboard statistic
type Stat struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
	Diff  int    `json:"diff"`
}

// DashboardCount handler returns counts of customers, employees, positions
func DashboardCount(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var (
			custCount int
			empCount  int
			posCount  int
		)

		// Query counts
		err := db.Get(&custCount, "SELECT COUNT(*) FROM customers")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		err = db.Get(&empCount, "SELECT COUNT(*) FROM employees")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		err = db.Get(&posCount, "SELECT COUNT(*) FROM positions")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Assemble stats
		stats := []Stat{
			{Name: "ลูกค้า (คน)", Value: custCount, Diff: 0},
			{Name: "พนักงาน (คน)", Value: empCount, Diff: 0},
			{Name: "ตำแหน่ง", Value: posCount, Diff: 0},
		}

		c.JSON(http.StatusOK, stats)
	}
}
