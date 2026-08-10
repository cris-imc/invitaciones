const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'src', 'components', 'templates');
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
    const filePath = path.join(templatesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We want to find: {!isCoverOpen && (
    // And then the next line or two which has: style={{ ... }}
    // And append: , ...getTypographyCssVars(invitation.fontTitle as string, invitation.fontBody as string)
    // right before the closing }}
    
    let lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('{!isCoverOpen && (')) {
            // Find the style={{ in the next 10 lines
            for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
                if (lines[j].includes('style={{') && lines[j].includes('zIndex: 99999')) {
                    // Check if we haven't already added it
                    if (!lines[j].includes('getTypographyCssVars')) {
                        // Insert it right before the last }}
                        lines[j] = lines[j].replace(/(\s*)\}\}/, ", ...getTypographyCssVars(invitation.fontTitle as string, invitation.fontBody as string)$1}}");
                        console.log(`Injected in ${file}`);
                    }
                    break;
                }
            }
            break; // only do it for the first cover
        }
    }
    
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
});
