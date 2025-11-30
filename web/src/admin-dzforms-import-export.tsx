import { css } from "@linaria/core";
import { createSignal, Show } from "solid-js";

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

const contentContainer = css`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  max-width: 900px;
`;

const card = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  padding: 24px;
`;

const cardTitle = css`
  font-size: 18px;
  font-weight: 600;
  color: var(--white);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const cardIcon = css`
  font-size: 24px;
`;

const cardDescription = css`
  font-size: 14px;
  color: var(--gray400);
  margin-bottom: 20px;
  line-height: 1.6;
`;

const fileInput = css`
  display: none;
`;

const uploadArea = css`
  border: 2px dashed var(--gray600);
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
    background: rgba(167, 139, 250, 0.05);
  }
`;

const uploadIcon = css`
  font-size: 32px;
  margin-bottom: 12px;
`;

const uploadText = css`
  font-size: 14px;
  color: var(--gray400);
  margin-bottom: 8px;
`;

const uploadHint = css`
  font-size: 12px;
  color: var(--gray500);
`;

const exportButton = css`
  width: 100%;
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
  justify-content: center;
  gap: 8px;

  &:hover {
    background: var(--primaryDark);
  }

  &:disabled {
    background: var(--gray600);
    cursor: not-allowed;
  }
`;

const exportOption = css`
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--gray700);

  &:last-child {
    border-bottom: none;
  }
`;

const radioInput = css`
  margin-right: 12px;
  accent-color: var(--primary);
`;

const optionLabel = css`
  font-size: 14px;
  color: var(--gray300);
`;

const successMessage = css`
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  color: #22c55e;
  font-size: 14px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const errorMessage = css`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  color: #ef4444;
  font-size: 14px;
  margin-top: 16px;
`;

export const AdminDZFormsImportExport = () => {
	const [exportFormat, setExportFormat] = createSignal("json");
	const [exporting, setExporting] = createSignal(false);
	const [importSuccess, setImportSuccess] = createSignal(false);
	const [importError, setImportError] = createSignal<string | null>(null);

	const handleExport = async () => {
		setExporting(true);
		// Simulate export
		await new Promise((resolve) => setTimeout(resolve, 1000));
		
		// Create a dummy export file
		const data = {
			exportDate: new Date().toISOString(),
			format: exportFormat(),
			forms: [],
		};
		
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `forms-export-${Date.now()}.${exportFormat()}`;
		a.click();
		URL.revokeObjectURL(url);
		
		setExporting(false);
	};

	const handleImport = (e: Event) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		
		if (file) {
			setImportError(null);
			setImportSuccess(false);
			
			const reader = new FileReader();
			reader.onload = () => {
				try {
					JSON.parse(reader.result as string);
					setImportSuccess(true);
					setTimeout(() => setImportSuccess(false), 5000);
				} catch (err) {
					setImportError("Invalid file format. Please upload a valid JSON file.");
				}
			};
			reader.onerror = () => {
				setImportError("Failed to read file");
			};
			reader.readAsText(file);
		}
		
		// Reset input
		input.value = "";
	};

	return (
		<main class={mainContent}>
			<h1 class={title}>Import / Export</h1>
			<p class={subtitle}>Import and export your forms and data</p>

			<div class={contentContainer}>
				<div class={card}>
					<h2 class={cardTitle}>
						<span class={cardIcon}>📥</span>
						Import Forms
					</h2>
					<p class={cardDescription}>
						Import forms from a previously exported file. Supported formats: JSON, CSV
					</p>
					
					<input
						type="file"
						id="import-file"
						class={fileInput}
						accept=".json,.csv"
						onChange={handleImport}
					/>
					<label for="import-file">
						<div class={uploadArea}>
							<div class={uploadIcon}>📁</div>
							<div class={uploadText}>
								Click to upload or drag and drop
							</div>
							<div class={uploadHint}>JSON or CSV files</div>
						</div>
					</label>
					
					<Show when={importSuccess()}>
						<div class={successMessage}>
							<span>✓</span>
							Forms imported successfully
						</div>
					</Show>
					
					<Show when={importError()}>
						<div class={errorMessage}>{importError()}</div>
					</Show>
				</div>

				<div class={card}>
					<h2 class={cardTitle}>
						<span class={cardIcon}>📤</span>
						Export Forms
					</h2>
					<p class={cardDescription}>
						Export all your forms and their configurations for backup or migration
					</p>
					
					<div class={exportOption}>
						<input
							type="radio"
							name="format"
							id="format-json"
							class={radioInput}
							value="json"
							checked={exportFormat() === "json"}
							onChange={() => setExportFormat("json")}
						/>
						<label for="format-json" class={optionLabel}>
							JSON Format (recommended)
						</label>
					</div>
					<div class={exportOption}>
						<input
							type="radio"
							name="format"
							id="format-csv"
							class={radioInput}
							value="csv"
							checked={exportFormat() === "csv"}
							onChange={() => setExportFormat("csv")}
						/>
						<label for="format-csv" class={optionLabel}>
							CSV Format
						</label>
					</div>
					
					<button
						class={exportButton}
						onClick={handleExport}
						disabled={exporting()}
					>
						{exporting() ? "Exporting..." : "Export All Forms"}
					</button>
				</div>
			</div>
		</main>
	);
};
