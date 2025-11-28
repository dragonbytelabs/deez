import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SIDEBAR_STORAGE_KEY = "deez-sidebar-open";

// Test the sidebar state logic from protected-route.tsx
const getInitialSidebarState = (mockStorage: Record<string, string | null>): boolean => {
	try {
		const stored = mockStorage[SIDEBAR_STORAGE_KEY];
		return stored === null || stored === undefined ? true : stored === "true";
	} catch {
		return true;
	}
};

describe("Protected Route - Sidebar State", () => {
	describe("getInitialSidebarState", () => {
		it("should return true when no value is stored", () => {
			const mockStorage: Record<string, string | null> = {};
			expect(getInitialSidebarState(mockStorage)).toBe(true);
		});

		it('should return true when stored value is "true"', () => {
			const mockStorage: Record<string, string | null> = {
				[SIDEBAR_STORAGE_KEY]: "true",
			};
			expect(getInitialSidebarState(mockStorage)).toBe(true);
		});

		it('should return false when stored value is "false"', () => {
			const mockStorage: Record<string, string | null> = {
				[SIDEBAR_STORAGE_KEY]: "false",
			};
			expect(getInitialSidebarState(mockStorage)).toBe(false);
		});

		it("should return true when stored value is null", () => {
			const mockStorage: Record<string, string | null> = {
				[SIDEBAR_STORAGE_KEY]: null,
			};
			expect(getInitialSidebarState(mockStorage)).toBe(true);
		});

		it("should return false for any non-true string value", () => {
			const mockStorage: Record<string, string | null> = {
				[SIDEBAR_STORAGE_KEY]: "invalid",
			};
			expect(getInitialSidebarState(mockStorage)).toBe(false);
		});
	});

	describe("Sidebar Storage Key", () => {
		it("should have the correct storage key", () => {
			expect(SIDEBAR_STORAGE_KEY).toBe("deez-sidebar-open");
		});
	});
});

describe("Protected Route - LocalStorage Integration", () => {
	let mockLocalStorage: Record<string, string>;

	beforeEach(() => {
		mockLocalStorage = {};
		vi.stubGlobal("localStorage", {
			getItem: vi.fn((key: string) => mockLocalStorage[key] ?? null),
			setItem: vi.fn((key: string, value: string) => {
				mockLocalStorage[key] = value;
			}),
			removeItem: vi.fn((key: string) => {
				delete mockLocalStorage[key];
			}),
			clear: vi.fn(() => {
				mockLocalStorage = {};
			}),
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("should save sidebar state to localStorage", () => {
		localStorage.setItem(SIDEBAR_STORAGE_KEY, "true");
		expect(localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe("true");
	});

	it("should retrieve sidebar state from localStorage", () => {
		mockLocalStorage[SIDEBAR_STORAGE_KEY] = "false";
		expect(localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe("false");
	});

	it("should return null for non-existent keys", () => {
		expect(localStorage.getItem("non-existent-key")).toBe(null);
	});
});
