package handlers

import (
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"
)

type loginReq struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func Login(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req loginReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// ดึงข้อมูลพนักงาน + กลุ่มสิทธิ์
		var emp struct {
			ID           string `db:"id"`
			FirstName    string `db:"first_name"`
			LastName     string `db:"last_name"`
			Email        string `db:"email"`
			PasswordHash string `db:"password_hash"`
			Role         string `db:"role"`
		}

		query := `
      SELECT 
        e.id, e.first_name, e.last_name, e.email, e.password_hash,
        pg.name AS role
      FROM employees e
      JOIN permission_groups pg 
        ON e.role_id = pg.id
      WHERE e.email = $1
    `
		err := db.Get(&emp, query, req.Email)
		if err != nil {
			// ไม่เจอ user หรือเกิด SQL error
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}

		// ตรวจรหัสผ่าน
		if bcrypt.CompareHashAndPassword(
			[]byte(emp.PasswordHash), []byte(req.Password)) != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}

		// สร้าง JWT
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"uid":  emp.ID,
			"role": emp.Role,
			"exp":  time.Now().Add(24 * time.Hour).Unix(),
		})
		signed, _ := token.SignedString([]byte(os.Getenv("JWT_SECRET")))

		// ตอบกลับ
		fullName := emp.FirstName + " " + emp.LastName
		c.JSON(http.StatusOK, gin.H{
			"token": signed,
			"user": gin.H{
				"id":        emp.ID,
				"full_name": fullName,
				"role":      emp.Role,
			},
		})
	}
}
