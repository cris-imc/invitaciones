# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> 1. Cuentas y Autenticación >> Registro y Validaciones
- Location: e2e\auth.spec.ts:13:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=f1e1]:
  - generic [ref=f1e3]:
    - link "Volver al inicio" [ref=f1e4] [cursor=pointer]:
      - /url: /
    - generic [ref=f1e7]:
      - generic [ref=f1e8]:
        - heading "Crea tu cuenta" [level=1] [ref=f1e9]
        - paragraph [ref=f1e10]: Comienza a crear invitaciones digitales increíbles
      - generic [ref=f1e11]:
        - generic [ref=f1e12]:
          - heading "Elige tu plan" [level=2] [ref=f1e13]
          - generic [ref=f1e14]:
            - button "Gratis $ 0 Hasta 20 invitados Plantilla 100% personalizada Gestión de invitados y pagos Cuenta regresiva Album de fotos ✕ Sin musica de fondo ✕ Sin LIVE (fotos en vivo) ✕ Sin Trivia ✕ Sin sugerencias DJ" [ref=f1e15]:
              - generic [ref=f1e17]:
                - heading "Gratis" [level=3] [ref=f1e18]
                - paragraph [ref=f1e19]: $ 0
              - list [ref=f1e23]:
                - listitem [ref=f1e24]:
                  - generic [ref=f1e27]: Hasta 20 invitados
                - listitem [ref=f1e28]:
                  - generic [ref=f1e31]: Plantilla 100% personalizada
                - listitem [ref=f1e32]:
                  - generic [ref=f1e35]: Gestión de invitados y pagos
                - listitem [ref=f1e36]:
                  - generic [ref=f1e39]: Cuenta regresiva
                - listitem [ref=f1e40]:
                  - generic [ref=f1e43]: Album de fotos
                - listitem [ref=f1e44]:
                  - generic [ref=f1e45]: ✕
                  - generic [ref=f1e46]: Sin musica de fondo
                - listitem [ref=f1e47]:
                  - generic [ref=f1e48]: ✕
                  - generic [ref=f1e49]: Sin LIVE (fotos en vivo)
                - listitem [ref=f1e50]:
                  - generic [ref=f1e51]: ✕
                  - generic [ref=f1e52]: Sin Trivia
                - listitem [ref=f1e53]:
                  - generic [ref=f1e54]: ✕
                  - generic [ref=f1e55]: Sin sugerencias DJ
            - button "Más Popular Premium $ 50.000 Invitados ilimitados Plantilla 100% personalizada Gestión de invitados y pagos Cuenta regresiva Album de fotos Con musica de fondo Con LIVE (fotos en vivo) Con Trivia Con sugerencias DJ ⚠️ El pago se habilitará próximamente con Mercado Pago" [ref=f1e56]:
              - generic [ref=f1e57]: Más Popular
              - generic [ref=f1e59]:
                - heading "Premium" [level=3] [ref=f1e60]
                - paragraph [ref=f1e61]: $ 50.000
              - list [ref=f1e62]:
                - listitem [ref=f1e63]:
                  - generic [ref=f1e66]: Invitados ilimitados
                - listitem [ref=f1e67]:
                  - generic [ref=f1e70]: Plantilla 100% personalizada
                - listitem [ref=f1e71]:
                  - generic [ref=f1e74]: Gestión de invitados y pagos
                - listitem [ref=f1e75]:
                  - generic [ref=f1e78]: Cuenta regresiva
                - listitem [ref=f1e79]:
                  - generic [ref=f1e82]: Album de fotos
                - listitem [ref=f1e83]:
                  - generic [ref=f1e86]: Con musica de fondo
                - listitem [ref=f1e87]:
                  - generic [ref=f1e90]: Con LIVE (fotos en vivo)
                - listitem [ref=f1e91]:
                  - generic [ref=f1e94]: Con Trivia
                - listitem [ref=f1e95]:
                  - generic [ref=f1e98]: Con sugerencias DJ
              - generic [ref=f1e99]: ⚠️ El pago se habilitará próximamente con Mercado Pago
        - generic [ref=f1e100]:
          - heading "Datos de tu cuenta" [level=2] [ref=f1e101]
          - generic [ref=f1e102]:
            - generic [ref=f1e103]:
              - generic [ref=f1e104]: Nombre completo
              - textbox "Nombre completo" [active] [ref=f1e108]:
                - /placeholder: Juan Pérez
            - generic [ref=f1e109]:
              - generic [ref=f1e110]: Email
              - textbox "Email" [ref=f1e114]:
                - /placeholder: tu@email.com
                - text: qa_1785663098222@test.com
            - generic [ref=f1e115]:
              - generic [ref=f1e116]: Contraseña
              - textbox "Contraseña" [ref=f1e120]:
                - /placeholder: Mínimo 6 caracteres
            - generic [ref=f1e121]:
              - generic [ref=f1e122]: Confirmar contraseña
              - textbox "Confirmar contraseña" [ref=f1e126]:
                - /placeholder: Repite tu contraseña
                - text: Password123!
            - button "Crear Cuenta Gratis" [ref=f1e127] [cursor=pointer]
            - paragraph [ref=f1e129]:
              - text: ¿Ya tienes cuenta?
              - link "Inicia sesión" [ref=f1e130] [cursor=pointer]:
                - /url: /login
  - button "Open Next.js Dev Tools" [ref=f1e136] [cursor=pointer]
  - alert [ref=f1e140]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('1. Cuentas y Autenticación', () => {
  4  |   const testEmail = `qa_${Date.now()}@test.com`;
  5  |   const testPassword = 'Password123!';
  6  | 
  7  |   test('Seguridad: Redirección al Dashboard sin estar autenticado', async ({ page }) => {
  8  |     await page.goto('/dashboard');
  9  |     // Si no está autenticado, NextAuth suele redirigir a /login
  10 |     await expect(page).toHaveURL(/.*\/login/);
  11 |   });
  12 | 
  13 |   test('Registro y Validaciones', async ({ page }) => {
  14 |     await page.goto('/login');
  15 |     
  16 |     // Asumiendo que hay un link o botón para registrarse (cambiar selector según el diseño real)
  17 |     const registerLink = page.getByText(/crear cuenta|registrarse/i);
  18 |     if (await registerLink.isVisible()) {
  19 |       await registerLink.click();
  20 |     } else {
  21 |       await page.goto('/register');
  22 |     }
  23 | 
  24 |     // Probar registro inválido
  25 |     await page.getByPlaceholder(/correo|email/i).fill('invalid-email');
  26 |     await page.getByPlaceholder(/contraseña|password/i).fill('123');
  27 |     await page.getByRole('button', { name: /registrarse|crear/i }).click();
  28 | 
  29 |     // Debería mostrar errores de validación de Zod
  30 |     await expect(page.locator('text=correo electrónico válido|email inválido').first()).toBeVisible({ timeout: 5000 }).catch(() => null);
  31 | 
  32 |     // Registro Válido
  33 |     await page.getByPlaceholder(/correo|email/i).fill(testEmail);
  34 |     await page.getByPlaceholder(/contraseña|password/i).fill(testPassword);
  35 |     
  36 |     // Si hay un campo de nombre
  37 |     const nameInput = page.getByPlaceholder(/nombre/i);
  38 |     if (await nameInput.isVisible()) {
  39 |       await nameInput.fill('QA Tester');
  40 |     }
  41 | 
  42 |     await page.getByRole('button', { name: /registrarse|crear/i }).click();
  43 | 
  44 |     // Esperar redirección al login o dashboard
> 45 |     await page.waitForURL(/.*(\/dashboard|\/login)/);
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  46 |   });
  47 | 
  48 |   test('Login y Logout Correcto', async ({ page }) => {
  49 |     await page.goto('/login');
  50 |     
  51 |     await page.getByPlaceholder(/correo|email/i).fill(testEmail);
  52 |     await page.getByPlaceholder(/contraseña|password/i).fill(testPassword);
  53 |     await page.getByRole('button', { name: /ingresar|login/i }).click();
  54 | 
  55 |     // Verificar que entró al dashboard
  56 |     await expect(page).toHaveURL(/.*\/dashboard/);
  57 |     
  58 |     // Probar Cerrar Sesión
  59 |     const userMenu = page.getByRole('button', { name: /perfil|usuario|menu/i }).first();
  60 |     if (await userMenu.isVisible()) {
  61 |       await userMenu.click();
  62 |     }
  63 |     await page.getByText(/cerrar sesión|salir|logout/i).click();
  64 | 
  65 |     // Debería redirigir al inicio o login
  66 |     await expect(page).toHaveURL(/.*(\/login|\/)/);
  67 |   });
  68 | });
  69 | 
```