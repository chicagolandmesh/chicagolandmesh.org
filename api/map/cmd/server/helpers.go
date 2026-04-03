package main

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime"
	"net/http"
	"net/url"
	"os"
	"strconv"

	"github.com/go-playground/form/v4"

	"github.com/phuslu/log"
)

func errorsIsMany(err error, errs ...error) bool {
	for _, e := range errs {
		if errors.Is(err, e) {
			return true
		}
	}
	return false
}

func getEnv(envKey string, defaultValue string) string {
	if val := os.Getenv(envKey); val != "" {
		return val
	}
	return defaultValue
}

func getBoolEnv(key string, defaultValue bool) bool {
	if val, ok := os.LookupEnv(key); ok {
		if b, err := strconv.ParseBool(val); err == nil {
			return b
		}
	}
	return defaultValue
}

func addQueryParam(base url.URL, key string, val string) url.URL {
	q := base.Query()
	q.Set(key, val)
	base.RawQuery = q.Encode()
	return base
}

func addQueryParams(base string, params map[string]string) (string, error) {
	u, err := url.Parse(base)
	if err != nil {
		return "", err
	}

	q := u.Query()
	for key, val := range params {
		q.Set(key, val)
	}

	u.RawQuery = q.Encode()

	return u.String(), nil
}

func generateNonce(length int) string {
	buffer := make([]byte, length)
	rand.Read(buffer)
	return base64.RawURLEncoding.EncodeToString(buffer)
}

func getLogEntry(logger *log.Logger, level log.Level) *log.Entry {
	switch level {
	case log.TraceLevel:
		return logger.Trace()
	case log.DebugLevel:
		return logger.Debug()
	case log.InfoLevel:
		return logger.Info()
	case log.WarnLevel:
		return logger.Warn()
	case log.ErrorLevel:
		return logger.Error()
	case log.FatalLevel:
		return logger.Fatal()
	case log.PanicLevel:
		return logger.Panic()
	default:
		return logger.Info()
	}
}

func (server *server) debug(r *http.Request, payload any) {
	rl := contextGetResponseWriterLogger(r)
	rl.AddPayload(payload)
	if userID := server.getUserID(r); userID != 0 {
		rl.AddUserID(userID)
	}
}

func (server *server) decode(w http.ResponseWriter, r *http.Request, dst any) error {
	mediaType, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if err != nil {
		return apiError{
			StatusCode: http.StatusBadRequest,
			Message:    "invalid content type",
			Err:        err,
		}
	}

	switch mediaType {
	case "application/json":
		err := json.NewDecoder(r.Body).Decode(dst)
		if err != nil {
			var invalidUnmarshalError *json.InvalidUnmarshalError
			if errors.As(err, &invalidUnmarshalError) {
				return apiError{
					StatusCode: http.StatusInternalServerError,
					Message:    "failed to decode request",
					Err:        err,
				}
			}
			return apiError{
				StatusCode: http.StatusBadRequest,
				Message:    "invalid json",
				Err:        err,
			}
		}
	case "application/x-www-form-urlencoded":
		if err := r.ParseForm(); err != nil {
			return apiError{
				StatusCode: http.StatusInternalServerError,
				Message:    "failed to parse form",
				Err:        err,
			}
		}

		if err := form.NewDecoder().Decode(dst, r.PostForm); err != nil {
			if _, ok := err.(form.DecodeErrors); ok {
				return apiError{
					StatusCode: http.StatusBadRequest,
					Message:    "invalid form",
					Err:        err,
				}
			}
			return apiError{
				StatusCode: http.StatusInternalServerError,
				Message:    "failed to decode form",
				Err:        err,
			}
		}
	default:
		return apiError{
			StatusCode: http.StatusUnsupportedMediaType,
			Message:    "unsupported media type",
			Err:        nil,
		}
	}

	return nil
}

func writeJSON(w http.ResponseWriter, status int, v any) error {
	raw, err := json.Marshal(v)
	if err != nil {
		return err
	}

	w.Header().Set("Content-Length", strconv.Itoa(len(raw)+1))
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(raw)
	w.Write([]byte("\n"))

	return nil
}

func readJSON(r *http.Response, v any) error {
	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		return fmt.Errorf("failed to read response body (http %d): %w", r.StatusCode, err)
	}

	if err := json.Unmarshal(body, &v); err != nil {
		return fmt.Errorf("failed to decode json response (http %d): %w", r.StatusCode, err)
	}

	return nil
}
