import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import {dev} from "$app/environment";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false
		}),
		paths: {
			base: dev ? '' : '/sleep'
		},
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				if (path.startsWith('/images/') || path.endsWith('.png') || path.endsWith('.jpg')) {
					return;
				}
				console.warn(`Warning: ${message} at ${path}${referrer ? ` (referrer: ${referrer})` : ''}`);
				return;
			}
		}
	}
};

export default config;
