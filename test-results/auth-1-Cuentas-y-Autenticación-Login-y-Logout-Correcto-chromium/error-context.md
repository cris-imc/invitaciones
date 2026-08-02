# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> 1. Cuentas y Autenticación >> Login y Logout Correcto
- Location: e2e\auth.spec.ts:48:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByPlaceholder(/contraseña|password/i)

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - link "Volver al inicio" [ref=e4] [cursor=pointer]:
      - /url: /
    - generic [ref=e8]:
      - generic [ref=e9]:
        - heading "Iniciar Sesión" [level=1] [ref=e10]
        - paragraph [ref=e11]: Accede a tu cuenta de invitaciones digitales
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: Email
          - textbox "Email" [active] [ref=e18]:
            - /placeholder: tu@email.com
            - text: qa_1785663098202@test.com
        - generic [ref=e19]:
          - generic [ref=e20]: Contraseña
          - textbox "Contraseña" [ref=e24]:
            - /placeholder: ••••••••
        - button "Iniciar Sesión" [ref=e25]
      - generic [ref=e26]: o
      - paragraph [ref=e31]:
        - text: ¿No tienes cuenta?
        - link "Regístrate gratis" [ref=e32] [cursor=pointer]:
          - /url: /register
  - button "Open Next.js Dev Tools" [ref=e38] [cursor=pointer]
  - alert [ref=e42]
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
  45 |     await page.waitForURL(/.*(\/dashboard|\/login)/);
  46 |   });
  47 | 
  48 |   test('Login y Logout Correcto', async ({ page }) => {
  49 |     await page.goto('/login');
  50 |     
  51 |     await page.getByPlaceholder(/correo|email/i).fill(testEmail);
> 52 |     await page.getByPlaceholder(/contraseña|password/i).fill(testPassword);
     |                                                         ^ Error: locator.fill: Test timeout of 30000ms exceeded.
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