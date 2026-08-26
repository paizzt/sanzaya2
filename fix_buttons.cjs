const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

const primaryClass = 'inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900 shrink-0';
const secondaryClass = 'inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 shrink-0';
const unduhClass = 'inline-flex items-center rounded-md border border-emerald-400 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition duration-150 hover:bg-emerald-100 shrink-0';

walkDir('resources/js/Pages', function(filePath) {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove bg-blue-600 from PrimaryButton
    content = content.replace(/<PrimaryButton[^>]*className=(["'\`\{])[^>]*bg-blue-600[^>]*\1[^>]*>/g, (match) => {
        return match.replace(/className=(["'\`\{])[^\>]*bg-blue-600[^\>]*\1/, 'className=""');
    });

    // Replace raw <button> with bg-blue-600 to primaryClass
    content = content.replace(/<button[^>]*className=(["'\`\{])[^\>]*bg-blue-600[^\>]*\1[^>]*>/g, (match) => {
        return match.replace(/className=(["'\`\{])[^\>]*bg-blue-600[^\>]*\1/, `className="${primaryClass}"`);
    });
    
    // Replace raw <button> Unduh (emerald or rose)
    content = content.replace(/<button[^>]*className=(["'\`\{])[^\>]*(bg-emerald-50|bg-rose-50)[^\>]*\1[^>]*>/g, (match) => {
        if (match.includes('Unduh') || match.includes('unduh')) {
            return match.replace(/className=(["'\`\{])[^\>]*(bg-emerald-50|bg-rose-50)[^\>]*\1/, `className="${unduhClass}"`);
        }
        return match;
    });

    // Replace <Link> with bg-blue-600
    content = content.replace(/<Link[^>]*className=(["'\`\{])[^\>]*bg-blue-600[^\>]*\1[^>]*>/g, (match) => {
        return match.replace(/className=(["'\`\{])[^\>]*bg-blue-600[^\>]*\1/, `className="${primaryClass}"`);
    });
    
    // Convert `<Plus className="w-5 h-5" /> Tambah Produk` to `<Plus className="w-4 h-4 mr-2" /> TAMBAH PRODUK` 
    // Just simpler to use CSS uppercase tracking-widest for raw buttons that were changed to primaryClass
    // Wait, text-transform: uppercase is applied via class `uppercase`. So text will be uppercased by CSS!

    // Also remove any custom classes on SecondaryButton that are meant to override
    content = content.replace(/<SecondaryButton[^>]*className=(["'\`\{])[^>]*px-([4-8])[^>]*\1[^>]*>/g, (match) => {
        return match.replace(/className=(["'\`\{])[^\>]*px-[^\>]*\1/, 'className=""');
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Updated: ' + filePath);
    }
  }
});
