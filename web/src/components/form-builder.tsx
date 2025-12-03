import { css } from "@linaria/core";
import { createSignal, For, Show } from "solid-js";

// Types
export type FormFieldType =
	| "text"
	| "textarea"
	| "select"
	| "number"
	| "checkbox"
	| "radio"
	| "hidden"
	| "html"
	| "section";

export type FormField = {
	id: string;
	name: string;
	label: string;
	type: FormFieldType;
	required?: boolean;
	placeholder?: string;
	options?: string[];
	defaultValue?: string;
	htmlContent?: string;
};

// Styles
const builderContainer = css`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 20px;
  min-height: 600px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const formPreviewSection = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  padding: 24px;
  overflow-y: auto;
`;

const rightPanel = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  overflow: hidden;
`;

const tabsContainer = css`
  display: flex;
  border-bottom: 1px solid var(--gray700);
`;

const tab = css`
  flex: 1;
  padding: 14px 16px;
  background: transparent;
  border: none;
  color: var(--gray400);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;

  &:hover {
    color: var(--white);
    background: var(--gray750);
  }
`;

const activeTabStyle = css`
  color: var(--primary);
  border-bottom-color: var(--primary);
`;

const tabContent = css`
  padding: 20px;
  max-height: calc(100vh - 280px);
  overflow-y: auto;
`;

const searchContainer = css`
  position: relative;
  margin-bottom: 20px;
`;

const searchInput = css`
  width: 100%;
  padding: 12px 16px 12px 40px;
  background: var(--gray700);
  border: 1px solid var(--gray600);
  border-radius: 8px;
  color: var(--white);
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }

  &::placeholder {
    color: var(--gray500);
  }
`;

const searchIcon = css`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray500);
`;

const helpText = css`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: var(--gray750);
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 13px;
  color: var(--gray400);
  line-height: 1.5;
`;

const cursorIcon = css`
  font-size: 18px;
  color: var(--gray500);
`;

const sectionHeader = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  margin-bottom: 12px;
  cursor: pointer;
  
  &:hover {
    color: var(--white);
  }
`;

const sectionTitle = css`
  font-size: 14px;
  font-weight: 600;
  color: var(--gray300);
`;

const sectionToggle = css`
  color: var(--gray500);
  transition: transform 0.2s;
`;

const fieldTypesGrid = css`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const fieldTypeCard = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  background: var(--gray750);
  border: 1px solid var(--gray600);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
    background: var(--gray700);
  }
`;

const fieldTypeIcon = css`
  font-size: 20px;
  margin-bottom: 8px;
  color: var(--gray400);
`;

const fieldTypeName = css`
  font-size: 11px;
  color: var(--gray400);
  text-align: center;
`;

// Form Preview Styles
const formPreviewTitle = css`
  font-size: 18px;
  font-weight: 600;
  color: var(--white);
  margin-bottom: 20px;
`;

const emptyPreview = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--gray500);
  text-align: center;
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

const fieldItem = css`
  padding: 16px;
  background: var(--gray750);
  border: 1px solid var(--gray600);
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
  }
`;

const fieldItemSelected = css`
  border-color: var(--primary);
  background: rgba(59, 130, 246, 0.1);
`;

const fieldLabel = css`
  font-size: 14px;
  font-weight: 500;
  color: var(--white);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const requiredIndicator = css`
  color: #ef4444;
`;

const fieldPreviewInput = css`
  width: 100%;
  padding: 10px 12px;
  background: var(--gray700);
  border: 1px solid var(--gray600);
  border-radius: 6px;
  color: var(--gray500);
  font-size: 13px;
  box-sizing: border-box;

  &::placeholder {
    color: var(--gray600);
  }
`;

const fieldPreviewTextarea = css`
  width: 100%;
  padding: 10px 12px;
  background: var(--gray700);
  border: 1px solid var(--gray600);
  border-radius: 6px;
  color: var(--gray500);
  font-size: 13px;
  min-height: 80px;
  resize: vertical;
  box-sizing: border-box;

  &::placeholder {
    color: var(--gray600);
  }
`;

const fieldPreviewSelect = css`
  width: 100%;
  padding: 10px 12px;
  background: var(--gray700);
  border: 1px solid var(--gray600);
  border-radius: 6px;
  color: var(--gray500);
  font-size: 13px;
  box-sizing: border-box;
`;

const checkboxContainer = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const radioGroup = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const radioOption = css`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gray400);
  font-size: 13px;
`;

const sectionDivider = css`
  padding: 12px 0;
  border-bottom: 1px solid var(--gray600);
  margin-bottom: 12px;
`;

const sectionLabel = css`
  font-size: 16px;
  font-weight: 600;
  color: var(--white);
`;

const htmlPreview = css`
  padding: 12px;
  background: var(--gray700);
  border-radius: 6px;
  color: var(--gray400);
  font-size: 13px;
  font-family: monospace;
`;

const hiddenFieldPreview = css`
  padding: 8px 12px;
  background: var(--gray700);
  border: 1px dashed var(--gray600);
  border-radius: 6px;
  color: var(--gray500);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Field Settings Styles
const settingsForm = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const settingsField = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const settingsLabel = css`
  font-size: 13px;
  color: var(--gray400);
`;

const settingsInput = css`
  width: 100%;
  padding: 10px 12px;
  background: var(--gray700);
  border: 1px solid var(--gray600);
  border-radius: 6px;
  color: var(--white);
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const settingsTextarea = css`
  width: 100%;
  padding: 10px 12px;
  background: var(--gray700);
  border: 1px solid var(--gray600);
  border-radius: 6px;
  color: var(--white);
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const checkboxWrapper = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const checkboxLabel = css`
  font-size: 14px;
  color: var(--gray300);
`;

const deleteButton = css`
  padding: 10px 16px;
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
  }
`;

const noFieldSelected = css`
  text-align: center;
  padding: 40px 20px;
  color: var(--gray500);
`;

// Field type definitions for the palette
const fieldTypes = [
	{ type: "text" as FormFieldType, name: "Single Line Text", icon: "A" },
	{ type: "textarea" as FormFieldType, name: "Paragraph Text", icon: "¶" },
	{ type: "select" as FormFieldType, name: "Drop Down", icon: "☐" },
	{ type: "number" as FormFieldType, name: "Number", icon: "123" },
	{ type: "checkbox" as FormFieldType, name: "Checkboxes", icon: "☑" },
	{ type: "radio" as FormFieldType, name: "Radio Buttons", icon: "◉" },
	{ type: "hidden" as FormFieldType, name: "Hidden", icon: "👁" },
	{ type: "html" as FormFieldType, name: "HTML", icon: "</>" },
	{ type: "section" as FormFieldType, name: "Section", icon: "—" },
];

// Helper to generate unique IDs
const generateId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper to get default field
const createDefaultField = (type: FormFieldType): FormField => {
	const baseField = {
		id: generateId(),
		name: `field_${Date.now()}`,
		type,
		required: false,
	};

	switch (type) {
		case "text":
			return { ...baseField, label: "Text Field", placeholder: "Enter text" };
		case "textarea":
			return { ...baseField, label: "Paragraph", placeholder: "Enter text" };
		case "select":
			return { ...baseField, label: "Dropdown", options: ["Option 1", "Option 2", "Option 3"] };
		case "number":
			return { ...baseField, label: "Number", placeholder: "Enter number" };
		case "checkbox":
			return { ...baseField, label: "Checkbox", options: ["Option 1", "Option 2"] };
		case "radio":
			return { ...baseField, label: "Radio Buttons", options: ["Option 1", "Option 2", "Option 3"] };
		case "hidden":
			return { ...baseField, label: "Hidden Field", defaultValue: "" };
		case "html":
			return { ...baseField, label: "HTML Content", htmlContent: "<p>Custom HTML content</p>" };
		case "section":
			return { ...baseField, label: "Section Title" };
		default:
			return { ...baseField, label: "New Field" };
	}
};

type FormBuilderProps = {
	fields: FormField[];
	onFieldsChange: (fields: FormField[]) => void;
};

export const FormBuilder = (props: FormBuilderProps) => {
	const [activeTab, setActiveTab] = createSignal<"add" | "settings">("add");
	const [selectedFieldId, setSelectedFieldId] = createSignal<string | null>(null);
	const [searchQuery, setSearchQuery] = createSignal("");
	const [sectionOpen, setSectionOpen] = createSignal(true);

	const selectedField = () => props.fields.find((f) => f.id === selectedFieldId());

	const addField = (type: FormFieldType) => {
		const newField = createDefaultField(type);
		props.onFieldsChange([...props.fields, newField]);
		setSelectedFieldId(newField.id);
		setActiveTab("settings");
	};

	const updateField = (fieldId: string, updates: Partial<FormField>) => {
		const updatedFields = props.fields.map((field) =>
			field.id === fieldId ? { ...field, ...updates } : field
		);
		props.onFieldsChange(updatedFields);
	};

	const deleteField = (fieldId: string) => {
		const updatedFields = props.fields.filter((field) => field.id !== fieldId);
		props.onFieldsChange(updatedFields);
		if (selectedFieldId() === fieldId) {
			setSelectedFieldId(null);
		}
	};

	const filteredFieldTypes = () => {
		const query = searchQuery().toLowerCase();
		if (!query) return fieldTypes;
		return fieldTypes.filter((ft) => ft.name.toLowerCase().includes(query));
	};

	const renderFieldPreview = (field: FormField) => {
		switch (field.type) {
			case "textarea":
				return <textarea class={fieldPreviewTextarea} placeholder={field.placeholder} disabled />;
			case "select":
				return (
					<select class={fieldPreviewSelect} disabled>
						<option>Select an option</option>
						<For each={field.options || []}>
							{(option) => <option>{option}</option>}
						</For>
					</select>
				);
			case "number":
				return <input type="number" class={fieldPreviewInput} placeholder={field.placeholder} disabled />;
			case "checkbox":
				return (
					<div>
						<For each={field.options || []}>
							{(option) => (
								<div class={checkboxContainer}>
									<input type="checkbox" disabled />
									<span style={{ color: "var(--gray400)", "font-size": "13px" }}>{option}</span>
								</div>
							)}
						</For>
					</div>
				);
			case "radio":
				return (
					<div class={radioGroup}>
						<For each={field.options || []}>
							{(option) => (
								<label class={radioOption}>
									<input type="radio" name={field.name} disabled />
									{option}
								</label>
							)}
						</For>
					</div>
				);
			case "hidden":
				return (
					<div class={hiddenFieldPreview}>
						<span>👁</span>
						<span>Hidden field: {field.name}</span>
					</div>
				);
			case "html":
				return (
					<div class={htmlPreview}>
						{field.htmlContent || "<p>HTML content</p>"}
					</div>
				);
			case "section":
				return (
					<div class={sectionDivider}>
						<div class={sectionLabel}>{field.label}</div>
					</div>
				);
			default:
				return <input type="text" class={fieldPreviewInput} placeholder={field.placeholder} disabled />;
		}
	};

	const renderFieldSettings = () => {
		const field = selectedField();
		if (!field) {
			return (
				<div class={noFieldSelected}>
					<p>Select a field to edit its settings</p>
				</div>
			);
		}

		return (
			<div class={settingsForm}>
				<div class={settingsField}>
					<label class={settingsLabel}>Field Label</label>
					<input
						type="text"
						class={settingsInput}
						value={field.label}
						onInput={(e) => updateField(field.id, { label: e.currentTarget.value })}
					/>
				</div>

				<div class={settingsField}>
					<label class={settingsLabel}>Field Name (ID)</label>
					<input
						type="text"
						class={settingsInput}
						value={field.name}
						onInput={(e) => updateField(field.id, { name: e.currentTarget.value })}
					/>
				</div>

				<Show when={field.type !== "section" && field.type !== "html" && field.type !== "hidden"}>
					<div class={checkboxWrapper}>
						<input
							type="checkbox"
							checked={field.required}
							onChange={(e) => updateField(field.id, { required: e.currentTarget.checked })}
						/>
						<span class={checkboxLabel}>Required field</span>
					</div>
				</Show>

				<Show when={field.type === "text" || field.type === "textarea" || field.type === "number"}>
					<div class={settingsField}>
						<label class={settingsLabel}>Placeholder</label>
						<input
							type="text"
							class={settingsInput}
							value={field.placeholder || ""}
							onInput={(e) => updateField(field.id, { placeholder: e.currentTarget.value })}
						/>
					</div>
				</Show>

				<Show when={field.type === "hidden"}>
					<div class={settingsField}>
						<label class={settingsLabel}>Default Value</label>
						<input
							type="text"
							class={settingsInput}
							value={field.defaultValue || ""}
							onInput={(e) => updateField(field.id, { defaultValue: e.currentTarget.value })}
						/>
					</div>
				</Show>

				<Show when={field.type === "html"}>
					<div class={settingsField}>
						<label class={settingsLabel}>HTML Content</label>
						<textarea
							class={settingsTextarea}
							value={field.htmlContent || ""}
							onInput={(e) => updateField(field.id, { htmlContent: e.currentTarget.value })}
						/>
					</div>
				</Show>

				<Show when={field.type === "select" || field.type === "checkbox" || field.type === "radio"}>
					<div class={settingsField}>
						<label class={settingsLabel}>Options (one per line)</label>
						<textarea
							class={settingsTextarea}
							value={(field.options || []).join("\n")}
							onInput={(e) => {
								const options = e.currentTarget.value.split("\n").filter((o) => o.trim());
								updateField(field.id, { options });
							}}
						/>
					</div>
				</Show>

				<button
					type="button"
					class={deleteButton}
					onClick={() => deleteField(field.id)}
				>
					Delete Field
				</button>
			</div>
		);
	};

	return (
		<div class={builderContainer}>
			{/* Form Preview Panel */}
			<div class={formPreviewSection}>
				<div class={formPreviewTitle}>Form Preview</div>
				<Show
					when={props.fields.length > 0}
					fallback={
						<div class={emptyPreview}>
							<div class={emptyIcon}>📝</div>
							<p class={emptyText}>No fields added yet</p>
							<p class={emptySubtext}>Add fields from the panel on the right</p>
						</div>
					}
				>
					<For each={props.fields}>
						{(field) => (
							<div
								class={`${fieldItem} ${selectedFieldId() === field.id ? fieldItemSelected : ""}`}
								onClick={() => {
									setSelectedFieldId(field.id);
									setActiveTab("settings");
								}}
							>
								<Show when={field.type !== "section"}>
									<div class={fieldLabel}>
										{field.label}
										<Show when={field.required}>
											<span class={requiredIndicator}>*</span>
										</Show>
									</div>
								</Show>
								{renderFieldPreview(field)}
							</div>
						)}
					</For>
				</Show>
			</div>

			{/* Right Panel - Add Fields / Field Settings */}
			<div class={rightPanel}>
				<div class={tabsContainer}>
					<button
						type="button"
						class={`${tab} ${activeTab() === "add" ? activeTabStyle : ""}`}
						onClick={() => setActiveTab("add")}
					>
						Add Fields
					</button>
					<button
						type="button"
						class={`${tab} ${activeTab() === "settings" ? activeTabStyle : ""}`}
						onClick={() => setActiveTab("settings")}
					>
						Field Settings
					</button>
				</div>

				<div class={tabContent}>
					<Show when={activeTab() === "add"}>
						<div class={searchContainer}>
							<span class={searchIcon}>🔍</span>
							<input
								type="text"
								class={searchInput}
								placeholder="Search for a field"
								value={searchQuery()}
								onInput={(e) => setSearchQuery(e.currentTarget.value)}
							/>
						</div>

						<div class={helpText}>
							<span class={cursorIcon}>👆</span>
							<span>Click a field type below to add it to your form, then configure it in Field Settings.</span>
						</div>

						<div
							class={sectionHeader}
							onClick={() => setSectionOpen(!sectionOpen())}
						>
							<span class={sectionTitle}>Standard Fields</span>
							<span class={sectionToggle} style={{ transform: sectionOpen() ? "rotate(0deg)" : "rotate(-90deg)" }}>
								▼
							</span>
						</div>

						<Show when={sectionOpen()}>
							<div class={fieldTypesGrid}>
								<For each={filteredFieldTypes()}>
									{(fieldType) => (
										<div
											class={fieldTypeCard}
											onClick={() => addField(fieldType.type)}
										>
											<span class={fieldTypeIcon}>{fieldType.icon}</span>
											<span class={fieldTypeName}>{fieldType.name}</span>
										</div>
									)}
								</For>
							</div>
						</Show>
					</Show>

					<Show when={activeTab() === "settings"}>
						{renderFieldSettings()}
					</Show>
				</div>
			</div>
		</div>
	);
};
