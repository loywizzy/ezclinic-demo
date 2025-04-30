package database

import (
	"fmt"
	"os"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

var DB *sqlx.DB

func Connect() error {
	// Railway injects ENV: PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
	host := os.Getenv("PGHOST")
	port := os.Getenv("PGPORT")
	user := os.Getenv("PGUSER")
	pass := os.Getenv("PGPASSWORD")
	dbname := os.Getenv("PGDATABASE")

	// If you deployed outside Railway, fall back to manual config
	if host == "" {
		host = "postgres.railway.internal"
		port = "36682"
		user = "postgres"
		pass = "krTchFdUNnZEqdjnTDyxmfVsXAAQrFhw"
		dbname = "railway"
	}

	// toggle SSL by env (default disable for *.internal)
	ssl := os.Getenv("PGSSLMODE") // allow override from Railway → “require” ในกรณี up.railway.app
	if ssl == "" {
		ssl = "disable"
	}

	dsn := fmt.Sprintf(
		"postgresql://%s:%s@%s:%s/%s?sslmode=%s",
		user, pass, host, port, dbname, ssl,
	)

	db, err := sqlx.Connect("postgres", dsn)
	if err != nil {
		return err
	}
	db.SetConnMaxLifetime(time.Minute * 5)
	DB = db
	return nil
}
