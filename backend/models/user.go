package models

type User struct {
	ID           int    `db:"id" json:"id"`
	FullName     string `db:"full_name" json:"full_name"`
	Email        string `db:"email" json:"email"`
	PasswordHash string `db:"password_hash" json:"-"`
	Role         string `db:"role" json:"role"`
}
