package models

import "errors"

var ErrNoRecord = errors.New("models: no matching record found")
var ErrNoFields = errors.New("models: no fields provided")
