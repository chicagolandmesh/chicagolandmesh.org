package main

import "net/http"

func (server *server) healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	if err := server.db.PingContext(r.Context()); err != nil {
		http.Error(w, http.StatusText(http.StatusServiceUnavailable), http.StatusServiceUnavailable)
		return
	}

	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}
