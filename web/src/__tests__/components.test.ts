import { describe, expect, it } from "vitest";

describe("Home Component", () => {
	it("should export a Home component", async () => {
		const { Home } = await import("../Home");
		expect(Home).toBeDefined();
		expect(typeof Home).toBe("function");
	});
});

describe("Admin Component", () => {
	it("should export an Admin component", async () => {
		const { Admin } = await import("../admin");
		expect(Admin).toBeDefined();
		expect(typeof Admin).toBe("function");
	});
});

describe("AdminSettings Component", () => {
	it("should export an AdminSettings component", async () => {
		const { AdminSettings } = await import("../admin-settings");
		expect(AdminSettings).toBeDefined();
		expect(typeof AdminSettings).toBe("function");
	});
});

describe("Login Component", () => {
	it("should export a Login component", async () => {
		const { Login } = await import("../Login");
		expect(Login).toBeDefined();
		expect(typeof Login).toBe("function");
	});
});

describe("Register Component", () => {
	it("should export a Register component", async () => {
		const { Register } = await import("../Register");
		expect(Register).toBeDefined();
		expect(typeof Register).toBe("function");
	});
});
