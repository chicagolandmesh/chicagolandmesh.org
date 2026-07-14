package main

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/chicagolandmesh/chicagolandmesh.org/api/map/internal/data"
	"github.com/chicagolandmesh/chicagolandmesh.org/api/map/internal/models"
	"github.com/chicagolandmesh/chicagolandmesh.org/api/map/internal/validator"
)

type nodeResponse struct {
	ID         string        `json:"id"`
	Name       string        `json:"name"`
	Owner      *userResponse `json:"owner,omitempty"`
	PublicKey  *string       `json:"publicKey"`
	LngLat     [2]float64    `json:"lngLat"`
	Elevation  *int          `json:"elevation"`
	Frequency  float64       `json:"frequency"`
	Power      *string       `json:"power"`
	Device     *string       `json:"device"`
	Protocol   string        `json:"protocol"`
	Role       string        `json:"role"`
	MqttUplink bool          `json:"mqttUplink"`
	CreatedAt  string        `json:"createdAt"`
	UpdatedAt  *string       `json:"updatedAt"`
}

func newNodeResponse(node models.Node, owner models.User, userID int, isAuthenticated bool) nodeResponse {
	response := nodeResponse{
		ID:         node.ID,
		Name:       "Anonymous",
		PublicKey:  node.PublicKey,
		LngLat:     [2]float64{node.Longitude, node.Latitude},
		Elevation:  node.Elevation,
		Frequency:  node.Frequency,
		Power:      node.Power,
		Device:     node.Device,
		Protocol:   node.Protocol,
		Role:       node.Role,
		MqttUplink: node.MqttUplink,
		CreatedAt:  node.CreatedAt.Round(time.Hour).Format(time.RFC3339),
	}

	if node.Name != nil && *node.Name != "" {
		response.Name = *node.Name
	}

	if !node.UpdatedAt.IsZero() && node.UpdatedAt.After(node.CreatedAt.AddDate(0, 1, 0)) {
		updatedAt := node.UpdatedAt.Round(time.Hour).Format(time.RFC3339)
		response.UpdatedAt = &updatedAt
	}

	if isAuthenticated && (!owner.Hidden || userID == owner.ID) {
		response.Owner = &userResponse{
			ID:       strconv.Itoa(owner.ID),
			Username: owner.Username,
		}
		// need client-side to fill edit node form
		if userID == owner.ID {
			response.Owner.Privacy = &owner.Hidden
		}
	}

	return response
}

func (server *server) getAllNodesHandler(w http.ResponseWriter, r *http.Request) {
	nodes, users, err := server.nodes.GetAllWithUser()
	if err != nil {
		server.error(w, r, "failed to get all nodes from db", err)
		return
	}

	response := make([]nodeResponse, 0, len(nodes))
	for i, node := range nodes {
		nr := newNodeResponse(node, users[i], server.getUserID(r), server.isUserAuthenticated(r))
		response = append(response, nr)
	}

	if err := writeJSON(w, http.StatusOK, response); err != nil {
		server.error(w, r, "failed to write json", err)
		return
	}
}

type locationResponse struct {
	ID     string     `json:"id"`
	LngLat [2]float64 `json:"lngLat"`
}

func newLocationResponse(node models.Node) locationResponse {
	return locationResponse{
		ID:     node.ID,
		LngLat: [2]float64{node.Longitude, node.Latitude},
	}
}

func (server *server) getPersonalNodesHandler(w http.ResponseWriter, r *http.Request) {
	nodes, err := server.nodes.GetAllByUser(server.getUserID(r))
	if err != nil {
		server.error(w, r, "failed to get nodes", err)
		return
	}

	response := make([]locationResponse, 0, len(nodes))
	for _, node := range nodes {
		response = append(response, newLocationResponse(node))
	}

	if err := writeJSON(w, http.StatusOK, response); err != nil {
		server.error(w, r, "failed to write response", err)
		return
	}
}

type nodeRequest struct {
	Name       *string  `json:"name"       form:"name"`
	PublicKey  *string  `json:"publicKey"  form:"publicKey"`
	Latitude   *float64 `json:"latitude"   form:"latitude"`
	Longitude  *float64 `json:"longitude"  form:"longitude"`
	Elevation  *int     `json:"elevation"  form:"elevation"`
	Power      *string  `json:"power"      form:"power"`
	Device     *string  `json:"device"     form:"device"`
	Protocol   *string  `json:"protocol"   form:"protocol"`
	Role       *string  `json:"role"       form:"role"`
	Frequency  *float64 `json:"frequency"  form:"frequency"`
	MqttUplink *bool    `json:"mqttUplink" form:"mqttUplink"`
}

func (nr nodeRequest) toParams() models.NodeParams {
	return models.NodeParams{
		Name:       nr.Name,
		PublicKey:  nr.PublicKey,
		Latitude:   nr.Latitude,
		Longitude:  nr.Longitude,
		Elevation:  nr.Elevation,
		Frequency:  nr.Frequency,
		Power:      nr.Power,
		Device:     nr.Device,
		Protocol:   nr.Protocol,
		Role:       nr.Role,
		MqttUplink: nr.MqttUplink,
	}
}

func (nr nodeRequest) Validate(method string) (bool, map[string][]string) {
	v := validator.New()

	isNotPatch := method != http.MethodPatch

	v.Field("name").String(nr.Name).Optional().NotBlank().Max(50)
	v.Field("publicKey").String(nr.PublicKey).Optional().Equal(64)
	v.Field("latitude").Float(nr.Latitude).RequiredIf(isNotPatch).Within(-90, 90)
	v.Field("longitude").Float(nr.Longitude).RequiredIf(isNotPatch).Within(-180, 180)
	v.Field("elevation").Int(nr.Elevation).Optional().NotNegative()
	v.Field("power").String(nr.Power).Optional().OneOf("hardwired", "portable", "solar")
	v.Field("device").String(nr.Device).Optional().OneOf(data.GetDeviceSlugs()...)
	v.Field("protocol").String(nr.Protocol).RequiredIf(isNotPatch).OneOf("meshcore", "meshtastic", "reticulum")
	v.Field("mqttUplink").Bool(nr.MqttUplink).RequiredIf(isNotPatch)

	switch fromPtr(nr.Protocol) {
	case "meshcore":
		v.Field("frequency").Float(nr.Frequency).Required().MustBe(910.525)
		v.Field("role").String(nr.Role).Required().OneOf("companion", "repeater", "room", "sensor", "kiss")
	case "meshtastic":
		v.Field("frequency").Float(nr.Frequency).Required().OneOf(906.875, 913.125)
		v.Field("role").String(nr.Role).Required().OneOf("client", "client_mute", "client_hidden", "client_base", "tracker", "lost_and_found", "sensor", "tak", "tak_tracker", "repeater", "router", "router_late")
	case "reticulum":
		v.Field("frequency").Float(nr.Frequency).Required().Within(0, 1000)
		v.Field("role").String(nr.Role).Required().OneOf("rnode", "ax25", "tnc", "generic")
	default: // if no protocol but has role or frequency, return error
		v.Field("frequency").Float(nr.Frequency).Optional().DependsOn("protocol", nr.Protocol).DependsOn("role", nr.Role)
		v.Field("role").String(nr.Role).Optional().DependsOn("protocol", nr.Protocol).DependsOn("frequency", nr.Frequency)
	}

	return v.Valid(), v.Errors()
}

func (server *server) createNodeHandler(w http.ResponseWriter, r *http.Request) {
	var request struct {
		nodeRequest
		Privacy *bool `json:"privacy" form:"privacy"`
	}

	if err := server.decode(w, r, &request); err != nil {
		server.error(w, r, "failed to decode request", err)
		return
	}

	server.debug(r, request)

	if valid, errors := request.Validate(r.Method); !valid {
		err := writeJSON(w, http.StatusUnprocessableEntity, newMultiErrorResponse(errors))
		if err != nil {
			server.error(w, r, "failed to marshal validation errors", err)
		}
		return
	}

	ctx, tx, err := models.BeginTx(server.db, r.Context())
	if err != nil {
		server.error(w, r, "failed to start database transaction", err)
		return
	}
	defer tx.Rollback()

	node, err := server.nodes.WithTx(ctx).Insert(models.InsertNodeParams{
		UserID:     server.getUserID(r),
		NodeParams: request.toParams(),
	})
	if err != nil {
		server.error(w, r, "failed to insert node", err)
		return
	}

	user, err := server.users.WithTx(ctx).Get(server.getUserID(r))
	if err != nil {
		server.error(w, r, "failed to get user", err)
		return
	}

	if err := server.setUserPrivacy(ctx, &user, request.Privacy); err != nil {
		server.error(w, r, "failed to set privacy for user", err)
		return
	}

	if err := tx.Commit(); err != nil {
		server.error(w, r, "failed to commit transaction", err)
		return
	}

	response := newNodeResponse(node, user, server.getUserID(r), server.isUserAuthenticated(r))
	if err := writeJSON(w, http.StatusCreated, response); err != nil {
		server.error(w, r, "failed to write node response", err)
		return
	}
}

func (server *server) updateNodeHandler(w http.ResponseWriter, r *http.Request) {
	var request struct {
		nodeRequest
		Privacy *bool `json:"privacy" form:"privacy"`
	}

	if err := server.decode(w, r, &request); err != nil {
		server.error(w, r, "failed to decode request", err)
		return
	}

	server.debug(r, request)

	if valid, errors := request.Validate(r.Method); !valid {
		err := writeJSON(w, http.StatusUnprocessableEntity, newMultiErrorResponse(errors))
		if err != nil {
			server.error(w, r, "failed to marshal validation errors", err)
		}
		return
	}

	ctx, tx, err := models.BeginTx(server.db, r.Context())
	if err != nil {
		server.error(w, r, "failed to start database transaction", err)
		return
	}
	defer tx.Rollback()

	node, err := server.nodes.WithTx(ctx).Update(models.UpdateNodeParams{
		NodeID:     r.PathValue("id"),
		NodeParams: request.toParams(),
	})
	if err != nil {
		server.error(w, r, "failed to update node", err)
		return
	}

	user, err := server.users.WithTx(ctx).Get(server.getUserID(r))
	if err != nil {
		server.error(w, r, "failed to get user", err)
		return
	}

	if err := server.setUserPrivacy(ctx, &user, request.Privacy); err != nil {
		server.error(w, r, "failed to set privacy for user", err)
		return
	}

	if err := tx.Commit(); err != nil {
		server.error(w, r, "failed to commit transaction", err)
		return
	}

	response := newNodeResponse(node, user, server.getUserID(r), server.isUserAuthenticated(r))
	if err := writeJSON(w, http.StatusOK, response); err != nil {
		server.error(w, r, "failed to marshal node update response", err)
	}
}

func (server *server) patchNodeHandler(w http.ResponseWriter, r *http.Request) {
	var request nodeRequest

	if err := server.decode(w, r, &request); err != nil {
		server.error(w, r, "failed to decode request", err)
		return
	}

	server.debug(r, request)

	if valid, errors := request.Validate(r.Method); !valid {
		err := writeJSON(w, http.StatusUnprocessableEntity, newMultiErrorResponse(errors))
		if err != nil {
			server.error(w, r, "failed to marshal validation errors", err)
		}
		return
	}

	ctx, tx, err := models.BeginTx(server.db, r.Context())
	if err != nil {
		server.error(w, r, "failed to start database transaction", err)
		return
	}
	defer tx.Rollback()

	node, err := server.nodes.WithTx(ctx).Patch(models.PatchNodeParams{
		NodeID:     r.PathValue("id"),
		NodeParams: request.toParams(),
	})
	if err != nil {
		if errors.Is(err, models.ErrNoFields) {
			clientError(w, http.StatusBadRequest)
			return
		}
		server.error(w, r, "failed to patch node", err)
		return
	}

	user, err := server.users.WithTx(ctx).Get(server.getUserID(r))
	if err != nil {
		server.error(w, r, "failed to get user", err)
		return
	}

	if err := tx.Commit(); err != nil {
		server.error(w, r, "failed to commit transaction", err)
		return
	}

	response := newNodeResponse(node, user, server.getUserID(r), server.isUserAuthenticated(r))
	if err := writeJSON(w, http.StatusOK, response); err != nil {
		server.error(w, r, "failed to write node response", err)
	}
}

func (server *server) deleteNodeHandler(w http.ResponseWriter, r *http.Request) {
	if err := server.nodes.Delete(r.PathValue("id")); err != nil {
		server.error(w, r, "failed to delete node", err)
		return
	}

	server.debug(r, nil)

	w.WriteHeader(http.StatusNoContent)
}

func (server *server) setUserPrivacy(ctx context.Context, user *models.User, newPrivacy *bool) error {
	if newPrivacy == nil || *newPrivacy == user.Hidden {
		return nil
	}

	err := server.users.WithTx(ctx).SetHidden(user.ID, *newPrivacy)
	if err != nil {
		return err
	}

	user.Hidden = *newPrivacy

	return nil
}
