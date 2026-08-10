const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'src', 'components', 'templates');
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
    const filePath = path.join(templatesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let lines = content.split('\n');
    let modified = false;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('ABRIR INVITACI')) {
            // Found the button
            for (let j = i; j >= Math.max(0, i-10); j--) {
                if (lines[j].includes('className=')) {
                    // Check if the button already has the fontFamily style correctly applied.
                    let hasFontFamily = false;
                    for (let k = j; k <= i; k++) {
                        if (lines[k].includes('fontFamily:')) hasFontFamily = true;
                    }
                    if (!hasFontFamily) {
                        // We will add the style inline right at the end of className
                        // if className line has no closing >, we can just append it safely
                        // Wait, some might have it closed like > or not. We'll replace it carefully.
                        lines[j] = lines[j].replace('"', '" style={{ fontFamily: "var(--font-body-custom, var(--font-inter)), sans-serif" }}');
                        // No wait, replacing `"` is risky if there are multiple quotes.
                        // Let's just append to the end of the line (before any `>`)
                        if (lines[j].includes('>')) {
                             lines[j] = lines[j].replace('>', ' style={{ fontFamily: "var(--font-body-custom, var(--font-inter)), sans-serif" }}>');
                        } else {
                             lines[j] = lines[j] + ' style={{ fontFamily: "var(--font-body-custom, var(--font-inter)), sans-serif" }}';
                        }
                        
                        modified = true;
                        console.log(`Fixed button in ${file}`);
                    }
                    break;
                }
            }
        }
    }
    
    if (modified) {
        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    }
});
