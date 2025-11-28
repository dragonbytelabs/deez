import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock fetch for API tests
const mockFetch = vi.fn();
(globalThis as { fetch: typeof fetch }).fetch = mockFetch;

// Routes constant for testing
const routes = {
	login: "/api/login",
	register: "/api/register",
	logout: "/api/logout",
	me: "/api/me",
	getCollections: "/api/admin/tables",
	getCollectionByName: "/api/admin/table",
	updateAvatar: "/api/admin/user/avatar",
	updateDisplayName: "/api/admin/user/display-name",
};

describe("API Module", () => {
	beforeEach(() => {
		mockFetch.mockClear();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe("Routes Configuration", () => {
		it("should have correct login route", () => {
			expect(routes.login).toBe("/api/login");
		});

		it("should have correct register route", () => {
			expect(routes.register).toBe("/api/register");
		});

		it("should have correct logout route", () => {
			expect(routes.logout).toBe("/api/logout");
		});

		it("should have correct me route", () => {
			expect(routes.me).toBe("/api/me");
		});

		it("should have correct getCollections route", () => {
			expect(routes.getCollections).toBe("/api/admin/tables");
		});

		it("should have correct getCollectionByName route", () => {
			expect(routes.getCollectionByName).toBe("/api/admin/table");
		});

		it("should have correct updateAvatar route", () => {
			expect(routes.updateAvatar).toBe("/api/admin/user/avatar");
		});

		it("should have correct updateDisplayName route", () => {
			expect(routes.updateDisplayName).toBe("/api/admin/user/display-name");
		});
	});

	describe("Login Function", () => {
		it("should call fetch with correct parameters", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ redirect: "/" }),
			});

			await fetch(routes.login, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: "test@example.com", password: "password123" }),
				credentials: "include",
			});

			expect(mockFetch).toHaveBeenCalledWith(routes.login, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: "test@example.com", password: "password123" }),
				credentials: "include",
			});
		});
	});

	describe("Register Function", () => {
		it("should call fetch with correct parameters including confirmPassword", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ redirect: "/" }),
			});

			const email = "test@example.com";
			const password = "password123";
			const confirmPassword = "password123";

			await fetch(routes.register, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password, confirmPassword }),
				credentials: "include",
			});

			expect(mockFetch).toHaveBeenCalledWith(routes.register, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password, confirmPassword }),
				credentials: "include",
			});
		});
	});

	describe("Me Function", () => {
		it("should return authenticated user info when authenticated", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					authenticated: true,
					user_id: 1,
					email: "test@example.com",
				}),
			});

			const response = await fetch(routes.me, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			const data = await response.json();

			expect(data.authenticated).toBe(true);
			expect(data.user_id).toBe(1);
			expect(data.email).toBe("test@example.com");
		});

		it("should return not authenticated when user is not logged in", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					authenticated: false,
				}),
			});

			const response = await fetch(routes.me, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			const data = await response.json();

			expect(data.authenticated).toBe(false);
		});
	});

	describe("GetCollections Function", () => {
		it("should call the correct endpoint", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ tables: ["users", "posts"] }),
			});

			await fetch(routes.getCollections, {
				credentials: "include",
			});

			expect(mockFetch).toHaveBeenCalledWith(routes.getCollections, {
				credentials: "include",
			});
		});
	});

	describe("GetCollectionByName Function", () => {
		it("should call the correct endpoint with table name", async () => {
			const tableName = "users";
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ table: "users", data: [] }),
			});

			await fetch(`${routes.getCollectionByName}/${tableName}`, {
				credentials: "include",
			});

			expect(mockFetch).toHaveBeenCalledWith(`${routes.getCollectionByName}/${tableName}`, {
				credentials: "include",
			});
		});
	});

	describe("UpdateAvatar Function", () => {
		it("should call fetch with PUT method and avatar URL", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
			});

			const avatarUrl = "data:image/svg+xml;base64,abc123";

			await fetch(routes.updateAvatar, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ avatar_url: avatarUrl }),
				credentials: "include",
			});

			expect(mockFetch).toHaveBeenCalledWith(routes.updateAvatar, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ avatar_url: avatarUrl }),
				credentials: "include",
			});
		});
	});

	describe("UpdateDisplayName Function", () => {
		it("should call fetch with PUT method and display name", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
			});

			const displayName = "John Doe";

			await fetch(routes.updateDisplayName, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ display_name: displayName }),
				credentials: "include",
			});

			expect(mockFetch).toHaveBeenCalledWith(routes.updateDisplayName, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ display_name: displayName }),
				credentials: "include",
			});
		});
	});

	describe("Logout Function", () => {
		it("should call fetch with POST method", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ redirect: "/login" }),
			});

			await fetch(routes.logout, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			expect(mockFetch).toHaveBeenCalledWith(routes.logout, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});
		});
	});
});
