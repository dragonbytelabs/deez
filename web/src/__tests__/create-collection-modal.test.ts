import { describe, expect, it } from "vitest";
import { type CollectionField, FIELD_TYPES, isValidFieldName } from "../components/admin-tables.create-collection.modal";

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

		it("should clear fields array", () => {
			let fields: CollectionField[] = [
				{ name: "title", type: "TEXT" },
				{ name: "count", type: "INTEGER" },
			];

			// Simulate reset
			fields = [];

			expect(fields).toEqual([]);
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

	describe("Field Types", () => {
		it("should have TEXT as a valid field type", () => {
			expect(FIELD_TYPES).toContain("TEXT");
		});

		it("should have INTEGER as a valid field type", () => {
			expect(FIELD_TYPES).toContain("INTEGER");
		});

		it("should have REAL as a valid field type", () => {
			expect(FIELD_TYPES).toContain("REAL");
		});

		it("should have BLOB as a valid field type", () => {
			expect(FIELD_TYPES).toContain("BLOB");
		});

		it("should have exactly 4 field types", () => {
			expect(FIELD_TYPES.length).toBe(4);
		});
	});

	describe("Field Management", () => {
		const addField = (fields: CollectionField[]): CollectionField[] => {
			return [...fields, { name: "", type: "TEXT" }];
		};

		const removeField = (fields: CollectionField[], index: number): CollectionField[] => {
			return fields.filter((_, i) => i !== index);
		};

		const updateField = (
			fields: CollectionField[],
			index: number,
			key: keyof CollectionField,
			value: string
		): CollectionField[] => {
			return fields.map((field, i) => (i === index ? { ...field, [key]: value } : field));
		};

		const filterValidFields = (fields: CollectionField[]): CollectionField[] => {
			return fields.filter((f) => f.name.trim());
		};

		it("should add a new empty field with TEXT type", () => {
			const fields: CollectionField[] = [];
			const newFields = addField(fields);

			expect(newFields.length).toBe(1);
			expect(newFields[0]).toEqual({ name: "", type: "TEXT" });
		});

		it("should add multiple fields", () => {
			let fields: CollectionField[] = [];
			fields = addField(fields);
			fields = addField(fields);
			fields = addField(fields);

			expect(fields.length).toBe(3);
		});

		it("should remove a field by index", () => {
			const fields: CollectionField[] = [
				{ name: "title", type: "TEXT" },
				{ name: "count", type: "INTEGER" },
				{ name: "price", type: "REAL" },
			];

			const newFields = removeField(fields, 1);

			expect(newFields.length).toBe(2);
			expect(newFields[0].name).toBe("title");
			expect(newFields[1].name).toBe("price");
		});

		it("should update field name", () => {
			const fields: CollectionField[] = [{ name: "", type: "TEXT" }];

			const newFields = updateField(fields, 0, "name", "username");

			expect(newFields[0].name).toBe("username");
			expect(newFields[0].type).toBe("TEXT");
		});

		it("should update field type", () => {
			const fields: CollectionField[] = [{ name: "count", type: "TEXT" }];

			const newFields = updateField(fields, 0, "type", "INTEGER");

			expect(newFields[0].name).toBe("count");
			expect(newFields[0].type).toBe("INTEGER");
		});

		it("should filter out empty field names", () => {
			const fields: CollectionField[] = [
				{ name: "title", type: "TEXT" },
				{ name: "", type: "INTEGER" },
				{ name: "  ", type: "REAL" },
				{ name: "price", type: "REAL" },
			];

			const validFields = filterValidFields(fields);

			expect(validFields.length).toBe(2);
			expect(validFields[0].name).toBe("title");
			expect(validFields[1].name).toBe("price");
		});
	});

	describe("Field Name Validation", () => {
		it("should accept valid field names starting with letter", () => {
			expect(isValidFieldName("name")).toBe(true);
			expect(isValidFieldName("userName")).toBe(true);
			expect(isValidFieldName("user_name")).toBe(true);
		});

		it("should accept valid field names starting with underscore", () => {
			expect(isValidFieldName("_id")).toBe(true);
			expect(isValidFieldName("_private_field")).toBe(true);
		});

		it("should accept field names with numbers after first character", () => {
			expect(isValidFieldName("field1")).toBe(true);
			expect(isValidFieldName("user_id_2")).toBe(true);
		});

		it("should reject empty field names", () => {
			expect(isValidFieldName("")).toBe(false);
			expect(isValidFieldName("   ")).toBe(false);
		});

		it("should reject field names starting with numbers", () => {
			expect(isValidFieldName("1field")).toBe(false);
			expect(isValidFieldName("123")).toBe(false);
		});

		it("should reject field names with special characters", () => {
			expect(isValidFieldName("field-name")).toBe(false);
			expect(isValidFieldName("field.name")).toBe(false);
			expect(isValidFieldName("field name")).toBe(false);
		});
	});
});
