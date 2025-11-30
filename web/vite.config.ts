import wyw from "@wyw-in-js/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig(() => ({
	plugins: [
		solid(),
		wyw({
			include: ["**/*.{ts,tsx}"],
			babelOptions: {
				presets: ["@babel/preset-typescript"],
			},
		}),
	],
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:3000", // Replace with your backend server's address
			},
			"/_/preview": {
				target: "http://localhost:3000",
			},
		},
	},
	test: {
		environment: "jsdom",
		globals: true,
		transformMode: {
			web: [/\.[jt]sx?$/],
		},
		server: {
			deps: {
				inline: [/@solidjs\/router/],
			},
		},
		deps: {
			optimizer: {
				web: {
					include: ["solid-js", "@solidjs/router"],
				},
			},
		},
	},
}));
