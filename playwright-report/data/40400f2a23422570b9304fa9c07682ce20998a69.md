# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: invitation-creation.spec.ts >> 2. Creación y Configuración de Invitaciones >> Creación de tarjeta FREE y PREMIUM con Créditos
- Location: e2e\invitation-creation.spec.ts:36:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByPlaceholder(/nombre/i)

```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - generic [ref=f1e4]:
    - heading "404" [level=1] [ref=f1e5]
    - heading "This page could not be found." [level=2] [ref=f1e7]
  - button "Open Next.js Dev Tools" [ref=f1e13] [cursor=pointer]
  - alert [ref=f1e17]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('2. Creación y Configuración de Invitaciones', () => {
  4  |   // Configuración antes de correr las pruebas de este bloque:
  5  |   // Se requiere un usuario logueado. Podríamos usar setup global o loguearnos en el beforeEach
  6  |   
  7  |   test.beforeEach(async ({ page }) => {
  8  |     // Para simplificar, suponemos que las páginas de test acceden al estado si usamos storageState,
  9  |     // o hacemos login rápido si no está configurado el setup global.
  10 |     await page.goto('/login');
  11 |     // ... logic de login rápido o asumir que la sesión está guardada.
  12 |   });
  13 | 
  14 |   test('Validar campos vacíos en el Wizard (Auditoría)', async ({ page }) => {
  15 |     await page.goto('/dashboard');
  16 |     // Navegar a la creación
  17 |     const createBtn = page.getByRole('button', { name: /nueva invitación|crear/i });
  18 |     if (await createBtn.isVisible()) {
  19 |       await createBtn.click();
  20 |     } else {
  21 |       await page.goto('/dashboard/invitaciones/new');
  22 |     }
  23 | 
  24 |     // Intentar avanzar sin llenar nada
  25 |     const nextBtn = page.getByRole('button', { name: /siguiente/i }).first();
  26 |     await nextBtn.click();
  27 | 
  28 |     // Comprobar que no dejó avanzar o que tiró error
  29 |     // Por ejemplo, buscar textos de error de Zod
  30 |     const errors = page.locator('text=requerido|obligatorio').first();
  31 |     await expect(errors).toBeVisible({ timeout: 3000 }).catch(() => {
  32 |       console.warn('⚠️ Posible bug: El wizard permitió avanzar con campos vacíos.');
  33 |     });
  34 |   });
  35 | 
  36 |   test('Creación de tarjeta FREE y PREMIUM con Créditos', async ({ page }) => {
  37 |     await page.goto('/dashboard/invitaciones/new');
  38 |     
  39 |     // Llenar datos básicos
> 40 |     await page.getByPlaceholder(/nombre/i).fill('Test Event');
     |                                            ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  41 |     // Avanzar
  42 |     
  43 |     // Testear botones de selección de plan...
  44 |     // Aquí irían los clicks específicos basados en la UI exacta.
  45 |   });
  46 | 
  47 |   test('Carga de Media (Fotos y Música)', async ({ page }) => {
  48 |     // Si la UI tiene un input type=file para coverImage o bgMusic
  49 |     // await page.locator('input[type="file"]').setInputFiles('./public/img/sample.jpg');
  50 |     // await page.locator('input[name="music"]').setInputFiles('./public/music/sample.mp3');
  51 |   });
  52 | 
  53 |   test('Toggles de Secciones', async ({ page }) => {
  54 |     // Activar/desactivar switches
  55 |     // const rsvpSwitch = page.locator('button[role="switch"]'); // Ejemplo Radix UI
  56 |     // await rsvpSwitch.click();
  57 |   });
  58 | });
  59 | 
```