import { describe, expect, it } from "vitest";
import { generateEmbedCode } from "../components/embed-modal";

describe("EmbedModal", () => {
	describe("generateEmbedCode", () => {
		it("should generate embed code with the correct form ID", () => {
			const formId = 123;
			const code = generateEmbedCode(formId);

			expect(code).toContain(`/embed/form/${formId}.js`);
			expect(code).toContain(`id="dz-form-${formId}"`);
		});

		it("should include script tag with async attribute", () => {
			const code = generateEmbedCode(1);

			expect(code).toContain("<script");
			expect(code).toContain("async");
			expect(code).toContain("</script>");
		});

		it("should include div container with correct ID", () => {
			const formId = 42;
			const code = generateEmbedCode(formId);

			expect(code).toContain("<div");
			expect(code).toContain(`id="dz-form-${formId}"`);
			expect(code).toContain("</div>");
		});

		it("should handle form ID of 0", () => {
			const code = generateEmbedCode(0);

			expect(code).toContain("/embed/form/0.js");
			expect(code).toContain('id="dz-form-0"');
		});

		it("should generate code with src attribute pointing to embed endpoint", () => {
			const formId = 5;
			const code = generateEmbedCode(formId);

			expect(code).toMatch(/src="[^"]*\/embed\/form\/5\.js"/);
		});

		it("should return a string containing both script and div elements", () => {
			const code = generateEmbedCode(10);
			const lines = code.split("\n");

			expect(lines.length).toBe(2);
			expect(lines[0]).toContain("<script");
			expect(lines[1]).toContain("<div");
		});
	});

	describe("Embed Code Format", () => {
		it("should have proper HTML structure", () => {
			const code = generateEmbedCode(1);

			// Should have script tag with closing tag
			expect(code).toContain("<script");
			expect(code).toContain("</script>");

			// Should have div tag with closing tag
			expect(code).toContain("<div");
			expect(code).toContain("</div>");
		});

		it("should use self-closing div format or empty div", () => {
			const code = generateEmbedCode(1);

			// The div should be empty or self-closing
			expect(code).toMatch(/<div[^>]*><\/div>/);
		});
	});
});
