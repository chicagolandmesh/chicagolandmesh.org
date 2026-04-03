package main

import (
	"flag"
	"fmt"
	"net/url"
	"os"
	"strings"
)

type config struct {
	addr         string
	logPath      string
	dsn          string
	secure       bool
	mapURL       string
	tokenSecret  string
	clientID     string
	clientSecret string
	redirectURL  string
	authURL      url.URL
}

func loadConfig() (*config, error) {
	config := &config{}

	flag.StringVar(&config.addr, "addr", getEnv("ADDR", ":8080"), "http server address")
	flag.StringVar(&config.logPath, "log-path", os.Getenv("LOG_PATH"), "path to save log files. will not save if empty")
	flag.StringVar(&config.dsn, "dsn", os.Getenv("DSN"), "sqlite3 dsn address")
	flag.BoolVar(&config.secure, "secure", getBoolEnv("SECURE", true), "will set all cookies secure flag")
	flag.StringVar(&config.tokenSecret, "token-secret", os.Getenv("TOKEN_SECRET"), "jwt token private key")
	flag.StringVar(&config.mapURL, "map-url", getEnv("MAP_URL", "/map/"), "location of frontend map")
	flag.StringVar(&config.clientID, "client-id", os.Getenv("CLIENT_ID"), "discord oauth client id")
	flag.StringVar(&config.clientSecret, "client-secret", os.Getenv("CLIENT_SECRET"), "discord oauth client secret")
	flag.StringVar(&config.redirectURL, "redirect-url", os.Getenv("REDIRECT_URL"), "discord oauth redirect url")
	flag.Parse()

	var missingFields []string
	if config.dsn == "" {
		missingFields = append(missingFields, "dsn")
	}
	if config.tokenSecret == "" {
		missingFields = append(missingFields, "token-secret")
	}
	if config.mapURL == "" {
		missingFields = append(missingFields, "map-url")
	}
	if config.clientID == "" {
		missingFields = append(missingFields, "client-id")
	}
	if config.clientSecret == "" {
		missingFields = append(missingFields, "client-secret")
	}
	if config.redirectURL == "" {
		missingFields = append(missingFields, "redirect-url")
	}
	if len(missingFields) > 0 {
		return nil, fmt.Errorf("missing required configuration: %s", strings.Join(missingFields, ", "))
	}

	authURL, err := url.Parse("https://discord.com/api/oauth2/authorize")
	if err != nil {
		return nil, fmt.Errorf("failed to parse discord auth url: %w", err)
	}
	config.authURL = *authURL

	q := url.Values{}
	q.Add("client_id", config.clientID)
	q.Add("redirect_uri", config.redirectURL)
	q.Add("response_type", "code")
	q.Add("scope", "identify")
	config.authURL.RawQuery = q.Encode()

	return config, nil
}
