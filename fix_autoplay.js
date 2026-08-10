const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'src', 'components', 'templates');
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
    const filePath = path.join(templatesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Case 1: autoplay: musicaHabilitada && Boolean(invitation.musicaAutoplay ?? true),
    const target1 = `autoplay: musicaHabilitada && Boolean(invitation.musicaAutoplay ?? true),`;
    const replacement1 = `autoplay: musicaHabilitada && Boolean(invitation.musicaAutoplay ?? true) && !invitation.isPreviewMode,`;

    // Case 2: autoplay={Boolean(invitation.musicaAutoplay ?? true)}
    const target2 = `autoplay={Boolean(invitation.musicaAutoplay ?? true)}`;
    const replacement2 = `autoplay={Boolean(invitation.musicaAutoplay ?? true) && !invitation.isPreviewMode}`;

    let modified = false;

    if (content.includes(target1)) {
        content = content.split(target1).join(replacement1);
        modified = true;
    }

    if (content.includes(target2)) {
        content = content.split(target2).join(replacement2);
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated autoplay in ${file}`);
    }
});
