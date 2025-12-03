package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"dragonbytelabs/dz/internal/dbx"
)

// RegisterEmbed registers the embed routes for forms
func RegisterEmbed(mux *http.ServeMux, db *dbx.DB) {
	// Serve the embed JavaScript for a form
	// Pattern: /embed/form/{id...} captures "123.js" and we strip the .js suffix
	mux.HandleFunc("GET /embed/form/{id...}", func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		// Strip .js suffix if present
		if !strings.HasSuffix(idStr, ".js") {
			http.NotFound(w, r)
			return
		}
		idStr = strings.TrimSuffix(idStr, ".js")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			http.Error(w, "invalid form id", http.StatusBadRequest)
			return
		}

		form, err := db.GetFormByID(r.Context(), id)
		if err != nil {
			http.Error(w, "failed to get form", http.StatusInternalServerError)
			return
		}
		if form == nil {
			http.Error(w, "form not found", http.StatusNotFound)
			return
		}

		// Generate the embed JavaScript
		w.Header().Set("Content-Type", "application/javascript")
		w.Header().Set("Cache-Control", "public, max-age=3600")
		
		js := generateEmbedJS(form.ID, form.Name, form.Fields)
		w.Write([]byte(js))
	})
}

// FormField represents a form field for embedding
type FormField struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Label       string   `json:"label"`
	Type        string   `json:"type"`
	Required    bool     `json:"required,omitempty"`
	Placeholder string   `json:"placeholder,omitempty"`
	Options     []string `json:"options,omitempty"`
}

// defaultEmbedFields returns the default fields when no fields are configured
func defaultEmbedFields() []FormField {
	return []FormField{
		{
			ID:          "name",
			Name:        "name",
			Label:       "Name",
			Type:        "text",
			Required:    true,
			Placeholder: "Enter your name",
		},
		{
			ID:          "email",
			Name:        "email",
			Label:       "Email",
			Type:        "email",
			Required:    true,
			Placeholder: "Enter your email",
		},
		{
			ID:          "message",
			Name:        "message",
			Label:       "Message",
			Type:        "textarea",
			Required:    false,
			Placeholder: "Enter your message",
		},
	}
}

// generateEmbedJS generates the JavaScript code for embedding a form
func generateEmbedJS(formID int64, formName string, fieldsJSON string) string {
	// Parse fields
	var fields []FormField
	if err := json.Unmarshal([]byte(fieldsJSON), &fields); err != nil || len(fields) == 0 {
		fields = defaultEmbedFields()
	}

	// Serialize fields to JSON for embedding in JS
	fieldsData, _ := json.Marshal(fields)
	
	// Escape form name for JavaScript string
	escapedName := escapeJSString(formName)

	return fmt.Sprintf(`(function() {
  var formId = %d;
  var formName = "%s";
  var fields = %s;
  
  function renderForm() {
    var container = document.getElementById("dz-form-" + formId);
    if (!container) {
      console.error("DZForms: Container element #dz-form-" + formId + " not found");
      return;
    }
    
    // Create form element
    var form = document.createElement("form");
    form.className = "dz-form";
    form.id = "dz-form-element-" + formId;
    
    // Create form title
    var title = document.createElement("h3");
    title.className = "dz-form-title";
    title.textContent = formName;
    form.appendChild(title);
    
    // Create fields
    fields.forEach(function(field) {
      var fieldContainer = document.createElement("div");
      fieldContainer.className = "dz-form-field";
      
      var label = document.createElement("label");
      label.className = "dz-form-label";
      label.setAttribute("for", "dz-field-" + formId + "-" + field.name);
      label.textContent = field.label + (field.required ? " *" : "");
      fieldContainer.appendChild(label);
      
      var input;
      if (field.type === "textarea") {
        input = document.createElement("textarea");
        input.rows = 4;
      } else if (field.type === "select") {
        input = document.createElement("select");
        var defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select an option";
        input.appendChild(defaultOption);
        (field.options || []).forEach(function(opt) {
          var option = document.createElement("option");
          option.value = opt;
          option.textContent = opt;
          input.appendChild(option);
        });
      } else if (field.type === "checkbox") {
        var checkboxContainer = document.createElement("div");
        checkboxContainer.className = "dz-form-checkbox-container";
        input = document.createElement("input");
        input.type = "checkbox";
        input.className = "dz-form-checkbox";
        var checkboxLabel = document.createElement("span");
        checkboxLabel.textContent = field.placeholder || "";
        checkboxContainer.appendChild(input);
        checkboxContainer.appendChild(checkboxLabel);
        fieldContainer.appendChild(checkboxContainer);
      } else {
        input = document.createElement("input");
        input.type = field.type || "text";
      }
      
      if (field.type !== "checkbox") {
        input.className = "dz-form-input";
      }
      input.id = "dz-field-" + formId + "-" + field.name;
      input.name = field.name;
      if (field.placeholder && field.type !== "checkbox") {
        input.placeholder = field.placeholder;
      }
      if (field.required) {
        input.required = true;
      }
      
      if (field.type !== "checkbox") {
        fieldContainer.appendChild(input);
      }
      form.appendChild(fieldContainer);
    });
    
    // Create submit button
    var submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.className = "dz-form-submit";
    submitBtn.textContent = "Submit";
    form.appendChild(submitBtn);
    
    // Create message container
    var messageContainer = document.createElement("div");
    messageContainer.className = "dz-form-message";
    messageContainer.id = "dz-form-message-" + formId;
    form.appendChild(messageContainer);
    
    // Handle form submission
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      
      var data = {};
      fields.forEach(function(field) {
        var input = document.getElementById("dz-field-" + formId + "-" + field.name);
        if (field.type === "checkbox") {
          data[field.name] = input.checked ? "true" : "false";
        } else {
          data[field.name] = input.value;
        }
      });
      
      // Show success message (in a real implementation, this would submit to an API)
      var msg = document.getElementById("dz-form-message-" + formId);
      msg.textContent = "Thank you for your submission!";
      msg.className = "dz-form-message dz-form-message-success";
      
      // Reset form
      form.reset();
    });
    
    container.appendChild(form);
    
    // Inject styles if not already present
    if (!document.getElementById("dz-form-styles")) {
      var style = document.createElement("style");
      style.id = "dz-form-styles";
      style.textContent = [
        ".dz-form { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; padding: 20px; }",
        ".dz-form-title { font-size: 24px; margin-bottom: 20px; color: #333; }",
        ".dz-form-field { margin-bottom: 16px; }",
        ".dz-form-label { display: block; margin-bottom: 6px; font-weight: 500; color: #555; }",
        ".dz-form-input { width: 100%%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box; }",
        ".dz-form-input:focus { outline: none; border-color: #007bff; box-shadow: 0 0 0 3px rgba(0,123,255,0.1); }",
        "textarea.dz-form-input { resize: vertical; min-height: 100px; }",
        "select.dz-form-input { appearance: none; background: url('data:image/svg+xml;utf8,<svg fill=\"%%23555\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>') no-repeat right 10px center; background-size: 20px; }",
        ".dz-form-checkbox-container { display: flex; align-items: center; gap: 8px; }",
        ".dz-form-checkbox { width: 18px; height: 18px; }",
        ".dz-form-submit { display: inline-block; padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer; }",
        ".dz-form-submit:hover { background: #0056b3; }",
        ".dz-form-message { margin-top: 16px; padding: 12px; border-radius: 6px; display: none; }",
        ".dz-form-message-success { display: block; background: #d4edda; color: #155724; }",
        ".dz-form-message-error { display: block; background: #f8d7da; color: #721c24; }"
      ].join("\n");
      document.head.appendChild(style);
    }
  }
  
  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderForm);
  } else {
    renderForm();
  }
})();
`, formID, escapedName, string(fieldsData))
}

// escapeJSString escapes a string for safe inclusion in a JavaScript string literal
func escapeJSString(s string) string {
	s = strings.ReplaceAll(s, "\\", "\\\\")
	s = strings.ReplaceAll(s, "\"", "\\\"")
	s = strings.ReplaceAll(s, "\n", "\\n")
	s = strings.ReplaceAll(s, "\r", "\\r")
	s = strings.ReplaceAll(s, "\t", "\\t")
	return s
}
