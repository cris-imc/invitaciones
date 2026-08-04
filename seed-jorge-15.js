const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  const userId = 'cmsbdonza0000uqczkgqf9deg';
  
  // 1. Copy photos from img/15 to public/uploads
  const sourceDir = path.join(__dirname, 'img', '15');
  const targetDir = path.join(__dirname, 'public', 'uploads');
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
  
  // Select up to 10 random files
  const selectedFiles = files.sort(() => 0.5 - Math.random()).slice(0, 10);
  
  const uploadedUrls = [];
  
  for (const file of selectedFiles) {
    const ext = path.extname(file);
    const newName = `15-fake-${crypto.randomBytes(4).toString('hex')}${ext}`;
    fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, newName));
    uploadedUrls.push(`/uploads/${newName}`);
  }
  
  console.log('Photos copied:', uploadedUrls);

  // 2. Create the Premium Invitation
  const slug = `mis-15-sofia-${crypto.randomBytes(3).toString('hex')}`;
  
  const invitation = await prisma.invitation.create({
    data: {
      userId,
      planTier: 'PREMIUM',
      tipo: 'QUINCE_ANOS',
      estado: 'ACTIVA',
      slug,
      nombreEvento: 'Mis 15 Sofía',
      fechaEvento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      nombreQuinceanera: 'Sofía',
      lugarNombre: 'Salón de Eventos El Palacio',
      direccion: 'Av. Libertador 1234, CABA',
      hora: '21:00 hs',
      templateId: 'moderno-purpura',
      templateTipo: 'PREMIUM',
      temaColores: '{"primary":"#9b59b6","secondary":"#8e44ad","accent":"#e91e63","background":"#1a1a2e","text":"#ffffff"}',
      
      // Features
      portadaHabilitada: true,
      portadaTitulo: 'MIS 15',
      portadaTextoBoton: 'INGRESAR',
      portadaImagenFondo: uploadedUrls[0] || null,
      portadaImagenFondoDesktop: uploadedUrls[0] || null,
      
      musicaHabilitada: true,
      musicaUrl: null, // Let's keep it null for now or could use a known mp3
      
      contadorHabilitado: true,
      seccionCuandoHabilitada: true,
      seccionDondeHabilitada: true,
      
      galeriaPrincipalHabilitada: true,
      galeriaPrincipalFotos: JSON.stringify(uploadedUrls),
      galeriaPrincipalEstilo: 'grid',
      
      albumCompartidoHabilitado: true,
      sugerenciaMusicaHabilitada: true,
      
      regaloHabilitado: true,
      regaloMostrarDatos: true,
      regaloAlias: 'sofia.15.fiesta',
      regaloTitular: 'Sofía Perez',
      regaloCbu: '0000003123123123123123',
      regaloBanco: 'Banco Galicia',
      
      rsvpEnabled: true,
      confirmacionHabilitada: true,
      confirmacionFechaLimite: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
    }
  });

  console.log(`Successfully created invitation: http://localhost:3000/invite/${slug}`);
  console.log(`Invitation ID: ${invitation.id}`);
  
  // 3. Let's create a guest so Jorge can preview it properly? (The admin panel generates preview tokens).
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
