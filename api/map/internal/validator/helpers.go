package validator
import (
	"fmt"
	"strings"
)

func plural(n int, singular, plural string) string {
	if n == 1 {
		return singular
	}
	return plural
}

func formatOrList[T any](vals []T) string {
	count := len(vals)

	if count == 0 {
		return ""
	}

	if count == 1 {
		return fmt.Sprint(vals[0])
	}

	first := []string{}
	for _, val := range vals[:count-1] {
		first = append(first, fmt.Sprint(val))
	}

	last := fmt.Sprint(vals[count-1])

	return strings.Join(first, ", ") + ", or " + last
}
