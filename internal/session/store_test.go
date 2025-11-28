package session

import "time"

// mockStore implements SessionStore for testing
type mockStore struct {
	sessions map[string]*Session
}

func newMockStore() *mockStore {
	return &mockStore{
		sessions: make(map[string]*Session),
	}
}

func (m *mockStore) Read(id string) (*Session, error) {
	session, ok := m.sessions[id]
	if !ok {
		return nil, nil
	}
	return session, nil
}

func (m *mockStore) Write(session *Session) error {
	m.sessions[session.id] = session
	return nil
}

func (m *mockStore) Destroy(id string) error {
	delete(m.sessions, id)
	return nil
}

func (m *mockStore) GC(idleExpiration, absoluteExpiration time.Duration) error {
	return nil
}
