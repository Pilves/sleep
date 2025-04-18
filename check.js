import fs from 'fs';
import path from 'path';

const repoPath = './'; // Root directory of your repository
const httpRegex = /http:\/\/[^\s"']+/g; // Regex to match http URLs

// Function to recursively scan files in a directory
function scanDirectory(directory) {
    const files = fs.readdirSync(directory);
    let httpUrls = [];

    for (const file of files) {
        const fullPath = path.join(directory, file);

        if (file === 'node_modules') {
            continue;
        }

        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            httpUrls = httpUrls.concat(scanDirectory(fullPath));
        } else if (stats.isFile() && fullPath.endsWith('.svelte')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const matches = content.match(httpRegex);
            if (matches) {
                httpUrls = httpUrls.concat(matches.map(url => ({ file: fullPath, url })));
            }
        }
    }

    return httpUrls;
}

// Scan the repository and log results
const httpUrls = scanDirectory(repoPath);

if (httpUrls.length > 0) {
    console.log('Found HTTP URLs:');
    httpUrls.forEach(({ file, url }) => {
        console.log(`File: ${file}, URL: ${url}`);
    });
} else {
    console.log('No HTTP URLs found. All URLs are HTTPS.');
}
