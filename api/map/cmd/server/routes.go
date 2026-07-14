package main

import (
	"net/http"

	"github.com/justinas/alice"
)

func (server *server) routes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/", server.notFound)
	mux.HandleFunc("GET /health", server.healthCheckHandler)
	mux.HandleFunc("GET /devices", server.getDeviceListHandler)

	dynamic := alice.New(server.noCache, server.checkAuthentication)

	mux.Handle("GET /login", dynamic.ThenFunc(server.loginHandler))
	mux.Handle("GET /logout", dynamic.ThenFunc(server.logoutHandler))
	mux.Handle("GET /callback", dynamic.ThenFunc(server.discordCallbackHandler))
	mux.Handle("GET /nodes", dynamic.ThenFunc(server.getAllNodesHandler))

	protected := dynamic.Append(server.requireAuthentication)

	mux.Handle("GET /me", protected.ThenFunc(server.checkAuthenticationHandler))
	mux.Handle("GET /me/locations", protected.ThenFunc(server.getPersonalNodesHandler))
	mux.Handle("POST /nodes", protected.ThenFunc(server.createNodeHandler))
	mux.Handle("PUT /nodes/{id}", protected.Then(server.requireOwnership(server.updateNodeHandler)))
	mux.Handle("PATCH /nodes/{id}", protected.Then(server.requireOwnership(server.patchNodeHandler)))
	mux.Handle("DELETE /nodes/{id}", protected.Then(server.requireOwnership(server.deleteNodeHandler)))

	standard := alice.New(server.recoverPanic, server.proxyHeaders, server.logRequest, server.rateLimit)
	return standard.Then(mux)
}
