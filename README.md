# Plataforma de Invitaciones Digitales

Una plataforma completa para crear y gestionar invitaciones digitales personalizadas para eventos.

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Datos**: PostgreSQL
- **Estado**: Zustand
- **Validación**: Zod + React Hook Form

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar base de datos
# 1. Crea una base de datos PostgreSQL
# 2. Copia .env.example a .env y configura DATABASE_URL

# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma db push

# (Opcional) Cargar datos de ejemplo
npx prisma db seed
```

## 🏃 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir en http://localhost:3000
```

## 📝 Rutas Principales

- `/` - Landing page
- `/dashboard` - Dashboard principal
- `/dashboard/invitaciones` - Lista de invitaciones
- `/dashboard/invitaciones/crear` - Wizard de creación
- `/i/[slug]` - Vista pública de invitación

## 🗄️ Base de Datos

### Configurar PostgreSQL Local

Si no tienes PostgreSQL instalado, puedes usar Docker:

```bash
docker run --name invitaciones-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=invitaciones -p 5432:5432 -d postgres
```

Luego configura tu `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/invitaciones?schema=public"
```

### Comandos Útiles de Prisma

```bash
# Ver base de datos en el navegador
npx prisma studio

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Resetear base de datos (¡CUIDADO!)
npx prisma migrate reset

# Generar cliente después de cambios en schema
npx prisma generate
```

## ✨ Funcionalidades Implementadas

### MVP
- ✅ Landing page con diseño moderno
- ✅ Dashboard con métricas
- ✅ Wizard de creación de invitaciones (5 pasos)
- ✅ Vista pública de invitación
- ✅ Cuenta regresiva en tiempo real
- ✅ Formulario RSVP con validación
- ✅ Galería de fotos colaborativa
- ✅ Persistencia en base de datos
- ✅ Diseño responsive mobile-first

### Próximas Features
- ⏳ Autenticación (NextAuth)
- ⏳ Upload de fotos a S3/Cloudflare R2
- ⏳ Música de fondo personalizada
- ⏳ Más plantillas visuales
- ⏳ Panel CRM para admin
- ⏳ QR codes únicos por invitado
- ⏳ Recordatorios automáticos

## 🎨 Personalización

Las invitaciones soportan:
- Colores personalizados
- Diferentes tipos de eventos (Casamiento, 15 Años, Cumpleaños)
- Música de fondo
- Fotos personalizadas

## 📱 Ejemplo de Uso

1. Crear cuenta (próximamente con auth)
2. Ir a "Nueva Invitación"
3. Completar el wizard paso a paso
4. Compartir el link generado: `/i/tu-evento-123`
5. Los invitados pueden confirmar asistencia y subir fotos

## 🔧 Configuración Avanzada

### Variables de Entorno

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."                 # Obligatoria en producción
NEXTAUTH_URL="http://localhost:3000"

SEED_ADMIN_PASSWORD="..."         # Clave del Super Usuario (ver abajo)
SEED_DEMO="1"                     # Opcional: fuerza los datos de ejemplo
```

#### `SEED_ADMIN_PASSWORD`

La clave del Super Usuario (`admin@altainvitacion.com`) sale de acá y nunca
del código: este repositorio es público, así que cualquier clave escrita en
`prisma/seed.ts` queda a la vista.

El seed corre en cada arranque, y se comporta así:

| Situación | Qué hace |
|---|---|
| La variable está puesta | Aplica esa clave (sirve para rotarla) |
| No está puesta y la cuenta existe | **No toca la clave** — se puede cambiar desde la app sin que el próximo deploy la revierta |
| No está puesta y hay que crear la cuenta | Corta con un error claro, en vez de inventar una clave débil |

#### Datos de ejemplo

El usuario `test@example.com` y las dos invitaciones de muestra son sólo para
desarrollo: en producción no se crean. `SEED_DEMO=1` los fuerza si hacen falta.

## 📄 Licencia

MIT
