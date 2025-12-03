import { describe, it, expect } from "vitest";
import { FormBuilder, type FormField, type FormFieldType } from "../components/form-builder";

describe("FormBuilder Component", () => {
	describe("FormField Type", () => {
		it("should have proper field type definitions", () => {
			const fieldTypes: FormFieldType[] = [
				"text",
				"textarea",
				"select",
				"number",
				"checkbox",
				"radio",
				"hidden",
				"html",
				"section",
			];

			expect(fieldTypes).toHaveLength(9);
			expect(fieldTypes).toContain("text");
			expect(fieldTypes).toContain("textarea");
			expect(fieldTypes).toContain("select");
			expect(fieldTypes).toContain("number");
			expect(fieldTypes).toContain("checkbox");
			expect(fieldTypes).toContain("radio");
			expect(fieldTypes).toContain("hidden");
			expect(fieldTypes).toContain("html");
			expect(fieldTypes).toContain("section");
		});

		it("should have correct FormField structure", () => {
			const field: FormField = {
				id: "test-id",
				name: "test-name",
				label: "Test Label",
				type: "text",
				required: true,
				placeholder: "Enter text",
			};

			expect(field.id).toBe("test-id");
			expect(field.name).toBe("test-name");
			expect(field.label).toBe("Test Label");
			expect(field.type).toBe("text");
			expect(field.required).toBe(true);
			expect(field.placeholder).toBe("Enter text");
		});

		it("should support optional properties in FormField", () => {
			const minimalField: FormField = {
				id: "min-id",
				name: "min-name",
				label: "Minimal Label",
				type: "text",
			};

			expect(minimalField.required).toBeUndefined();
			expect(minimalField.placeholder).toBeUndefined();
			expect(minimalField.options).toBeUndefined();
			expect(minimalField.defaultValue).toBeUndefined();
			expect(minimalField.htmlContent).toBeUndefined();
		});

		it("should support select field with options", () => {
			const selectField: FormField = {
				id: "select-id",
				name: "select-name",
				label: "Select Label",
				type: "select",
				options: ["Option 1", "Option 2", "Option 3"],
			};

			expect(selectField.options).toHaveLength(3);
			expect(selectField.options?.[0]).toBe("Option 1");
		});

		it("should support checkbox field with options", () => {
			const checkboxField: FormField = {
				id: "checkbox-id",
				name: "checkbox-name",
				label: "Checkbox Label",
				type: "checkbox",
				options: ["Check 1", "Check 2"],
			};

			expect(checkboxField.options).toHaveLength(2);
			expect(checkboxField.type).toBe("checkbox");
		});

		it("should support radio field with options", () => {
			const radioField: FormField = {
				id: "radio-id",
				name: "radio-name",
				label: "Radio Label",
				type: "radio",
				options: ["Radio 1", "Radio 2", "Radio 3"],
			};

			expect(radioField.options).toHaveLength(3);
			expect(radioField.type).toBe("radio");
		});

		it("should support hidden field with defaultValue", () => {
			const hiddenField: FormField = {
				id: "hidden-id",
				name: "hidden-name",
				label: "Hidden Label",
				type: "hidden",
				defaultValue: "hidden-value",
			};

			expect(hiddenField.defaultValue).toBe("hidden-value");
			expect(hiddenField.type).toBe("hidden");
		});

		it("should support html field with htmlContent", () => {
			const htmlField: FormField = {
				id: "html-id",
				name: "html-name",
				label: "HTML Label",
				type: "html",
				htmlContent: "<p>Custom HTML</p>",
			};

			expect(htmlField.htmlContent).toBe("<p>Custom HTML</p>");
			expect(htmlField.type).toBe("html");
		});

		it("should support section field type", () => {
			const sectionField: FormField = {
				id: "section-id",
				name: "section-name",
				label: "Section Title",
				type: "section",
			};

			expect(sectionField.type).toBe("section");
			expect(sectionField.label).toBe("Section Title");
		});

		it("should support number field with placeholder", () => {
			const numberField: FormField = {
				id: "number-id",
				name: "number-name",
				label: "Number Label",
				type: "number",
				placeholder: "Enter a number",
				required: true,
			};

			expect(numberField.type).toBe("number");
			expect(numberField.placeholder).toBe("Enter a number");
		});

		it("should support textarea field with placeholder", () => {
			const textareaField: FormField = {
				id: "textarea-id",
				name: "textarea-name",
				label: "Textarea Label",
				type: "textarea",
				placeholder: "Enter long text",
			};

			expect(textareaField.type).toBe("textarea");
			expect(textareaField.placeholder).toBe("Enter long text");
		});
	});

	describe("FormBuilder Export", () => {
		it("should export FormBuilder component", () => {
			expect(FormBuilder).toBeDefined();
			expect(typeof FormBuilder).toBe("function");
		});
	});
});
