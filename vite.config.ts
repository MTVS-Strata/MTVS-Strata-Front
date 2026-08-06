import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { type Connect, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import {svelteTesting} from '@testing-library/svelte/vite'

function unityWebGLHeaders(): Plugin {
	const middleware: Connect.NextHandleFunction = (req, res, next) => {
		const pathname = (req as { url?: string }).url?.split('?', 1)[0] ?? '';

		if (pathname.startsWith('/unity/Build/')) {
			if (pathname.endsWith('.br')) {
				res.setHeader('Content-Encoding', 'br');
			} else if (pathname.endsWith('.unityweb')) {
				res.setHeader('Content-Encoding', 'gzip');
			} else {
				next();
				return;
			}

			if (pathname.endsWith('.wasm.br') || pathname.endsWith('.wasm.unityweb')) {
				res.setHeader('Content-Type', 'application/wasm');
			} else if (pathname.endsWith('.js.br') || pathname.endsWith('.js.unityweb')) {
				res.setHeader('Content-Type', 'application/javascript');
			} else {
				res.setHeader('Content-Type', 'application/octet-stream');
			}
		}

		next();
	};

	return {
		name: 'unity-webgl-headers',
		configureServer(server) {
			server.middlewares.use(middleware);
		},
		configurePreviewServer(server) {
			server.middlewares.use(middleware);
		}
	};
}

export default defineConfig({
	plugins: [
		unityWebGLHeaders(),
		svelteTesting(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter()
		})
	], 
	preview: {
		allowedHosts: [
			'www.h-our.shop',
			'www.mtvs-strata.cloud'
		]
	},
	test: {
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.js'],
  	}
});
