package session

import (
	"time"
)

// SessionStore interface for different storage backends
type SessionStore interface {
	Read(id string) (*Session, error)
	Write(session *Session) error
	Destroy(id string) error
	GC(idleExpiration, absoluteExpiration time.Duration) error
}
