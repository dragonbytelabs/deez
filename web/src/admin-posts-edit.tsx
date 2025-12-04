import { css } from "@linaria/core";
import { useNavigate, useParams } from "@solidjs/router";
import { createSignal, For, onMount, Show } from "solid-js";
import { api, type PostInfo, type PostInput } from "./server/api";

const layout = css`
  display: flex;
  height: 100vh;
  flex-direction: column;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const mainContent = css`
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  margin-left: 250px;
  
  @media (max-width: 768px) {
    padding: 80px 20px 20px;
    margin-left: 0;
  }
`;

const header = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 16px;
`;

const title = css`
  font-size: 32px;
  font-weight: bold;
  color: var(--white);
`;

const headerButtons = css`
  display: flex;
  gap: 12px;
`;

const button = css`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
`;

const saveButton = css`
  background: var(--primary);
  color: white;
  
  &:hover {
    background: var(--primaryDark);
  }
  
  &:disabled {
    background: var(--gray600);
    cursor: not-allowed;
  }
`;

const cancelButton = css`
  background: var(--gray700);
  color: var(--white);
  
  &:hover {
    background: var(--gray600);
  }
`;

const previewButton = css`
  background: var(--gray700);
  color: var(--white);
  
  &:hover {
    background: var(--gray600);
  }
  
  &.active {
    background: var(--primary);
  }
`;

const contentContainer = css`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const editorColumn = css`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const sidebarColumn = css`
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  @media (max-width: 1200px) {
    order: -1;
  }
`;

const editorPane = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  padding: 24px;
`;

const previewPane = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  padding: 24px;
`;

const sidebarSection = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  overflow: hidden;
`;

const sectionHeader = css`
  background: var(--gray700);
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--white);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  
  &:hover {
    background: var(--gray600);
  }
`;

const sectionContent = css`
  padding: 16px;
`;

const inputGroup = css`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const label = css`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--gray400);
  margin-bottom: 8px;
`;

const titleInput = css`
  width: 100%;
  padding: 12px 16px;
  font-size: 18px;
  font-weight: 500;
  background: var(--gray900);
  border: 1px solid var(--gray700);
  border-radius: 8px;
  color: var(--white);
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
  
  &::placeholder {
    color: var(--gray600);
  }
`;

const contentTextarea = css`
  width: 100%;
  min-height: 400px;
  padding: 16px;
  font-size: 16px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  background: var(--gray900);
  border: 1px solid var(--gray700);
  border-radius: 8px;
  color: var(--white);
  resize: vertical;
  line-height: 1.6;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
  
  &::placeholder {
    color: var(--gray600);
  }
`;

const excerptTextarea = css`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  font-size: 14px;
  background: var(--gray900);
  border: 1px solid var(--gray700);
  border-radius: 8px;
  color: var(--white);
  resize: vertical;
  line-height: 1.5;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
  
  &::placeholder {
    color: var(--gray600);
  }
`;

const selectInput = css`
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  background: var(--gray900);
  border: 1px solid var(--gray700);
  border-radius: 8px;
  color: var(--white);
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const radioGroup = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const radioLabel = css`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--white);
  cursor: pointer;
  
  &:hover {
    color: var(--primary);
  }
`;

const radioInput = css`
  width: 16px;
  height: 16px;
  accent-color: var(--primary);
  cursor: pointer;
`;

const statusRow = css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 14px;
  color: var(--gray300);
  border-bottom: 1px solid var(--gray700);
  
  &:last-child {
    border-bottom: none;
  }
`;

const statusIcon = css`
  font-size: 16px;
`;

const statusLabel = css`
  color: var(--gray400);
`;

const statusValue = css`
  font-weight: 500;
  color: var(--white);
`;

const editLink = css`
  color: var(--primary);
  font-size: 12px;
  cursor: pointer;
  margin-left: auto;
  
  &:hover {
    text-decoration: underline;
  }
`;

const publishActions = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--gray700);
  margin-top: 12px;
`;

const trashLink = css`
  color: #ef4444;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const previewTitle = css`
  font-size: 14px;
  font-weight: 500;
  color: var(--gray400);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const previewContent = css`
  background: var(--gray900);
  border-radius: 8px;
  padding: 24px;
  min-height: 200px;
  color: var(--white);
  line-height: 1.8;
  
  h1 {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 16px;
    color: var(--white);
  }
  
  p {
    margin-bottom: 16px;
    white-space: pre-wrap;
  }
`;

const loading = css`
  text-align: center;
  padding: 40px;
  color: var(--gray500);
  font-size: 18px;
`;

const error = css`
  background: #991b1b;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const success = css`
  background: #166534;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const mobilePreviewToggle = css`
  display: none;
  
  @media (max-width: 1024px) {
    display: block;
  }
`;

const formatOptions = [
    { value: "standard", label: "Standard", icon: "📝" },
    { value: "aside", label: "Aside", icon: "📋" },
    { value: "image", label: "Image", icon: "🖼️" },
    { value: "video", label: "Video", icon: "🎬" },
    { value: "audio", label: "Audio", icon: "🎵" },
    { value: "quote", label: "Quote", icon: "💬" },
    { value: "link", label: "Link", icon: "🔗" },
    { value: "gallery", label: "Gallery", icon: "🖼️" },
];

export const AdminPostsEdit = () => {
    const params = useParams();
    const navigate = useNavigate();
    const isNewPost = () => params.id === "new";
    
    const [postTitle, setPostTitle] = createSignal("");
    const [content, setContent] = createSignal("");
    const [status, setStatus] = createSignal("draft");
    const [visibility, setVisibility] = createSignal("public");
    const [format, setFormat] = createSignal("standard");
    const [excerpt, setExcerpt] = createSignal("");
    const [publishAt, setPublishAt] = createSignal<string | null>(null);
    const [isLoading, setIsLoading] = createSignal(false);
    const [isSaving, setIsSaving] = createSignal(false);
    const [errorMsg, setErrorMsg] = createSignal<string | null>(null);
    const [successMsg, setSuccessMsg] = createSignal<string | null>(null);
    const [showMobilePreview, setShowMobilePreview] = createSignal(false);
    const [showPublishSection, setShowPublishSection] = createSignal(true);
    const [showFormatSection, setShowFormatSection] = createSignal(true);
    const [showExcerptSection, setShowExcerptSection] = createSignal(true);
    const [editingStatus, setEditingStatus] = createSignal(false);
    const [editingVisibility, setEditingVisibility] = createSignal(false);
    const [editingPublishAt, setEditingPublishAt] = createSignal(false);

    onMount(async () => {
        if (!isNewPost()) {
            await loadPost();
        }
    });

    const loadPost = async () => {
        try {
            setIsLoading(true);
            setErrorMsg(null);

            const id = Number.parseInt(params.id, 10);
            if (Number.isNaN(id)) {
                setErrorMsg("Invalid post ID");
                return;
            }

            const response = await api.getPostById(id);
            if (!response.ok) {
                if (response.status === 404) {
                    setErrorMsg("Post not found");
                    return;
                }
                throw new Error("Failed to load post");
            }

            const post: PostInfo = await response.json();
            setPostTitle(post.title);
            setContent(post.content);
            setStatus(post.status || "draft");
            setVisibility(post.visibility || "public");
            setFormat(post.format || "standard");
            setExcerpt(post.excerpt || "");
            setPublishAt(post.publish_at);
        } catch (err) {
            console.error("Error loading post:", err);
            setErrorMsg("Failed to load post");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        const titleValue = postTitle().trim();
        if (!titleValue) {
            setErrorMsg("Title is required");
            return;
        }

        try {
            setIsSaving(true);
            setErrorMsg(null);
            setSuccessMsg(null);

            const postInput: PostInput = {
                title: titleValue,
                content: content(),
                status: status(),
                visibility: visibility(),
                format: format(),
                excerpt: excerpt(),
                publish_at: publishAt(),
            };

            let response: Response;
            if (isNewPost()) {
                response = await api.createPost(postInput);
            } else {
                const id = Number.parseInt(params.id, 10);
                response = await api.updatePost(id, postInput);
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to save post");
            }

            const savedPost: PostInfo = await response.json();
            setSuccessMsg(isNewPost() ? "Post created successfully!" : "Post saved successfully!");
            
            // If it was a new post, navigate to the edit page
            if (isNewPost()) {
                navigate(`/_/admin/posts/${savedPost.id}`, { replace: true });
            }
        } catch (err) {
            console.error("Error saving post:", err);
            setErrorMsg(err instanceof Error ? err.message : "Failed to save post");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveDraft = async () => {
        setStatus("draft");
        await handleSave();
    };

    const handlePublish = async () => {
        setStatus("published");
        await handleSave();
    };

    const handleCancel = () => {
        navigate("/_/admin/posts");
    };

    const toggleMobilePreview = () => {
        setShowMobilePreview(!showMobilePreview());
    };

    const getStatusDisplay = () => {
        return status() === "published" ? "Published" : "Draft";
    };

    const getVisibilityDisplay = () => {
        switch (visibility()) {
            case "private": return "Private";
            case "password": return "Password Protected";
            default: return "Public";
        }
    };

    const getPublishAtDisplay = () => {
        if (!publishAt()) return "Immediately";
        try {
            const date = new Date(publishAt()!);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "Immediately";
        }
    };

    return (
        <div class={layout}>
            <main class={mainContent}>
                <Show when={errorMsg()}>
                    <div class={error}>{errorMsg()}</div>
                </Show>

                <Show when={successMsg()}>
                    <div class={success}>{successMsg()}</div>
                </Show>

                <div class={header}>
                    <h1 class={title}>
                        {isNewPost() ? "Add New Post" : "Edit Post"}
                    </h1>
                    <div class={headerButtons}>
                        <div class={mobilePreviewToggle}>
                            <button
                                class={`${button} ${previewButton}`}
                                classList={{ active: showMobilePreview() }}
                                onClick={toggleMobilePreview}
                            >
                                👁️ {showMobilePreview() ? "Edit" : "Preview"}
                            </button>
                        </div>
                        <button
                            class={`${button} ${cancelButton}`}
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                <Show when={isLoading()}>
                    <div class={loading}>Loading post...</div>
                </Show>

                <Show when={!isLoading()}>
                    <div class={contentContainer}>
                        <div class={editorColumn}>
                            <div class={editorPane}>
                                <div class={inputGroup}>
                                    <label class={label} for="post-title">Title</label>
                                    <input
                                        id="post-title"
                                        type="text"
                                        class={titleInput}
                                        placeholder="Enter title here..."
                                        value={postTitle()}
                                        onInput={(e) => setPostTitle(e.currentTarget.value)}
                                    />
                                </div>
                                <div class={inputGroup}>
                                    <label class={label} for="post-content">Content</label>
                                    <textarea
                                        id="post-content"
                                        class={contentTextarea}
                                        placeholder="Write your post content here..."
                                        value={content()}
                                        onInput={(e) => setContent(e.currentTarget.value)}
                                    />
                                </div>
                            </div>
                            
                            <div class={previewPane}>
                                <div class={previewTitle}>Preview</div>
                                <div class={previewContent}>
                                    <Show when={postTitle()} fallback={<h1 style="color: var(--gray600)">Post title...</h1>}>
                                        <h1>{postTitle()}</h1>
                                    </Show>
                                    <Show when={content()} fallback={<p style="color: var(--gray600)">Your content will appear here...</p>}>
                                        <p>{content()}</p>
                                    </Show>
                                </div>
                            </div>
                        </div>
                        
                        <div class={sidebarColumn}>
                            {/* Publish Section */}
                            <div class={sidebarSection}>
                                <div 
                                    class={sectionHeader}
                                    onClick={() => setShowPublishSection(!showPublishSection())}
                                >
                                    <span>Publish</span>
                                    <span>{showPublishSection() ? "▲" : "▼"}</span>
                                </div>
                                <Show when={showPublishSection()}>
                                    <div class={sectionContent}>
                                        {/* Status row */}
                                        <div class={statusRow}>
                                            <span class={statusIcon}>📋</span>
                                            <span class={statusLabel}>Status:</span>
                                            <Show when={!editingStatus()}>
                                                <span class={statusValue}>{getStatusDisplay()}</span>
                                                <span class={editLink} onClick={() => setEditingStatus(true)}>Edit</span>
                                            </Show>
                                            <Show when={editingStatus()}>
                                                <select 
                                                    class={selectInput}
                                                    value={status()}
                                                    onChange={(e) => {
                                                        setStatus(e.currentTarget.value);
                                                        setEditingStatus(false);
                                                    }}
                                                >
                                                    <option value="draft">Draft</option>
                                                    <option value="published">Published</option>
                                                </select>
                                            </Show>
                                        </div>
                                        
                                        {/* Visibility row */}
                                        <div class={statusRow}>
                                            <span class={statusIcon}>👁️</span>
                                            <span class={statusLabel}>Visibility:</span>
                                            <Show when={!editingVisibility()}>
                                                <span class={statusValue}>{getVisibilityDisplay()}</span>
                                                <span class={editLink} onClick={() => setEditingVisibility(true)}>Edit</span>
                                            </Show>
                                            <Show when={editingVisibility()}>
                                                <select 
                                                    class={selectInput}
                                                    value={visibility()}
                                                    onChange={(e) => {
                                                        setVisibility(e.currentTarget.value);
                                                        setEditingVisibility(false);
                                                    }}
                                                >
                                                    <option value="public">Public</option>
                                                    <option value="private">Private</option>
                                                    <option value="password">Password Protected</option>
                                                </select>
                                            </Show>
                                        </div>
                                        
                                        {/* Publish timing row */}
                                        <div class={statusRow}>
                                            <span class={statusIcon}>📅</span>
                                            <span class={statusLabel}>Publish:</span>
                                            <Show when={!editingPublishAt()}>
                                                <span class={statusValue}>{getPublishAtDisplay()}</span>
                                                <span class={editLink} onClick={() => setEditingPublishAt(true)}>Edit</span>
                                            </Show>
                                            <Show when={editingPublishAt()}>
                                                <input
                                                    type="datetime-local"
                                                    class={selectInput}
                                                    value={publishAt() ? publishAt()!.slice(0, 16) : ""}
                                                    onChange={(e) => {
                                                        const value = e.currentTarget.value;
                                                        if (value) {
                                                            setPublishAt(new Date(value).toISOString());
                                                        } else {
                                                            setPublishAt(null);
                                                        }
                                                        setEditingPublishAt(false);
                                                    }}
                                                />
                                            </Show>
                                        </div>

                                        <div class={publishActions}>
                                            <span class={trashLink} onClick={handleCancel}>
                                                Move to Trash
                                            </span>
                                            <div style="display: flex; gap: 8px;">
                                                <button
                                                    class={`${button} ${cancelButton}`}
                                                    onClick={handleSaveDraft}
                                                    disabled={isSaving()}
                                                    style="padding: 8px 16px; font-size: 14px;"
                                                >
                                                    Save Draft
                                                </button>
                                                <button
                                                    class={`${button} ${saveButton}`}
                                                    onClick={handlePublish}
                                                    disabled={isSaving()}
                                                    style="padding: 8px 16px; font-size: 14px;"
                                                >
                                                    {isSaving() ? "Saving..." : "Publish"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Show>
                            </div>

                            {/* Format Section */}
                            <div class={sidebarSection}>
                                <div 
                                    class={sectionHeader}
                                    onClick={() => setShowFormatSection(!showFormatSection())}
                                >
                                    <span>Format</span>
                                    <span>{showFormatSection() ? "▲" : "▼"}</span>
                                </div>
                                <Show when={showFormatSection()}>
                                    <div class={sectionContent}>
                                        <div class={radioGroup}>
                                            <For each={formatOptions}>
                                                {(option) => (
                                                    <label class={radioLabel}>
                                                        <input
                                                            type="radio"
                                                            class={radioInput}
                                                            name="post-format"
                                                            value={option.value}
                                                            checked={format() === option.value}
                                                            onChange={() => setFormat(option.value)}
                                                        />
                                                        <span>{option.icon}</span>
                                                        <span>{option.label}</span>
                                                    </label>
                                                )}
                                            </For>
                                        </div>
                                    </div>
                                </Show>
                            </div>

                            {/* Excerpt Section */}
                            <div class={sidebarSection}>
                                <div 
                                    class={sectionHeader}
                                    onClick={() => setShowExcerptSection(!showExcerptSection())}
                                >
                                    <span>Excerpt</span>
                                    <span>{showExcerptSection() ? "▲" : "▼"}</span>
                                </div>
                                <Show when={showExcerptSection()}>
                                    <div class={sectionContent}>
                                        <textarea
                                            class={excerptTextarea}
                                            placeholder="Write a short excerpt or summary..."
                                            value={excerpt()}
                                            onInput={(e) => setExcerpt(e.currentTarget.value)}
                                        />
                                        <p style="font-size: 12px; color: var(--gray500); margin-top: 8px;">
                                            Excerpts are optional hand-crafted summaries of your content.
                                        </p>
                                    </div>
                                </Show>
                            </div>
                        </div>
                    </div>
                </Show>
            </main>
        </div>
    );
};
