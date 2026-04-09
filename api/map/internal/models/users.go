package models

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

type User struct {
	ID            int
	CreatedAt     time.Time
	UpdatedAt     time.Time
	Username      string
	GlobalName    string
	Avatar        string
	Hidden        bool
}

func (u *User) Pointers() []any {
	return []any{
		&u.ID,
		&u.CreatedAt,
		&u.UpdatedAt,
		&u.Username,
		&u.GlobalName,
		&u.Avatar,
		&u.Hidden,
	}
}

type UserModel struct {
	DB DB
}

func (m *UserModel) WithTx(ctx context.Context) *UserModel {
	if tx, ok := contextGetTx(ctx); ok {
		return &UserModel{DB: tx}
	}
	return m
}

type UserParams struct {
	ID            string
	Username      string
	GlobalName    string
	Avatar        string
}

func (m *UserModel) Insert(arg UserParams) (User, error) {
	stmt := `
		INSERT INTO users (id, created_at, updated_at, username, global_name, avatar)
		VALUES (?1, ?2, ?3, ?4, ?5, ?6)
		ON CONFLICT (id) DO UPDATE SET
			username = EXCLUDED.username,
			global_name = EXCLUDED.global_name,
			avatar = EXCLUDED.avatar,
			updated_at = ?
		RETURNING *
	`

	now :=  time.Now()

	args := []any{
		arg.ID,
		now,
		now,
		arg.Username,
		arg.GlobalName,
		arg.Avatar,
		now,
	}

	user := User{}

	err := m.DB.QueryRow(stmt, args...).Scan(user.Pointers()...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return User{}, ErrNoRecord
		}
		return User{}, err
	}

	return user, nil
}

func (m *UserModel) Get(id int) (User, error) {
	stmt := `
		SELECT *
		FROM users
		WHERE id = ?
	`

	user := User{}

	err := m.DB.QueryRow(stmt, id).Scan(user.Pointers()...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return User{}, ErrNoRecord
		}
		return User{}, err
	}

	return user, nil
}

func (m *UserModel) SetHidden(id int, hidden bool) error {
	stmt := `
		UPDATE users
		SET hidden = ?, updated_at = ?
		WHERE id = ?
	`

	_, err := m.DB.Exec(stmt, hidden, time.Now(), id)
	if err != nil {
		return err
	}

	return nil
}
