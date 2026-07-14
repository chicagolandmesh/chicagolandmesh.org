package data

import (
	"crypto/sha256"
	_ "embed"
	"encoding/json"
	"fmt"
	"slices"
	"strconv"
)

//go:generate ../../scripts/generate_devices.sh

//go:embed "devices.json"
var devicesJSON []byte

type DevicesResponse struct {
	Body          []byte
	CacheControl  string
	ContentLength string
	ContentType   string
	ETag          string
}

var (
	devices         map[string]string
	deviceSlugs     []string
	devicesResponse DevicesResponse
)

func init() {
	err := json.Unmarshal(devicesJSON, &devices)
	if err != nil {
		panic("failed to unmarshal embedded devices JSON: " + err.Error())
	}

	deviceSlugs = make([]string, 0, len(devices))
	for slug := range devices {
		deviceSlugs = append(deviceSlugs, slug)
	}
	slices.Sort(deviceSlugs)

	hash := sha256.Sum256(devicesJSON)

	devicesResponse = DevicesResponse{
		Body:          devicesJSON,
		CacheControl:  "public, max-age=86400, must-revalidate",
		ContentLength: strconv.Itoa(len(devicesJSON)),
		ContentType:   "application/json",
		ETag:          fmt.Sprintf(`"%x"`, hash[:8]),
	}
}

func GetDevices() map[string]string {
	return devices
}

func GetDeviceSlugs() []string {
	return deviceSlugs
}

func GetDevicesResponse() DevicesResponse {
	return devicesResponse
}
