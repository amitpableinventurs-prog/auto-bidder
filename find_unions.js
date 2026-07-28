const fs = require('fs');
const path = require('path');

const fabricDir = path.join(__dirname, 'node_modules', 'react-native-screens', 'src', 'fabric');

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('Event') && content.includes('|') && content.includes("'")) {
                console.log(`Found potential union in event in ${fullPath}`);
            }
        }
    }
}

walk(fabricDir);
