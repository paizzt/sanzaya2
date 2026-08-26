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

    // We want to replace <button className="..."> ... Unduh ... </button>
    // Since regex across tags in JS can be tricky, let's just replace the class if it has bg-emerald-50 or bg-rose-50 and it's not a div.
    // Wait, let's just replace ALL <button ... bg-emerald-50|bg-rose-50 ...> with unduhClass, UNLESS they are Tambah buttons in Spreadsheet.
    
    // In Spreadsheet/Index.jsx, there are Add buttons with bg-blue-50, bg-emerald-50, bg-purple-50, bg-orange-50.
    // Let's just manually replace those to primaryClass if they say Tambah.
    content = content.replace(/<button[^>]*className=(["'\`\{])[^\>]*(bg-emerald-50|bg-rose-50|bg-blue-50|bg-purple-50|bg-orange-50)[^\>]*\1[^>]*>([^<]*<[^>]*>)*\s*Tambah/gi, (match) => {
        return match.replace(/className=(["'\`\{])[^\>]*\1/, `className="${primaryClass}"`);
    });

    // Now for Unduh buttons (the ones that didn't get caught above because they say Unduh)
    content = content.replace(/<button[^>]*className=(["'\`\{])[^\>]*(bg-emerald-50|bg-rose-50)[^\>]*\1[^>]*>/g, (match) => {
        // Only if it still has bg-emerald-50/rose-50 (not replaced by Tambah logic)
        return match.replace(/className=(["'\`\{])[^\>]*(bg-emerald-50|bg-rose-50)[^\>]*\1/, `className="${unduhClass}"`);
    });

    // Replace the icons inside Unduh to not have text-emerald-600 or text-rose-600 since the parent sets the text color. Wait, parent sets text color but SVG stroke might need currentColor. Actually, Lucide icons inherit color usually, or we can just leave the color class there. But to make them all identical green, we should ensure the icon is green. The Unduh class sets text-emerald-700. So we can remove text-rose-600 from the icon.
    content = content.replace(/<Download className="[^"]*text-rose-600[^"]*"/g, '<Download className="w-4 h-4 mr-2"');
    content = content.replace(/<Download className="[^"]*text-emerald-600[^"]*"/g, '<Download className="w-4 h-4 mr-2"');

    // Also, make sure all `<Plus ... /> Tambah` have `mr-2` and `TAMBAH` text (though CSS `uppercase` handles TAMBAH).
    content = content.replace(/<Plus className="([^"]*)"/g, (match, p1) => {
        if (!p1.includes('mr-2')) {
            return `<Plus className="${p1} mr-2"`;
        }
        return match;
    });

    // Remove text-white from <button> that got transformed to primaryClass
    // It's already in primaryClass, so it's fine, but let's ensure we didn't leave duplicate standard classes.
    // Since we replaced the ENTIRE className string with primaryClass, there are no leftovers!

    // Wait, what about `bg-indigo-600` for `Filter`? Did we replace that?
    // Let's replace any `PrimaryButton` custom classes that have `bg-indigo-600` or similar.
    content = content.replace(/<PrimaryButton[^>]*className=(["'\`\{])[^\>]*\1[^>]*>/g, (match) => {
        // Remove ALL className from PrimaryButton to revert to default!
        return match.replace(/className=(["'\`\{])[^\>]*\1/, 'className=""');
    });

    // Let's replace any `SecondaryButton` custom classes
    content = content.replace(/<SecondaryButton[^>]*className=(["'\`\{])[^\>]*\1[^>]*>/g, (match) => {
        // Remove ALL className from SecondaryButton to revert to default!
        return match.replace(/className=(["'\`\{])[^\>]*\1/, 'className=""');
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Fixed: ' + filePath);
    }
  }
});
