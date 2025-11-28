import { describe, expect, it } from "vitest";

describe("DzContext Exports", () => {
	it("should export DzProvider", async () => {
		const { DzProvider } = await import("../dz-context");
		expect(DzProvider).toBeDefined();
		expect(typeof DzProvider).toBe("function");
	});

	it("should export useDz", async () => {
		const { useDz } = await import("../dz-context");
		expect(useDz).toBeDefined();
		expect(typeof useDz).toBe("function");
	});
});
