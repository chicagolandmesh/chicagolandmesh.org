package models

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
)

type Node struct {
	ID         string
	UserID     int
	CreatedAt  time.Time
	UpdatedAt  time.Time
	Name       *string
	PublicKey  *string
	Latitude   float64
	Longitude  float64
	Elevation  *int
	Frequency  float64
	Power      *string
	Device     *string
	Protocol   string
	Role       string
	MqttUplink bool
}

func (n *Node) Pointers() []any {
	return []any{
		&n.ID,
		&n.UserID,
		&n.CreatedAt,
		&n.UpdatedAt,
		&n.Name,
		&n.PublicKey,
		&n.Latitude,
		&n.Longitude,
		&n.Elevation,
		&n.Frequency,
		&n.Power,
		&n.Device,
		&n.Protocol,
		&n.Role,
		&n.MqttUplink,
	}
}

type NodeModel struct {
	DB DB
}

func (m *NodeModel) WithTx(ctx context.Context) *NodeModel {
	if tx, ok := contextGetTx(ctx); ok {
		return &NodeModel{DB: tx}
	}
	return m
}

type NodeParams struct {
	Name       *string
	PublicKey  *string
	Latitude   *float64
	Longitude  *float64
	Elevation  *int
	Frequency  *float64
	Power      *string
	Device     *string
	Protocol   *string
	Role       *string
	MqttUplink *bool
}

type InsertNodeParams struct {
	UserID int
	NodeParams
}

func (m *NodeModel) Insert(arg InsertNodeParams) (Node, error) {
	stmt := `
		INSERT INTO nodes (id, user_id, created_at, updated_at, name, public_key, latitude, longitude, elevation, frequency, power, device, protocol, role, mqtt_uplink)
		VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)
		RETURNING *
	`

	now := time.Now()

	args := []any{
		uuid.New().String(),
		arg.UserID,
		now, // created_at
		now, // updated_at
		arg.Name,
		arg.PublicKey,
		arg.Latitude,
		arg.Longitude,
		arg.Elevation,
		arg.Frequency,
		arg.Power,
		arg.Device,
		arg.Protocol,
		arg.Role,
		arg.MqttUplink,
	}

	node := Node{}

	err := m.DB.QueryRow(stmt, args...).Scan(node.Pointers()...)
	if err != nil {
		return Node{}, err
	}

	return node, nil
}

func (m *NodeModel) Get(id string) (Node, error) {
	stmt := `
		SELECT *
		FROM nodes
		WHERE id = ?
	`

	node := Node{}

	err := m.DB.QueryRow(stmt, id).Scan(node.Pointers()...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Node{}, ErrNoRecord
		}
		return Node{}, err
	}

	return node, err
}

func (m *NodeModel) GetAllWithUser() ([]Node, []User, error) {
	stmt := `
		SELECT n.*, u.*
		FROM nodes n
		JOIN users u ON n.user_id = u.id
	`

	rows, err := m.DB.Query(stmt)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	nodes := []Node{}
	users := []User{}

	for rows.Next() {
		node := Node{}
		user := User{}

		dest := append(node.Pointers(), user.Pointers()...)

		err := rows.Scan(dest...)
		if err != nil {
			return nil, nil, err
		}

		nodes = append(nodes, node)
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, nil, err
	}

	return nodes, users, nil
}

func (m *NodeModel) GetAllByUser(userID int) ([]Node, error) {
	stmt := `
		SELECT *
		FROM nodes
		WHERE user_id = ?
	`

	rows, err := m.DB.Query(stmt, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	nodes := []Node{}

	for rows.Next() {
		node := Node{}

		err := rows.Scan(node.Pointers()...)
		if err != nil {
			return nil, err
		}

		nodes = append(nodes, node)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return nodes, err
}

type UpdateNodeParams struct {
	NodeID string
	NodeParams
}

func (m *NodeModel) Update(arg UpdateNodeParams) (Node, error) {
	stmt := `
		UPDATE nodes
		SET name = ?1,
			public_key = ?2,
			latitude = ?3,
			longitude = ?4,
			elevation = ?5,
			frequency = ?6,
			power = ?7,
			device = ?8,
			protocol = ?9,
			role = ?10,
			mqtt_uplink = ?11,
			updated_at = ?12
		WHERE id = ?13
		RETURNING *
	`

	args := []any{
		arg.Name,
		arg.PublicKey,
		arg.Latitude,
		arg.Longitude,
		arg.Elevation,
		arg.Frequency,
		arg.Power,
		arg.Device,
		arg.Protocol,
		arg.Role,
		arg.MqttUplink,
		time.Now(),
		arg.NodeID,
	}

	node := Node{}

	err := m.DB.QueryRow(stmt, args...).Scan(node.Pointers()...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Node{}, ErrNoRecord
		}
		return Node{}, err
	}

	return node, err
}

func (m *NodeModel) Delete(id string) error {
	stmt := `
		DELETE FROM nodes
		WHERE id = ?
	`

	_, err := m.DB.Exec(stmt, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNoRecord
		}
		return err
	}

	return nil
}

type PatchNodeParams struct {
	NodeID string
	NodeParams
}

// TODO: support patching in null values
func (p PatchNodeParams) atLeastOne() bool {
	return p.Name != nil ||
		p.PublicKey != nil ||
		p.Latitude != nil ||
		p.Longitude != nil ||
		p.Elevation != nil ||
		p.Frequency != nil ||
		p.Power != nil ||
		p.Device != nil ||
		p.Protocol != nil ||
		p.Role != nil ||
		p.MqttUplink != nil
}

func (m *NodeModel) Patch(arg PatchNodeParams) (Node, error) {
	if !arg.atLeastOne() {
		return Node{}, ErrNoFields
	}

	stmt := `
		UPDATE nodes
		SET name = coalesce(?1, name),
			public_key = coalesce(?2, public_key),
			latitude = coalesce(?3, latitude),
			longitude = coalesce(?4, longitude),
			elevation = coalesce(?5, elevation),
			frequency = coalesce(?6, frequency),
			power = coalesce(?7, power),
			device = coalesce(?8, device),
			protocol = coalesce(?9, protocol),
			role = coalesce(?10, role),
			mqtt_uplink = coalesce(?11, mqtt_uplink),
			updated_at = ?12
		WHERE id = ?13
		RETURNING *
	`

	args := []any{
		arg.Name,
		arg.PublicKey,
		arg.Latitude,
		arg.Longitude,
		arg.Elevation,
		arg.Frequency,
		arg.Power,
		arg.Device,
		arg.Protocol,
		arg.Role,
		arg.MqttUplink,
		time.Now(),
		arg.NodeID,
	}

	node := Node{}

	err := m.DB.QueryRow(stmt, args...).Scan(node.Pointers()...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Node{}, ErrNoRecord
		}
		return Node{}, err
	}

	return node, nil
}

func (m *NodeModel) Owns(userID int, nodeID string) (bool, error) {
	stmt := `
		SELECT EXISTS(
			SELECT true
			FROM nodes
			WHERE id = ? AND user_id = ?
		)
	`

	var exists bool

	err := m.DB.QueryRow(stmt, nodeID, userID).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}
