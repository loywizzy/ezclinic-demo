package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	// เปลี่ยนเป็นรหัสผ่านที่ต้องการ (admin123)
	pass := "admin123"
	h, err := bcrypt.GenerateFromPassword([]byte(pass), bcrypt.DefaultCost)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(h))
}
