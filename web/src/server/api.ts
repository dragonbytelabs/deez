type Route = {
	[key: string]: string;
};

type Method = "GET" | "POST" | "PUT" | "DELETE";
const MethodGET: Method = "GET";
const MethodPOST: Method = "POST";
const MethodPUT: Method = "PUT";
const MethodDELETE: Method = "DELETE";

const methods = {
	GET: MethodGET,
	POST: MethodPOST,
	PUT: MethodPUT,
	DELETE: MethodDELETE,
};

const routes: Route = {
	login: "/api/login",
	register: "/api/register",
	logout: "/api/logout",
	me: "/api/me",
	getCollections: "/api/admin/tables",
	getCollectionByName: "/api/admin/table",
	updateAvatar: "/api/admin/user/avatar",
	updateEmail: "/api/admin/user/email",
	media: "/api/media",
	mediaUpload: "/api/media/upload",
	updateDisplayName: "/api/admin/user/display-name",
};

export type UserInfo = {
	email: string;
	avatar_url: string;
	user_id: string;
	display_name: string;
};

export type TeamInfo = {
	id: number;
	name: string;
	description?: string;
	avatar_url?: string;
};

export type MediaItem = {
	id: number;
	user_id: number;
	filename: string;
	original_name: string;
	mime_type: string;
	size: number;
	storage_type: string;
	storage_path: string;
	url: string;
	created_at: string;
	updated_at?: string;
};

type MeFuncData = {
	authenticated: boolean;
	user?: UserInfo;
	teams?: TeamInfo[];
};

const meFunc = async (): Promise<{ authenticated: boolean; user?: UserInfo; teams?: TeamInfo[] }> => {
	try {
		const response = await fetch(routes.me, {
			method: methods.GET,
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});
		const data: MeFuncData = await response.json();
		console.log("meFunc response data:", data);
		if (data.authenticated) {
			return {
				authenticated: true,
				user: data.user,
				teams: data.teams,
			};
		}
		return { authenticated: false };
	} catch (error) {
		console.error("Auth check failed:", error);
		return { authenticated: false };
	}
};

const getCollectionsFunc = async () => {
	const response = await fetch(routes.getCollections, {
		credentials: "include",
	});
	return response;
};

const getCollectionByNameFunc = async (tableName: string) => {
	const response = await fetch(`${routes.getCollectionByName}/${tableName}`, {
		credentials: "include",
	});
	return response;
};

const loginFunc = async (email: string, password: string) => {
	const body = JSON.stringify({ email, password });
	console.log("API login called with body:", body);
	const r = await fetch(routes.login, {
		method: methods.POST,
		headers: {
			"Content-Type": "application/json",
		},
		body,
		credentials: "include",
	});
	return r;
};

const registerFunc = async (
	email: string,
	password: string,
	confirmPassword: string,
) => {
	const body = JSON.stringify({ email, password, confirmPassword });
	const r = await fetch(routes.register, {
		method: methods.POST,
		headers: {
			"Content-Type": "application/json",
		},
		body,
		credentials: "include",
	});
	return r;
};

const logoutFunc = async () => {
	const r = await fetch(routes.logout, {
		method: methods.POST,
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});
	return r;
};

const updateAvatarFunc = async (avatarUrl: string) => {
	const body = JSON.stringify({ avatar_url: avatarUrl });
	console.log("API updateAvatar called with body:", body);
	const r = await fetch(routes.updateAvatar, {
		method: methods.PUT,
		headers: {
			"Content-Type": "application/json",
		},
		body,
		credentials: "include",
	});
	return r;
};

const updateEmailFunc = async (email: string) => {
	const body = JSON.stringify({ email });
	const r = await fetch(routes.updateEmail, {
		method: methods.PUT,
		headers: {
			"Content-Type": "application/json",
		},
		body,
		credentials: "include",
	});
	return r;
};

const getMediaFunc = async () => {
	const response = await fetch(routes.media, {
		credentials: "include",
	});
	return response;
};

const getMediaByIdFunc = async (id: number) => {
	const response = await fetch(`${routes.media}/${id}`, {
		credentials: "include",
	});
	return response;
};

const uploadMediaFunc = async (file: File) => {
	const formData = new FormData();
	formData.append("file", file);
	const r = await fetch(routes.mediaUpload, {
		method: methods.POST,
		body: formData,
		credentials: "include",
	});
	return r;
};

const deleteMediaFunc = async (id: number) => {
	const r = await fetch(`${routes.media}/${id}`, {
		method: methods.DELETE,
		credentials: "include",
	});
	return r;
};

const updateDisplayNameFunc = async (displayName: string) => {
	const body = JSON.stringify({ display_name: displayName });
	console.log("API updateDisplayName called with body:", body);
	const r = await fetch(routes.updateDisplayName, {
		method: methods.PUT,
		headers: {
			"Content-Type": "application/json",
		},
		body,
		credentials: "include",
	});
	return r;
};

type ApiRoutes = {
	login: (email: string, password: string) => Promise<Response>;
	register: (
		email: string,
		password: string,
		confirmPassword: string,
	) => Promise<Response>;
	logout: () => Promise<Response>;
	me: () => Promise<{ authenticated: boolean; user?: UserInfo; teams?: TeamInfo[] }>;
	getCollections: () => Promise<Response>;
	getCollectionByName: (tableName: string) => Promise<Response>;
	updateAvatar: (avatarUrl: string) => Promise<Response>;
	updateEmail: (email: string) => Promise<Response>;
	getMedia: () => Promise<Response>;
	getMediaById: (id: number) => Promise<Response>;
	uploadMedia: (file: File) => Promise<Response>;
	deleteMedia: (id: number) => Promise<Response>;
	updateDisplayName: (displayName: string) => Promise<Response>;
};

export const api: ApiRoutes = {
	login: loginFunc,
	register: registerFunc,
	logout: logoutFunc,
	me: meFunc,
	getCollections: getCollectionsFunc,
	getCollectionByName: getCollectionByNameFunc,
	updateAvatar: updateAvatarFunc,
	updateEmail: updateEmailFunc,
	getMedia: getMediaFunc,
	getMediaById: getMediaByIdFunc,
	uploadMedia: uploadMediaFunc,
	deleteMedia: deleteMediaFunc,
	updateDisplayName: updateDisplayNameFunc,
};
