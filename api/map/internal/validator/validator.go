package validator

import (
	"fmt"
	"slices"
	"strings"
	"unicode/utf8"

	"golang.org/x/exp/constraints"
)

type Validator struct {
	errors map[string][]string
}

func New() *Validator {
	return &Validator{
		errors: make(map[string][]string),
	}
}

func (v *Validator) Valid() bool {
	return len(v.errors) == 0
}

func (v *Validator) Errors() map[string][]string {
	return v.errors
}

func (v *Validator) AddError(field string, message string) {
	v.errors[field] = append(v.errors[field], message)
}

func (v *Validator) GetError(field string) []string {
	return v.errors[field]
}

type ValueBuilder struct {
	field string
	validator *Validator
}

func (v *Validator) Field(name string) *ValueBuilder {
	return &ValueBuilder{name, v}
}

type StringValue struct {
	value *string
	field string
	validator *Validator
}

func (v *ValueBuilder) String(value *string) *StringValue {
	return &StringValue{
		value: value,
		field: v.field,
		validator: v.validator,
	}
}

func (v *StringValue) Optional() *StringValue {
	return v
}

func (v *StringValue) Required() *StringValue {
	if v.value == nil {
		v.validator.AddError(v.field, "must be present")
	}
	return v
}

func (v *StringValue) RequiredIf(condition bool) *StringValue {
	if condition {
		return v.Required()
	}
	return v.Optional()
}

func (v *StringValue) NotBlank() *StringValue {
	if v.value != nil && strings.TrimSpace(*v.value) == "" {
		v.validator.AddError(v.field, "must not be blank")
	}
	return v
}

func (v *StringValue) Max(count int) *StringValue {
	if v.value != nil && utf8.RuneCountInString(*v.value) > count {
		v.validator.AddError(v.field, fmt.Sprintf("must be at most %d character%s", count, plural(count, "", "s")))
	}
	return v
}

func (v *StringValue) OneOf(vals ...string) *StringValue {
	if v.value != nil && !slices.Contains(vals, *v.value) {
		v.validator.AddError(v.field, fmt.Sprintf("must contain either %s", formatOrList(vals)))
	}
	return v
}

type NumberValue[T constraints.Integer | constraints.Float] struct {
	value *T
	field string
	validator *Validator
}

func (v *ValueBuilder) Float(value *float64) *NumberValue[float64] {
	return &NumberValue[float64]{
		value: value,
		field: v.field,
		validator: v.validator,
	}
}

func (v *ValueBuilder) Int(value *int) *NumberValue[int] {
	return &NumberValue[int]{
		value: value,
		field: v.field,
		validator: v.validator,
	}
}

func (v *NumberValue[T]) Optional() *NumberValue[T] {
	return v
}

func (v *NumberValue[T]) Required() *NumberValue[T] {
	if v.value == nil {
		v.validator.AddError(v.field, "must be present")
	}
	return v
}

func (v *NumberValue[T]) RequiredIf(condition bool) *NumberValue[T] {
	if condition {
		return v.Required()
	}
	return v.Optional()
}

func (v *NumberValue[T]) Within(min, max T) *NumberValue[T] {
	if v.value != nil && (*v.value < min || *v.value > max) {
		v.validator.AddError(v.field, fmt.Sprintf("must be between %v and %v", min, max))
	}
	return v
}

func (v *NumberValue[T]) NotNegative() *NumberValue[T] {
	if v.value != nil && *v.value < 0 {
		v.validator.AddError(v.field, fmt.Sprintf("must not be negative"))
	}
	return v
}

func (v *NumberValue[T]) OneOf(vals ...T) *NumberValue[T] {
	if v.value != nil && !slices.Contains(vals, *v.value) {
		v.validator.AddError(v.field, fmt.Sprintf("must contain either %s", formatOrList(vals)))
	}
	return v
}

type BoolValue struct {
	value *bool
	field string
	validator *Validator
}

func (v *ValueBuilder) Bool(value *bool) *BoolValue {
	return &BoolValue{
		value: value,
		field: v.field,
		validator: v.validator,
	}
}

func (v *BoolValue) Optional() *BoolValue {
	return v
}

func (v *BoolValue) Required() *BoolValue {
	if v.value == nil {
		v.validator.AddError(v.field, "must be present")
	}
	return v
}

func (v *BoolValue) RequiredIf(condition bool) *BoolValue {
	if condition {
		return v.Required()
	}
	return v.Optional()
}
