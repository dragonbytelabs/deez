import { css } from "@linaria/core";
import { createSignal, onMount, Show } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import { api, type FormInfo } from "./server/api";
import { EmbedModal } from "./components/embed-modal";
import { FormBuilder, type FormField } from "./components/form-builder";

const mainContent = css`
  padding: 40px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const headerSection = css`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const headerLeft = css`
  flex: 1;
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
  margin-bottom: 0;
`;

const headerButtons = css`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const formDetailsSection = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const formDetailsGrid = css`
  display: grid;
  grid-template-columns: auto 1fr auto 1fr;
  gap: 16px;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const detailLabel = css`
  font-size: 14px;
  color: var(--gray400);
`;

const detailInput = css`
  padding: 10px 14px;
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

const formIdBadge = css`
  padding: 8px 14px;
  background: var(--gray700);
  border: 1px solid var(--gray600);
  border-radius: 8px;
  color: var(--gray400);
  font-size: 14px;
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
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: var(--primaryDark);
  }

  &:disabled {
    background: var(--gray600);
    cursor: not-allowed;
  }
`;

const previewButton = css`
  padding: 12px 24px;
  background: transparent;
  color: var(--gray300);
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

const embedButton = css`
  padding: 12px 24px;
  background: transparent;
  color: var(--gray300);
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

const errorText = css`
  color: #ef4444;
  font-size: 14px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  margin-bottom: 16px;
`;

const successText = css`
  color: #22c55e;
  font-size: 14px;
  padding: 12px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 8px;
  margin-bottom: 16px;
`;

const loadingText = css`
  color: var(--gray500);
  font-size: 16px;
`;

export const AdminDZFormsEdit = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = createSignal<FormInfo | null>(null);
  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [fields, setFields] = createSignal<FormField[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [saving, setSaving] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);
  const [embedModalOpen, setEmbedModalOpen] = createSignal(false);

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
          setName(data.form.name || "");
          setDescription(data.form.description || "");
          // Parse fields from JSON string
          try {
            const parsedFields = JSON.parse(data.form.fields || "[]");
            setFields(parsedFields);
          } catch {
            setFields([]);
          }
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

  const handleSave = async () => {
    if (!name().trim()) {
      setError("Form name is required");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const formId = getFormId();
      if (formId === null) {
        setError("Invalid form ID");
        return;
      }
      const fieldsJson = JSON.stringify(fields());
      const response = await api.updateForm(formId, name(), description(), fieldsJson);
      if (response.ok) {
        setSuccess("Form saved successfully");
        // Update local form state
        const currentForm = form();
        if (currentForm) {
          setForm({
            ...currentForm,
            name: name(),
            description: description(),
            fields: fieldsJson,
          });
        }
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Failed to save form");
      }
    } catch (err) {
      setError("Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const handleFieldsChange = (newFields: FormField[]) => {
    setFields(newFields);
  };

  onMount(() => {
    fetchForm();
  });

  return (
    <main class={mainContent}>
      <Show when={loading()}>
        <p class={loadingText}>Loading form...</p>
      </Show>

      <Show when={!loading() && error() && !form()}>
        <p class={errorText}>{error()}</p>
      </Show>

      <Show when={!loading() && form()}>
        {/* Header with title and action buttons */}
        <div class={headerSection}>
          <div class={headerLeft}>
            <h1 class={title}>{name() || "Untitled Form"}</h1>
            <p class={subtitle}>Edit your form fields and settings</p>
          </div>
          <div class={headerButtons}>
            <button
              type="button"
              class={embedButton}
              onClick={() => setEmbedModalOpen(true)}
            >
              &lt;/&gt; Embed
            </button>
            <button
              type="button"
              class={previewButton}
              onClick={() => navigate(`/_/admin/plugins/dzforms/preview/${params.id}`)}
            >
              Preview
            </button>
            <button
              type="button"
              class={submitButton}
              disabled={saving()}
              onClick={handleSave}
            >
              {saving() ? "Saving..." : "💾 Save Form"}
            </button>
          </div>
        </div>

        {/* Form details section */}
        <div class={formDetailsSection}>
          <div class={formDetailsGrid}>
            <span class={detailLabel}>Form ID:</span>
            <span class={formIdBadge}>{form()?.id}</span>
            <span class={detailLabel}>Form Name:</span>
            <input
              type="text"
              class={detailInput}
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              placeholder="Enter form name"
            />
          </div>
        </div>

        {/* Status messages */}
        {error() && form() && <p class={errorText}>{error()}</p>}
        {success() && <p class={successText}>{success()}</p>}

        {/* Form Builder */}
        <FormBuilder
          fields={fields()}
          onFieldsChange={handleFieldsChange}
        />

        <EmbedModal
          isOpen={embedModalOpen}
          setIsOpen={setEmbedModalOpen}
          formId={form()!.id}
          formName={form()!.name}
        />
      </Show>
    </main>
  );
};
