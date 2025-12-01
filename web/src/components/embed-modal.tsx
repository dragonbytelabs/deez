import { css } from "@linaria/core";
import { createSignal, type Accessor, type Component, type Setter } from "solid-js";

const modalOverlay = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  
  &.open {
    opacity: 1;
    pointer-events: auto;
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
  pointer-events: none;
  transition: transform 0.3s ease;
  
  &.open {
    transform: translateX(0);
    pointer-events: auto;
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

const label = css`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--white);
  margin-bottom: 8px;
`;

const helpText = css`
  font-size: 12px;
  color: var(--gray500);
  margin-top: 6px;
  margin-bottom: 16px;
`;

const codeBlock = css`
  width: 100%;
  padding: 16px;
  background: var(--gray900);
  border: 1px solid var(--gray700);
  border-radius: 8px;
  color: var(--gray300);
  font-size: 13px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  box-sizing: border-box;
`;

const copyButton = css`
  margin-top: 12px;
  padding: 10px 20px;
  background: var(--primary);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: var(--primaryDark);
  }
`;

const copiedText = css`
  color: #22c55e;
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

/**
 * Generates the embed script code for a form
 */
export const generateEmbedCode = (formId: number): string => {
	const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
	return `<script src="${baseUrl}/embed/form/${formId}.js" async></script>
<div id="dz-form-${formId}"></div>`;
};

interface EmbedModalProps {
	isOpen: Accessor<boolean>;
	setIsOpen: Setter<boolean>;
	formId: number;
	formName: string;
}

export const EmbedModal: Component<EmbedModalProps> = (props) => {
	const [copied, setCopied] = createSignal(false);

	const handleClose = () => {
		props.setIsOpen(false);
		setCopied(false);
	};

	const handleCopy = async () => {
		const code = generateEmbedCode(props.formId);
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			setTimeout(() => setCopied(false), 3000);
		} catch (err) {
			console.error("Failed to copy to clipboard:", err);
		}
	};

	return (
		<>
			{/* Overlay */}
			<div
				class={`${modalOverlay} ${props.isOpen() ? "open" : ""}`}
				onClick={handleClose}
			/>

			{/* Slide-in Panel */}
			<div class={`${modalPanel} ${props.isOpen() ? "open" : ""}`}>
				<div class={modalHeader}>
					<h2 class={modalTitle}>Embed Form</h2>
					<button class={closeButton} onClick={handleClose}>
						✕
					</button>
				</div>

				<div class={modalBody}>
					<label class={label}>Embed Code for "{props.formName}"</label>
					<p class={helpText}>
						Copy the code below and paste it into your website's HTML where you
						want the form to appear.
					</p>

					<div class={codeBlock}>{generateEmbedCode(props.formId)}</div>

					<button class={copyButton} onClick={handleCopy}>
						<span>📋</span>
						<span>Copy to Clipboard</span>
					</button>

					{copied() && <p class={copiedText}>✓ Copied to clipboard!</p>}
				</div>

				<div class={modalFooter}>
					<button type="button" class={cancelButton} onClick={handleClose}>
						Close
					</button>
				</div>
			</div>
		</>
	);
};
