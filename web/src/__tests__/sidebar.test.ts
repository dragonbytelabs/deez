import { describe, expect, it } from "vitest";

// Test the getInitials function logic (legacy)
const getInitials = (email: string): string => {
	const parts = email.split("@")[0];
	if (parts.length >= 2) {
		return parts.substring(0, 2).toUpperCase();
	}
	return parts.toUpperCase();
};

// Test the getDisplayName function logic (legacy)
const getDisplayName = (email: string): string => {
	return email.split("@")[0];
};

// Test the getInitial function logic for teams
const getInitial = (name: string): string => {
	if (!name) return "?";
	return name.charAt(0).toUpperCase();
};

// DragonByteForms submenu items configuration (same as in sidebar.tsx)
const dzformsSubmenu = [
	{ title: "Forms", link: "", isHeader: true },
	{ title: "New Form", link: "/_/admin/plugins/dzforms/new" },
	{ title: "Entries", link: "/_/admin/plugins/dzforms/entries" },
	{ title: "Settings", link: "/_/admin/plugins/dzforms/settings" },
	{ title: "Import/Export", link: "/_/admin/plugins/dzforms/import-export" },
	{ title: "Add-Ons", link: "/_/admin/plugins/dzforms/addons" },
	{ title: "System Status", link: "/_/admin/plugins/dzforms/status" },
	{ title: "Help", link: "/_/admin/plugins/dzforms/help" },
];

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

	describe("getInitial (for teams)", () => {
		it("should return the first character in uppercase", () => {
			expect(getInitial("Team Alpha")).toBe("T");
		});

		it("should return ? for empty string", () => {
			expect(getInitial("")).toBe("?");
		});

		it("should handle single character team names", () => {
			expect(getInitial("A")).toBe("A");
		});

		it("should handle lowercase team names", () => {
			expect(getInitial("cab5476")).toBe("C");
		});
	});

	describe("DragonByteForms Submenu", () => {
		it("should have 8 submenu items", () => {
			expect(dzformsSubmenu).toHaveLength(8);
		});

		it("should have Forms as first item with isHeader true", () => {
			expect(dzformsSubmenu[0].title).toBe("Forms");
			expect(dzformsSubmenu[0].isHeader).toBe(true);
		});

		it("should have New Form as second item", () => {
			expect(dzformsSubmenu[1].title).toBe("New Form");
			expect(dzformsSubmenu[1].link).toBe("/_/admin/plugins/dzforms/new");
		});

		it("should have all required menu items", () => {
			const titles = dzformsSubmenu.map(item => item.title);
			expect(titles).toContain("Forms");
			expect(titles).toContain("New Form");
			expect(titles).toContain("Entries");
			expect(titles).toContain("Settings");
			expect(titles).toContain("Import/Export");
			expect(titles).toContain("Add-Ons");
			expect(titles).toContain("System Status");
			expect(titles).toContain("Help");
		});

		it("should have valid links for all non-header items", () => {
			const nonHeaderItems = dzformsSubmenu.filter(item => !item.isHeader);
			for (const item of nonHeaderItems) {
				expect(item.link).toMatch(/^\/_\/admin\/plugins\/dzforms\//);
			}
		});
	});
});
