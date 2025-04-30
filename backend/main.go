package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"ezclinic-demo/backend/database"
	"ezclinic-demo/backend/handlers"
	"ezclinic-demo/backend/middleware"
)

func main() {
	// ------------------------------------------------------------------
	// 1) โหลดตัวแปร ENV จาก .env (ถ้ามี) – เวลา deploy Railway จะไม่ใช้ไฟล์นี้
	// ------------------------------------------------------------------
	if err := godotenv.Load(".env"); err != nil {
		log.Println("no .env file found (ใช้ ENV จากระบบแทน)")
	}

	// ------------------------------------------------------------------
	// 2) ต่อฐานข้อมูล PostgreSQL
	// ------------------------------------------------------------------
	if err := database.Connect(); err != nil {
		log.Fatalf("ไม่สามารถเชื่อมต่อฐานข้อมูล: %v", err)
	}
	log.Println("เชื่อมต่อฐานข้อมูลสำเร็จ")

	// ------------------------------------------------------------------
	// 3) สร้าง Gin Engine + Middleware
	// ------------------------------------------------------------------
	r := gin.Default()
	r.Use(cors.Default()) // อนุญาตทุก Origin (ปรับตามต้องการ)

	// ------------------------------------------------------------------
	// 4) เส้นทางสาธารณะ
	// ------------------------------------------------------------------
	api := r.Group("/api")
	api.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// auth/login
	api.POST("/auth/login", handlers.Login(database.DB))

	// ------------------------------------------------------------------
	// 5) เส้นทางที่ต้องมี JWT
	// ------------------------------------------------------------------
	protected := api.Group("/")
	protected.Use(middleware.JWT())
	{
		protected.GET("/dashboard", handlers.Dashboard(database.DB))
		protected.GET("/employees", handlers.ListEmployees(database.DB))
		protected.POST("/employees", handlers.CreateEmployee(database.DB))

		// เพิ่ม route CRUD อื่น ๆ ที่นี่
	}

	// ------------------------------------------------------------------
	// 6) รันเซิร์ฟเวอร์
	// ------------------------------------------------------------------
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server running on :%s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
