import { css } from "@linaria/core";
import {
	type Accessor,
	type Component,
	createSignal,
	type Setter,
	Show,
} from "solid-js";
import { api } from "../server/api";
import { useDz } from "../dz-context";

const modalOverlay = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  &.open {
    opacity: 1;
  }
`;

const modalPanel = css`
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  width: 500px;
  max-width: 90vw;
  background: var(--gray800);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  
  &.open {
    transform: translateX(0);
  }
`;

const modalHeader = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--gray700);
`;

const modalTitle = css`
  font-size: 24px;
  font-weight: bold;
  color: var(--white);
`;

const closeButton = css`
  background: transparent;
  border: none;
  color: var(--gray500);
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: var(--gray700);
    color: var(--white);
  }
`;

const modalBody = css`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
`;

const inputSection = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const inputLabel = css`
  font-size: 14px;
  font-weight: 600;
  color: var(--white);
`;

const inputField = css`
  padding: 12px 16px;
  background: var(--gray700);
  border: 1px solid var(--gray600);
  border-radius: 8px;
  color: var(--white);
  font-size: 16px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(106, 61, 232, 0.3);
  }
  
  &::placeholder {
    color: var(--gray500);
  }
`;

const charCount = css`
  font-size: 12px;
  color: var(--gray500);
  text-align: right;
`;

const errorMessage = css`
  font-size: 14px;
  color: #ef4444;
  margin-top: 4px;
`;

const currentDisplayName = css`
  font-size: 14px;
  color: var(--gray400);
  margin-bottom: 16px;
`;

const modalFooter = css`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid var(--gray700);
`;

const cancelButton = css`
  padding: 10px 20px;
  background: transparent;
  border: 1px solid var(--gray600);
  border-radius: 8px;
  color: var(--white);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: var(--gray700);
  }
`;

const submitButton = css`
  padding: 10px 20px;
  background: var(--primary);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: var(--primaryDark);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MAX_DISPLAY_NAME_LENGTH = 50;

interface DisplayNameEditorProps {
	isOpen: Accessor<boolean>;
	setIsOpen: Setter<boolean>;
}

export const DisplayNameEditor: Component<DisplayNameEditorProps> = (props) => {
	const { store, actions } = useDz();
	const [displayName, setDisplayName] = createSignal(
		store.user?.display_name ?? ""
	);
	const [isSaving, setIsSaving] = createSignal(false);
	const [error, setError] = createSignal("");

	const handleDisplayNameSave = async (newDisplayName: string) => {
		try {
			const response = await api.updateDisplayName(newDisplayName);
			if (response.ok) {
				console.log("Display name updated successfully");
				actions.updateUserDisplayName(newDisplayName);
			} else {
				const errorText = await response.text();
				console.error("Failed to update display name:", errorText);
				throw new Error(errorText);
			}
		} catch (err) {
			console.error("Error updating display name:", err);
			throw err;
		}
	};

	const handleClose = () => {
		props.setIsOpen(false);
		// Reset input after animation completes
		setTimeout(() => {
			setDisplayName(store.user?.display_name ?? "");
			setError("");
		}, 300);
	};

	const handleInputChange = (e: InputEvent) => {
		const target = e.target as HTMLInputElement;
		const value = target.value;
		if (value.length <= MAX_DISPLAY_NAME_LENGTH) {
			setDisplayName(value);
			setError("");
		}
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();

		const trimmedName = displayName().trim();

		if (!trimmedName) {
			setError("Display name cannot be empty");
			return;
		}

		if (trimmedName.length > MAX_DISPLAY_NAME_LENGTH) {
			setError(`Display name must be ${MAX_DISPLAY_NAME_LENGTH} characters or less`);
			return;
		}

		setIsSaving(true);
		setError("");

		try {
			await handleDisplayNameSave(trimmedName);
			handleClose();
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message || "Failed to save display name");
			} else {
				setError("Failed to save display name");
			}
		} finally {
			setIsSaving(false);
		}
	};

	const hasChanges = () => {
		return displayName().trim() !== (store.user?.display_name ?? "");
	};

	const isValid = () => {
		const trimmed = displayName().trim();
		return trimmed.length > 0 && trimmed.length <= MAX_DISPLAY_NAME_LENGTH;
	};

	return (
		<Show when={props.isOpen()}>
			{/* Overlay */}
			<div
				role="button"
				tabIndex={0}
				class={`${modalOverlay} ${props.isOpen() ? "open" : ""}`}
				onClick={handleClose}
				onKeyDown={(e) => e.key === "Escape" && handleClose()}
			/>

			{/* Slide-in Panel */}
			<div class={`${modalPanel} open`}>
				<div class={modalHeader}>
					<h2 class={modalTitle}>Update Display Name</h2>
					<button class={closeButton} onClick={handleClose} type="button">
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit}>
					<div class={modalBody}>
						<Show when={store.user?.display_name}>
							<p class={currentDisplayName}>
								Current display name: <strong>{store.user?.display_name}</strong>
							</p>
						</Show>

						<div class={inputSection}>
							<label class={inputLabel} for="display-name-input">
								New Display Name
							</label>
							<input
								id="display-name-input"
								type="text"
								class={inputField}
								value={displayName()}
								onInput={handleInputChange}
								placeholder="Enter your display name"
								maxLength={MAX_DISPLAY_NAME_LENGTH}
								autocomplete="off"
							/>
							<span class={charCount}>
								{displayName().length}/{MAX_DISPLAY_NAME_LENGTH}
							</span>
							<Show when={error()}>
								<span class={errorMessage}>{error()}</span>
							</Show>
						</div>
					</div>

					<div class={modalFooter}>
						<button type="button" class={cancelButton} onClick={handleClose}>
							Cancel
						</button>
						<button
							type="submit"
							class={submitButton}
							disabled={!hasChanges() || !isValid() || isSaving()}
						>
							{isSaving() ? "Saving..." : "Save Display Name"}
						</button>
					</div>
				</form>
			</div>
		</Show>
	);
};
