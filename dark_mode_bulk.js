const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'app');

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

    // Direct replacements for hardcoded light classes
    content = content.replace(/text-slate-800/g, 'text-white');
    content = content.replace(/text-slate-700/g, 'text-slate-200');
    content = content.replace(/text-slate-600/g, 'text-slate-300');
    content = content.replace(/text-slate-500/g, 'text-slate-400');
    content = content.replace(/bg-white/g, 'bg-slate-900');
    content = content.replace(/bg-slate-50/g, 'bg-slate-800/50');
    content = content.replace(/border-slate-100/g, 'border-slate-800');
    content = content.replace(/border-slate-200/g, 'border-slate-700');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
    }
});
