import { css } from "@linaria/core";
import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { api } from "./server/api";
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

const errorText = css`
  color: #ef4444;
  font-size: 14px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  margin-bottom: 16px;
`;

export const AdminDZFormsNew = () => {
	const navigate = useNavigate();
	const [name, setName] = createSignal("");
	const [description, setDescription] = createSignal("");
	const [fields, setFields] = createSignal<FormField[]>([]);
	const [saving, setSaving] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);

	const handleCreate = async () => {
		if (!name().trim()) {
			setError("Form name is required");
			return;
		}

		setSaving(true);
		setError(null);

		try {
			const fieldsJson = JSON.stringify(fields());
			const response = await api.createForm(name(), description(), fieldsJson);
			if (response.ok) {
				const data = await response.json();
				// Navigate to edit page for the new form
				if (data.form?.id) {
					navigate(`/_/admin/plugins/dzforms/edit/${data.form.id}`);
				} else {
					navigate("/_/admin/plugins/dzforms/forms");
				}
			} else {
				setError("Failed to create form");
			}
		} catch (err) {
			setError("Failed to create form");
		} finally {
			setSaving(false);
		}
	};

	const handleFieldsChange = (newFields: FormField[]) => {
		setFields(newFields);
	};

	return (
		<main class={mainContent}>
			{/* Header with title and action buttons */}
			<div class={headerSection}>
				<div class={headerLeft}>
					<h1 class={title}>New Form</h1>
					<p class={subtitle}>Create a new form with customizable fields</p>
				</div>
				<div class={headerButtons}>
					<button
						type="button"
						class={cancelButton}
						onClick={() => navigate("/_/admin/plugins/dzforms/forms")}
					>
						Cancel
					</button>
					<button
						type="button"
						class={submitButton}
						disabled={saving()}
						onClick={handleCreate}
					>
						{saving() ? "Creating..." : "💾 Create Form"}
					</button>
				</div>
			</div>

			{/* Form details section */}
			<div class={formDetailsSection}>
				<div class={formDetailsGrid}>
					<span class={detailLabel}>Form Name: *</span>
					<input
						type="text"
						class={detailInput}
						value={name()}
						onInput={(e) => setName(e.currentTarget.value)}
						placeholder="Enter form name"
					/>
					<span class={detailLabel}>Description:</span>
					<input
						type="text"
						class={detailInput}
						value={description()}
						onInput={(e) => setDescription(e.currentTarget.value)}
						placeholder="Enter form description (optional)"
					/>
				</div>
			</div>

			{/* Status messages */}
			{error() && <p class={errorText}>{error()}</p>}

			{/* Form Builder */}
			<FormBuilder
				fields={fields()}
				onFieldsChange={handleFieldsChange}
			/>
		</main>
	);
};
