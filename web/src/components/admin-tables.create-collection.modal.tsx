import { css } from "@linaria/core";
import { createSignal, type Accessor, type Component, type Setter } from "solid-js";

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
  padding: 12px;
  background: var(--gray700);
  border: 1px solid var(--gray600);
  border-radius: 8px;
  color: var(--white);
  font-size: 14px;
  
  &::placeholder {
    color: var(--gray500);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const textarea = css`
  width: 100%;
  padding: 12px;
  background: var(--gray700);
  border: 1px solid var(--gray600);
  border-radius: 8px;
  color: var(--white);
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  
  &::placeholder {
    color: var(--gray500);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const helpText = css`
  font-size: 12px;
  color: var(--gray500);
  margin-top: 6px;
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

interface CreateCollectionModalProps {
    isOpen: Accessor<boolean>;
    setIsOpen: Setter<boolean>;
}

export const CreateCollectionModal: Component<CreateCollectionModalProps> = (props) => {
    const [collectionName, setCollectionName] = createSignal("");
    const [description, setDescription] = createSignal("");

    const handleClose = () => {
        props.setIsOpen(false);
        // Reset form
        setTimeout(() => {
            setCollectionName("");
            setDescription("");
        }, 300); // Wait for animation to complete
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();

        console.log("Creating collection:", {
            name: collectionName(),
            description: description(),
        });

        // TODO: Add API call to create collection

        handleClose();
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
                    <h2 class={modalTitle}>Create New Collection</h2>
                    <button class={closeButton} onClick={handleClose}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div class={modalBody}>
                        <div class={formGroup}>
                            <label class={label} for="collection-name">
                                Collection Name *
                            </label>
                            <input
                                id="collection-name"
                                type="text"
                                class={input}
                                placeholder="e.g., users, posts, products"
                                value={collectionName()}
                                onInput={(e) => setCollectionName(e.currentTarget.value)}
                                required
                                autocomplete="off"
                            />
                            <div class={helpText}>
                                Use lowercase letters, numbers, and underscores only
                            </div>
                        </div>

                        <div class={formGroup}>
                            <label class={label} for="description">
                                Description
                            </label>
                            <textarea
                                id="description"
                                class={textarea}
                                placeholder="Optional description for this collection..."
                                value={description()}
                                onInput={(e) => setDescription(e.currentTarget.value)}
                            />
                        </div>
                    </div>

                    <div class={modalFooter}>
                        <button
                            type="button"
                            class={cancelButton}
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            class={submitButton}
                            disabled={!collectionName().trim()}
                        >
                            Create Collection
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};