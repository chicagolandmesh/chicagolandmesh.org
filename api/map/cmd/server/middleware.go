package main

import (
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"path"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/handlers"
	"github.com/phuslu/log"
	"github.com/throttled/throttled/v2"
	"github.com/throttled/throttled/v2/store/memstore"
)

func (server *server) recoverPanic(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				w.Header().Set("Connection", "close")
				server.error(w, r, "panic encountered", fmt.Errorf("%v", err))
			}
		}()

		next.ServeHTTP(w, r)
	})
}

func (server *server) proxyHeaders(next http.Handler) http.Handler {
	return handlers.ProxyHeaders(next)
}

type responseWriterRecorder struct {
	wrapped       http.ResponseWriter
	statusCode    int
	headerWritten bool
	size          int
}

func (rr *responseWriterRecorder) Header() http.Header {
	return rr.wrapped.Header()
}

func (rr *responseWriterRecorder) Write(b []byte) (int, error) {
	rr.headerWritten = true
	size, err := rr.wrapped.Write(b)
	rr.size += size
	return size, err
}

func (rr *responseWriterRecorder) WriteHeader(statusCode int) {
	rr.wrapped.WriteHeader(statusCode)
	if !rr.headerWritten {
		rr.statusCode = statusCode
		rr.headerWritten = true
	}
}

type responseWriterLogger struct {
	level   log.Level
	caller  string
	goID    int64
	error   error
	payload any
	userID  int
}

func (rl *responseWriterLogger) AddCaller(pc uintptr, file string, line int, ok bool) {
	if !ok {
		return
	}

	dir, file := path.Split(file)
	if dir != "" {
		file = path.Base(dir) + "/" + file
	}

	rl.caller = fmt.Sprintf("%s:%d", file, line)
}

func (rl *responseWriterLogger) AddGoID(goID int64) {
	rl.goID = goID
}

func (rl *responseWriterLogger) AddError(err error) {
	if err != nil {
		rl.error = err
		rl.level = log.ErrorLevel
	}
}

func (rl *responseWriterLogger) AddPayload(payload any) {
	rl.payload = payload
}

func (rl *responseWriterLogger) AddUserID(userID int) {
	rl.userID = userID
}

type sizeReader struct {
	rc   io.ReadCloser
	size int
}

func (r *sizeReader) Read(p []byte) (int, error) {
	n, err := r.rc.Read(p)
	r.size += n
	return n, err
}

func (r *sizeReader) Close() error {
	return r.rc.Close()
}

func (server *server) logRequest(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		rec := &responseWriterRecorder{
			wrapped:    w,
			statusCode: http.StatusOK,
		}

		log := &responseWriterLogger{
			level: log.InfoLevel,
		}
		r = contextSetResponseWriterLogger(r, log)

		bodyReader := &sizeReader{
			rc: r.Body,
		}
		r.Body = bodyReader

		next.ServeHTTP(rec, r)

		for key := range r.Header {
			switch strings.ToLower(key) {
			case "cookie", "set-cookie", "authorization", "proxy-authorization":
				r.Header.Set(key, "*****")
			}
		}

		// level
		entry := getLogEntry(server.log, log.level)
		if log.caller != "" && log.goID != 0 {
			entry.Str("caller", log.caller)
			entry.Int64("goid", log.goID)
		}

		// error
		if log.error != nil {
			entry.Err(log.error)
		}

		// request
		ip, port, err := net.SplitHostPort(r.RemoteAddr)
		if err != nil {
			ip = r.RemoteAddr
		}

		entry.Str("remote_ip", ip)
		if port != "" {
			entry.Str("remote_port", port)
		}
		entry.Str("proto", r.Proto)
		entry.Str("method", r.Method)
		entry.Str("host", r.Host)
		entry.Str("uri", r.RequestURI)
		entry.Any("headers", r.Header)

		// debug
		if log.payload != nil {
			entry.Any("payload", log.payload)
		}
		if log.userID != 0 {
			entry.Any("user_id", log.userID)
		}

		// stats
		entry.Int("status", rec.statusCode)
		entry.Int("bytes_read", bodyReader.size)
		entry.Int("bytes_wrote", rec.size)
		entry.Float64("duration", time.Since(start).Seconds())

		entry.Msg("handled request")
	})
}

func (server *server) rateLimit(next http.Handler) http.Handler {
	store, err := memstore.NewCtx(65536)
	if err != nil {
		server.log.Fatal().Err(err).Msg("failed to initialize memory store for rate limiter")
	}

	quota := throttled.RateQuota{
		MaxRate:  throttled.PerMin(20),
		MaxBurst: 10,
	}

	gcraRateLimiter, err := throttled.NewGCRARateLimiterCtx(store, quota)
	if err != nil {
		server.log.Fatal().Err(err).Msg("failed to initialize rate limiter")
	}

	httpRateLimiter := throttled.HTTPRateLimiterCtx{
		DeniedHandler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			clientError(w, http.StatusTooManyRequests)
		}),
		Error: func(w http.ResponseWriter, r *http.Request, err error) {
			server.error(w, r, "http rate limiter encountered an error", err)
		},
		RateLimiter: gcraRateLimiter,
		VaryBy: &throttled.VaryBy{
			RemoteAddr: true,
			Cookies:    []string{"token"},
		},
	}

	return httpRateLimiter.RateLimit(next)
}

func (server *server) noCache(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-cache")
		next.ServeHTTP(w, r)
	})
}

func (server *server) checkAuthentication(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("token")
		if err != nil {
			if errors.Is(err, http.ErrNoCookie) {
				next.ServeHTTP(w, r)
				return
			}
			server.error(w, r, "failed to get token from cookie", err)
			return
		}

		token, err := server.verifyToken(cookie.Value)
		if err != nil {
			if errorsIsMany(err,
				jwt.ErrTokenExpired,
				jwt.ErrTokenSignatureInvalid,
				jwt.ErrTokenMalformed,
				jwt.ErrTokenNotValidYet,
			) {
				clientError(w, http.StatusUnauthorized)
				return
			}
			server.error(w, r, "failed to verify jwt token", err)
			return
		}

		userClaims, err := getUserClaimsFromToken(token)
		if err != nil {
			server.error(w, r, "failed to get user claims from token", err)
			return
		}

		r = contextSetUserClaims(r, userClaims)

		next.ServeHTTP(w, r)
	})
}

func (server *server) requireAuthentication(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !server.isUserAuthenticated(r) {
			clientError(w, http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (server *server) requireOwnership(next http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := server.getUserID(r)
		nodeID := r.PathValue("id")

		if nodeID == "" {
			panic("no id placeholder in route")
		}

		owns, err := server.nodes.Owns(userID, nodeID)
		if err != nil {
			server.error(w, r, "failed to check ownership", err)
			return
		}
		if !owns {
			clientError(w, http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}
