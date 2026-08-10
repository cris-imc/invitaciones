const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'src', 'components', 'templates');
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
    const filePath = path.join(templatesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    const duplicateProp = `fontFamily: 'var(--font-body-custom, var(--font-inter)), sans-serif',\n                fontFamily: 'var(--font-body-custom, var(--font-inter)), sans-serif',`;
    const singleProp = `fontFamily: 'var(--font-body-custom, var(--font-inter)), sans-serif',`;
    
    // Also handle \r\n
    const duplicatePropWin = `fontFamily: 'var(--font-body-custom, var(--font-inter)), sans-serif',\r\n                fontFamily: 'var(--font-body-custom, var(--font-inter)), sans-serif',`;
    
    if (content.includes(duplicateProp)) {
        content = content.split(duplicateProp).join(singleProp);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed duplicate in ${file}`);
    } else if (content.includes(duplicatePropWin)) {
        content = content.split(duplicatePropWin).join(singleProp);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed duplicate in ${file}`);
    }
});
