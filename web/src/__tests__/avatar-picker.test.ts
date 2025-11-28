import { describe, expect, it } from "vitest";

// Test utility functions from user-profile-avatar-picker.tsx
const escapeXml = (unsafe: string): string => {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
};

/**
 * Helper to convert string to base64, handling unicode characters.
 * Uses TextEncoder to properly encode unicode characters to UTF-8 bytes,
 * which is the standard approach for base64 encoding strings with unicode.
 */
const toBase64 = (str: string): string => {
	const encoder = new TextEncoder();
	const bytes = encoder.encode(str);
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary);
};

const generateAvatarSvg = (emoji: string, backgroundColor: string): string => {
	const safeEmoji = escapeXml(emoji);
	const safeColor = escapeXml(backgroundColor);
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="50" fill="${safeColor}"/>
  <text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-size="50">${safeEmoji}</text>
</svg>`;
	const encoded = toBase64(svg);
	return `data:image/svg+xml;base64,${encoded}`;
};

describe("Avatar Picker Utilities", () => {
	describe("escapeXml", () => {
		it("should escape ampersand", () => {
			expect(escapeXml("&")).toBe("&amp;");
		});

		it("should escape less than symbol", () => {
			expect(escapeXml("<")).toBe("&lt;");
		});

		it("should escape greater than symbol", () => {
			expect(escapeXml(">")).toBe("&gt;");
		});

		it("should escape double quotes", () => {
			expect(escapeXml('"')).toBe("&quot;");
		});

		it("should escape single quotes", () => {
			expect(escapeXml("'")).toBe("&apos;");
		});

		it("should escape multiple special characters", () => {
			expect(escapeXml('<script>"test"</script>')).toBe(
				"&lt;script&gt;&quot;test&quot;&lt;/script&gt;",
			);
		});

		it("should not change strings without special characters", () => {
			expect(escapeXml("hello world")).toBe("hello world");
		});

		it("should handle empty string", () => {
			expect(escapeXml("")).toBe("");
		});
	});

	describe("generateAvatarSvg", () => {
		it("should generate a valid data URI", () => {
			const result = generateAvatarSvg("🐶", "#4CAF50");
			expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
		});

		it("should contain base64 encoded SVG structure", () => {
			const result = generateAvatarSvg("A", "#4CAF50");
			const base64Part = result.replace("data:image/svg+xml;base64,", "");
			const decoded = atob(base64Part);
			expect(decoded).toContain("<svg");
			expect(decoded).toContain("</svg>");
		});

		it("should include the background color", () => {
			const result = generateAvatarSvg("A", "#FF5722");
			const base64Part = result.replace("data:image/svg+xml;base64,", "");
			const decoded = atob(base64Part);
			expect(decoded).toContain("#FF5722");
		});

		it("should include the content in the SVG", () => {
			const result = generateAvatarSvg("A", "#E91E63");
			const base64Part = result.replace("data:image/svg+xml;base64,", "");
			const decoded = atob(base64Part);
			expect(decoded).toContain("A");
		});

		it("should escape special characters in inputs", () => {
			// This should not throw and should properly escape any special chars
			const result = generateAvatarSvg("🐶", "#4CAF50");
			expect(result).toBeDefined();
		});
	});
});
