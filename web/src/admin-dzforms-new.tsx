import { css } from "@linaria/core";
import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { api } from "./server/api";

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

const errorText = css`
  color: #ef4444;
  font-size: 14px;
  margin-top: 8px;
`;

export const AdminDZFormsNew = () => {
	const navigate = useNavigate();
	const [name, setName] = createSignal("");
	const [description, setDescription] = createSignal("");
	const [saving, setSaving] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		if (!name().trim()) {
			setError("Form name is required");
			return;
		}

		setSaving(true);
		setError(null);

		try {
			const response = await api.createForm(name(), description(), "[]");
			if (response.ok) {
				navigate("/_/admin/plugins/dzforms");
			} else {
				setError("Failed to create form");
			}
		} catch (err) {
			setError("Failed to create form");
		} finally {
			setSaving(false);
		}
	};

	return (
		<main class={mainContent}>
			<h1 class={title}>New Form</h1>
			<p class={subtitle}>Create a new form</p>

			<div class={formContainer}>
				<form onSubmit={handleSubmit}>
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
					{error() && <p class={errorText}>{error()}</p>}
					<div class={buttonContainer}>
						<button
							type="submit"
							class={submitButton}
							disabled={saving()}
						>
							{saving() ? "Creating..." : "Create Form"}
						</button>
						<button
							type="button"
							class={cancelButton}
							onClick={() => navigate("/_/admin/plugins/dzforms")}
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</main>
	);
};
