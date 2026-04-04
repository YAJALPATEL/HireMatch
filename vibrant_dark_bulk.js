const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.css') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Remove desaturated "Grays" with vibrant "Midnight Indigos"
    content = content.replace(/#0B0F19/g, '#030310'); // Blacker but with indigo essence
    content = content.replace(/#131A2B/g, '#09091A'); // High tech midnight indigo
    content = content.replace(/#0F172A/g, '#060614'); // Deep base midnight
    content = content.replace(/#1E293B/g, '#101026'); // Card background indigo
    content = content.replace(/#111126/g, '#09091A'); // Just in case it was already replaced

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated HEX:', file);
    }
});
