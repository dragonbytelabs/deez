import { css } from "@linaria/core";
import { useNavigate } from "@solidjs/router";
import { createSignal, For, onMount, Show } from "solid-js";
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

const subtitle = css`
  font-size: 18px;
  color: var(--gray500);
  margin-top: 8px;
`;

const newPostButton = css`
  background: var(--primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
  
  &:hover {
    background: var(--primaryDark);
  }
`;

const postsTable = css`
  width: 100%;
  border-collapse: collapse;
  background: var(--gray800);
  border-radius: 12px;
  overflow: hidden;
  
  th, td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid var(--gray700);
  }
  
  th {
    background: var(--gray700);
    color: var(--gray400);
    font-weight: 500;
    font-size: 14px;
    text-transform: uppercase;
  }
  
  td {
    color: var(--white);
  }
  
  tr:hover td {
    background: var(--gray750, #2a2a2a);
  }
  
  tr:last-child td {
    border-bottom: none;
  }
`;

const postTitle = css`
  font-weight: 500;
  color: var(--primary);
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const postDate = css`
  color: var(--gray500);
  font-size: 14px;
`;

const actionButton = css`
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  margin-right: 8px;
`;

const editButton = css`
  background: var(--gray700);
  color: var(--white);
  
  &:hover {
    background: var(--gray600);
  }
`;

const deleteButton = css`
  background: #7f1d1d;
  color: white;
  
  &:hover {
    background: #991b1b;
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

const emptyState = css`
  text-align: center;
  padding: 60px 20px;
  color: var(--gray500);
`;

const emptyStateIcon = css`
  font-size: 48px;
  margin-bottom: 16px;
`;

const emptyStateText = css`
  font-size: 18px;
  margin-bottom: 8px;
`;

const emptyStateSubtext = css`
  font-size: 14px;
  color: var(--gray600);
`;

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function truncateContent(content: string, maxLength: number = 100): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
}

export const AdminPosts = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = createSignal<PostInfo[]>([]);
    const [isLoading, setIsLoading] = createSignal(true);
    const [errorMsg, setErrorMsg] = createSignal<string | null>(null);
    const [successMsg, setSuccessMsg] = createSignal<string | null>(null);

    onMount(async () => {
        await loadPosts();
    });

    const loadPosts = async () => {
        try {
            setIsLoading(true);
            setErrorMsg(null);

            const response = await api.getPosts();
            if (!response.ok) {
                throw new Error("Failed to load posts");
            }

            const data = await response.json();
            setPosts(data.posts || []);
        } catch (err) {
            console.error("Error loading posts:", err);
            setErrorMsg("Failed to load posts");
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewPost = () => {
        navigate("/_/admin/posts/new");
    };

    const handleEditPost = (id: number) => {
        navigate(`/_/admin/posts/${id}`);
    };

    const handleDelete = async (post: PostInfo) => {
        if (!confirm(`Are you sure you want to delete "${post.title}"?`)) {
            return;
        }

        try {
            setErrorMsg(null);
            setSuccessMsg(null);

            const response = await api.deletePost(post.id);
            if (!response.ok) {
                throw new Error("Failed to delete post");
            }

            setSuccessMsg("Post deleted successfully!");
            await loadPosts();
        } catch (err) {
            console.error("Error deleting post:", err);
            setErrorMsg("Failed to delete post");
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
                    <div>
                        <h1 class={title}>Posts</h1>
                        <p class={subtitle}>
                            {posts().length} post(s) total
                        </p>
                    </div>
                    <div>
                        <button
                            class={newPostButton}
                            onClick={handleNewPost}
                        >
                            ✏️ New Post
                        </button>
                    </div>
                </div>

                <Show when={isLoading()}>
                    <div class={loading}>Loading posts...</div>
                </Show>

                <Show when={!isLoading() && posts().length === 0}>
                    <div class={emptyState}>
                        <div class={emptyStateIcon}>📝</div>
                        <div class={emptyStateText}>No posts yet</div>
                        <div class={emptyStateSubtext}>
                            Create your first post to get started
                        </div>
                    </div>
                </Show>

                <Show when={!isLoading() && posts().length > 0}>
                    <table class={postsTable}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Preview</th>
                                <th>Created</th>
                                <th>Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <For each={posts()}>
                                {(post) => (
                                    <tr>
                                        <td>
                                            <span
                                                class={postTitle}
                                                onClick={() => handleEditPost(post.id)}
                                            >
                                                {post.title}
                                            </span>
                                        </td>
                                        <td>{truncateContent(post.content)}</td>
                                        <td class={postDate}>{formatDate(post.created_at)}</td>
                                        <td class={postDate}>{formatDate(post.updated_at)}</td>
                                        <td>
                                            <button
                                                class={`${actionButton} ${editButton}`}
                                                onClick={() => handleEditPost(post.id)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                class={`${actionButton} ${deleteButton}`}
                                                onClick={() => handleDelete(post)}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </For>
                        </tbody>
                    </table>
                </Show>
            </main>
        </div>
    );
};
