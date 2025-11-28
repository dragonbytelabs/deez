import { css } from "@linaria/core";
import { type Component, createSignal } from "solid-js";

const uploadSection = css`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--gray700);
`;

const uploadLabel = css`
  font-size: 14px;
  font-weight: 600;
  color: var(--white);
  margin-bottom: 12px;
  display: block;
`;

const uploadButton = css`
  width: 100%;
  padding: 12px 24px;
  background: transparent;
  border: 2px dashed var(--gray600);
  border-radius: 8px;
  color: var(--gray400);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--primary);
    color: var(--white);
    background: rgba(106, 61, 232, 0.1);
  }
`;

const hiddenInput = css`
  display: none;
`;

const errorText = css`
  color: #ef4444;
  font-size: 12px;
  margin-top: 8px;
`;

interface UserUploadAvatarProps {
	onImageSelected: (dataUrl: string) => void;
}

export const UserUploadAvatar: Component<UserUploadAvatarProps> = (props) => {
	const [error, setError] = createSignal<string | null>(null);
	let fileInputRef: HTMLInputElement | undefined;

	const handleButtonClick = () => {
		fileInputRef?.click();
	};

	const handleFileChange = (event: Event) => {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) {
			return;
		}

		// Validate file type
		const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
		if (!validTypes.includes(file.type)) {
			setError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
			return;
		}

		// Validate file size (max 2MB)
		const maxSize = 2 * 1024 * 1024;
		if (file.size > maxSize) {
			setError("Image must be smaller than 2MB");
			return;
		}

		setError(null);

		const reader = new FileReader();
		reader.onload = (e) => {
			const dataUrl = e.target?.result as string;
			if (dataUrl) {
				props.onImageSelected(dataUrl);
			}
		};
		reader.onerror = () => {
			setError("Failed to read the image file");
		};
		reader.readAsDataURL(file);

		// Reset input so the same file can be selected again
		input.value = "";
	};

	return (
		<div class={uploadSection}>
			<span class={uploadLabel}>Or upload your own</span>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/png,image/gif,image/webp"
				class={hiddenInput}
				onChange={handleFileChange}
			/>
			<button type="button" class={uploadButton} onClick={handleButtonClick}>
				Upload your own
			</button>
			{error() && <p class={errorText}>{error()}</p>}
		</div>
	);
};
