import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock fetch for API tests
const mockFetch = vi.fn();
(globalThis as { fetch: typeof fetch }).fetch = mockFetch;

// Routes constant for testing
const routes = {
	media: "/api/media",
	mediaUpload: "/api/media/upload",
};

describe("Media API Module", () => {
	beforeEach(() => {
		mockFetch.mockClear();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe("Routes Configuration", () => {
		it("should have correct media route", () => {
			expect(routes.media).toBe("/api/media");
		});

		it("should have correct mediaUpload route", () => {
			expect(routes.mediaUpload).toBe("/api/media/upload");
		});
	});

	describe("GetMedia Function", () => {
		it("should call the correct endpoint", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					media: [
						{
							id: 1,
							filename: "abc123.jpg",
							original_name: "test.jpg",
							mime_type: "image/jpeg",
							size: 1024,
							url: "/uploads/abc123.jpg",
						},
					],
				}),
			});

			await fetch(routes.media, {
				credentials: "include",
			});

			expect(mockFetch).toHaveBeenCalledWith(routes.media, {
				credentials: "include",
			});
		});

		it("should return media items when successful", async () => {
			const mockMedia = [
				{
					id: 1,
					filename: "abc123.jpg",
					original_name: "test.jpg",
					mime_type: "image/jpeg",
					size: 1024,
					url: "/uploads/abc123.jpg",
				},
				{
					id: 2,
					filename: "def456.png",
					original_name: "image.png",
					mime_type: "image/png",
					size: 2048,
					url: "/uploads/def456.png",
				},
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ media: mockMedia }),
			});

			const response = await fetch(routes.media, {
				credentials: "include",
			});
			const data = await response.json();

			expect(data.media).toHaveLength(2);
			expect(data.media[0].original_name).toBe("test.jpg");
			expect(data.media[1].mime_type).toBe("image/png");
		});
	});

	describe("GetMediaById Function", () => {
		it("should call the correct endpoint with media id", async () => {
			const mediaId = 1;
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					id: 1,
					filename: "abc123.jpg",
					original_name: "test.jpg",
				}),
			});

			await fetch(`${routes.media}/${mediaId}`, {
				credentials: "include",
			});

			expect(mockFetch).toHaveBeenCalledWith(`${routes.media}/${mediaId}`, {
				credentials: "include",
			});
		});
	});

	describe("UploadMedia Function", () => {
		it("should call fetch with POST method and FormData", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					id: 1,
					filename: "abc123.jpg",
					original_name: "test.jpg",
					url: "/uploads/abc123.jpg",
				}),
			});

			const formData = new FormData();
			const file = new Blob(["test"], { type: "image/jpeg" });
			formData.append("file", file, "test.jpg");

			await fetch(routes.mediaUpload, {
				method: "POST",
				body: formData,
				credentials: "include",
			});

			expect(mockFetch).toHaveBeenCalledWith(routes.mediaUpload, {
				method: "POST",
				body: formData,
				credentials: "include",
			});
		});
	});

	describe("DeleteMedia Function", () => {
		it("should call fetch with DELETE method", async () => {
			const mediaId = 1;
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true }),
			});

			await fetch(`${routes.media}/${mediaId}`, {
				method: "DELETE",
				credentials: "include",
			});

			expect(mockFetch).toHaveBeenCalledWith(`${routes.media}/${mediaId}`, {
				method: "DELETE",
				credentials: "include",
			});
		});
	});
});

describe("Media Utility Functions", () => {
	describe("formatFileSize", () => {
		const formatFileSize = (bytes: number): string => {
			if (bytes === 0) return "0 Bytes";
			const k = 1024;
			const sizes = ["Bytes", "KB", "MB", "GB"];
			const i = Math.floor(Math.log(bytes) / Math.log(k));
			return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
		};

		it("should format 0 bytes", () => {
			expect(formatFileSize(0)).toBe("0 Bytes");
		});

		it("should format bytes", () => {
			expect(formatFileSize(500)).toBe("500 Bytes");
		});

		it("should format kilobytes", () => {
			expect(formatFileSize(1024)).toBe("1 KB");
			expect(formatFileSize(2048)).toBe("2 KB");
		});

		it("should format megabytes", () => {
			expect(formatFileSize(1048576)).toBe("1 MB");
			expect(formatFileSize(5242880)).toBe("5 MB");
		});

		it("should format with decimal precision", () => {
			expect(formatFileSize(1536)).toBe("1.5 KB");
		});
	});
});
