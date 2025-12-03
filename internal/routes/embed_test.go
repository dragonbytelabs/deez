package routes

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestRegisterEmbed(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	mux := http.NewServeMux()
	RegisterEmbed(mux, db)

	t.Run("GET /embed/form/1.js returns JavaScript for default form", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/embed/form/1.js", nil)
		rec := httptest.NewRecorder()

		mux.ServeHTTP(rec, req)

		// Should return 200 OK
		if rec.Code != http.StatusOK {
			t.Errorf("GET /embed/form/1.js status = %v, want %v", rec.Code, http.StatusOK)
		}

		// Content-Type should be JavaScript
		contentType := rec.Header().Get("Content-Type")
		if contentType != "application/javascript" {
			t.Errorf("Content-Type = %v, want application/javascript", contentType)
		}

		// Body should contain form rendering code
		body := rec.Body.String()
		if !strings.Contains(body, "dz-form") {
			t.Error("Response should contain form class 'dz-form'")
		}
		if !strings.Contains(body, "renderForm") {
			t.Error("Response should contain 'renderForm' function")
		}
		if !strings.Contains(body, "formId = 1") {
			t.Error("Response should contain formId = 1")
		}
	})

	t.Run("GET /embed/form/999.js returns 404 for non-existent form", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/embed/form/999.js", nil)
		rec := httptest.NewRecorder()

		mux.ServeHTTP(rec, req)

		// Should return 404 Not Found
		if rec.Code != http.StatusNotFound {
			t.Errorf("GET /embed/form/999.js status = %v, want %v", rec.Code, http.StatusNotFound)
		}
	})

	t.Run("GET /embed/form/abc.js returns 400 for invalid id", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/embed/form/abc.js", nil)
		rec := httptest.NewRecorder()

		mux.ServeHTTP(rec, req)

		// Should return 400 Bad Request
		if rec.Code != http.StatusBadRequest {
			t.Errorf("GET /embed/form/abc.js status = %v, want %v", rec.Code, http.StatusBadRequest)
		}
	})
}

func TestGenerateEmbedJS(t *testing.T) {
	t.Run("generates JS with default fields when no fields configured", func(t *testing.T) {
		js := generateEmbedJS(1, "Test Form", "[]")

		if !strings.Contains(js, "formId = 1") {
			t.Error("JS should contain formId = 1")
		}
		if !strings.Contains(js, `formName = "Test Form"`) {
			t.Error("JS should contain form name")
		}
		// Should contain default fields (name, email, message)
		if !strings.Contains(js, `"name":"name"`) {
			t.Error("JS should contain default name field")
		}
		if !strings.Contains(js, `"name":"email"`) {
			t.Error("JS should contain default email field")
		}
		if !strings.Contains(js, `"name":"message"`) {
			t.Error("JS should contain default message field")
		}
	})

	t.Run("generates JS with custom fields", func(t *testing.T) {
		fields := `[{"id":"custom","name":"custom","label":"Custom Field","type":"text","required":true}]`
		js := generateEmbedJS(2, "Custom Form", fields)

		if !strings.Contains(js, "formId = 2") {
			t.Error("JS should contain formId = 2")
		}
		if !strings.Contains(js, `"name":"custom"`) {
			t.Error("JS should contain custom field")
		}
	})

	t.Run("escapes special characters in form name", func(t *testing.T) {
		js := generateEmbedJS(1, `Form "with" quotes`, "[]")

		if !strings.Contains(js, `formName = "Form \"with\" quotes"`) {
			t.Error("JS should have escaped quotes in form name")
		}
	})
}

func TestEscapeJSString(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"simple", "simple"},
		{`with "quotes"`, `with \"quotes\"`},
		{"with\nnewline", "with\\nnewline"},
		{"with\ttab", "with\\ttab"},
		{"with\\backslash", "with\\\\backslash"},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			result := escapeJSString(tt.input)
			if result != tt.expected {
				t.Errorf("escapeJSString(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}
