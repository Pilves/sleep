import adapterNode from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Using adapter-node for deployment to services like Render, Heroku, etc.
		adapter: adapterNode({
			// default options are shown
			out: 'build',
			precompress: false,
			envPrefix: ''
		}),
		// Default fallback for SPA - ensures all routes are caught by our app
		trailingSlash: 'never',
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
