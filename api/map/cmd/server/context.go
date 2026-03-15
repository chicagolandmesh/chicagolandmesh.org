package main

import (
	"context"
	"net/http"
)

type contextKey string

const userClaimsKey = contextKey("userClaims")

func contextSetUserClaims(r *http.Request, userClaims *UserClaims) *http.Request {
	ctx := context.WithValue(r.Context(), userClaimsKey, userClaims)
	return r.WithContext(ctx)
}

func contextGetUserClaims(r *http.Request) *UserClaims {
	userClaims, _ := r.Context().Value(userClaimsKey).(*UserClaims)
	return userClaims
}

const responseWriterLoggerKey = contextKey("responseWriterLogger")

func contextSetResponseWriterLogger(r *http.Request, rl *responseWriterLogger) *http.Request {
	ctx := context.WithValue(r.Context(), responseWriterLoggerKey, rl)
	return r.WithContext(ctx)
}

func contextGetResponseWriterLogger(r *http.Request) *responseWriterLogger {
	rl, _ := r.Context().Value(responseWriterLoggerKey).(*responseWriterLogger)
	return rl
}
