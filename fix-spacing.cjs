const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if(file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('resources/js/Pages');
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    
    content = content.replace(/className=\"py-12/g, 'className=\"pb-12 pt-0');
    content = content.replace(/className=\"py-6/g, 'className=\"pb-6 pt-0');

    if(content !== originalContent) {
        fs.writeFileSync(file, content);
        changedFiles++;
        console.log('Updated', file);
    }
});

console.log('Total files updated:', changedFiles);
