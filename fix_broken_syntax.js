const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'src', 'components', 'templates');
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
    const filePath = path.join(templatesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the broken line
    // broken part 1: className=" style={{ fontFamily: "var(--font-body-custom, var(--font-inter)), sans-serif" }}inline-block
    content = content.replace('className=" style={{ fontFamily: "var(--font-body-custom, var(--font-inter)), sans-serif" }}inline-block', 'className="inline-block');
    
    fs.writeFileSync(filePath, content, 'utf8');
});
