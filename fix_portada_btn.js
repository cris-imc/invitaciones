const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'src', 'components', 'templates');
const BAD_STYLE = 'style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}';
const BORDER_OLD = "border: '1px solid #C9A876', color: '#C9A876',";
const BORDER_NEW = "fontFamily: 'var(--font-body-custom, var(--font-inter)), sans-serif', border: '1px solid #C9A876', color: '#C9A876',";

const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
    const filePath = path.join(templatesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(BAD_STYLE)) {
        let modified = content.replace(BAD_STYLE, "");
        modified = modified.replace(BORDER_OLD, BORDER_NEW); // string replace replaces only first occurrence in JS by default
        fs.writeFileSync(filePath, modified, 'utf8');
        console.log(`Fixed: ${file}`);
    } else {
        console.log(`Skip: ${file}`);
    }
});
