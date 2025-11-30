import { css } from "@linaria/core";
import { createSignal, For, onMount, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { api, type FormInfo } from "./server/api";

const mainContent = css`
  padding: 40px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const title = css`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--white);
`;

const subtitle = css`
  font-size: 18px;
  color: var(--gray500);
  margin-bottom: 30px;
`;

const tableContainer = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  overflow: hidden;
`;

const table = css`
  width: 100%;
  border-collapse: collapse;
`;

const tableHeader = css`
  background: var(--gray700);
`;

const tableHeaderCell = css`
  padding: 16px 20px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: var(--gray300);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const tableRow = css`
  border-bottom: 1px solid var(--gray700);
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--gray700);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const tableCell = css`
  padding: 16px 20px;
  color: var(--white);
  font-size: 14px;
`;

const tableCellId = css`
  padding: 16px 20px;
  color: var(--gray400);
  font-size: 14px;
  width: 80px;
`;

const tableCellDescription = css`
  padding: 16px 20px;
  color: var(--gray400);
  font-size: 14px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const tableCellDate = css`
  padding: 16px 20px;
  color: var(--gray500);
  font-size: 14px;
  width: 180px;
`;

const loadingText = css`
  color: var(--gray500);
  font-size: 16px;
  padding: 40px;
  text-align: center;
`;

const errorText = css`
  color: #ef4444;
  font-size: 16px;
  padding: 40px;
  text-align: center;
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
  color: var(--gray400);
`;

const emptyStateSubtext = css`
  font-size: 14px;
  color: var(--gray600);
  margin-bottom: 20px;
`;

const createButton = css`
  padding: 12px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--primaryDark);
  }
`;

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const AdminDZFormsForms = () => {
  const navigate = useNavigate();
  const [forms, setForms] = createSignal<FormInfo[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  const fetchForms = async () => {
    try {
      const response = await api.getForms();
      if (response.ok) {
        const data = await response.json();
        setForms(data.forms || []);
      } else {
        setError("Failed to fetch forms");
      }
    } catch (err) {
      setError("Failed to fetch forms");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (formId: number) => {
    navigate(`/_/admin/plugins/dzforms/edit/${formId}`);
  };

  onMount(() => {
    fetchForms();
  });

  return (
    <main class={mainContent}>
      <h1 class={title}>Forms</h1>
      <p class={subtitle}>View and manage your forms</p>

      <Show when={loading()}>
        <div class={tableContainer}>
          <p class={loadingText}>Loading forms...</p>
        </div>
      </Show>

      <Show when={error()}>
        <div class={tableContainer}>
          <p class={errorText}>{error()}</p>
        </div>
      </Show>

      <Show when={!loading() && !error()}>
        <Show when={forms().length === 0}>
          <div class={tableContainer}>
            <div class={emptyState}>
              <div class={emptyStateIcon}>📋</div>
              <div class={emptyStateText}>No forms yet</div>
              <div class={emptyStateSubtext}>
                Create your first form to get started
              </div>
              <button
                class={createButton}
                onClick={() => navigate("/_/admin/plugins/dzforms/new")}
              >
                Create Form
              </button>
            </div>
          </div>
        </Show>

        <Show when={forms().length > 0}>
          <div class={tableContainer}>
            <table class={table}>
              <thead class={tableHeader}>
                <tr>
                  <th class={tableHeaderCell}>ID</th>
                  <th class={tableHeaderCell}>Name</th>
                  <th class={tableHeaderCell}>Description</th>
                  <th class={tableHeaderCell}>Created</th>
                </tr>
              </thead>
              <tbody>
                <For each={forms()}>
                  {(form) => (
                    <tr
                      class={tableRow}
                      onClick={() => handleRowClick(form.id)}
                    >
                      <td class={tableCellId}>{form.id}</td>
                      <td class={tableCell}>{form.name}</td>
                      <td class={tableCellDescription}>
                        {form.description || "No description"}
                      </td>
                      <td class={tableCellDate}>
                        {formatDate(form.created_at)}
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </Show>
      </Show>
    </main>
  );
};
