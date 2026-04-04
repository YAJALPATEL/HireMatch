const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'y:', 'PROJECTS', 'Jd Analyse', 'hirematch-ai', 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join('y:', 'PROJECTS', 'Jd Analyse', 'hirematch-ai', 'src'));

let replaceCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replacements
  content = content.replace(/coral/g, 'primary');
  content = content.replace(/teal/g, 'accent');
  content = content.replace(/sage/g, 'success');
  content = content.replace(/peach/g, 'slate');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    replaceCount++;
    console.log('Updated:', file);
  }
});

console.log('Total files updated:', replaceCount);
