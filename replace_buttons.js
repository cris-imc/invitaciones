const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\crmartinez\\OneDrive - Prisma Medios de Pago\\Escritorio\\invitaciones\\src\\components\\wizard';
const files = [
    'StepEventType.tsx',
    'StepBasicInfo.tsx',
    'StepDetails.tsx',
    'StepCeremonia.tsx',
    'StepCronograma.tsx',
    'StepCoverPage.tsx',
    'StepHeroImages.tsx',
    'StepGallery.tsx',
    'StepPhrase.tsx',
    'StepMusic.tsx',
    'StepTrivia.tsx',
    'StepBankDetails.tsx',
    'StepDesign.tsx'
];

files.forEach(file => {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${file} - not found`);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Add import for SaveStepButtons
    if (!content.includes('import { SaveStepButtons }')) {
        // Find last import
        const lines = content.split('\n');
        let lastImportIdx = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) {
                lastImportIdx = i;
            }
        }
        if (lastImportIdx !== -1) {
            lines.splice(lastImportIdx + 1, 0, 'import { SaveStepButtons } from "./SaveStepButtons";');
            content = lines.join('\n');
        }
    }

    // 2. Replace the old buttons div
    const oldButtonsRegex = /<div\s+className="flex justify-between pt-4">\s*<Button[^>]*>Atrás<\/Button>\s*<Button type="submit">Siguiente Paso<\/Button>\s*<\/div>/g;
    
    // Also handle possible disabled states or variations
    const regex2 = /<div\s+className="flex justify-between pt-4">[\s\S]*?<\/div>/;
    
    // But since regex2 is broad, let's manually find the exact block:
    // It usually looks like:
    // <div className="flex justify-between pt-4">
    //     <Button type="button" variant="outline" onClick={prevStep}>Atrás</Button>
    //     <Button type="submit">Siguiente Paso</Button>
    // </div>
    const blockStart = '<div className="flex justify-between pt-4">';
    const blockEnd = '</div>';
    
    let parts = content.split(blockStart);
    if (parts.length > 1) {
        // Find the first </div> after blockStart
        for (let i = 1; i < parts.length; i++) {
            const endIdx = parts[i].indexOf(blockEnd);
            if (endIdx !== -1) {
                const inside = parts[i].substring(0, endIdx);
                // Check if it's the right block (has Atrás and Siguiente)
                if (inside.includes('Atrás') && inside.includes('Siguiente')) {
                    parts[i] = '\n                        <SaveStepButtons form={form} />\n                    ' + parts[i].substring(endIdx + blockEnd.length);
                }
            }
        }
        content = parts.join('');
    }

    // What if StepEventType doesn't have "Atrás"? 
    // StepEventType is step 0, it doesn't have "Atrás".
    // <div className="flex justify-end pt-4">
    //     <Button type="submit">Siguiente Paso</Button>
    // </div>
    const blockStartEvent = '<div className="flex justify-end pt-4">';
    let partsEvent = content.split(blockStartEvent);
    if (partsEvent.length > 1) {
        for (let i = 1; i < partsEvent.length; i++) {
            const endIdx = partsEvent[i].indexOf(blockEnd);
            if (endIdx !== -1) {
                const inside = partsEvent[i].substring(0, endIdx);
                if (inside.includes('Siguiente Paso')) {
                    partsEvent[i] = '\n                        <SaveStepButtons form={form} />\n                    ' + partsEvent[i].substring(endIdx + blockEnd.length);
                }
            }
        }
        content = partsEvent.join('');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
});
