const fs = require('fs');
const path = require('path');

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let data = fs.readFileSync(fullPath, 'utf8');
            let originalData = data;
            
            data = data.replace(/\splaceholder=(["']).*?\1/g, '')
                       .replace(/\splaceholder=\{.*?\}/g, '');
                       
            if (originalData !== data) {
                fs.writeFileSync(fullPath, data, 'utf8');
                console.log('Removed placeholders in ' + fullPath);
            }
        }
    });
}

processDir('c:/xampp/htdocs/sanzaya2/resources/js');
