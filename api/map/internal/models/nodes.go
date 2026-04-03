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
	Latitude   float64
	Longitude  float64
	Role       string
	Elevation  *int
	Frequency  int
	MqttUplink bool
}

func (n *Node) Pointers() []any {
	return []any{
		&n.ID,
		&n.UserID,
		&n.CreatedAt,
		&n.UpdatedAt,
		&n.Name,
		&n.Latitude,
		&n.Longitude,
		&n.Role,
		&n.Elevation,
		&n.Frequency,
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
	Latitude   *float64
	Longitude  *float64
	Role       *string
	Elevation  *int
	Frequency  *int
	MqttUplink *bool
}

type InsertNodeParams struct {
	UserID int
	NodeParams
}

func (m *NodeModel) Insert(arg InsertNodeParams) (Node, error) {
	stmt := `
		INSERT INTO nodes (id, user_id, created_at, updated_at, name, latitude, longitude, role, elevation, frequency, mqtt_uplink)
		VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
		RETURNING *
	`

	now := time.Now()

	args := []any{
		uuid.New().String(),
		arg.UserID,
		now, // created_at
		now, // updated_at
		arg.Name,
		arg.Latitude,
		arg.Longitude,
		arg.Role,
		arg.Elevation,
		arg.Frequency,
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
			latitude = ?2,
			longitude = ?3,
			role = ?4,
			elevation = ?5,
			frequency = ?6,
			mqtt_uplink = ?7,
			updated_at = ?8
		WHERE id = ?9
		RETURNING *
	`

	args := []any{
		arg.Name,
		arg.Latitude,
		arg.Longitude,
		arg.Role,
		arg.Elevation,
		arg.Frequency,
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

func (p PatchNodeParams) atLeastOne() bool {
	return p.Name != nil ||
		p.Latitude != nil ||
		p.Longitude != nil ||
		p.Role != nil ||
		p.Elevation != nil ||
		p.Frequency != nil ||
		p.MqttUplink != nil
}

func (m *NodeModel) Patch(arg PatchNodeParams) (Node, error) {
	if !arg.atLeastOne() {
		return Node{}, ErrNoFields
	}

	stmt := `
		UPDATE nodes
		SET name = coalesce(?1, name),
			latitude = coalesce(?2, latitude),
			longitude = coalesce(?3, longitude),
			role = coalesce(?4, role),
			elevation = coalesce(?5, elevation),
			frequency = coalesce(?6, frequency),
			mqtt_uplink = coalesce(?7, mqtt_uplink),
			updated_at = ?8
		WHERE id = ?9
		RETURNING *
	`

	args := []any{
		arg.Name,
		arg.Latitude,
		arg.Longitude,
		arg.Role,
		arg.Elevation,
		arg.Frequency,
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
