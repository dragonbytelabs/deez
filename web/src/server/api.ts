type Method = "GET" | "POST" | "PUT" | "DELETE";

const routes = {
	info: "/api/info",
	health: "/api/health",
	files: "/api/files",
	file: "/api/file",
	createFolder: "/api/folder",
	createFile: "/api/file",
	tree: "/api/tree",
} as const;

const methods = {
	GET: "GET",
	POST: "POST",
	PUT: "PUT",
	DELETE: "DELETE",
} as const;

type RequestOptions<TBody = unknown> = {
	method?: Method;
	body?: TBody;
	headers?: Record<string, string>;
	query?: Record<string, string | number | boolean | undefined | null>;
};

function withQuery(url: string, query?: RequestOptions["query"]) {
	if (!query) return url;
	const u = new URL(url, window.location.origin);
	for (const [k, v] of Object.entries(query)) {
		if (v === undefined || v === null) continue;
		u.searchParams.set(k, String(v));
	}
	return u.pathname + u.search;
}

async function requestJSON<TResponse, TBody = unknown>(
	url: string,
	opts: RequestOptions<TBody> = {}
): Promise<TResponse> {
	const method = opts.method ?? methods.GET;
	const finalUrl = withQuery(url, opts.query);

	const headers: Record<string, string> = {
		...(opts.headers ?? {}),
	};

	let body: BodyInit | undefined;
	if (opts.body !== undefined) {
		headers["Content-Type"] ??= "application/json";
		body = JSON.stringify(opts.body);
	}

	const res = await fetch(finalUrl, { method, headers, body });

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`${method} ${finalUrl} -> ${res.status} ${res.statusText}\n${text}`);
	}
	if (res.status === 204) return undefined as unknown as TResponse;

	return (await res.json()) as TResponse;
}

export type Info = {
	version: string;
	app: string;
};

export type Health = {
	status: "ok" | "degraded" | "down";
	details?: Record<string, unknown>;
};

export type VaultFileInfo = { path: string; name: string; size: number; mtime: string };
export type ReadFileRes = { path: string; content: string; size: number; mtime: string; sha256: string };
export type WriteFileReq = { content: string; ifMatch?: string };
export type WriteFileRes = { path: string; size: number; mtime: string; sha256: string };
export type CreateFolderReq = { path: string };
export type CreateFileReq = { path: string; content: string };
export type Entry = {
  path: string;
  name: string;
  kind: "folder" | "file";
  mtime: string;
  size?: number;
};

export const api = {
	getInfo: () => requestJSON<Info>(routes.info),
	getHealth: () => requestJSON<Health>(routes.health),
	listFiles: () => requestJSON<VaultFileInfo[]>(routes.files),
	readFile: (path: string) => requestJSON<ReadFileRes>(routes.file, { method: "GET", query: { path } }),
	createFolder: (path: string) =>
		requestJSON<{ ok: true }, CreateFolderReq>(routes.createFolder, {
			method: "POST",
			body: { path },
		}),
	createFile: (path: string, content: string) =>
		requestJSON<WriteFileRes, CreateFileReq>(routes.createFile, {
			method: "POST",
			body: { path, content },
		}),
	writeFile: (path: string, body: WriteFileReq) =>
		requestJSON<WriteFileRes, WriteFileReq>(routes.file, { method: "PUT", query: { path }, body }),
    listTree: () => requestJSON<Entry[]>(routes.tree),
};