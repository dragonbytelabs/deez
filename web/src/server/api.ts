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
	info: "/api/info",
	health: "/api/health",
};

const getInfoFunc = () => {
	return fetch(routes.info, {
		method: methods.GET,
	}).then((res) => res.json());
}

const getHealthFunc = () => {
	return fetch(routes.health, {
		method: methods.GET,
	}).then((res) => res.json());
}

type ApiRoutes = {
	getInfo: () => Promise<Response>;
	getHealth: () => Promise<Response>;
};

export const api: ApiRoutes = {
	getInfo: getInfoFunc,
	getHealth: getHealthFunc,
};
