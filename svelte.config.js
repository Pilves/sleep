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
		})
	}
};

export default config;
