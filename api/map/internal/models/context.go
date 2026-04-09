package models

import (
	"context"
	"database/sql"
)

type contextKey string

const txContextKey = contextKey("tx")

func contextGetTx(ctx context.Context) (*sql.Tx, bool) {
	tx, ok := ctx.Value(txContextKey).(*sql.Tx)
	return tx, ok
}
