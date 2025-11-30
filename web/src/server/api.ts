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
	themes: "/api/themes",
	plugins: "/api/plugins",
	pluginsActive: "/api/plugins/active",
	dzforms: "/api/dzforms/forms",
	publicAuthSettings: "/api/admin/settings/public-auth",
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

export type ThemeItem = {
	name: string;
	path: string;
	active: boolean;
};

export type PluginInfo = {
	id: number;
	name: string;
	display_name: string;
	description?: string;
	version: string;
	is_active: boolean;
	sidebar_icon?: string;
	sidebar_title?: string;
	sidebar_link?: string;
	created_at: string;
	updated_at?: string;
};

export type FormInfo = {
	id: number;
	name: string;
	description?: string;
	fields: string;
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

const getThemesFunc = async () => {
	const response = await fetch(routes.themes, {
		credentials: "include",
	});
	return response;
};

const activateThemeFunc = async (themeName: string) => {
	const r = await fetch(`${routes.themes}/${themeName}/activate`, {
		method: methods.POST,
		credentials: "include",
	});
	return r;
};

const deactivateThemeFunc = async () => {
	const r = await fetch(`${routes.themes}/deactivate`, {
		method: methods.POST,
		credentials: "include",
	});
	return r;
};

const getPluginsFunc = async () => {
	const response = await fetch(routes.plugins, {
		credentials: "include",
	});
	return response;
};

const getActivePluginsFunc = async () => {
	const response = await fetch(routes.pluginsActive, {
		credentials: "include",
	});
	return response;
};

const getPluginByNameFunc = async (name: string) => {
	const response = await fetch(`${routes.plugins}/${name}`, {
		credentials: "include",
	});
	return response;
};

const updatePluginStatusFunc = async (name: string, isActive: boolean) => {
	const body = JSON.stringify({ is_active: isActive });
	const r = await fetch(`${routes.plugins}/${name}/status`, {
		method: methods.PUT,
		headers: {
			"Content-Type": "application/json",
		},
		body,
		credentials: "include",
	});
	return r;
};

const checkPluginUpdatesFunc = async (name: string) => {
	const response = await fetch(`${routes.plugins}/${name}/check-updates`, {
		credentials: "include",
	});
	return response;
};

// DZForms plugin functions
const getFormsFunc = async () => {
	const response = await fetch(routes.dzforms, {
		credentials: "include",
	});
	return response;
};

const getFormByIdFunc = async (id: number) => {
	const response = await fetch(`${routes.dzforms}/${id}`, {
		credentials: "include",
	});
	return response;
};

const createFormFunc = async (name: string, description: string, fields: string) => {
	const body = JSON.stringify({ name, description, fields });
	const r = await fetch(routes.dzforms, {
		method: methods.POST,
		headers: {
			"Content-Type": "application/json",
		},
		body,
		credentials: "include",
	});
	return r;
};

const updateFormFunc = async (id: number, name: string, description: string, fields: string) => {
	const body = JSON.stringify({ name, description, fields });
	const r = await fetch(`${routes.dzforms}/${id}`, {
		method: methods.PUT,
		headers: {
			"Content-Type": "application/json",
		},
		body,
		credentials: "include",
	});
	return r;
};

// Public auth settings functions
const getPublicAuthSettingsFunc = async () => {
	const response = await fetch(routes.publicAuthSettings, {
		credentials: "include",
	});
	return response;
};

const updatePublicAuthSettingsFunc = async (loginEnabled?: boolean, registerEnabled?: boolean) => {
	const body: { public_login_enabled?: boolean; public_register_enabled?: boolean } = {};
	if (loginEnabled !== undefined) {
		body.public_login_enabled = loginEnabled;
	}
	if (registerEnabled !== undefined) {
		body.public_register_enabled = registerEnabled;
	}
	const r = await fetch(routes.publicAuthSettings, {
		method: methods.PUT,
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
		credentials: "include",
	});
	return r;
};

export type PublicAuthSettings = {
	public_login_enabled: boolean;
	public_register_enabled: boolean;
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
	getThemes: () => Promise<Response>;
	activateTheme: (themeName: string) => Promise<Response>;
	deactivateTheme: () => Promise<Response>;
	// Plugin functions
	getPlugins: () => Promise<Response>;
	getActivePlugins: () => Promise<Response>;
	getPluginByName: (name: string) => Promise<Response>;
	updatePluginStatus: (name: string, isActive: boolean) => Promise<Response>;
	checkPluginUpdates: (name: string) => Promise<Response>;
	// DZForms plugin functions
	getForms: () => Promise<Response>;
	getFormById: (id: number) => Promise<Response>;
	createForm: (name: string, description: string, fields: string) => Promise<Response>;
	updateForm: (id: number, name: string, description: string, fields: string) => Promise<Response>;
	// Public auth settings functions
	getPublicAuthSettings: () => Promise<Response>;
	updatePublicAuthSettings: (loginEnabled?: boolean, registerEnabled?: boolean) => Promise<Response>;
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
	getThemes: getThemesFunc,
	activateTheme: activateThemeFunc,
	deactivateTheme: deactivateThemeFunc,
	// Plugin functions
	getPlugins: getPluginsFunc,
	getActivePlugins: getActivePluginsFunc,
	getPluginByName: getPluginByNameFunc,
	updatePluginStatus: updatePluginStatusFunc,
	checkPluginUpdates: checkPluginUpdatesFunc,
	// DZForms plugin functions
	getForms: getFormsFunc,
	getFormById: getFormByIdFunc,
	createForm: createFormFunc,
	updateForm: updateFormFunc,
	// Public auth settings functions
	getPublicAuthSettings: getPublicAuthSettingsFunc,
	updatePublicAuthSettings: updatePublicAuthSettingsFunc,
};
