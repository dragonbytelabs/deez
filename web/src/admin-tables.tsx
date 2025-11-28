import { css } from "@linaria/core";
import { createSignal, For, onMount, Show } from "solid-js";
import { api } from "./server/api";
import { ShowCollections } from "./components/admin-tables.show-collections";

const layout = css`
  display: flex;
  height: 100vh; 
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const mainContent = css`
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const header = css`
  margin-bottom: 30px;
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
`;

const dataSection = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 8px;
  padding: 20px;
  overflow-x: auto;
`;

const table = css`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid var(--gray700);
  }
  
  th {
    background: var(--gray700);
    color: var(--primary);
    font-weight: 600;
    position: sticky;
    top: 0;
  }
  
  td {
    color: var(--white);
  }
  
  tr:hover td {
    background: var(--gray700);
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

interface TableData {
    table: string;
    data: Record<string, any>[];
}

export const AdminTables = () => {
    const [collections, setCollections] = createSignal<string[]>([]);
    const [selectedCollection, setSelectedCollection] = createSignal<string | null>(null);
    const [tableData, setTableData] = createSignal<TableData | null>(null);
    const [isLoadingCollections, setIsLoadingCollections] = createSignal(true);
    const [isLoadingData, setIsLoadingData] = createSignal(false);
    const [errorMsg, setErrorMsg] = createSignal<string | null>(null);

    onMount(async () => {
        await loadCollections();
    });

    const loadCollections = async () => {
        try {
            setIsLoadingCollections(true);
            setErrorMsg(null);

            const response = await api.getCollections();
            if (!response.ok) {
                throw new Error("Failed to load collections");
            }

            const data = await response.json();
            setCollections(data.tables || []);
        } catch (err) {
            console.error("Error loading collections:", err);
            setErrorMsg("Failed to load database collections");
        } finally {
            setIsLoadingCollections(false);
        }
    };

    const handleSelectCollection = async (collectionName: string) => {
        try {
            setIsLoadingData(true);
            setErrorMsg(null);
            setSelectedCollection(collectionName);

            const response = await api.getCollectionByName(collectionName);

            if (!response.ok) {
                throw new Error("Failed to load collection data");
            }

            const data = await response.json();
            setTableData(data);
        } catch (err) {
            console.error("Error loading collection data:", err);
            setErrorMsg(`Failed to load data for collection: ${collectionName}`);
        } finally {
            setIsLoadingData(false);
        }
    };

    return (
        <div class={layout}>
            <ShowCollections
                collections={collections()}
                selectedCollection={selectedCollection()}
                isLoading={isLoadingCollections()}
                onSelectCollection={handleSelectCollection}
            />

            <main class={mainContent}>
                <Show when={errorMsg()}>
                    <div class={error}>{errorMsg()}</div>
                </Show>

                <Show when={!selectedCollection()}>
                    <div class={emptyState}>
                        <div class={emptyStateIcon}>📋</div>
                        <div class={emptyStateText}>Select a collection</div>
                        <div class={emptyStateSubtext}>
                            Choose a collection from the sidebar to view its data
                        </div>
                    </div>
                </Show>

                <Show when={selectedCollection() && tableData()}>
                    <div class={header}>
                        <h1 class={title}>{selectedCollection()}</h1>
                        <p class={subtitle}>
                            {tableData()?.data.length || 0} record(s)
                        </p>
                    </div>

                    <div class={dataSection}>
                        <Show when={isLoadingData()}>
                            <div class={loading}>Loading data...</div>
                        </Show>

                        <Show
                            when={
                                !isLoadingData() &&
                                tableData()?.data &&
                                tableData()!.data.length > 0
                            }
                        >
                            <table class={table}>
                                <thead>
                                    <tr>
                                        <For each={Object.keys(tableData()!.data[0])}>
                                            {(column) => <th>{column}</th>}
                                        </For>
                                    </tr>
                                </thead>
                                <tbody>
                                    <For each={tableData()!.data}>
                                        {(row) => (
                                            <tr>
                                                <For each={Object.values(row)}>
                                                    {(value) => (
                                                        <td>
                                                            {value === null
                                                                ? "NULL"
                                                                : typeof value === "object"
                                                                    ? JSON.stringify(value)
                                                                    : String(value)}
                                                        </td>
                                                    )}
                                                </For>
                                            </tr>
                                        )}
                                    </For>
                                </tbody>
                            </table>
                        </Show>

                        <Show
                            when={
                                !isLoadingData() &&
                                tableData()?.data &&
                                tableData()!.data.length === 0
                            }
                        >
                            <div class={loading}>No data in this collection</div>
                        </Show>
                    </div>
                </Show>
            </main>
        </div>
    );
};