package main

import (
	"errors"
	"fmt"
	"net/http"
	"runtime"

	"github.com/phuslu/log"
)

type apiError struct {
	StatusCode int
	Message    string
	Err        error
}

func (e apiError) Error() string {
	if e.Err == nil {
		return e.Message
	}
	if e.Message == "" {
		return e.Err.Error()
	}
	return e.Message + ": " + e.Err.Error()
}

func (e apiError) Unwrap() error {
	return e.Err
}

type multiErrorResponse[T ~string] struct {
	Errors map[T][]string `json:"error"`
}

func newMultiErrorResponse[T ~string](errors map[T][]string) multiErrorResponse[T] {
	return multiErrorResponse[T]{
		Errors: errors,
	}
}

func clientError(w http.ResponseWriter, status int) {
	http.Error(w, http.StatusText(status), status)
}

func (server *server) error(w http.ResponseWriter, r *http.Request, msg string, err error) {
	var apiErr apiError
	if errors.As(err, &apiErr) && apiErr.StatusCode != http.StatusInternalServerError {
		clientError(w, apiErr.StatusCode)
		return
	}

	if rl := contextGetResponseWriterLogger(r); rl != nil {
		rl.AddError(fmt.Errorf("%s: %w", msg, err))
		rl.AddCaller(runtime.Caller(1))
		rl.AddGoID(log.Goid())
	} else {
		server.log.Error().Err(err).Stack().Caller(2).Msg(msg)
	}

	http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
}

func (server *server) notFound(w http.ResponseWriter, r *http.Request) {
	http.Error(w, http.StatusText(http.StatusNotFound), http.StatusNotFound)
}
