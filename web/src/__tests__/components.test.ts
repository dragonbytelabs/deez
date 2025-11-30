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

describe("AdminOnboarding Component", () => {
	it("should export an AdminOnboarding component", async () => {
		const { AdminOnboarding } = await import("../admin-onboarding");
		expect(AdminOnboarding).toBeDefined();
		expect(typeof AdminOnboarding).toBe("function");
	});
});

describe("AdminPlugins Component", () => {
	it("should export an AdminPlugins component", async () => {
		const { AdminPlugins } = await import("../admin-plugins");
		expect(AdminPlugins).toBeDefined();
		expect(typeof AdminPlugins).toBe("function");
	});
});

describe("AdminDZFormsForms Component", () => {
	it("should export an AdminDZFormsForms component", async () => {
		const { AdminDZFormsForms } = await import("../admin-dzforms-forms");
		expect(AdminDZFormsForms).toBeDefined();
		expect(typeof AdminDZFormsForms).toBe("function");
	});
});

describe("AdminDZFormsEdit Component", () => {
	it("should export an AdminDZFormsEdit component", async () => {
		const { AdminDZFormsEdit } = await import("../admin-dzforms-edit");
		expect(AdminDZFormsEdit).toBeDefined();
		expect(typeof AdminDZFormsEdit).toBe("function");
	});
});
