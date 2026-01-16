import { Show } from "solid-js";
import { css } from "@linaria/core";
import { useApp } from "../context/AppContext";

const toolbar = css`
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 8px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	background: rgba(0, 0, 0, 0.1);
	flex-shrink: 0;
`;

const toolBtn = css`
	padding: 6px 10px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 6px;
	background: rgba(255, 255, 255, 0.05);
	color: rgba(255, 255, 255, 0.9);
	font-size: 12px;
	cursor: pointer;
	transition: all 0.15s;
	display: flex;
	align-items: center;
	gap: 4px;

	&:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.3);
	}

	&:active {
		background: rgba(255, 255, 255, 0.15);
	}
`;

const toolSeparator = css`
	width: 1px;
	height: 20px;
	background: rgba(255, 255, 255, 0.2);
	margin: 0 4px;
`;

interface MarkdownToolbarProps {
	onInsertMarkdown: (before: string, after?: string) => void;
}

export function MarkdownToolbar(props: MarkdownToolbarProps) {
	const { selectedFile, viewMode, setViewMode } = useApp();

	return (
		<Show when={selectedFile()}>
			<div class={toolbar}>
				<button class={toolBtn} onClick={() => props.onInsertMarkdown("**", "**")} title="Bold (Cmd+B)">
					<strong>B</strong>
				</button>
				<button class={toolBtn} onClick={() => props.onInsertMarkdown("*", "*")} title="Italic (Cmd+I)">
					<em>I</em>
				</button>
				<button class={toolBtn} onClick={() => props.onInsertMarkdown("~~", "~~")} title="Strikethrough">
					<s>S</s>
				</button>
				<div class={toolSeparator} />
				<button class={toolBtn} onClick={() => props.onInsertMarkdown("# ")} title="Heading 1">
					H1
				</button>
				<button class={toolBtn} onClick={() => props.onInsertMarkdown("## ")} title="Heading 2">
					H2
				</button>
				<button class={toolBtn} onClick={() => props.onInsertMarkdown("### ")} title="Heading 3">
					H3
				</button>
				<div class={toolSeparator} />
				<button class={toolBtn} onClick={() => props.onInsertMarkdown("[", "](url)")} title="Link">
					🔗
				</button>
				<button class={toolBtn} onClick={() => props.onInsertMarkdown("[[", "]]")} title="Wiki Link (Zettelkasten)">
					[[]]
				</button>
				<button class={toolBtn} onClick={() => props.onInsertMarkdown("`", "`")} title="Code">
					{"</>"}
				</button>
				<button class={toolBtn} onClick={() => props.onInsertMarkdown("```\n", "\n```")} title="Code Block">
					{"{ }"}
				</button>
				<div class={toolSeparator} />
				<button class={toolBtn} onClick={() => props.onInsertMarkdown("- ")} title="Bullet List">
					•
				</button>
				<button class={toolBtn} onClick={() => props.onInsertMarkdown("1. ")} title="Numbered List">
					1.
				</button>
				<button class={toolBtn} onClick={() => props.onInsertMarkdown("- [ ] ")} title="Task List">
					☑
				</button>
				<div class={toolSeparator} />
				<button class={toolBtn} onClick={() => props.onInsertMarkdown("> ")} title="Quote">
					"
				</button>
				<button class={toolBtn} onClick={() => props.onInsertMarkdown("---\n")} title="Horizontal Rule">
					─
				</button>
				<div class={toolSeparator} />
				<button
					class={toolBtn}
					onClick={() => setViewMode(viewMode() === "edit" ? "preview" : "edit")}
					style={{ background: viewMode() === "preview" ? "rgba(96, 165, 250, 0.2)" : undefined }}
					title={viewMode() === "edit" ? "Preview" : "Edit"}
				>
					{viewMode() === "edit" ? "👁️" : "✎"}
				</button>
			</div>
		</Show>
	);
}
