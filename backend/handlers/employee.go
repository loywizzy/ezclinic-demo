package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

type Employee struct {
	ID         string  `db:"id" json:"id"`
	Prefix     string  `db:"prefix" json:"prefix"`
	FirstName  string  `db:"first_name" json:"first_name"`
	LastName   string  `db:"last_name" json:"last_name"`
	Nickname   string  `db:"nickname" json:"nickname"`
	PositionID string  `db:"position_id" json:"position_id"`
	Salary     float64 `db:"salary" json:"salary"`
	Email      string  `db:"email" json:"email"`
}

func ListEmployees(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []Employee
		db.Select(&list, `
      SELECT id, prefix||' '||first_name||' '||last_name AS full_name,
             position_id, salary, email
        FROM employees ORDER BY id`)
		c.JSON(http.StatusOK, list)
	}
}

func CreateEmployee(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var emp Employee
		if err := c.ShouldBindJSON(&emp); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		_, err := db.NamedExec(`
      INSERT INTO employees 
      (id,prefix,first_name,last_name,nickname,position_id,color,
       salary,pay_date,has_social_security,social_security_number,
       tax_deduction,hour_rate,overtime_rate,
       leave_personal,leave_vacation,leave_sick,
       role,email,password_hash,status,
       pay_channel,account_type,bank,account_number,bank_branch)
      VALUES 
      (:id,:prefix,:first_name,:last_name,:nickname,:position_id,:color,
       :salary,:pay_date,:has_social_security,:social_security_number,
       :tax_deduction,:hour_rate,:overtime_rate,
       :leave_personal,:leave_vacation,:leave_sick,
       :role,:email,:password_hash,:status,
       :pay_channel,:account_type,:bank,:account_number,:bank_branch)
    `, &emp)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusCreated)
	}
}
