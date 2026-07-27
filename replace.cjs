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
            
            data = data.replace(/<(button|PrimaryButton|SecondaryButton|DangerButton)([^>]*)>(.*?)<\/\1>/gs, (match, tag, attrs, inner) => {
                // If button contains 'Kirim', remove any icon component
                if (inner.includes('Kirim')) {
                    inner = inner.replace(/<[A-Z][a-zA-Z0-9]*\s+[^>]*(\/>|><\/[A-Z][a-zA-Z0-9]*>)/g, '');
                }

                // Replace 'Tambah Armada', 'Simpan Data', 'Simpan Perubahan', 'Buat Pengguna' with 1 word
                let newInner = inner
                    .replace(/(Tambah|Simpan|Kirim|Batal|Hapus|Edit|Update)\s+[A-Za-z0-9\s]+/g, '$1')
                    .replace(/'(Tambah|Simpan|Kirim|Batal|Hapus|Edit|Update)\s+[A-Za-z0-9\s]+'/g, "'$1'")
                    .replace(/"(Tambah|Simpan|Kirim|Batal|Hapus|Edit|Update)\s+[A-Za-z0-9\s]+"/g, '"$1"');
                
                // Specific edge cases like "Buat Pengguna"
                newInner = newInner.replace(/(Buat)\s+[A-Za-z0-9\s]+/g, '$1')
                                   .replace(/'(Buat)\s+[A-Za-z0-9\s]+'/g, "'$1'");
                                   
                return '<' + tag + attrs + '>' + newInner + '</' + tag + '>';
            });

            if (originalData !== data) {
                fs.writeFileSync(fullPath, data, 'utf8');
                console.log('Updated ' + fullPath);
            }
        }
    });
}

processDir('c:/xampp/htdocs/sanzaya2/resources/js/Pages');
