import { describe, expect, it } from "vitest";

// Test the email validation logic used in login and register components
const isValidEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

describe("Email Validation", () => {
	describe("isValidEmail", () => {
		it("should return true for valid email addresses", () => {
			expect(isValidEmail("test@example.com")).toBe(true);
			expect(isValidEmail("user.name@domain.org")).toBe(true);
			expect(isValidEmail("user+tag@example.co.uk")).toBe(true);
		});

		it("should return false for emails without @ symbol", () => {
			expect(isValidEmail("testexample.com")).toBe(false);
		});

		it("should return false for emails without domain", () => {
			expect(isValidEmail("test@")).toBe(false);
		});

		it("should return false for emails without username", () => {
			expect(isValidEmail("@example.com")).toBe(false);
		});

		it("should return false for emails without TLD", () => {
			expect(isValidEmail("test@example")).toBe(false);
		});

		it("should return false for emails with spaces", () => {
			expect(isValidEmail("test @example.com")).toBe(false);
			expect(isValidEmail("test@ example.com")).toBe(false);
			expect(isValidEmail(" test@example.com")).toBe(false);
		});

		it("should return false for empty string", () => {
			expect(isValidEmail("")).toBe(false);
		});

		it("should return false for multiple @ symbols", () => {
			expect(isValidEmail("test@@example.com")).toBe(false);
			expect(isValidEmail("te@st@example.com")).toBe(false);
		});
	});
});
