import { css } from "@linaria/core";
import { createSignal, For, onMount, Show } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import { api, type FormInfo } from "./server/api";

const mainContent = css`
  padding: 40px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const title = css`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--white);
`;

const subtitle = css`
  font-size: 18px;
  color: var(--gray500);
  margin-bottom: 30px;
`;

const previewContainer = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const formPreviewSection = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  padding: 24px;
`;

const entriesSection = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  padding: 24px;
`;

const sectionTitle = css`
  font-size: 20px;
  font-weight: 600;
  color: var(--white);
  margin-bottom: 20px;
`;

const formField = css`
  margin-bottom: 20px;
`;

const fieldLabel = css`
  display: block;
  font-size: 14px;
  color: var(--gray400);
  margin-bottom: 8px;
`;

const fieldInput = css`
  width: 100%;
  padding: 12px 16px;
  background: var(--gray700);
  border: 1px solid var(--gray600);
  border-radius: 8px;
  color: var(--white);
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const fieldTextarea = css`
  width: 100%;
  padding: 12px 16px;
  background: var(--gray700);
  border: 1px solid var(--gray600);
  border-radius: 8px;
  color: var(--white);
  font-size: 14px;
  transition: border-color 0.2s;
  min-height: 100px;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const fieldSelect = css`
  width: 100%;
  padding: 12px 16px;
  background: var(--gray700);
  border: 1px solid var(--gray600);
  border-radius: 8px;
  color: var(--white);
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const buttonContainer = css`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const submitButton = css`
  padding: 12px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--primaryDark);
  }

  &:disabled {
    background: var(--gray600);
    cursor: not-allowed;
  }
`;

const cancelButton = css`
  padding: 12px 24px;
  background: var(--gray700);
  color: var(--gray300);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--gray600);
  }
`;

const clearButton = css`
  padding: 12px 24px;
  background: transparent;
  color: var(--gray400);
  border: 1px solid var(--gray600);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--gray700);
    border-color: var(--gray500);
  }
`;

const successText = css`
  color: #22c55e;
  font-size: 14px;
  margin-top: 8px;
  padding: 12px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 8px;
`;

const loadingText = css`
  color: var(--gray500);
  font-size: 16px;
`;

const errorText = css`
  color: #ef4444;
  font-size: 14px;
`;

const table = css`
  width: 100%;
  border-collapse: collapse;
`;

const tableHeader = css`
  background: var(--gray700);
`;

const tableHeaderCell = css`
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: var(--gray300);
  border-bottom: 1px solid var(--gray600);
`;

const tableRow = css`
  border-bottom: 1px solid var(--gray700);

  &:last-child {
    border-bottom: none;
  }
`;

const tableCell = css`
  padding: 12px 16px;
  color: var(--white);
  font-size: 14px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const emptyState = css`
  text-align: center;
  padding: 40px 20px;
  color: var(--gray500);
`;

const emptyIcon = css`
  font-size: 48px;
  margin-bottom: 16px;
`;

const emptyText = css`
  font-size: 16px;
  margin-bottom: 8px;
`;

const emptySubtext = css`
  font-size: 14px;
  color: var(--gray600);
`;

const previewBadge = css`
  display: inline-block;
  padding: 4px 12px;
  background: var(--primary);
  color: white;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 12px;
`;

const formInfoBox = css`
  background: var(--gray700);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const formInfoLabel = css`
  font-size: 12px;
  color: var(--gray500);
  margin-bottom: 4px;
`;

const formInfoValue = css`
  font-size: 14px;
  color: var(--white);
`;

const deleteButton = css`
  padding: 4px 8px;
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
  }
`;

type FormField = {
  id: string;
  name: string;
  label: string;
  type: "text" | "email" | "number" | "textarea" | "select" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: string[];
};

type FormEntry = {
  id: number;
  data: Record<string, string>;
  submittedAt: string;
};

// Default fields to show when form has no fields configured
const defaultFields: FormField[] = [
  {
    id: "name",
    name: "name",
    label: "Name",
    type: "text",
    required: true,
    placeholder: "Enter your name",
  },
  {
    id: "email",
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "Enter your email",
  },
  {
    id: "message",
    name: "message",
    label: "Message",
    type: "textarea",
    required: false,
    placeholder: "Enter your message",
  },
];

export const AdminDZFormsPreview = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = createSignal<FormInfo | null>(null);
  const [fields, setFields] = createSignal<FormField[]>([]);
  const [formData, setFormData] = createSignal<Record<string, string>>({});
  const [entries, setEntries] = createSignal<FormEntry[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = createSignal(false);

  const getFormId = (): number | null => {
    const formId = Number.parseInt(params.id, 10);
    return Number.isNaN(formId) ? null : formId;
  };

  const fetchForm = async () => {
    try {
      const formId = getFormId();
      if (formId === null) {
        setError("Invalid form ID");
        setLoading(false);
        return;
      }

      const response = await api.getFormById(formId);
      if (response.ok) {
        const data = await response.json();
        if (data.form) {
          setForm(data.form);
          // Parse fields from JSON string
          try {
            const parsedFields = JSON.parse(data.form.fields || "[]");
            // Use default fields if no fields are configured
            if (parsedFields.length === 0) {
              setFields(defaultFields);
            } else {
              setFields(parsedFields);
            }
          } catch {
            setFields(defaultFields);
          }
          // Initialize form data with empty values
          const initialData: Record<string, string> = {};
          const fieldsToUse = fields().length > 0 ? fields() : defaultFields;
          for (const field of fieldsToUse) {
            initialData[field.name] = "";
          }
          setFormData(initialData);
        } else {
          setError("Form not found");
        }
      } else {
        setError("Failed to fetch form");
      }
    } catch (err) {
      setError("Failed to fetch form");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setSubmitSuccess(false);

    // Validate required fields
    const currentFields = fields();
    for (const field of currentFields) {
      if (field.required && !formData()[field.name]?.trim()) {
        setError(`${field.label} is required`);
        return;
      }
    }

    // Add entry to the preview table
    const newEntry: FormEntry = {
      id: entries().length + 1,
      data: { ...formData() },
      submittedAt: new Date().toLocaleString(),
    };
    setEntries((prev) => [...prev, newEntry]);

    // Clear form
    const clearedData: Record<string, string> = {};
    for (const field of currentFields) {
      clearedData[field.name] = "";
    }
    setFormData(clearedData);
    setError(null);
    setSubmitSuccess(true);

    // Clear success message after 3 seconds
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const handleClearForm = () => {
    const clearedData: Record<string, string> = {};
    for (const field of fields()) {
      clearedData[field.name] = "";
    }
    setFormData(clearedData);
    setError(null);
    setSubmitSuccess(false);
  };

  const handleDeleteEntry = (id: number) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleClearAllEntries = () => {
    setEntries([]);
  };

  onMount(() => {
    fetchForm();
  });

  const renderField = (field: FormField) => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            class={fieldTextarea}
            value={formData()[field.name] || ""}
            onInput={(e) => handleInputChange(field.name, e.currentTarget.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      case "select":
        return (
          <select
            class={fieldSelect}
            value={formData()[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.currentTarget.value)}
            required={field.required}
          >
            <option value="">Select an option</option>
            <For each={field.options || []}>
              {(option) => <option value={option}>{option}</option>}
            </For>
          </select>
        );
      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={formData()[field.name] === "true"}
            onChange={(e) =>
              handleInputChange(field.name, e.currentTarget.checked ? "true" : "false")
            }
          />
        );
      default:
        return (
          <input
            type={field.type}
            class={fieldInput}
            value={formData()[field.name] || ""}
            onInput={(e) => handleInputChange(field.name, e.currentTarget.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
    }
  };

  return (
    <main class={mainContent}>
      <h1 class={title}>
        Form Preview
        <span class={previewBadge}>Preview Mode</span>
      </h1>
      <p class={subtitle}>Test your form by adding entries - data is not saved to the database</p>

      <Show when={loading()}>
        <p class={loadingText}>Loading form...</p>
      </Show>

      <Show when={!loading() && error() && !form()}>
        <p class={errorText}>{error()}</p>
      </Show>

      <Show when={!loading() && form()}>
        <div class={previewContainer}>
          {/* Form Preview Section */}
          <div class={formPreviewSection}>
            <h2 class={sectionTitle}>{form()?.name || "Form"}</h2>
            
            <div class={formInfoBox}>
              <div class={formInfoLabel}>Form ID</div>
              <div class={formInfoValue}>{form()?.id}</div>
              <Show when={form()?.description}>
                <div class={formInfoLabel} style={{ "margin-top": "12px" }}>Description</div>
                <div class={formInfoValue}>{form()?.description}</div>
              </Show>
            </div>

            <form onSubmit={handleSubmit}>
              <For each={fields()}>
                {(field) => (
                  <div class={formField}>
                    <label class={fieldLabel}>
                      {field.label}
                      {field.required && " *"}
                    </label>
                    {renderField(field)}
                  </div>
                )}
              </For>

              {error() && <p class={errorText}>{error()}</p>}
              {submitSuccess() && (
                <p class={successText}>✓ Entry added successfully!</p>
              )}

              <div class={buttonContainer}>
                <button type="submit" class={submitButton}>
                  Submit Entry
                </button>
                <button type="button" class={clearButton} onClick={handleClearForm}>
                  Clear Form
                </button>
                <button
                  type="button"
                  class={cancelButton}
                  onClick={() => navigate(`/_/admin/plugins/dzforms/edit/${params.id}`)}
                >
                  Back to Edit
                </button>
              </div>
            </form>
          </div>

          {/* Entries Section */}
          <div class={entriesSection}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "20px" }}>
              <h2 class={sectionTitle} style={{ margin: "0" }}>Preview Entries ({entries().length})</h2>
              <Show when={entries().length > 0}>
                <button class={clearButton} onClick={handleClearAllEntries}>
                  Clear All
                </button>
              </Show>
            </div>

            <Show
              when={entries().length > 0}
              fallback={
                <div class={emptyState}>
                  <div class={emptyIcon}>📋</div>
                  <p class={emptyText}>No entries yet</p>
                  <p class={emptySubtext}>Submit the form to see entries here</p>
                </div>
              }
            >
              <div style={{ "overflow-x": "auto" }}>
                <table class={table}>
                  <thead class={tableHeader}>
                    <tr>
                      <th class={tableHeaderCell}>#</th>
                      <For each={fields()}>
                        {(field) => (
                          <th class={tableHeaderCell}>{field.label}</th>
                        )}
                      </For>
                      <th class={tableHeaderCell}>Submitted</th>
                      <th class={tableHeaderCell}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={entries()}>
                      {(entry) => (
                        <tr class={tableRow}>
                          <td class={tableCell}>{entry.id}</td>
                          <For each={fields()}>
                            {(field) => (
                              <td class={tableCell}>{entry.data[field.name] || "-"}</td>
                            )}
                          </For>
                          <td class={tableCell}>{entry.submittedAt}</td>
                          <td class={tableCell}>
                            <button
                              class={deleteButton}
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </main>
  );
};
