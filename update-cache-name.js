import { promises as fs } from 'fs';
import path from 'path';

// Get the current directory of the module using import.meta.url
const swPath = path.join('C:/Users/bro32/PycharmProjects/waffle/public/sw.js');

const currentCacheVersion = 'static-v'; // The prefix of your cache name

async function updateCacheName() {
    try {
        const data = await fs.readFile(swPath, 'utf8');

        // Find the cache name using a regex and increment it
        const match = data.match(/const CACHE_NAME = 'static-v(\d+)'/);
        if (match) {
            const newCacheName = `${currentCacheVersion}${parseInt(match[1], 10) + 1}`;
            console.log('New Cache Name:', newCacheName);

            // Replace the old cache name in sw.js content
            const result = data.replace(/const CACHE_NAME = 'static-v\d+'/, `const CACHE_NAME = '${newCacheName}'`);

            // Write the updated file back
            await fs.writeFile(swPath, result, 'utf8');
            console.log('sw.js updated successfully!');
        } else {
          console.error('Cache name not found in sw.js');
        }
    } catch (err) {
      console.error('Error:', err);
    }
}

updateCacheName();