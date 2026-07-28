const fs = require('fs');
const path = require('path');
const searchDir = 'resources/js';

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      fileList = walk(path.join(dir, file), fileList);
    } else if (file.endsWith('.jsx')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const files = walk(searchDir);
const issues = [];
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  
  const importMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/);
  if (importMatch) {
    const importedIcons = importMatch[1].split(',').map(i => i.trim()).filter(Boolean);
    const missingIcons = [];
    for (const icon of importedIcons) {
      const usedRegex = new RegExp('<' + icon + '(\\s|>)|\\b' + icon + '\\b', 'g');
      const matches = content.match(usedRegex);
      if (!matches || matches.length <= 1) {
         missingIcons.push(icon);
      }
    }
    if (missingIcons.length > 0) {
      issues.push({file, missingIcons});
    }
  }
}
console.log(JSON.stringify(issues, null, 2));
