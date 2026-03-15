package models

import (
	"context"
	"database/sql"
)

type DB interface {
	Exec(string, ...any) (sql.Result, error)
	Prepare(string) (*sql.Stmt, error)
	Query(string, ...any) (*sql.Rows, error)
	QueryRow(string, ...any) *sql.Row
}

func BeginTx(db *sql.DB, ctx context.Context) (context.Context, *sql.Tx, error) {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return ctx, nil, err
	}

	ctxWithTx := context.WithValue(ctx, txContextKey, tx)

	return ctxWithTx, tx, nil
}
