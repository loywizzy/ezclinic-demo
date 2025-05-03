package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

// Customer model
type Customer struct {
	ID       string `db:"id" json:"id"`
	FullName string `db:"full_name" json:"full_name"`
	Phone    string `db:"phone" json:"phone"`
	Email    string `db:"email" json:"email"`
	Status   bool   `db:"status" json:"status"`
}

// ListCustomers returns paginated list
func ListCustomers(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []Customer
		// parse ?page and ?limit if needed, here simple
		err := db.Select(&list, "SELECT id, full_name, phone, email, status FROM customers ORDER BY id")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, list)
	}
}

// CreateCustomer inserts a new customer
func CreateCustomer(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var cs Customer
		if err := c.ShouldBindJSON(&cs); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Fetch current max
		var max sql.NullString
		if err := db.Get(&max, "SELECT MAX(id) FROM customers"); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Compute next numeric value
		next := 1
		if max.Valid {
			if n, err := strconv.Atoi(strings.TrimLeft(max.String, "0")); err == nil {
				next = n + 1
			}
		}
		cs.ID = fmt.Sprintf("%07d", next)

		// Now insert including id
		_, err := db.NamedExec(`
		INSERT INTO customers (id, full_name, phone, email, status)
		VALUES (:id, :full_name, :phone, :email, true)
	  `, &cs)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusCreated)
	}
}

// UpdateCustomer updates existing customer
func UpdateCustomer(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var cs Customer
		if err := c.ShouldBindJSON(&cs); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		cs.ID = id
		_, err := db.NamedExec(`
      UPDATE customers SET full_name=:full_name, phone=:phone, email=:email, status=:status
      WHERE id=:id
    `, &cs)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusOK)
	}
}

// DeleteCustomer soft-deletes (or hard) a customer by id
func DeleteCustomer(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		_, err := db.Exec("DELETE FROM customers WHERE id=$1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusOK)
	}
}
