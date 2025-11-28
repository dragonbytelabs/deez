import { describe, expect, it } from "vitest";

// Test the getInitials function logic
const getInitials = (email: string): string => {
	const parts = email.split("@")[0];
	if (parts.length >= 2) {
		return parts.substring(0, 2).toUpperCase();
	}
	return parts.toUpperCase();
};

// Test the getDisplayName function logic
const getDisplayName = (email: string): string => {
	return email.split("@")[0];
};

describe("Sidebar Utilities", () => {
	describe("getInitials", () => {
		it("should return first two characters of email username in uppercase", () => {
			expect(getInitials("john.doe@example.com")).toBe("JO");
		});

		it("should return the single character in uppercase if username is one character", () => {
			expect(getInitials("a@example.com")).toBe("A");
		});

		it("should handle short usernames", () => {
			expect(getInitials("ab@example.com")).toBe("AB");
		});

		it("should handle usernames with numbers", () => {
			expect(getInitials("user123@example.com")).toBe("US");
		});

		it("should handle usernames with special characters", () => {
			expect(getInitials("user_name@example.com")).toBe("US");
		});
	});

	describe("getDisplayName", () => {
		it("should return the username part of the email", () => {
			expect(getDisplayName("john.doe@example.com")).toBe("john.doe");
		});

		it("should handle emails with simple usernames", () => {
			expect(getDisplayName("admin@example.com")).toBe("admin");
		});

		it("should handle emails with numbers in username", () => {
			expect(getDisplayName("user123@example.com")).toBe("user123");
		});

		it("should handle emails with special characters in username", () => {
			expect(getDisplayName("user_name@example.com")).toBe("user_name");
		});
	});
});
