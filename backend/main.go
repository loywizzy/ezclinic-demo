package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"ezclinic-demo/backend/database"
	"ezclinic-demo/backend/handlers"
	"ezclinic-demo/backend/middleware"
)

func main() {

	if err := godotenv.Load(".env"); err != nil {
		log.Println("no .env file found (ใช้ ENV จากระบบแทน)")
	}

	// ต่อ DB
	if err := database.Connect(); err != nil {
		log.Fatalf("ไม่สามารถเชื่อมต่อฐานข้อมูล: %v", err)
	}
	log.Println("เชื่อมต่อฐานข้อมูลสำเร็จ")

	// สร้าง router
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := r.Group("/api")
	api.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
	api.POST("/auth/login", handlers.Login(database.DB))

	// protected routes
	protected := api.Group("/")
	protected.Use(middleware.JWT())
	{
		// เรียกแค่ DashboardCount (ไม่มี Dashboard)
		protected.GET("/dashboard", handlers.DashboardCount(database.DB))

		// ตัวอย่าง CRUD พนักงาน
		protected.GET("/employees", handlers.ListEmployees(database.DB))
		protected.POST("/employees", handlers.CreateEmployee(database.DB))
		protected.PUT("/employees/:id", handlers.UpdateEmployee(database.DB))
		protected.DELETE("/employees/:id", handlers.DeleteEmployee(database.DB))

		protected.GET("/customers", handlers.ListCustomers(database.DB))
		protected.POST("/customers", handlers.CreateCustomer(database.DB))
		protected.PUT("/customers/:id", handlers.UpdateCustomer(database.DB))
		protected.DELETE("/customers/:id", handlers.DeleteCustomer(database.DB))

		protected.GET("/positions", handlers.ListPositions(database.DB))
		protected.POST("/positions", handlers.CreatePosition(database.DB))
		protected.PUT("/positions/:id", handlers.UpdatePosition(database.DB))
		protected.DELETE("/positions/:id", handlers.DeletePosition(database.DB))

		protected.GET("/permissions", handlers.ListPermissions(database.DB))
		protected.POST("/permissions", handlers.CreatePermissionGroup(database.DB))
		protected.PUT("/permissions/:id", handlers.UpdatePermissionGroup(database.DB))
		protected.DELETE("/permissions/:id", handlers.DeletePermissionGroup(database.DB))
	}

	// รันเซิร์ฟเวอร์
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server running on :%s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
