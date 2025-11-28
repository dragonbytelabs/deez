import { describe, expect, it } from "vitest";

describe("Root Layout", () => {
	it("should export a Layout component", async () => {
		const { Layout } = await import("../components/root-layout");
		expect(Layout).toBeDefined();
		expect(typeof Layout).toBe("function");
	});
});

describe("ShowCollections Component", () => {
	it("should export a ShowCollections component", async () => {
		const { ShowCollections } = await import("../components/admin-tables.show-collections");
		expect(ShowCollections).toBeDefined();
		expect(typeof ShowCollections).toBe("function");
	});
});

describe("CreateCollection Component", () => {
	it("should export a CreateCollection component", async () => {
		const { CreateCollection } = await import("../components/admin-tables.create-collection");
		expect(CreateCollection).toBeDefined();
		expect(typeof CreateCollection).toBe("function");
	});
});

describe("CreateCollectionModal Component", () => {
	it("should export a CreateCollectionModal component", async () => {
		const { CreateCollectionModal } = await import(
			"../components/admin-tables.create-collection.modal"
		);
		expect(CreateCollectionModal).toBeDefined();
		expect(typeof CreateCollectionModal).toBe("function");
	});
});

describe("AvatarPicker Component", () => {
	it("should export an AvatarPicker component", async () => {
		const { AvatarPicker } = await import("../components/user-profile-avatar-picker");
		expect(AvatarPicker).toBeDefined();
		expect(typeof AvatarPicker).toBe("function");
	});
});
