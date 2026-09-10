import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const esProduccion = process.env.NODE_ENV === 'production'

/**
 * La clave del Super Usuario sale de SEED_ADMIN_PASSWORD, nunca del código:
 * este archivo está en el repo y el repo es público, así que cualquier clave
 * escrita acá queda a la vista de todo el mundo.
 *
 * - Si la variable está puesta, se aplica (al crear la cuenta y también al
 *   actualizarla, para poder rotar la clave desde Railway).
 * - Si NO está puesta, la clave existente NO se toca. Antes el seed la
 *   reescribía en cada arranque, así que cambiarla desde la app no servía de
 *   nada: el próximo deploy la volvía atrás.
 * - Si no está puesta y encima hay que CREAR la cuenta, se corta con un error
 *   claro en vez de inventar una clave débil.
 */
function resolverClaveAdmin(): { clave: string; origen: string } | null {
  const desdeEnv = process.env.SEED_ADMIN_PASSWORD
  if (desdeEnv) return { clave: desdeEnv, origen: 'SEED_ADMIN_PASSWORD' }
  if (!esProduccion) return { clave: 'admin-local-dev', origen: 'valor por defecto de desarrollo' }
  return null
}

async function main() {
  // Super Usuario: reemplaza al admin@invitaciones.com original. Busca por
  // el email VIEJO primero para renombrar esa fila en su lugar (preserva su
  // id y todo lo que le pertenece -- invitaciones, sesiones, etc.) en vez de
  // crear una fila nueva y dejar la vieja huerfana en bases ya existentes
  // (producción). Si no existe (base nueva), la crea directo con el email
  // nuevo.
  const claveAdmin = resolverClaveAdmin()
  const suPassword = claveAdmin ? await bcrypt.hash(claveAdmin.clave, 10) : null

  // Se mira PRIMERO el email nuevo. Si ya existe esa cuenta, no hay nada que
  // renombrar: intentar mover igual la vieja al email nuevo choca contra la
  // restricción de unicidad y, como el arranque encadena con &&, se lleva
  // puesto el deploy entero. Sólo se renombra la vieja si la nueva no está.
  const actual = await prisma.user.findUnique({ where: { email: 'admin@altainvitacion.com' } })
  const legacyAdmin = actual
    ? null
    : await prisma.user.findUnique({ where: { email: 'admin@invitaciones.com' } })
  const existente = actual ?? legacyAdmin

  if (!existente && !suPassword) {
    throw new Error(
      'Hay que crear el Super Usuario pero falta SEED_ADMIN_PASSWORD. ' +
      'Definila como variable de entorno (en Railway: Variables) y volvé a desplegar.'
    )
  }

  // La clave sólo se toca si vino una nueva por variable de entorno.
  const datosClave = suPassword ? { password: suPassword } : {}

  const adminUser = existente
    ? await prisma.user.update({
        where: { id: existente.id },
        data: {
          email: 'admin@altainvitacion.com',
          name: 'Super Admin',
          role: 'SUPERUSER',
          planTier: 'ADMIN',
          subscriptionStatus: 'ACTIVE',
          ...datosClave,
        },
      })
    : await prisma.user.create({
        data: {
          email: 'admin@altainvitacion.com',
          name: 'Super Admin',
          password: suPassword!,
          role: 'SUPERUSER',
          planTier: 'ADMIN',
          subscriptionStatus: 'ACTIVE',
        },
      })

  console.log(
    '✅ Super Usuario listo:', adminUser.email,
    claveAdmin ? `(clave tomada de ${claveAdmin.origen})` : '(clave sin cambios)'
  )

  // De acá en adelante son datos de demostración: un usuario de prueba con
  // clave conocida (test@example.com / test123, también visible en el repo)
  // y dos invitaciones de ejemplo. Se venían creando en la base REAL en cada
  // arranque. Ahora quedan sólo para desarrollo; SEED_DEMO=1 los fuerza.
  if (esProduccion && process.env.SEED_DEMO !== '1') {
    console.log('ℹ️  Datos de demostración omitidos (producción)')
    return
  }

  // Crear usuario de prueba FREE
  const testPassword = await bcrypt.hash('test123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: 'mock-user-id',
      email: 'test@example.com',
      name: 'Usuario de Prueba',
      password: testPassword,
      role: 'CLIENT',
      planTier: 'FREE',
      subscriptionStatus: 'TRIAL',
    },
  })

  console.log('✅ Usuario de prueba creado:', user.email)

  // Invitación 1: 15 Años Completa (similar a Paulina) - ADMIN USER
  const invitation15 = await prisma.invitation.upsert({
    where: { slug: 'mis-15-paulina' },
    update: {},
    create: {
      userId: adminUser.id,
      planTier: 'ADMIN',
      tipo: 'QUINCE_ANOS',
      estado: 'ACTIVA',
      slug: 'mis-15-paulina',
      nombreEvento: 'Mis 15',
      fechaEvento: new Date('2026-09-26T20:00:00'),
      nombreQuinceanera: 'Paulina',
      hora: '20:00',
      lugarNombre: "JANO'S PUERTO MADERO",
      direccion: 'Av. Alicia Moreau de Justo 1000, Puerto Madero, Buenos Aires',
      mapUrl: 'https://maps.google.com/?q=Puerto+Madero+Buenos+Aires',
      templateId: 'quinceañera-elegante',
      temaColores: JSON.stringify({
        colorPrimario: '#c7757f',
        colorSecundario: '#ffffff',
        tema: 'elegante',
      }),
      
      // Portada
      portadaHabilitada: true,
      portadaTitulo: 'MIS 15',
      portadaTextoBoton: 'HAZ CLIC PARA INGRESAR',
      portadaImagenFondo: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
      
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
      seccionCuandoTitulo: '¿CUÁNDO?',
      
      // Sección Dónde
      seccionDondeHabilitada: true,
      seccionDondeIcono: '📍',
      seccionDondeTitulo: '¿DÓNDE?',
      lugarBotonTexto: 'COMO LLEGAR',
      
      // Dress Code
      dresscodeHabilitado: true,
      dresscodeIcono: '👗',
      dresscodeTitulo: 'DRESS CODE',
      dresscodeTipo: 'FORMAL',
      dresscodeObservaciones: 'El color rosa se reserva para la quinceañera',
      
      // Galería Principal
      galeriaPrincipalHabilitada: true,
      galeriaPrincipalFotos: JSON.stringify([
        'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800',
        'https://images.unsplash.com/photo-1529634806980-85d3fbd75e6b?w=800',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
      ]),
      galeriaPrincipalEstilo: 'carrusel',
      galeriaPrincipalAutoplay: true,
      
      // Frase Personalizada
      frasePersonalizadaHabilitada: true,
      frasePersonalizadaTexto: 'HAY MOMENTOS QUE NO SE PUEDEN BORRAR, SON MÁGICOS Y PERMANECEN PARA SIEMPRE EN NUESTROS CORAZONES',
      frasePersonalizadaEstilo: 'elegante',
      
      // Álbum Compartido
      albumCompartidoHabilitado: true,
      albumCompartidoIcono: '📷',
      albumCompartidoTitulo: 'QUIERO VER TUS FOTOS',
      albumCompartidoDescripcion: 'PUEDEN SUBIR TODAS SUS FOTOS DE LA FIESTA EN ESTE ÁLBUM',
      albumCompartidoBotonTexto: 'IR AL ÁLBUM',
      
      // Regalo
      regaloHabilitado: true,
      regaloIcono: '🎁',
      regaloTitulo: 'REGALO',
      regaloMensaje: 'NADA ES MÁS IMPORTANTE QUE TU PRESENCIA, PERO SI DESEAS HACERME UN REGALO, AQUÍ TE DEJO MIS DATOS',
      regaloMostrarDatos: true,
      regaloAlias: 'PAULINA.15',
      regaloCvu: '0000003100010000000001',
      regaloCbu: '0000003100010000000001',
      
      // Galería Secundaria
      galeriaSecundariaHabilitada: true,
      galeriaSecundariaFotos: JSON.stringify([
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
        'https://images.unsplash.com/photo-1464047736614-af63643285bf?w=800',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
      ]),
      
      // Mensaje Final
      mensajeFinalHabilitado: true,
      mensajeFinalTexto: 'Prepárate para una NOCHE ¡inolvidable!',
      
      // Trivia
      triviaHabilitada: true,
      triviaIcono: '🎮',
      triviaTitulo: '¿CUÁNTO ME CONOCES?',
      triviaSubtitulo: 'JUGUEMOS UN POCO',
      triviaPreguntas: JSON.stringify([
        {
          pregunta: '¿Cuál es mi color favorito?',
          opciones: ['Rosa', 'Azul', 'Verde', 'Amarillo'],
          respuestaCorrect: 0
        },
        {
          pregunta: '¿Cuál es mi comida favorita?',
          opciones: ['Pizza', 'Sushi', 'Hamburguesa', 'Pasta'],
          respuestaCorrecta: 1
        },
        {
          pregunta: '¿Dónde nací?',
          opciones: ['Buenos Aires', 'Córdoba', 'Mendoza', 'Rosario'],
          respuestaCorrecta: 0
        },
      ]),
      triviaBotonTexto: 'INICIAR TRIVIA',
      
      // Confirmación
      confirmacionHabilitada: true,
      confirmacionIcono: '✉️',
      confirmacionTitulo: 'CONFIRMÁ TU ASISTENCIA',
      confirmacionFechaLimite: new Date('2026-08-28T23:59:59'),
      confirmacionWhatsapp: '+5491112345678',
      confirmacionEmail: 'paulina15@example.com',
      
      // Despedida
      despedidaHabilitada: true,
      despedidaIcono: '💕',
      despedidaTexto: 'TE ESPERO',
      despedidaFoto: 'https://images.unsplash.com/photo-1529634806980-85d3fbd75e6b?w=600',
      
      album: {
        create: {
          permitirSubida: true,
          moderacion: false,
        },
      },
    },
    include: {
      album: true,
    },
  })

  console.log('✅ Invitación 15 años creada:', invitation15.nombreEvento)

  // Invitación 2: Casamiento Elegante
  const invitationBoda = await prisma.invitation.upsert({
    where: { slug: 'boda-ana-juan' },
    update: {},
    create: {
      userId: user.id,
      tipo: 'CASAMIENTO',
      estado: 'ACTIVA',
      slug: 'boda-ana-juan',
      nombreEvento: 'Nuestra Boda',
      fechaEvento: new Date('2026-03-15T18:00:00'),
      nombreNovio: 'Juan',
      nombreNovia: 'Ana',
      hora: '18:00',
      lugarNombre: 'Estancia La Candelaria',
      direccion: 'Ruta 6 Km 42, Cañuelas, Buenos Aires',
      mapUrl: 'https://maps.google.com/?q=Estancia+La+Candelaria',
      templateId: 'boda-clasica',
      temaColores: JSON.stringify({
        colorPrimario: '#2563eb',
        colorSecundario: '#ffffff',
        tema: 'clasico',
      }),
      
      // Portada
      portadaHabilitada: true,
      portadaTitulo: 'NOS CASAMOS',
      portadaTextoBoton: 'ABRIR INVITACIÓN',
      portadaImagenFondo: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200',
      
      // Música
      musicaHabilitada: true,
      musicaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      musicaAutoplay: true,
      musicaLoop: true,
      
      // Contador
      contadorHabilitado: true,
      
      // Sección Cuándo
      seccionCuandoHabilitada: true,
      seccionCuandoIcono: '📅',
      seccionCuandoTitulo: '¿CUÁNDO?',
      
      // Sección Dónde
      seccionDondeHabilitada: true,
      seccionDondeIcono: '📍',
      seccionDondeTitulo: 'CEREMONIA Y FIESTA',
      lugarBotonTexto: 'VER EN MAPA',
      
      // Dress Code
      dresscodeHabilitado: true,
      dresscodeIcono: '👔',
      dresscodeTitulo: 'DRESS CODE',
      dresscodeTipo: 'ELEGANTE',
      dresscodeObservaciones: 'Se sugiere traje y vestido de gala',
      
      // Galería Principal
      galeriaPrincipalHabilitada: true,
      galeriaPrincipalFotos: JSON.stringify([
        'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
      ]),
      galeriaPrincipalEstilo: 'grid',
      galeriaPrincipalAutoplay: false,
      
      // Frase Personalizada
      frasePersonalizadaHabilitada: true,
      frasePersonalizadaTexto: 'El amor no se mira, se siente, y aún más cuando ella está junto a ti',
      frasePersonalizadaEstilo: 'romantico',
      
      // Álbum Compartido
      albumCompartidoHabilitado: true,
      albumCompartidoIcono: '📸',
      albumCompartidoTitulo: 'COMPARTE TUS FOTOS',
      albumCompartidoDescripcion: 'Queremos ver la boda desde tu perspectiva',
      albumCompartidoBotonTexto: 'SUBIR FOTOS',
      
      // Regalo
      regaloHabilitado: true,
      regaloIcono: '💝',
      regaloTitulo: 'MESA DE REGALOS',
      regaloMensaje: 'Tu presencia es nuestro mejor regalo, pero si deseas obsequiarnos algo más, puedes hacerlo aquí',
      regaloMostrarDatos: true,
      regaloAlias: 'BODA.ANAJUAN',
      regaloCvu: '0000003100010000000002',
      
      // Confirmación
      confirmacionHabilitada: true,
      confirmacionIcono: '💌',
      confirmacionTitulo: 'CONFIRMA TU ASISTENCIA',
      confirmacionFechaLimite: new Date('2026-02-15T23:59:59'),
      confirmacionWhatsapp: '+5491187654321',
      confirmacionEmail: 'bodaanajuan@example.com',
      
      // Despedida
      despedidaHabilitada: true,
      despedidaIcono: '💑',
      despedidaTexto: 'NOS VEMOS EN EL ALTAR',
      despedidaFoto: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600',
      
      album: {
        create: {
          permitirSubida: true,
          moderacion: false,
        },
      },
    },
  })

  console.log('✅ Invitación de boda creada:', invitationBoda.nombreEvento)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
