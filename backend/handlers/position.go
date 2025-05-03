package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

// Position represents a job position
type Position struct {
	ID     string  `db:"id" json:"id"`
	Name   string  `db:"name" json:"name"`
	Salary float64 `db:"salary" json:"salary"`
	Status bool    `db:"status" json:"status"`
}

// ListPositions returns all positions
func ListPositions(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []Position
		err := db.Select(&list, "SELECT id, name, salary, status FROM positions ORDER BY id")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, list)
	}
}

// CreatePosition inserts a new position
func CreatePosition(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var p Position
		if err := c.ShouldBindJSON(&p); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		_, err := db.NamedExec(`
		INSERT INTO positions (name, salary, status)
		VALUES (:name, :salary, :status)
	  `, &p)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusCreated)
	}
}

// UpdatePosition updates an existing position
func UpdatePosition(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var p Position
		if err := c.ShouldBindJSON(&p); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		p.ID = id
		_, err := db.NamedExec(`
      UPDATE positions SET name=:name, salary=:salary, status=:status
      WHERE id=:id
    `, &p)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusOK)
	}
}

// DeletePosition removes a position by id
func DeletePosition(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		_, err := db.Exec("DELETE FROM positions WHERE id=$1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusOK)
	}
}
