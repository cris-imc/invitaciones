import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fotos de ejemplo de Unsplash
const QUINCE_PHOTOS = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800',
];

const WEDDING_PHOTOS = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
    'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
];

const COVER_IMAGES = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1920',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1920',
];

async function main() {
    console.log('🌱 Seeding invitaciones de prueba...');

    // Buscar o crear usuario de prueba
    let user = await prisma.user.findFirst({
        where: { email: 'demo@invitadigital.com' }
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                email: 'demo@invitadigital.com',
                name: 'Usuario Demo',
                role: 'CLIENT',
            },
        });
        console.log('✅ Usuario demo creado');
    }

    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);

    // QUINCEAÑERA 1: Sofía Martínez
    const quince1 = await prisma.invitation.create({
        data: {
            userId: user.id,
            tipo: 'QUINCE_ANOS',
            estado: 'ACTIVA',
            slug: `sofia-martinez-xv-${Date.now()}`,
            nombreEvento: 'XV Años de Sofía',
            fechaEvento: twoMonthsFromNow,
            nombreQuinceanera: 'Sofía Martínez',
            lugarNombre: 'Salón de Eventos La Bella',
            direccion: 'Av. Principal 456, Ciudad',
            hora: '19:00',
            mapUrl: 'https://maps.google.com',
            templateId: 'quince-elegant',

            // Tema
            temaColores: JSON.stringify({
                primaryColor: '#ff69b4',
                backgroundColor: '#ffffff',
                textDark: '#1a1a1a',
                textLight: '#ffffff',
                fontFamily: 'poppins',
                layout: 'modern'
            }),

            // Portada
            portadaHabilitada: true,
            portadaTitulo: 'Mis XV Años',
            portadaTextoBoton: 'Abrir Invitación',
            portadaImagenFondo: COVER_IMAGES[0],

            // Música
            musicaHabilitada: true,
            musicaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            musicaAutoplay: true,
            musicaLoop: true,

            // Contador
            contadorHabilitado: true,

            // Sección Cuándo
            seccionCuandoHabilitada: true,
            seccionCuandoIcono: '📅',
            seccionCuandoTitulo: '¿Cuándo?',

            // Sección Dónde
            seccionDondeHabilitada: true,
            seccionDondeIcono: '📍',
            seccionDondeTitulo: '¿Dónde?',
            lugarBotonTexto: 'Ver en Maps',

            // Dress Code
            dresscodeHabilitado: true,
            dresscodeIcono: '👗',
            dresscodeTitulo: 'Dress Code',
            dresscodeTipo: 'Formal',
            dresscodeObservaciones: 'Colores sugeridos: Rosa, dorado y blanco',

            // Galería Principal
            galeriaPrincipalHabilitada: true,
            galeriaPrincipalFotos: JSON.stringify(QUINCE_PHOTOS),
            galeriaPrincipalEstilo: 'carrusel',
            galeriaPrincipalAutoplay: true,

            // Frase Personalizada
            frasePersonalizadaHabilitada: true,
            frasePersonalizadaTexto: '"La vida es una fiesta, y hoy celebro mis primeros 15 años"',
            frasePersonalizadaEstilo: 'elegant',

            // Álbum Compartido
            albumCompartidoHabilitado: true,
            albumCompartidoIcono: '📸',
            albumCompartidoTitulo: 'Comparte tus fotos',
            albumCompartidoDescripcion: '¡Sube tus fotos de la fiesta!',
            albumCompartidoBotonTexto: 'Ir al álbum',

            // Regalo
            regaloHabilitado: true,
            regaloIcono: '🎁',
            regaloTitulo: 'Regalos',
            regaloMensaje: 'Tu presencia es mi mejor regalo, pero si deseas obsequiarme algo:',
            regaloMostrarDatos: true,
            regaloAlias: 'sofia.quince',
            regaloCvu: '0000003100010000000001',
            regaloCbu: '0110599520000000123456',

            // Trivia
            triviaHabilitada: true,
            triviaIcono: '🎯',
            triviaTitulo: '¿Cuánto me conoces?',
            triviaSubtitulo: 'Responde estas preguntas y descubre si realmente me conoces',
            triviaPreguntas: JSON.stringify([
                {
                    pregunta: '¿Cuál es mi color favorito?',
                    opciones: ['Rosa', 'Azul', 'Verde', 'Morado'],
                    respuestaCorrecta: 0
                },
                {
                    pregunta: '¿En qué mes nací?',
                    opciones: ['Enero', 'Marzo', 'Junio', 'Septiembre'],
                    respuestaCorrecta: 2
                },
                {
                    pregunta: '¿Cuál es mi película favorita?',
                    opciones: ['Frozen', 'La Bella y la Bestia', 'Enredados', 'La Sirenita'],
                    respuestaCorrecta: 2
                },
                {
                    pregunta: '¿Qué deporte practico?',
                    opciones: ['Natación', 'Danza', 'Tenis', 'Gimnasia'],
                    respuestaCorrecta: 1
                },
                {
                    pregunta: '¿Cuántos hermanos tengo?',
                    opciones: ['1', '2', '3', 'Soy hija única'],
                    respuestaCorrecta: 1
                }
            ]),

            // Confirmación
            confirmacionHabilitada: true,
            confirmacionIcono: '✉️',
            confirmacionTitulo: 'Confirmá tu asistencia',
            confirmacionFechaLimite: new Date(twoMonthsFromNow.getTime() - 7 * 24 * 60 * 60 * 1000),
            confirmacionWhatsapp: '+5491123456789',

            // Despedida
            despedidaHabilitada: true,
            despedidaIcono: '💕',
            despedidaTexto: '¡Te espero para celebrar juntos!',
            despedidaFoto: QUINCE_PHOTOS[0],
        },
    });
    console.log('✅ Quinceañera 1 creada: Sofía Martínez');

    // QUINCEAÑERA 2: Valentina Rodríguez
    const quince2 = await prisma.invitation.create({
        data: {
            userId: user.id,
            tipo: 'QUINCE_ANOS',
            estado: 'ACTIVA',
            slug: `valentina-rodriguez-xv-${Date.now()}`,
            nombreEvento: 'XV Años de Valentina',
            fechaEvento: new Date(twoMonthsFromNow.getTime() + 30 * 24 * 60 * 60 * 1000),
            nombreQuinceanera: 'Valentina Rodríguez',
            lugarNombre: 'Jardín El Rosedal',
            direccion: 'Calle de las Rosas 789, Ciudad',
            hora: '20:00',
            mapUrl: 'https://maps.google.com',
            templateId: 'quince-modern',

            temaColores: JSON.stringify({
                primaryColor: '#9b59b6',
                backgroundColor: '#ffffff',
                textDark: '#2c3e50',
                textLight: '#ffffff',
                fontFamily: 'playfair',
                layout: 'elegant'
            }),

            portadaHabilitada: true,
            portadaTitulo: 'Celebrando mis XV',
            portadaTextoBoton: 'Entrar',
            portadaImagenFondo: COVER_IMAGES[1],

            musicaHabilitada: true,
            musicaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            musicaAutoplay: true,
            musicaLoop: true,

            contadorHabilitado: true,
            seccionCuandoHabilitada: true,
            seccionDondeHabilitada: true,
            dresscodeHabilitado: true,
            dresscodeTipo: 'Elegante',
            dresscodeObservaciones: 'Evitar colores blanco y negro',

            galeriaPrincipalHabilitada: true,
            galeriaPrincipalFotos: JSON.stringify(QUINCE_PHOTOS),

            frasePersonalizadaHabilitada: true,
            frasePersonalizadaTexto: '"Cada momento es único, y este es especialmente mío"',

            albumCompartidoHabilitado: true,

            triviaHabilitada: true,
            triviaIcono: '🎮',
            triviaTitulo: '¿Me conocés bien?',
            triviaSubtitulo: 'Ponete a prueba con estas preguntas',
            triviaPreguntas: JSON.stringify([
                {
                    pregunta: '¿Cuál es mi comida favorita?',
                    opciones: ['Pizza', 'Sushi', 'Hamburguesas', 'Pasta'],
                    respuestaCorrecta: 1
                },
                {
                    pregunta: '¿Dónde me gustaría viajar?',
                    opciones: ['París', 'Tokio', 'Nueva York', 'Londres'],
                    respuestaCorrecta: 0
                },
                {
                    pregunta: '¿Cuál es mi serie favorita?',
                    opciones: ['Friends', 'Stranger Things', 'The Crown', 'Bridgerton'],
                    respuestaCorrecta: 3
                }
            ]),

            confirmacionHabilitada: true,
            despedidaHabilitada: true,
            despedidaTexto: '¡Gracias por acompañarme en este día tan especial!',
        },
    });
    console.log('✅ Quinceañera 2 creada: Valentina Rodríguez');

    // BODA 1: María y Juan
    const boda1 = await prisma.invitation.create({
        data: {
            userId: user.id,
            tipo: 'CASAMIENTO',
            estado: 'ACTIVA',
            slug: `maria-juan-boda-${Date.now()}`,
            nombreEvento: 'Nuestra Boda',
            fechaEvento: new Date(twoMonthsFromNow.getTime() + 60 * 24 * 60 * 60 * 1000),
            nombreNovia: 'María González',
            nombreNovio: 'Juan Pérez',
            lugarNombre: 'Estancia Los Ángeles',
            direccion: 'Ruta 5 Km 42, Buenos Aires',
            hora: '18:00',
            mapUrl: 'https://maps.google.com',
            templateId: 'wedding-classic',

            temaColores: JSON.stringify({
                primaryColor: '#d4af37',
                backgroundColor: '#fff8f0',
                textDark: '#2c1810',
                textLight: '#ffffff',
                fontFamily: 'cormorant',
                layout: 'classic'
            }),

            portadaHabilitada: true,
            portadaTitulo: 'Nos Casamos',
            portadaTextoBoton: 'Ver Invitación',
            portadaImagenFondo: COVER_IMAGES[2],

            musicaHabilitada: true,
            musicaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
            musicaAutoplay: true,
            musicaLoop: true,

            contadorHabilitado: true,
            seccionCuandoHabilitada: true,
            seccionDondeHabilitada: true,

            dresscodeHabilitado: true,
            dresscodeIcono: '🤵👰',
            dresscodeTitulo: 'Dress Code',
            dresscodeTipo: 'Formal / Elegante',
            dresscodeObservaciones: 'Colores: Dorado, champagne, azul marino',

            galeriaPrincipalHabilitada: true,
            galeriaPrincipalFotos: JSON.stringify(WEDDING_PHOTOS),

            frasePersonalizadaHabilitada: true,
            frasePersonalizadaTexto: '"El amor es paciente, el amor es bondadoso" - 1 Corintios 13:4',

            albumCompartidoHabilitado: true,
            albumCompartidoTitulo: 'Compartí tus fotos',
            albumCompartidoDescripcion: 'Ayudanos a guardar los mejores recuerdos de este día',

            regaloHabilitado: true,
            regaloTitulo: 'Mesa de Regalos',
            regaloMensaje: 'Lo más importante para nosotros es que nos acompañes, pero si querés hacernos un regalo:',
            regaloMostrarDatos: true,
            regaloAlias: 'maria.juan.boda',
            regaloCvu: '0000003100010000000002',

            triviaHabilitada: true,
            triviaIcono: '❤️',
            triviaTitulo: '¿Qué tanto conocés nuestra historia?',
            triviaSubtitulo: 'Descubrí cuánto sabés sobre nosotros',
            triviaPreguntas: JSON.stringify([
                {
                    pregunta: '¿Dónde nos conocimos?',
                    opciones: ['Universidad', 'Trabajo', 'Viaje', 'Amigos en común'],
                    respuestaCorrecta: 0
                },
                {
                    pregunta: '¿Cuántos años llevamos juntos?',
                    opciones: ['3 años', '5 años', '7 años', '10 años'],
                    respuestaCorrecta: 1
                },
                {
                    pregunta: '¿Cuál fue nuestro primer viaje juntos?',
                    opciones: ['Mendoza', 'Bariloche', 'Mar del Plata', 'Córdoba'],
                    respuestaCorrecta: 1
                },
                {
                    pregunta: '¿Dónde fue la pedida de mano?',
                    opciones: ['En casa', 'En la playa', 'En un restaurante', 'En París'],
                    respuestaCorrecta: 3
                },
                {
                    pregunta: '¿Cuál es nuestro restaurante favorito?',
                    opciones: ['La Parrilla', 'El Rincón Italiano', 'Sushi House', 'El Fogón'],
                    respuestaCorrecta: 1
                }
            ]),

            confirmacionHabilitada: true,
            confirmacionTitulo: 'Confirmación de Asistencia',
            confirmacionFechaLimite: new Date(twoMonthsFromNow.getTime() + 45 * 24 * 60 * 60 * 1000),

            despedidaHabilitada: true,
            despedidaTexto: '¡Nos vemos en nuestra boda!',
        },
    });
    console.log('✅ Boda 1 creada: María & Juan');

    // BODA 2: Laura y Carlos
    const boda2 = await prisma.invitation.create({
        data: {
            userId: user.id,
            tipo: 'CASAMIENTO',
            estado: 'ACTIVA',
            slug: `laura-carlos-boda-${Date.now()}`,
            nombreEvento: 'Celebremos nuestro amor',
            fechaEvento: new Date(twoMonthsFromNow.getTime() + 90 * 24 * 60 * 60 * 1000),
            nombreNovia: 'Laura Fernández',
            nombreNovio: 'Carlos Ramírez',
            lugarNombre: 'Viñedos del Valle',
            direccion: 'Camino del Vino, Mendoza',
            hora: '19:30',
            mapUrl: 'https://maps.google.com',
            templateId: 'wedding-rustic',

            temaColores: JSON.stringify({
                primaryColor: '#8b4513',
                backgroundColor: '#faf8f3',
                textDark: '#3e2723',
                textLight: '#ffffff',
                fontFamily: 'lora',
                layout: 'rustic'
            }),

            portadaHabilitada: true,
            portadaTitulo: '¡Nos Casamos!',
            portadaTextoBoton: 'Abrir',
            portadaImagenFondo: WEDDING_PHOTOS[0],

            musicaHabilitada: true,
            musicaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
            musicaAutoplay: false,
            musicaLoop: true,

            contadorHabilitado: true,
            seccionCuandoHabilitada: true,
            seccionDondeHabilitada: true,

            dresscodeHabilitado: true,
            dresscodeTitulo: 'Vestimenta',
            dresscodeTipo: 'Semi-formal',
            dresscodeObservaciones: 'Sugerimos ropa cómoda para jardín. Evitar tacos aguja.',

            galeriaPrincipalHabilitada: true,
            galeriaPrincipalFotos: JSON.stringify(WEDDING_PHOTOS),

            frasePersonalizadaHabilitada: true,
            frasePersonalizadaTexto: '"Donde hay amor, hay vida" - Mahatma Gandhi',

            albumCompartidoHabilitado: true,
            regaloHabilitado: true,
            regaloMensaje: 'Su presencia es nuestro mejor regalo',

            triviaHabilitada: true,
            triviaIcono: '💑',
            triviaTitulo: 'Quiz de la Pareja',
            triviaSubtitulo: '¿Cuánto sabés de Laura y Carlos?',
            triviaPreguntas: JSON.stringify([
                {
                    pregunta: '¿Cuál es su canción favorita?',
                    opciones: ['Perfect - Ed Sheeran', 'All of Me - John Legend', 'Thinking Out Loud', 'A Thousand Years'],
                    respuestaCorrecta: 1
                },
                {
                    pregunta: '¿Qué mascota tienen?',
                    opciones: ['Perro', 'Gato', 'Ambos', 'No tienen'],
                    respuestaCorrecta: 0
                },
                {
                    pregunta: '¿En qué año se comprometieron?',
                    opciones: ['2022', '2023', '2024', '2025'],
                    respuestaCorrecta: 2
                }
            ]),

            confirmacionHabilitada: true,
            despedidaHabilitada: true,
            despedidaTexto: '¡Los esperamos con todo el amor!',
        },
    });
    console.log('✅ Boda 2 creada: Laura & Carlos');

    // Crear álbumes para cada invitación
    await prisma.album.createMany({
        data: [
            { invitationId: quince1.id, permitirSubida: true, moderacion: false },
            { invitationId: quince2.id, permitirSubida: true, moderacion: false },
            { invitationId: boda1.id, permitirSubida: true, moderacion: false },
            { invitationId: boda2.id, permitirSubida: true, moderacion: false },
        ],
    });
    console.log('✅ Álbumes creados');

    console.log('\n🎉 ¡Seed completado exitosamente!');
    console.log('\n📋 Invitaciones creadas:');
    console.log(`   - ${quince1.slug}`);
    console.log(`   - ${quince2.slug}`);
    console.log(`   - ${boda1.slug}`);
    console.log(`   - ${boda2.slug}`);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
