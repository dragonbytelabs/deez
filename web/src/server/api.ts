type Route = {
	[key: string]: string;
};

type Method = "GET" | "POST" | "PUT";
const MethodGET: Method = "GET";
const MethodPOST: Method = "POST";
const MethodPUT: Method = "PUT";

const methods = {
	GET: MethodGET,
	POST: MethodPOST,
	PUT: MethodPUT,
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
};

export type UserInfo = {
	email: string;
	avatar_url: string;
	user_id: string;
	display_name: string;
};

type MeFuncData = {
	authenticated: boolean;
	user?: UserInfo;
};

const meFunc = async (): Promise<{ authenticated: boolean; user?: UserInfo }> => {
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
	console.log("API updateEmail called with body:", body);
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

type ApiRoutes = {
	login: (email: string, password: string) => Promise<Response>;
	register: (
		email: string,
		password: string,
		confirmPassword: string,
	) => Promise<Response>;
	logout: () => Promise<Response>;
	me: () => Promise<{ authenticated: boolean; user?: UserInfo }>;
	getCollections: () => Promise<Response>;
	getCollectionByName: (tableName: string) => Promise<Response>;
	updateAvatar: (avatarUrl: string) => Promise<Response>;
	updateEmail: (email: string) => Promise<Response>;
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
};
