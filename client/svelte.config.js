import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const dev = process.env.NODE_ENV === 'development';

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
		// Ensure this doesn't use $app imports
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
