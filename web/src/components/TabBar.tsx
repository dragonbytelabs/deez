import { For, Show } from "solid-js";
import { produce } from "solid-js/store";
import { css } from "@linaria/core";
import { useApp } from "../context/AppContext";

const tabsBar = css`
	display: flex;
	background: #1e1e1e;
	border-bottom: 1px solid #333;
	overflow-x: auto;
	overflow-y: hidden;
	white-space: nowrap;
	flex-shrink: 0;
	scrollbar-width: thin;
	scrollbar-color: #555 #1e1e1e;

	&::-webkit-scrollbar {
		height: 6px;
	}
	&::-webkit-scrollbar-track {
		background: #1e1e1e;
	}
	&::-webkit-scrollbar-thumb {
		background: #555;
		border-radius: 3px;
	}
	&::-webkit-scrollbar-thumb:hover {
		background: #666;
	}
`;

const tab = css`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	background: #252525;
	border-right: 1px solid #333;
	cursor: pointer;
	user-select: none;
	transition: background 0.15s;
	min-width: 120px;
	max-width: 200px;

	&:hover {
		background: #2a2a2a;
	}
`;

const tabActive = css`
	background: #1e1e1e !important;
	border-bottom: 2px solid #007acc;
`;

const tabPreview = css`
	font-style: italic;
	opacity: 0.8;
`;

const tabFileName = css`
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 13px;
`;

const tabActions = css`
	display: flex;
	align-items: center;
	gap: 4px;
	flex-shrink: 0;
`;

const tabClose = css`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	border-radius: 3px;
	font-size: 18px;
	line-height: 1;
	opacity: 0.6;
	transition: opacity 0.15s, background 0.15s;

	&:hover {
		opacity: 1;
		background: #3a3a3a;
	}
`;

interface TabBarProps {
	onSave: () => Promise<void>;
}

export function TabBar(props: TabBarProps) {
	const {
		openTabs,
		setOpenTabs,
		selectedFile,
		setSelectedFile,
		previewTab,
		setPreviewTab,
		fileStore,
		setFileStore
	} = useApp();

	const isFileDirty = (filePath: string) => {
		const state = fileStore[filePath];
		if (!state) return false;
		return state.draftContent !== state.savedContent;
	};

	const closeTab = async (filePath: string, e?: MouseEvent) => {
		e?.stopPropagation();

		// Check if file has unsaved changes
		const fileIsDirty = isFileDirty(filePath);
		if (fileIsDirty) {
			const result = confirm(
				`"${filePath.split("/").pop()}" has unsaved changes. Do you want to save them?\n\nYour changes will be lost if you don't save them.`
			);

			if (result) {
				// User wants to save
				if (selectedFile() === filePath) {
					// File is currently selected, save it
					await props.onSave();
				} else {
					// File is not selected, we need to switch to it, save, then close
					setSelectedFile(filePath);
					// Wait a tick for the file to load
					await new Promise((resolve) => setTimeout(resolve, 100));
					await props.onSave();
				}
			} else {
				// User doesn't want to save (revert changes to saved version)
				const state = fileStore[filePath];
				if (state) {
					setFileStore(
						produce((store) => {
							if (store[filePath]) {
								store[filePath].draftContent = store[filePath].savedContent;
							}
						})
					);
				}
			}
		}

		// Get current index before removing
		const currentIdx = openTabs().indexOf(filePath);
		const tabs = openTabs().filter((p) => p !== filePath);
		setOpenTabs(tabs);

		// Remove from store
		setFileStore(
			produce((store) => {
				delete store[filePath];
			})
		);

		// If closing the selected file, select an appropriate tab
		if (selectedFile() === filePath) {
			if (tabs.length > 0) {
				// Try to select the tab to the right, or the one to the left if at the end
				const nextIdx = currentIdx >= tabs.length ? tabs.length - 1 : currentIdx;
				setSelectedFile(tabs[nextIdx]);
			} else {
				setSelectedFile("");
			}
		}
	};

	return (
		<Show when={openTabs().length > 0}>
			<div class={tabsBar}>
				<For each={openTabs()}>
					{(filePath) => {
						const fileName = filePath.split("/").pop() || filePath;
						return (
							<div
								class={`${tab} ${selectedFile() === filePath ? tabActive : ""} ${previewTab() === filePath ? tabPreview : ""}`}
								onClick={() => setSelectedFile(filePath)}
								onDblClick={() => {
									if (previewTab() === filePath) {
										setPreviewTab("");
									}
								}}
								title={filePath}
							>
								<span class={tabFileName}>{fileName}</span>
								<div class={tabActions}>
									<Show when={isFileDirty(filePath)}>
										<div
											class="tab-dirty-dot"
											style={{
												width: "8px",
												height: "8px",
												"border-radius": "50%",
												background: "#ffffff",
												opacity: "0.9",
											}}
											title="Unsaved changes"
										/>
									</Show>
									<div
										class={`${tabClose} tab-close-x`}
										style={{ display: isFileDirty(filePath) ? "none" : "flex" }}
										onClick={(e) => closeTab(filePath, e)}
										title="Close"
									>
										×
									</div>
								</div>
							</div>
						);
					}}
				</For>
			</div>
		</Show>
	);
}
