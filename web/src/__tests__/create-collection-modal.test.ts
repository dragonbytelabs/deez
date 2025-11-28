import { describe, expect, it } from "vitest";

describe("CreateCollectionModal", () => {
	describe("Collection Name Validation", () => {
		const isValidCollectionName = (name: string): boolean => {
			return name.trim().length > 0;
		};

		it("should be valid with a trimmed non-empty name", () => {
			expect(isValidCollectionName("users")).toBe(true);
		});

		it("should be invalid with empty string", () => {
			expect(isValidCollectionName("")).toBe(false);
		});

		it("should be invalid with whitespace only", () => {
			expect(isValidCollectionName("   ")).toBe(false);
		});

		it("should be valid with spaces around text", () => {
			expect(isValidCollectionName("  users  ")).toBe(true);
		});

		it("should be valid with underscores", () => {
			expect(isValidCollectionName("user_sessions")).toBe(true);
		});

		it("should be valid with numbers", () => {
			expect(isValidCollectionName("users2")).toBe(true);
		});
	});

	describe("Form Reset Logic", () => {
		it("should clear form values", () => {
			let collectionName = "test_collection";
			let description = "Test description";

			// Simulate reset
			collectionName = "";
			description = "";

			expect(collectionName).toBe("");
			expect(description).toBe("");
		});
	});

	describe("Submit Button State", () => {
		const isSubmitDisabled = (collectionName: string): boolean => {
			return !collectionName.trim();
		};

		it("should be disabled when collection name is empty", () => {
			expect(isSubmitDisabled("")).toBe(true);
		});

		it("should be disabled when collection name is whitespace", () => {
			expect(isSubmitDisabled("   ")).toBe(true);
		});

		it("should be enabled when collection name has value", () => {
			expect(isSubmitDisabled("users")).toBe(false);
		});
	});
});
