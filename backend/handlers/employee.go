package handlers

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

// Employee represents an employee record
// Use pointer types for nullable fields to allow JSON unmarshal directly
type Employee struct {
	ID                   string    `db:"id" json:"id"`
	Prefix               string    `db:"prefix" json:"prefix"`
	FirstName            string    `db:"first_name" json:"first_name"`
	LastName             string    `db:"last_name" json:"last_name"`
	Nickname             *string   `db:"nickname" json:"nickname"`
	PositionID           *string   `db:"position_id" json:"position_id"`
	Color                *string   `db:"color" json:"color"`
	Salary               float64   `db:"salary" json:"salary"`
	PayDate              *string   `db:"pay_date" json:"pay_date"`
	HasSocialSecurity    bool      `db:"has_social_security" json:"has_social_security"`
	SocialSecurityNumber *string   `db:"social_security_number" json:"social_security_number"`
	TaxDeduction         float64   `db:"tax_deduction" json:"tax_deduction"`
	HourRate             float64   `db:"hour_rate" json:"hour_rate"`
	OvertimeRate         float64   `db:"overtime_rate" json:"overtime_rate"`
	LeavePersonal        int       `db:"leave_personal" json:"leave_personal"`
	LeaveVacation        int       `db:"leave_vacation" json:"leave_vacation"`
	LeaveSick            int       `db:"leave_sick" json:"leave_sick"`
	RoleID               int       `db:"role_id" json:"role_id"`
	Email                string    `db:"email" json:"email"`
	PasswordHash         string    `db:"password_hash" json:"-"`
	Status               bool      `db:"status" json:"status"`
	PayChannel           *string   `db:"pay_channel" json:"pay_channel"`
	AccountType          *string   `db:"account_type" json:"account_type"`
	Bank                 *string   `db:"bank" json:"bank"`
	AccountNumber        *string   `db:"account_number" json:"account_number"`
	BankBranch           *string   `db:"bank_branch" json:"bank_branch"`
	CreatedAt            time.Time `db:"created_at" json:"created_at"`
}

// ListEmployees returns all employees
func ListEmployees(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []Employee
		query := `
		SELECT
		  id, prefix, first_name, last_name, nickname,
		  position_id, color, salary,
		  to_char(pay_date, 'YYYY-MM-DD') AS pay_date,
		  has_social_security,
		  social_security_number, tax_deduction, hour_rate, overtime_rate,
		  leave_personal, leave_vacation, leave_sick,
		  role_id, email, status, pay_channel, account_type,
		  bank, account_number, bank_branch, created_at
		FROM employees
		ORDER BY id
		`
		if err := db.Select(&list, query); err != nil {
			log.Printf("ListEmployees error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, list)
	}
}

// CreateEmployee handles POST /employees with ID gap reuse
func CreateEmployee(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var e Employee
		if err := c.ShouldBindJSON(&e); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if e.PayDate != nil {
			if _, err := time.Parse("2006-01-02", *e.PayDate); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid pay_date format, use YYYY-MM-DD"})
				return
			}
		}

		tx := db.MustBegin()

		var ids []int
		if err := tx.Select(&ids, "SELECT CAST(id AS INTEGER) FROM employees ORDER BY id"); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		next := 1
		for _, id := range ids {
			if id == next {
				next++
			} else if id > next {
				break
			}
		}
		e.ID = fmt.Sprintf("%07d", next)

		if _, err := tx.NamedExec(`
		INSERT INTO employees (
		  id, prefix, first_name, last_name, nickname, position_id,
		  color, salary, pay_date, has_social_security,
		  social_security_number, tax_deduction, hour_rate, overtime_rate,
		  leave_personal, leave_vacation, leave_sick,
		  role_id, email, password_hash, status,
		  pay_channel, account_type, bank, account_number, bank_branch, created_at
		) VALUES (
		  :id, :prefix, :first_name, :last_name, :nickname, :position_id,
		  :color, :salary, :pay_date, :has_social_security,
		  :social_security_number, :tax_deduction, :hour_rate, :overtime_rate,
		  :leave_personal, :leave_vacation, :leave_sick,
		  :role_id, :email, :password_hash, :status,
		  :pay_channel, :account_type, :bank, :account_number, :bank_branch, NOW()
		)`, &e); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if _, err := tx.Exec(
			"SELECT setval(pg_get_serial_sequence('employees','id'), (SELECT MAX(CAST(id AS INTEGER)) FROM employees))",
		); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if err := tx.Commit(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"id": e.ID})
	}
}

// UpdateEmployee updates existing employee
func UpdateEmployee(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var e Employee
		if err := c.ShouldBindJSON(&e); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		e.ID = id
		if _, err := db.NamedExec(`
		UPDATE employees SET
		  prefix=:prefix, first_name=:first_name, last_name=:last_name,
		  nickname=:nickname, position_id=:position_id, color=:color,
		  salary=:salary, pay_date=:pay_date, has_social_security=:has_social_security,
		  social_security_number=:social_security_number,
		  tax_deduction=:tax_deduction, hour_rate=:hour_rate, overtime_rate=:overtime_rate,
		  leave_personal=:leave_personal, leave_vacation=:leave_vacation, leave_sick=:leave_sick,
		  role_id=:role_id, email=:email, status=:status,
		  pay_channel=:pay_channel, account_type=:account_type,
		  bank=:bank, account_number=:account_number, bank_branch=:bank_branch
		WHERE id=:id
		`, &e); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusOK)
	}
}

// DeleteEmployee deletes an employee by id
func DeleteEmployee(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		if _, err := db.Exec("DELETE FROM employees WHERE id=$1", id); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusOK)
	}
}
