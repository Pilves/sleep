import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Using adapter-static for GitHub Pages deployment
		adapter: adapterStatic({
			// default options are shown
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false
		}),
		// Default fallback for SPA - ensures all routes are caught by our app
		trailingSlash: 'never',
		// Essential for GitHub Pages deployment
		paths: {
			base: process.env.NODE_ENV === 'production' ? '/sleep' : ''
		},
		// This helps with catching non-existing routes
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// Ignore missing assets as they are handled client-side
				if (path.startsWith('/images/') || path.endsWith('.png') || path.endsWith('.jpg')) {
					return;
				}
				
				// Log for debugging
				console.warn(`Warning: ${message} at ${path}${referrer ? ` (referrer: ${referrer})` : ''}`);
				
				// Continue without error
				return;
			}
		}
	}
};

export default config;
