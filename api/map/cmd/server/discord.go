package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/chicagolandmesh/chicagolandmesh.org/api/internal/models"
)

func (server *server) discordCallbackHandler(w http.ResponseWriter, r *http.Request) {
	if discordErr := r.URL.Query().Get("error"); discordErr != "" {
		server.redirectDiscordError(w, r, discordError{
			Err:            discordErr,
			ErrDescription: r.URL.Query().Get("error_description"),
		})
		return
	}

	code := r.URL.Query().Get("code")
	callbackState := r.URL.Query().Get("state")

	cookieState, err := r.Cookie("state")
	if err != nil && !errors.Is(err, http.ErrNoCookie) {
		server.error(w, r, "failed to get state from cookie", err)
		return
	}

	if code == "" || callbackState == "" || cookieState == nil || cookieState.Value == "" {
		server.redirectDiscordError(w, r, discordError{
			Err:            "invalid_request",
			ErrDescription: "Request is missing required parameters",
		})
		return
	}

	if callbackState != cookieState.Value {
		server.redirectDiscordError(w, r, discordError{
			Err:            "state_mismatch",
			ErrDescription: "Request did not pass security check",
		})
		return
	}

	accessToken, err := getDiscordAccessToken(server.config.clientID, server.config.clientSecret, server.config.redirectURL, code)
	if err != nil {
		var discordErr discordError
		if errors.As(err, &discordErr) && discordErr.StatusCode == 400 {
			server.redirectDiscordError(w, r, discordErr)
			return
		}
		server.error(w, r, "failed to access token from discord", err)
		return
	}

	user, err := getDiscordUser(accessToken)
	if err != nil {
		server.error(w, r, "failed to get user info from discord", err)
		return
	}

	_, err = server.users.Insert(models.UserParams{
		ID:         user.ID,
		Username:   user.Username,
		GlobalName: user.GlobalName,
		Avatar:     user.Avatar,
	})
	if err != nil {
		server.error(w, r, "failed to insert user", err)
		return
	}

	tokenExpiration := time.Now().Add(time.Hour * 24 * 7) // 1 week

	token, err := server.createToken(user.ID, tokenExpiration)
	if err != nil {
		server.error(w, r, "failed to create jwt token for user", err)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    token,
		Path:     "/api/",
		Expires:  tokenExpiration,
		HttpOnly: true,
		Secure:   server.config.secure,
		SameSite: http.SameSiteStrictMode,
	})
	http.SetCookie(w, &http.Cookie{
		Name:     "state",
		Value:    "",
		Path:     "/api/",
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		Secure:   server.config.secure,
		SameSite: http.SameSiteLaxMode,
	})
	http.Redirect(w, r, server.config.mapURL, http.StatusSeeOther)
}

type discordOAuth struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
	Scope        string `json:"scope"`
}

func getDiscordAccessToken(clientID, clientSecret, redirectURL, code string) (string, error) {
	form := url.Values{}
	form.Set("client_id", clientID)
	form.Set("client_secret", clientSecret)
	form.Set("grant_type", "authorization_code")
	form.Set("code", code)
	form.Set("redirect_uri", redirectURL)
	form.Set("scope", "identify")

	req, err := http.NewRequest(http.MethodPost, "https://discord.com/api/oauth2/token", strings.NewReader(form.Encode()))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", getDiscordError(resp)
	}

	var auth discordOAuth
	if err = readJSON(resp, &auth); err != nil {
		return "", err
	}

	return auth.AccessToken, nil
}

type discordUser struct {
	ID         string `json:"id"`
	Username   string `json:"username"`
	GlobalName string `json:"global_name"`
	Avatar     string `json:"avatar"`
}

func getDiscordUser(accessToken string) (discordUser, error) {
	req, err := http.NewRequest(http.MethodGet, "https://discord.com/api/users/@me", nil)
	if err != nil {
		return discordUser{}, err
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return discordUser{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return discordUser{}, getDiscordError(resp)
	}

	var user discordUser
	if err := readJSON(resp, &user); err != nil {
		return discordUser{}, err
	}

	return user, nil
}

type discordError struct {
	StatusCode     int
	Err            string `json:"error"`
	ErrDescription string `json:"error_description"`
}

func (e discordError) Error() string {
	return fmt.Sprintf("discord returned error (%s) (http %d): %s", e.StatusCode, e.Error, e.ErrDescription)
}

func getDiscordError(resp *http.Response) error {
	discordError := discordError{StatusCode: resp.StatusCode}

	body, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if err != nil {
		return fmt.Errorf("failed to read response body (http %d): %s", resp.StatusCode, err)
	}

	err = json.Unmarshal(body, &discordError)
	if err != nil {
		return fmt.Errorf("failed to decode discord error response (http %d): %s", resp.StatusCode, err)
	}
	if discordError.Err == "" {
		return fmt.Errorf("failed to decode discord error response (http %d): missing error", resp.StatusCode)
	}

	return discordError
}

func (server *server) redirectDiscordError(w http.ResponseWriter, r *http.Request, e discordError) {
	redirectURL, err := addQueryParams(server.config.mapURL, map[string]string{
		"error":             e.Err,
		"error_description": e.ErrDescription,
	})
	if err != nil {
		server.error(w, r, "failed creating redirect url for discord error", err)
		return
	}
	http.Redirect(w, r, redirectURL, http.StatusSeeOther)
}
