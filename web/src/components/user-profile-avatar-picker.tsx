import { css } from "@linaria/core";
import {
	type Accessor,
	type Component,
	createSignal,
	For,
	type Setter,
} from "solid-js";

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

const avatarGrid = css`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;

const avatarOption = css`
  aspect-ratio: 1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &.selected {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(106, 61, 232, 0.3);
  }
`;

const previewSection = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
`;

const previewLabel = css`
  font-size: 14px;
  font-weight: 600;
  color: var(--white);
  margin-bottom: 12px;
`;

const previewAvatar = css`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
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

// Define the 9 avatar options with animal emojis and background colors
const avatarOptions = [
	{ emoji: "🐶", backgroundColor: "#4CAF50" }, // Dog - Green
	{ emoji: "🐱", backgroundColor: "#E91E63" }, // Cat - Pink
	{ emoji: "🦊", backgroundColor: "#FF5722" }, // Fox - Deep Orange
	{ emoji: "🐻", backgroundColor: "#795548" }, // Bear - Brown
	{ emoji: "🐼", backgroundColor: "#607D8B" }, // Panda - Blue Grey
	{ emoji: "🦁", backgroundColor: "#FF9800" }, // Lion - Orange
	{ emoji: "🐸", backgroundColor: "#8BC34A" }, // Frog - Light Green
	{ emoji: "🦉", backgroundColor: "#9C27B0" }, // Owl - Purple
	{ emoji: "🐧", backgroundColor: "#00BCD4" }, // Penguin - Cyan
];

interface AvatarPickerProps {
	isOpen: Accessor<boolean>;
	setIsOpen: Setter<boolean>;
	onAvatarSave: (avatarUrl: string) => void;
}

export const AvatarPicker: Component<AvatarPickerProps> = (props) => {
	const [selectedIndex, setSelectedIndex] = createSignal<number | null>(null);
	const [isSaving, setIsSaving] = createSignal(false);

	const handleClose = () => {
		props.setIsOpen(false);
		// Reset selection after animation completes
		setTimeout(() => {
			setSelectedIndex(null);
		}, 300);
	};

	const generateAvatarSvg = (
		emoji: string,
		backgroundColor: string,
	): string => {
		const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="50" fill="${backgroundColor}"/>
  <text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-size="50">${emoji}</text>
</svg>`;
		const encoded = btoa(svg);
		return `data:image/svg+xml;base64,${encoded}`;
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();

		const selected = selectedIndex();
		if (selected === null) return;

		setIsSaving(true);

		const option = avatarOptions[selected];
		const avatarUrl = generateAvatarSvg(option.emoji, option.backgroundColor);

		try {
			await props.onAvatarSave(avatarUrl);
			handleClose();
		} catch (error) {
			console.error("Failed to save avatar:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const selectedOption = () => {
		const idx = selectedIndex();
		return idx !== null ? avatarOptions[idx] : null;
	};

	return (
		<>
			{/* Overlay */}
			<div
				role="button"
				tabIndex={0}
				class={`${modalOverlay} ${props.isOpen() ? "open" : ""}`}
				onClick={handleClose}
				onKeyDown={(e) => e.key === "Escape" && handleClose()}
			/>

			{/* Slide-in Panel */}
			<div class={`${modalPanel} ${props.isOpen() ? "open" : ""}`}>
				<div class={modalHeader}>
					<h2 class={modalTitle}>Choose Your Avatar</h2>
					<button class={closeButton} onClick={handleClose} type="button">
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit}>
					<div class={modalBody}>
						{/* Preview Section */}
						<div class={previewSection}>
							<span class={previewLabel}>Preview</span>
							<div
								class={previewAvatar}
								style={{
									"background-color":
										selectedOption()?.backgroundColor ?? "#4a1e79",
								}}
							>
								{selectedOption()?.emoji ?? "?"}
							</div>
						</div>

						{/* Avatar Grid */}
						<div class={avatarGrid}>
							<For each={avatarOptions}>
								{(option, index) => (
									<button
										type="button"
										class={`${avatarOption} ${selectedIndex() === index() ? "selected" : ""}`}
										style={{ "background-color": option.backgroundColor }}
										onClick={() => setSelectedIndex(index())}
									>
										{option.emoji}
									</button>
								)}
							</For>
						</div>
					</div>

					<div class={modalFooter}>
						<button type="button" class={cancelButton} onClick={handleClose}>
							Cancel
						</button>
						<button
							type="submit"
							class={submitButton}
							disabled={selectedIndex() === null || isSaving()}
						>
							{isSaving() ? "Saving..." : "Save Avatar"}
						</button>
					</div>
				</form>
			</div>
		</>
	);
};
