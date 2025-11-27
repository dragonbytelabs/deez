package session

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"io"
	"log"
	"net/http"
	"sync"
	"time"
)

type contextKey struct{}

var sessionContextKey = contextKey{}

type Session struct {
	mu             sync.RWMutex
	id             string
	data           map[string]any
	createdAt      time.Time
	lastActivityAt time.Time
}

func newSession() *Session {
	return &Session{
		id:             generateSessionID(),
		data:           make(map[string]any),
		createdAt:      time.Now(),
		lastActivityAt: time.Now(),
	}
}

func generateSessionID() string {
	id := make([]byte, 32)
	_, err := io.ReadFull(rand.Reader, id)
	if err != nil {
		panic("failed to generate session id")
	}
	return base64.RawURLEncoding.EncodeToString(id)
}

// Get retrieves a value from the session.
func (s *Session) Get(key string) any {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.data[key]
}

// Put stores a value in the session
func (s *Session) Put(key string, value any) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.data[key] = value
}

// Delete removes a value from the session
func (s *Session) Delete(key string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.data, key)
}

// SessionManager manages all sessions
type SessionManager struct {
	store              SessionStore
	idleExpiration     time.Duration
	absoluteExpiration time.Duration
	cookieName         string
}

// NewSessionManager creates a new session manager
func NewSessionManager(
	store SessionStore,
	gcInterval,
	idleExpiration,
	absoluteExpiration time.Duration,
	cookieName string,
) *SessionManager {
	m := &SessionManager{
		store:              store,
		idleExpiration:     idleExpiration,
		absoluteExpiration: absoluteExpiration,
		cookieName:         cookieName,
	}

	go m.gc(gcInterval)

	return m
}

func (m *SessionManager) gc(d time.Duration) {
	ticker := time.NewTicker(d)
	for range ticker.C {
		m.store.GC(m.idleExpiration, m.absoluteExpiration)
	}
}

func (m *SessionManager) validate(session *Session) bool {
	if time.Since(session.createdAt) > m.absoluteExpiration ||
		time.Since(session.lastActivityAt) > m.idleExpiration {

		if err := m.store.Destroy(session.id); err != nil {
			log.Printf("failed to destroy session: %v", err)
		}
		return false
	}
	return true
}

func (m *SessionManager) start(r *http.Request) (*Session, *http.Request) {
	var session *Session

	// Try to read from cookie
	cookie, err := r.Cookie(m.cookieName)
	if err == nil {
		session, err = m.store.Read(cookie.Value)
		if err != nil {
			log.Printf("failed to read session: %v", err)
		}
	}

	// Generate new session if needed
	if session == nil || !m.validate(session) {
		session = newSession()
	}

	// Attach to context
	ctx := context.WithValue(r.Context(), sessionContextKey, session)
	r = r.WithContext(ctx)

	return session, r
}

func (m *SessionManager) save(session *Session) error {
	session.lastActivityAt = time.Now()
	return m.store.Write(session)
}

// Migrate generates a new session ID (call on login/logout)
func (m *SessionManager) Migrate(session *Session) error {
	session.mu.Lock()
	defer session.mu.Unlock()

	if err := m.store.Destroy(session.id); err != nil {
		return err
	}

	session.id = generateSessionID()
	return nil
}

// GetSession retrieves the session from request context
func GetSession(r *http.Request) *Session {
	session, ok := r.Context().Value(sessionContextKey).(*Session)
	if !ok {
		panic("session not found in request context")
	}
	return session
}

// Custom response writer to ensure cookie is written
type sessionResponseWriter struct {
	http.ResponseWriter
	sessionManager *SessionManager
	request        *http.Request
	done           bool
}

func (w *sessionResponseWriter) Write(b []byte) (int, error) {
	w.writeCookieIfNecessary()
	return w.ResponseWriter.Write(b)
}

func (w *sessionResponseWriter) WriteHeader(code int) {
	w.writeCookieIfNecessary()
	w.ResponseWriter.WriteHeader(code)
}

func (w *sessionResponseWriter) writeCookieIfNecessary() {
	if w.done {
		return
	}

	session := GetSession(w.request)

	cookie := &http.Cookie{
		Name:     w.sessionManager.cookieName,
		Value:    session.id,
		HttpOnly: true,
		Path:     "/",
		Secure:   false, // Set to true in production with HTTPS
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(w.sessionManager.idleExpiration / time.Second),
	}

	http.SetCookie(w.ResponseWriter, cookie)
	w.done = true
}

// Handle is the middleware that manages sessions
func (m *SessionManager) Handle(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Start session
		session, r := m.start(r)

		// Create custom response writer
		sw := &sessionResponseWriter{
			ResponseWriter: w,
			sessionManager: m,
			request:        r,
		}

		// Add cache control headers
		w.Header().Add("Vary", "Cookie")
		w.Header().Add("Cache-Control", `no-cache="Set-Cookie"`)

		// Call next handler
		next.ServeHTTP(sw, r)

		// Make sure session is written after request
		if session != nil {
			log.Printf("SessionManager: Writing session after request, id=%s", session.id)
			if err := m.store.Write(session); err != nil {
				log.Printf("SessionManager: Failed to write session: %v", err)
			}
		}

		// Ensure cookie is written
		sw.writeCookieIfNecessary()
	})
}
