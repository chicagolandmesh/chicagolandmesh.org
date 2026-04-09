package main

import (
	"net/http"

	"github.com/justinas/alice"
)

func (server *server) routes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/", server.notFound)
	mux.HandleFunc("GET /api/health", server.healthCheckHandler)

	dynamic := alice.New(server.noCache, server.checkAuthentication)

	mux.Handle("GET /api/login", dynamic.ThenFunc(server.loginHandler))
	mux.Handle("GET /api/logout", dynamic.ThenFunc(server.logoutHandler))
	mux.Handle("GET /api/callback", dynamic.ThenFunc(server.discordCallbackHandler))
	mux.Handle("GET /api/nodes", dynamic.ThenFunc(server.getAllNodesHandler))

	protected := dynamic.Append(server.requireAuthentication)

	mux.Handle("GET /api/me", protected.ThenFunc(server.checkAuthenticationHandler))
	mux.Handle("GET /api/me/locations", protected.ThenFunc(server.getPersonalNodesHandler))
	mux.Handle("POST /api/nodes", protected.ThenFunc(server.createNodeHandler))
	mux.Handle("PUT /api/nodes/{id}", protected.Then(server.requireOwnership(server.updateNodeHandler)))
	mux.Handle("PATCH /api/nodes/{id}", protected.Then(server.requireOwnership(server.patchNodeHandler)))
	mux.Handle("DELETE /api/nodes/{id}", protected.Then(server.requireOwnership(server.deleteNodeHandler)))

	standard := alice.New(server.recoverPanic, server.proxyHeaders, server.logRequest, server.rateLimit)
	return standard.Then(mux)
}
