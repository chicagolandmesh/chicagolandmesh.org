package main

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/chicagolandmesh/chicagolandmesh.org/api/internal/models"
	"github.com/chicagolandmesh/chicagolandmesh.org/api/migrations"

	"github.com/DeRuina/timberjack"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/phuslu/log"

	_ "github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/mattn/go-sqlite3"
)

type server struct {
	config *config
	log    *log.Logger
	db     *sql.DB
	users  models.UserModel
	nodes  models.NodeModel
}

func main() {
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)

	config, err := loadConfig()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	logger := getLogger(config.logPath)

	db, err := openDB(config.dsn)
	if err != nil {
		logger.Fatal().Err(err).Msg("failed to open database")
	}
	defer db.Close()

	server := &server{
		config: config,
		log:    logger,
		db:     db,
		users:  models.UserModel{DB: db},
		nodes:  models.NodeModel{DB: db},
	}

	go func() {
		logger.Info().Str("address", config.addr).Str("database", config.dsn).Msg("server started")
		if err := http.ListenAndServe(config.addr, server.routes()); err != nil {
			logger.Fatal().Err(err).Msg("failed to start http server")
		}
	}()

	signal := <-c
	logger.Info().Any("signal", signal).Msg("closing server")
}

func getLogger(path string) *log.Logger {
	consoleWriter := &log.ConsoleWriter{
		Writer:      os.Stdout,
		ColorOutput: true,
	}

	var writer log.Writer = consoleWriter

	if path != "" {
		rotator := &timberjack.Logger{
			Filename:    path,
			MaxSize:     10, // megabytes
			Compression: "gzip",
		}
		writer = &log.MultiEntryWriter{
			consoleWriter,
			&log.IOWriter{Writer: rotator},
		}
	}

	return &log.Logger{
		Level:        log.InfoLevel,
		TimeLocation: time.UTC,
		Writer:       writer,
	}
}

func openDB(dsn string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %s", err)
	}

	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to open database: %s", err)
	}

	source, err := iofs.New(migrations.Files, ".")
	if err != nil {
		return nil, fmt.Errorf("failed to create migration source: %s", err)
	}

	migrator, err := migrate.NewWithSourceInstance("iofs", source, "sqlite3://"+dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to create migrator: %s", err)
	}

	if err := migrator.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return nil, fmt.Errorf("failed to migrate database: %s", err)
	}

	return db, nil
}
