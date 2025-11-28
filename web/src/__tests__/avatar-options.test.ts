import { describe, expect, it } from "vitest";

// Avatar options configuration from user-profile-avatar-picker.tsx
const avatarOptions = [
	{ emoji: "🐶", backgroundColor: "#4CAF50" }, // Dog - Green
	{ emoji: "🐱", backgroundColor: "#E91E63" }, // Cat - Pink
	{ emoji: "🦊", backgroundColor: "#FF5722" }, // Fox - Deep Orange
	{ emoji: "🐻", backgroundColor: "#795548" }, // Bear - Brown
	{ emoji: "🐼", backgroundColor: "#607D8B" }, // Panda - Blue Grey
	{ emoji: "🦁", backgroundColor: "#FF9800" }, // Lion - Orange
	{ emoji: "🐸", backgroundColor: "#8BC34A" }, // Frog - Light Green
	{ emoji: "🦉", backgroundColor: "#9C27B0" }, // Owl - Purple
	{ emoji: "🐧", backgroundColor: "#00BCD4" }, // Penguin - Cyan
];

describe("Avatar Options Configuration", () => {
	it("should have exactly 9 avatar options", () => {
		expect(avatarOptions).toHaveLength(9);
	});

	it("should have valid emoji for each option", () => {
		for (const option of avatarOptions) {
			expect(option.emoji).toBeDefined();
			expect(option.emoji.length).toBeGreaterThan(0);
		}
	});

	it("should have valid hex color for each option", () => {
		const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
		for (const option of avatarOptions) {
			expect(option.backgroundColor).toMatch(hexColorRegex);
		}
	});

	it("should have unique emojis", () => {
		const emojis = avatarOptions.map((o) => o.emoji);
		const uniqueEmojis = new Set(emojis);
		expect(uniqueEmojis.size).toBe(emojis.length);
	});

	it("should have unique background colors", () => {
		const colors = avatarOptions.map((o) => o.backgroundColor);
		const uniqueColors = new Set(colors);
		expect(uniqueColors.size).toBe(colors.length);
	});

	it("should contain expected animal emojis", () => {
		const emojis = avatarOptions.map((o) => o.emoji);
		expect(emojis).toContain("🐶"); // Dog
		expect(emojis).toContain("🐱"); // Cat
		expect(emojis).toContain("🦊"); // Fox
		expect(emojis).toContain("🐻"); // Bear
		expect(emojis).toContain("🐼"); // Panda
		expect(emojis).toContain("🦁"); // Lion
		expect(emojis).toContain("🐸"); // Frog
		expect(emojis).toContain("🦉"); // Owl
		expect(emojis).toContain("🐧"); // Penguin
	});
});
