const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'src', 'components', 'templates');
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
    const filePath = path.join(templatesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Fix Button duplicate styles
    // Find: style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}
    // And remove it if there's another style block immediately after it, or anywhere on the button.
    // Instead of regex madness, let's look for exactly what we know is duplicated:
    const duplicateDressCode = 'style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }} style={{';
    content = content.split(duplicateDressCode).join('style={{ fontFamily: "var(--font-body-custom, var(--font-inter)), sans-serif",');
    
    // Fix button (where there is a newline between them)
    const badStyleBtn = ' style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}';
    const badStyleBtn2 = 'style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}\n';
    const badStyleBtn3 = 'style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}\r\n';
    
    // Let's remove the first one if it's there
    let lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('ABRIR INVITACI')) {
            // Found button. Let's trace back to `<button`
            for (let j = i; j >= Math.max(0, i-20); j--) {
                if (lines[j].includes('className=') && lines[j].includes('font-sans')) {
                    lines[j] = lines[j].replace('font-sans ', '');
                }
                if (lines[j].includes('style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}')) {
                    lines[j] = lines[j].replace('style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}', '');
                }
                if (lines[j].includes("border: '1px solid") && lines[j].includes("color: '#C9A876'")) {
                    if (!lines[j].includes('fontFamily')) {
                        lines[j] = lines[j].replace("border:", "fontFamily: 'var(--font-body-custom, var(--font-inter)), sans-serif', border:");
                    }
                }
                if (lines[j].includes('<button')) break;
            }
        }
    }
    content = lines.join('\n');
    
    // 2. Fix Guest Name (Cover)
    // style={{ fontFamily: 'var(--font-title)', fontStyle: 'italic' }}
    // OR style={{ fontFamily: "var(--font-title)", fontStyle: 'italic' }}
    content = content.replace(/style=\{\{\s*fontFamily:\s*['"]var\(--font-title\)['"],\s*fontStyle:\s*['"]italic['"]\s*\}\}/g, "style={{ fontFamily: 'var(--font-title, var(--font-cormorant)), serif' }}");
    content = content.replace(/style=\{\{\s*fontFamily:\s*['"]var\(--font-title\)['"]\s*\}\}/g, "style={{ fontFamily: 'var(--font-title, var(--font-cormorant)), serif' }}");

    // Also remove font-sans from dress code paragraphs globally since they use custom font
    content = content.replace(/className="([^"]*)font-sans([^"]*)"\s*style=\{\{\s*fontFamily/g, 'className="$1$2" style={{ fontFamily');

    fs.writeFileSync(filePath, content, 'utf8');
});

// 3. Fix SongSuggestion.tsx
const songPath = path.join(__dirname, 'src', 'components', 'invitation', 'v2', 'SongSuggestion.tsx');
if (fs.existsSync(songPath)) {
    let songContent = fs.readFileSync(songPath, 'utf8');
    // We want to add the inline style for font-family
    songContent = songContent.replace(
        '<p className={variant === "moderno" ? "font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C9A876] mb-6" : "t-kicker"}>',
        '<p className={variant === "moderno" ? "text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C9A876] mb-6" : "t-kicker"} style={{ fontFamily: "var(--font-body-custom, var(--font-inter)), sans-serif" }}>'
    );
    songContent = songContent.replace(
        '<p className="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C9A876] mb-6">',
        '<p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C9A876] mb-6" style={{ fontFamily: "var(--font-body-custom, var(--font-inter)), sans-serif" }}>'
    );
    fs.writeFileSync(songPath, songContent, 'utf8');
}
