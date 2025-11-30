import { css } from "@linaria/core";
import { useNavigate, useParams } from "@solidjs/router";
import { createSignal, onMount, Show } from "solid-js";
import { api, type PostInfo } from "./server/api";

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

const editorContainer = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
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
  
  @media (max-width: 1024px) {
    display: none;
    
    &.visible {
      display: block;
    }
  }
`;

const inputGroup = css`
  margin-bottom: 20px;
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
  min-height: 400px;
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

export const AdminPostsEdit = () => {
    const params = useParams();
    const navigate = useNavigate();
    const isNewPost = () => params.id === "new";
    
    const [postTitle, setPostTitle] = createSignal("");
    const [content, setContent] = createSignal("");
    const [isLoading, setIsLoading] = createSignal(false);
    const [isSaving, setIsSaving] = createSignal(false);
    const [errorMsg, setErrorMsg] = createSignal<string | null>(null);
    const [successMsg, setSuccessMsg] = createSignal<string | null>(null);
    const [showMobilePreview, setShowMobilePreview] = createSignal(false);

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

            let response: Response;
            if (isNewPost()) {
                response = await api.createPost(titleValue, content());
            } else {
                const id = Number.parseInt(params.id, 10);
                response = await api.updatePost(id, titleValue, content());
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

    const handleCancel = () => {
        navigate("/_/admin/posts");
    };

    const toggleMobilePreview = () => {
        setShowMobilePreview(!showMobilePreview());
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
                        {isNewPost() ? "New Post" : "Edit Post"}
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
                        <button
                            class={`${button} ${saveButton}`}
                            onClick={handleSave}
                            disabled={isSaving()}
                        >
                            {isSaving() ? "Saving..." : (isNewPost() ? "Create Post" : "Save Changes")}
                        </button>
                    </div>
                </div>

                <Show when={isLoading()}>
                    <div class={loading}>Loading post...</div>
                </Show>

                <Show when={!isLoading()}>
                    <div class={editorContainer}>
                        <div class={editorPane}>
                            <div class={inputGroup}>
                                <label class={label} for="post-title">Title</label>
                                <input
                                    id="post-title"
                                    type="text"
                                    class={titleInput}
                                    placeholder="Enter post title..."
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
                        
                        <div class={previewPane} classList={{ visible: showMobilePreview() }}>
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
                </Show>
            </main>
        </div>
    );
};
