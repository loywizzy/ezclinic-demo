// check.go
package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	// วาง hash ที่ดึงมาจากตาราง employees ตรงนี้
	hash := "$2a$10$vwphZb6uUw3cybcF6.PL1eeWRf.ElWt.79oK1SP32Ov0z1pwVIPbm"
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte("admin123"))
	if err != nil {
		fmt.Println("❌ Password does NOT match:", err)
	} else {
		fmt.Println("✅ Password matches")
	}
}
