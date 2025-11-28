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

const formGroup = css`
  margin-bottom: 24px;
`;

const label = css`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--white);
  margin-bottom: 8px;
`;

const input = css`
  width: 100%;
  padding: 12px 16px;
  background: var(--gray700);
  border: 1px solid var(--gray600);
  border-radius: 8px;
  color: var(--white);
  font-size: 16px;
  transition: all 0.2s;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(106, 61, 232, 0.2);
  }
  
  &::placeholder {
    color: var(--gray500);
  }
`;

const currentEmail = css`
  font-size: 14px;
  color: var(--gray400);
  margin-bottom: 16px;
`;

const errorMessage = css`
  color: #ef4444;
  font-size: 14px;
  margin-top: 8px;
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

interface EmailPickerProps {
	isOpen: Accessor<boolean>;
	setIsOpen: Setter<boolean>;
}

export const EmailPicker: Component<EmailPickerProps> = (props) => {
	const [newEmail, setNewEmail] = createSignal("");
	const [isSaving, setIsSaving] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);
	const { store, actions } = useDz();

	const handleClose = () => {
		props.setIsOpen(false);
		// Reset form after animation completes
		setTimeout(() => {
			setNewEmail("");
			setError(null);
		}, 300);
	};

	const validateEmail = (email: string): boolean => {
		// RFC 5322 simplified email regex pattern
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		setError(null);

		const email = newEmail().trim();
		if (!email) {
			setError("Email is required");
			return;
		}

		if (!validateEmail(email)) {
			setError("Please enter a valid email address");
			return;
		}

		setIsSaving(true);

		try {
			const response = await api.updateEmail(email);
			if (response.ok) {
				actions.updateUserEmail(email);
				handleClose();
			} else {
				const errorText = await response.text();
				if (response.status === 409) {
					setError("This email is already in use");
				} else {
					setError(errorText || "Failed to update email");
				}
			}
		} catch (err) {
			console.error("Error updating email:", err);
			setError("An error occurred while updating email");
		} finally {
			setIsSaving(false);
		}
	};

	const isValid = () => {
		const email = newEmail().trim();
		return email.length > 0 && validateEmail(email);
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
					<h2 class={modalTitle}>Update Email</h2>
					<button class={closeButton} onClick={handleClose} type="button">
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit}>
					<div class={modalBody}>
						<div class={currentEmail}>
							Current email: {store.user?.email || "Not set"}
						</div>
						<div class={formGroup}>
							<label class={label} for="new-email">
								New Email Address
							</label>
							<input
								id="new-email"
								type="email"
								class={input}
								placeholder="Enter your new email"
								value={newEmail()}
								onInput={(e) => {
									setNewEmail(e.currentTarget.value);
									setError(null);
								}}
							/>
							<Show when={error()}>
								<div class={errorMessage}>{error()}</div>
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
							disabled={!isValid() || isSaving()}
						>
							{isSaving() ? "Saving..." : "Save Email"}
						</button>
					</div>
				</form>
			</div>
		</Show>
	);
};
