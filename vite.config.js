import { defineConfig } from 'vite';
import { generateCustomElements, watchComponentDir } from './plugins/generateCustomElements';

// Vite configuration
export default defineConfig({
    plugins: [
        {
            name: 'generate-custom-elements',
            buildStart() {
                // Generate and minify custom elements when the build starts
                generateCustomElements();
            },

            configureServer(server) {
                // Start watching the component directory for file changes
                watchComponentDir(server);
            }
        }
    ]
});
