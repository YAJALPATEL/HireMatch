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
            if (file.endsWith('.tsx')) {
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

    // Eradicate "Slate" (Gray) and replace with "Indigo/Violet"
    content = content.replace(/text-slate-400/g, 'text-indigo-300/80');
    content = content.replace(/text-slate-300/g, 'text-indigo-200');
    content = content.replace(/text-slate-200/g, 'text-indigo-100');
    content = content.replace(/bg-slate-800/g, 'bg-indigo-950/40');
    content = content.replace(/border-slate-800/g, 'border-indigo-500/20');
    content = content.replace(/border-slate-700/g, 'border-indigo-500/30');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Vibrant Update:', file);
    }
});
