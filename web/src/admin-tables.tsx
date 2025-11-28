import { css } from "@linaria/core";
import { createSignal, For, onMount, Show } from "solid-js";

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

const tablesGrid = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const tableCard = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
  }
  
  &.active {
    border-color: var(--primary);
    background: var(--gray700);
  }
`;

const tableName = css`
  font-size: 18px;
  font-weight: 600;
  color: var(--white);
  margin-bottom: 8px;
`;

const tableInfo = css`
  font-size: 14px;
  color: var(--gray500);
`;

const dataSection = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 8px;
  padding: 20px;
  overflow-x: auto;
`;

const dataTitle = css`
  font-size: 24px;
  font-weight: bold;
  color: var(--white);
  margin-bottom: 20px;
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

interface TableInfo {
	name: string;
	rowCount?: number;
}

interface TableData {
	table: string;
	data: Record<string, any>[];
}

export const AdminTables = () => {
	const [tables, setTables] = createSignal<TableInfo[]>([]);
	const [selectedTable, setSelectedTable] = createSignal<string | null>(null);
	const [tableData, setTableData] = createSignal<TableData | null>(null);
	const [isLoading, setIsLoading] = createSignal(true);
	const [errorMsg, setErrorMsg] = createSignal<string | null>(null);

	onMount(async () => {
		await loadTables();
	});

	const loadTables = async () => {
		try {
			setIsLoading(true);
			setErrorMsg(null);

			const response = await fetch("/api/admin/tables", {
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to load tables");
			}

			const data = await response.json();
			setTables(data.tables.map((name: string) => ({ name })));
		} catch (err) {
			console.error("Error loading tables:", err);
			setErrorMsg("Failed to load database tables");
		} finally {
			setIsLoading(false);
		}
	};

	const loadTableData = async (tableName: string) => {
		try {
			setIsLoading(true);
			setErrorMsg(null);
			setSelectedTable(tableName);

			const response = await fetch(`/api/admin/table/${tableName}`, {
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to load table data");
			}

			const data = await response.json();
			setTableData(data);
		} catch (err) {
			console.error("Error loading table data:", err);
			setErrorMsg(`Failed to load data for table: ${tableName}`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<main class={mainContent}>
			<h1 class={title}>Database Admin</h1>
			<p class={subtitle}>View and manage database tables</p>

			<Show when={errorMsg()}>
				<div class={error}>{errorMsg()}</div>
			</Show>

			<Show when={isLoading() && tables().length === 0}>
				<div class={loading}>Loading tables...</div>
			</Show>

			<Show when={!isLoading() || tables().length > 0}>
				<div class={tablesGrid}>
					<For each={tables()}>
						{(table) => (
							<div
								class={`${tableCard} ${selectedTable() === table.name ? "active" : ""}`}
								onClick={() => loadTableData(table.name)}
							>
								<div class={tableName}>📋 {table.name}</div>
								<div class={tableInfo}>Click to view data</div>
							</div>
						)}
					</For>
				</div>
			</Show>

			<Show when={tableData()}>
				<div class={dataSection}>
					<div class={dataTitle}>{tableData()?.table}</div>

					<Show when={isLoading()}>
						<div class={loading}>Loading data...</div>
					</Show>

					<Show
						when={
							!isLoading() && tableData()?.data && tableData()!.data.length > 0
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
							!isLoading() &&
							tableData()?.data &&
							tableData()!.data.length === 0
						}
					>
						<div class={loading}>No data in this table</div>
					</Show>
				</div>
			</Show>
		</main>
	);
};
