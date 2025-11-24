package session

import (
	"sync"
	"time"
)

// InMemoryStore stores sessions in memory
type InMemoryStore struct {
	mu       sync.RWMutex
	sessions map[string]*Session
}

// NewInMemoryStore creates a new in-memory session store
func NewInMemoryStore() *InMemoryStore {
	return &InMemoryStore{
		sessions: make(map[string]*Session),
	}
}

func (s *InMemoryStore) Read(id string) (*Session, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	session, ok := s.sessions[id]
	if !ok {
		return nil, nil
	}

	return session, nil
}

func (s *InMemoryStore) Write(session *Session) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.sessions[session.id] = session
	return nil
}

func (s *InMemoryStore) Destroy(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	delete(s.sessions, id)
	return nil
}

func (s *InMemoryStore) GC(idleExpiration, absoluteExpiration time.Duration) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for id, session := range s.sessions {
		if time.Since(session.lastActivityAt) > idleExpiration ||
			time.Since(session.createdAt) > absoluteExpiration {
			delete(s.sessions, id)
		}
	}

	return nil
}
