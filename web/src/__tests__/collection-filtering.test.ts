import { describe, expect, it } from "vitest";

// Test the collection filtering logic from admin-tables.show-collections.tsx
const filterCollections = (collections: string[], searchTerm: string): string[] => {
	const term = searchTerm.toLowerCase();
	if (!term) return collections;
	return collections.filter((name) => name.toLowerCase().includes(term));
};

describe("Collection Filtering", () => {
	const testCollections = ["users", "posts", "comments", "Products", "user_sessions"];

	describe("filterCollections", () => {
		it("should return all collections when search term is empty", () => {
			expect(filterCollections(testCollections, "")).toEqual(testCollections);
		});

		it("should filter collections by partial match", () => {
			expect(filterCollections(testCollections, "user")).toEqual([
				"users",
				"user_sessions",
			]);
		});

		it("should be case insensitive", () => {
			expect(filterCollections(testCollections, "USER")).toEqual([
				"users",
				"user_sessions",
			]);
			expect(filterCollections(testCollections, "products")).toEqual(["Products"]);
		});

		it("should return empty array when no matches found", () => {
			expect(filterCollections(testCollections, "nonexistent")).toEqual([]);
		});

		it("should match collections containing the search term anywhere", () => {
			expect(filterCollections(testCollections, "ost")).toEqual(["posts"]);
		});

		it("should handle special characters in search term", () => {
			expect(filterCollections(testCollections, "_")).toEqual(["user_sessions"]);
		});

		it("should handle empty collections array", () => {
			expect(filterCollections([], "test")).toEqual([]);
		});
	});
});
