import { css } from "@linaria/core";
import { createSignal, For, onMount, Show } from "solid-js";
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

const formBuilder = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
`;

const formBuilderTitle = css`
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

  &:focus {
    outline: none;
    border-color: var(--primary);
  }

  &:disabled {
    background: var(--gray800);
    color: var(--gray500);
    cursor: not-allowed;
  }
`;

const formsList = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const formCard = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;

  &:hover {
    border-color: var(--gray600);
  }
`;

const formCardTitle = css`
  font-size: 18px;
  font-weight: 600;
  color: var(--white);
  margin-bottom: 8px;
`;

const formCardDescription = css`
  font-size: 14px;
  color: var(--gray400);
  margin-bottom: 12px;
`;

const formCardId = css`
  font-size: 12px;
  color: var(--gray500);
`;

const loadingText = css`
  color: var(--gray500);
  font-size: 16px;
`;

const errorText = css`
  color: #ef4444;
  font-size: 16px;
`;

const sectionTitle = css`
  font-size: 20px;
  font-weight: 600;
  color: var(--white);
  margin-bottom: 20px;
`;

export const AdminDZForms = () => {
	const [forms, setForms] = createSignal<FormInfo[]>([]);
	const [loading, setLoading] = createSignal(true);
	const [error, setError] = createSignal<string | null>(null);
	const [currentForm, setCurrentForm] = createSignal<FormInfo | null>(null);

	const fetchForms = async () => {
		try {
			const response = await api.getForms();
			if (response.ok) {
				const data = await response.json();
				setForms(data.forms || []);
				// Set the first form as current if available
				if (data.forms && data.forms.length > 0) {
					setCurrentForm(data.forms[0]);
				}
			} else {
				setError("Failed to fetch forms");
			}
		} catch (err) {
			setError("Failed to fetch forms");
		} finally {
			setLoading(false);
		}
	};

	onMount(() => {
		fetchForms();
	});

	return (
		<main class={mainContent}>
			<h1 class={title}>DragonByteForm</h1>
			<p class={subtitle}>Form Builder Dashboard</p>

			<Show when={loading()}>
				<p class={loadingText}>Loading forms...</p>
			</Show>

			<Show when={error()}>
				<p class={errorText}>{error()}</p>
			</Show>

			<Show when={!loading() && !error()}>
				{/* Form Builder Section */}
				<div class={formBuilder}>
					<h2 class={formBuilderTitle}>Form Builder</h2>
					<div class={formField}>
						<label class={fieldLabel}>Form ID</label>
						<input
							type="text"
							class={fieldInput}
							value={currentForm()?.id?.toString() ?? ""}
							disabled
						/>
					</div>
					<div class={formField}>
						<label class={fieldLabel}>Form Name</label>
						<input
							type="text"
							class={fieldInput}
							value={currentForm()?.name ?? "Default Form"}
							disabled
							placeholder="Enter form name"
						/>
					</div>
					<div class={formField}>
						<label class={fieldLabel}>Description</label>
						<input
							type="text"
							class={fieldInput}
							value={currentForm()?.description ?? ""}
							disabled
							placeholder="Enter form description"
						/>
					</div>
				</div>

				{/* Forms List Section */}
				<h2 class={sectionTitle}>Your Forms</h2>
				<div class={formsList}>
					<For each={forms()}>
						{(form) => (
							<div class={formCard}>
								<div class={formCardTitle}>{form.name}</div>
								<div class={formCardDescription}>
									{form.description || "No description"}
								</div>
								<div class={formCardId}>ID: {form.id}</div>
							</div>
						)}
					</For>
				</div>
			</Show>
		</main>
	);
};
