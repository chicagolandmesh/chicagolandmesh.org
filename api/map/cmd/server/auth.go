package main

import (
	"net/http"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func (server *server) loginHandler(w http.ResponseWriter, r *http.Request) {
	if server.isUserAuthenticated(r) {
		http.Redirect(w, r, server.config.mapURL, http.StatusFound)
		return
	}

	state := generateNonce(32)

	http.SetCookie(w, &http.Cookie{
		Name:     "state",
		Value:    state,
		Path:     "/api/",
		MaxAge:   10 * 60,
		Expires:  time.Now().Add(10 * time.Minute),
		HttpOnly: true,
		Secure:   server.config.secure,
		SameSite: http.SameSiteLaxMode,
	})

	authURL := addQueryParam(server.config.authURL, "state", state)
	http.Redirect(w, r, authURL.String(), http.StatusFound)
}

func (server *server) logoutHandler(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/api/",
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		Secure:   server.config.secure,
		SameSite: http.SameSiteStrictMode,
	})
	w.WriteHeader(http.StatusNoContent)
}

type userResponse struct {
	ID       string `json:"id"`
	Username string `json:"username,omitempty"`
	Privacy  *bool  `json:"privacy,omitempty"`
}

type authenticationResponse struct {
	User      userResponse `json:"user"`
	ExpiresAt string       `json:"expires_at"`
}

func newAuthenticationResponse(userID int, expiresAt time.Time) authenticationResponse {
	return authenticationResponse{
		User:      userResponse{ID: strconv.Itoa(userID)},
		ExpiresAt: expiresAt.Format(time.RFC3339),
	}
}

func (server *server) checkAuthenticationHandler(w http.ResponseWriter, r *http.Request) {
	response := newAuthenticationResponse(server.getUserID(r), server.getUserExpiration(r))
	if err := writeJSON(w, http.StatusOK, response); err != nil {
		server.error(w, r, "failed to marshal user response to json", err)
		return
	}
}

func (server *server) createToken(userID string, expiration time.Time) (string, error) {
	claims := jwt.RegisteredClaims{
		Subject:   userID,
		ExpiresAt: jwt.NewNumericDate(expiration),
		NotBefore: jwt.NewNumericDate(time.Now()),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(server.config.tokenSecret))
}

func (server *server) verifyToken(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(
		tokenString,
		func(token *jwt.Token) (any, error) {
			return []byte(server.config.tokenSecret), nil
		},
		jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}),
	)
	if err != nil {
		return nil, err
	}
	return token, nil
}

type UserClaims struct {
	Subject   int
	ExpiresAt time.Time
	NotBefore time.Time
	IssuedAt  time.Time
}

func getUserClaimsFromToken(token *jwt.Token) (*UserClaims, error) {
	user := &UserClaims{}

	subject, err := token.Claims.GetSubject()
	if err != nil {
		return nil, err
	}

	userID, err := strconv.Atoi(subject)
	if err != nil {
		return nil, err
	}
	user.Subject = userID

	expiresAt, err := token.Claims.GetExpirationTime()
	if err != nil {
		return nil, err
	}
	user.ExpiresAt = expiresAt.Time

	notBefore, err := token.Claims.GetNotBefore()
	if err != nil {
		return nil, err
	}
	user.NotBefore = notBefore.Time

	issuedAt, err := token.Claims.GetIssuedAt()
	if err != nil {
		return nil, err
	}
	user.IssuedAt = issuedAt.Time

	return user, nil
}

func (server *server) isUserAuthenticated(r *http.Request) bool {
	return contextGetUserClaims(r) != nil
}

func (server *server) getUserID(r *http.Request) int {
	userClaims := contextGetUserClaims(r)
	if userClaims == nil {
		return 0
	}
	return userClaims.Subject
}

func (server *server) getUserExpiration(r *http.Request) time.Time {
	userClaims := contextGetUserClaims(r)
	if userClaims == nil {
		return time.Time{}
	}
	return userClaims.ExpiresAt
}
