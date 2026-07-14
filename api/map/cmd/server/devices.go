package main

import (
	"net/http"

	"github.com/chicagolandmesh/chicagolandmesh.org/api/map/internal/data"
)

func (server *server) getDeviceListHandler(w http.ResponseWriter, r *http.Request) {
	response := data.GetDevicesResponse()

	w.Header().Add("Cache-Control", response.CacheControl)
	w.Header().Add("ETag", response.ETag)

	if r.Header.Get("If-None-Match") == response.ETag {
		w.WriteHeader(http.StatusNotModified)
		return
	}

	w.Header().Add("Content-Length", response.ContentLength)
	w.Header().Add("Content-Type", response.ContentType)

	w.WriteHeader(http.StatusOK)
	w.Write(response.Body)
}
