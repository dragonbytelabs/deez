import { css } from "@linaria/core";
import { createSignal, onMount, Show } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import { api, type FormInfo } from "./server/api";
import { EmbedModal } from "./components/embed-modal";

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

const formContainer = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  padding: 24px;
  max-width: 600px;
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

const previewButton = css`
  padding: 12px 24px;
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--primary);
    color: white;
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
  margin-top: 8px;
`;

const successText = css`
  color: #22c55e;
  font-size: 14px;
  margin-top: 8px;
`;

const loadingText = css`
  color: var(--gray500);
  font-size: 16px;
`;

const formIdLabel = css`
  display: block;
  font-size: 14px;
  color: var(--gray400);
  margin-bottom: 8px;
`;

const formIdValue = css`
  padding: 12px 16px;
  background: var(--gray900);
  border: 1px solid var(--gray700);
  border-radius: 8px;
  color: var(--gray500);
  font-size: 14px;
`;

export const AdminDZFormsEdit = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = createSignal<FormInfo | null>(null);
  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");
  // fields state is maintained for future form builder functionality - currently preserves existing fields on save
  const [fields, setFields] = createSignal("[]");
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
          setFields(data.form.fields || "[]");
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

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
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
      const response = await api.updateForm(formId, name(), description(), fields());
      if (response.ok) {
        setSuccess("Form updated successfully");
        // Update local form state
        const currentForm = form();
        if (currentForm) {
          setForm({
            ...currentForm,
            name: name(),
            description: description(),
            fields: fields(),
          });
        }
      } else {
        setError("Failed to update form");
      }
    } catch (err) {
      setError("Failed to update form");
    } finally {
      setSaving(false);
    }
  };

  onMount(() => {
    fetchForm();
  });

  return (
    <main class={mainContent}>
      <h1 class={title}>Edit Form</h1>
      <p class={subtitle}>Modify your form details</p>

      <Show when={loading()}>
        <p class={loadingText}>Loading form...</p>
      </Show>

      <Show when={!loading() && error() && !form()}>
        <p class={errorText}>{error()}</p>
      </Show>

      <Show when={!loading() && form()}>
        <div class={formContainer}>
          <form onSubmit={handleSubmit}>
            <div class={formField}>
              <label class={formIdLabel}>Form ID</label>
              <div class={formIdValue}>{form()?.id}</div>
            </div>
            <div class={formField}>
              <label class={fieldLabel}>Form Name *</label>
              <input
                type="text"
                class={fieldInput}
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
                placeholder="Enter form name"
              />
            </div>
            <div class={formField}>
              <label class={fieldLabel}>Description</label>
              <textarea
                class={fieldTextarea}
                value={description()}
                onInput={(e) => setDescription(e.currentTarget.value)}
                placeholder="Enter form description (optional)"
              />
            </div>
            {error() && form() && <p class={errorText}>{error()}</p>}
            {success() && <p class={successText}>{success()}</p>}
            <div class={buttonContainer}>
              <button
                type="submit"
                class={submitButton}
                disabled={saving()}
              >
                {saving() ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                class={previewButton}
                onClick={() => navigate(`/_/admin/plugins/dzforms/preview/${params.id}`)}
              >
                Preview Form
              </button>
              <button
                type="button"
                class={embedButton}
                onClick={() => setEmbedModalOpen(true)}
              >
                Embed
              </button>
              <button
                type="button"
                class={cancelButton}
                onClick={() => navigate("/_/admin/plugins/dzforms/forms")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
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
