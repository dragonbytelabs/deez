package routes

import (
	"strings"
	"testing"
)

func TestInjectAdminToolbar(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		wantCSS  bool
		wantHTML bool
	}{
		{
			name:     "full HTML document",
			input:    "<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hello</h1></body></html>",
			wantCSS:  true,
			wantHTML: true,
		},
		{
			name:     "HTML without head",
			input:    "<html><body><h1>Hello</h1></body></html>",
			wantCSS:  true,
			wantHTML: true,
		},
		{
			name:     "HTML without body",
			input:    "<html><head></head></html>",
			wantCSS:  true,
			wantHTML: true,
		},
		{
			name:     "minimal HTML",
			input:    "<h1>Hello World</h1>",
			wantCSS:  true,
			wantHTML: true,
		},
		{
			name:     "body with attributes",
			input:    "<html><head></head><body class=\"test\" id=\"main\"><p>Content</p></body></html>",
			wantCSS:  true,
			wantHTML: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := injectAdminToolbar([]byte(tt.input))
			resultStr := string(result)

			if tt.wantCSS && !strings.Contains(resultStr, "dz-admin-toolbar-styles") {
				t.Error("expected CSS to be injected")
			}

			if tt.wantHTML && !strings.Contains(resultStr, "dz-admin-toolbar") {
				t.Error("expected HTML toolbar to be injected")
			}

			// Check that toolbar div is present
			if tt.wantHTML && !strings.Contains(resultStr, `<div id="dz-admin-toolbar">`) {
				t.Error("expected toolbar div to be injected")
			}

			// Check that script is present
			if tt.wantHTML && !strings.Contains(resultStr, "dz-admin-toolbar-script") {
				t.Error("expected toolbar script to be injected")
			}
		})
	}
}

func TestInjectAdminToolbar_CSSPosition(t *testing.T) {
	input := "<!DOCTYPE html><html><head><title>Test</title></head><body></body></html>"
	result := string(injectAdminToolbar([]byte(input)))

	// CSS should be before </head>
	cssPos := strings.Index(result, "dz-admin-toolbar-styles")
	headClosePos := strings.Index(strings.ToLower(result), "</head>")

	if cssPos > headClosePos {
		t.Error("CSS should be injected before </head>")
	}
}

func TestInjectAdminToolbar_HTMLPosition(t *testing.T) {
	input := "<!DOCTYPE html><html><head></head><body class=\"main\"><h1>Hello</h1></body></html>"
	result := string(injectAdminToolbar([]byte(input)))

	// Toolbar HTML should be after <body...>
	bodyOpenEnd := strings.Index(result, `class="main">`) + len(`class="main">`)
	toolbarPos := strings.Index(result, `<div id="dz-admin-toolbar">`)

	if toolbarPos < bodyOpenEnd {
		t.Error("Toolbar HTML should be injected after body opening tag")
	}
}

func TestInjectAdminToolbar_PreservesOriginalContent(t *testing.T) {
	input := "<!DOCTYPE html><html><head><title>My Page</title></head><body><h1>Original Content</h1><p>Some text</p></body></html>"
	result := string(injectAdminToolbar([]byte(input)))

	// Original content should still be present
	if !strings.Contains(result, "My Page") {
		t.Error("original title should be preserved")
	}
	if !strings.Contains(result, "Original Content") {
		t.Error("original h1 should be preserved")
	}
	if !strings.Contains(result, "Some text") {
		t.Error("original paragraph should be preserved")
	}
}
