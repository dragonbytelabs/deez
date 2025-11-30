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

const entriesContainer = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  padding: 24px;
`;

const formSelector = css`
  margin-bottom: 24px;
`;

const selectLabel = css`
  display: block;
  font-size: 14px;
  color: var(--gray400);
  margin-bottom: 8px;
`;

const selectInput = css`
  padding: 12px 16px;
  background: var(--gray700);
  border: 1px solid var(--gray600);
  border-radius: 8px;
  color: var(--white);
  font-size: 14px;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const tableContainer = css`
  overflow-x: auto;
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

const emptyState = css`
  text-align: center;
  padding: 48px 24px;
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

const loadingText = css`
  color: var(--gray500);
  font-size: 16px;
`;

const errorText = css`
  color: #ef4444;
  font-size: 16px;
`;

export const AdminDZFormsEntries = () => {
	const [forms, setForms] = createSignal<FormInfo[]>([]);
	const [selectedForm, setSelectedForm] = createSignal<FormInfo | null>(null);
	const [loading, setLoading] = createSignal(true);
	const [error, setError] = createSignal<string | null>(null);

	const fetchForms = async () => {
		try {
			const response = await api.getForms();
			if (response.ok) {
				const data = await response.json();
				setForms(data.forms || []);
				if (data.forms && data.forms.length > 0) {
					setSelectedForm(data.forms[0]);
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
			<h1 class={title}>Form Entries</h1>
			<p class={subtitle}>View and manage form submissions</p>

			<Show when={loading()}>
				<p class={loadingText}>Loading...</p>
			</Show>

			<Show when={error()}>
				<p class={errorText}>{error()}</p>
			</Show>

			<Show when={!loading() && !error()}>
				<div class={entriesContainer}>
					<div class={formSelector}>
						<label class={selectLabel}>Select Form</label>
						<select
							class={selectInput}
							onChange={(e) => {
								const form = forms().find(
									(f) => f.id.toString() === e.currentTarget.value,
								);
								setSelectedForm(form || null);
							}}
						>
							<For each={forms()}>
								{(form) => (
									<option value={form.id.toString()}>{form.name}</option>
								)}
							</For>
						</select>
					</div>

					<Show
						when={selectedForm()}
						fallback={
							<div class={emptyState}>
								<div class={emptyIcon}>📋</div>
								<p class={emptyText}>No forms available</p>
								<p class={emptySubtext}>Create a form to start collecting entries</p>
							</div>
						}
					>
						<div class={tableContainer}>
							<table class={table}>
								<thead class={tableHeader}>
									<tr>
										<th class={tableHeaderCell}>ID</th>
										<th class={tableHeaderCell}>Submitted At</th>
										<th class={tableHeaderCell}>Status</th>
										<th class={tableHeaderCell}>Actions</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td colspan="4">
											<div class={emptyState}>
												<div class={emptyIcon}>📭</div>
												<p class={emptyText}>No entries yet</p>
												<p class={emptySubtext}>
													Form submissions will appear here
												</p>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</Show>
				</div>
			</Show>
		</main>
	);
};
