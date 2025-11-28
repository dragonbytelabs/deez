type Route = {
	[key: string]: string;
};

type Method = "GET" | "POST";
const MethodGET: Method = "GET";
const MethodPOST: Method = "POST";

const methods = {
	GET: MethodGET,
	POST: MethodPOST,
};

const routes: Route = {
	login: "/api/login",
	register: "/api/register",
	logout: "/api/logout",
	me: "/api/me",
	getCollections: "/api/admin/tables",
	getCollectionByName: "/api/admin/table",
};

type MeFuncData = {
	authenticated: boolean;
};

const meFunc = async () => {
	try {
		const response = await fetch(routes.me, {
			method: methods.GET,
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});
		const data: MeFuncData = await response.json();
		return data.authenticated;
	} catch (error) {
		console.error("Auth check failed:", error);
		return false;
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
	console.log("API register called with body:", body);
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

type ApiRoutes = {
	login: (email: string, password: string) => Promise<Response>;
	register: (
		email: string,
		password: string,
		confirmPassword: string,
	) => Promise<Response>;
	logout: () => Promise<Response>;
	me: () => Promise<boolean>;
	getCollections: () => Promise<Response>;
	getCollectionByName: (tableName: string) => Promise<Response>;
};

export const api: ApiRoutes = {
	login: loginFunc,
	register: registerFunc,
	logout: logoutFunc,
	me: meFunc,
	getCollections: getCollectionsFunc,
	getCollectionByName: getCollectionByNameFunc,
};
