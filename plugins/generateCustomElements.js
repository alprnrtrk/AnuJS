import fs from 'fs';
import path from 'path';
import { minify } from 'terser'; // Correct import for terser (named import)

const componentDir = path.resolve(__dirname, '../components');
const outputDir = path.resolve(__dirname, '../src/js');

export function generateCustomElements() {
    const allCustomElements = [];

    // Read all files in the component directory
    fs.readdir(componentDir, (err, files) => {
        if (err) throw err;

        files.forEach(file => {
            const filePath = path.join(componentDir, file);

            if (file.startsWith('anu') && file.endsWith('.html')) {
                const componentName = file.replace('.html', '').toLowerCase();
                const className = componentName.split('-')
                    .map((part, index) => index === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part.charAt(0).toUpperCase() + part.slice(1))
                    .join('');
                const elementName = componentName.replace(/^anu-/, 'anu-');

                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) throw err;

                    const customElementJs = `
            class ${className} extends HTMLElement {
              constructor() {
                super();
                const shadow = this.attachShadow({mode: 'open'});
                shadow.innerHTML = \`${data}\`;
              }
            }
            customElements.define('${elementName}', ${className});
          `;

                    allCustomElements.push(customElementJs);

                    // Once all custom elements are processed, write the combined JS file
                    if (allCustomElements.length === files.filter(file => file.startsWith('anu') && file.endsWith('.html')).length) {
                        const allElementsJs = allCustomElements.join('\n');

                        // Minify the generated JavaScript using Terser
                        minify(allElementsJs).then(minified => {
                            const jsFilePath = path.join(outputDir, 'all-elements.min.js');
                            fs.writeFile(jsFilePath, minified.code, err => {
                                if (err) throw err;
                                console.log('All custom elements bundled and minified into one file: all-elements.min.js');
                            });
                        }).catch(err => {
                            console.error('Error minifying the JavaScript:', err);
                        });
                    }
                });
            }
        });
    });
}

export function watchComponentDir(server) {
    // Watch for file changes in the components directory
    fs.watch(componentDir, { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('.html')) {
            console.log(`File changed: ${filename}`);

            // Regenerate and minify the custom elements JavaScript file on change
            generateCustomElements();

            // Trigger a full reload to apply changes to the page
            server.ws.send({ type: 'full-reload' });
        }
    });
}
