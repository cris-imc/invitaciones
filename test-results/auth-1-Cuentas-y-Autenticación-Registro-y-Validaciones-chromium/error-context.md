# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> 1. Cuentas y Autenticación >> Registro y Validaciones
- Location: e2e/auth.spec.ts:13:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByPlaceholder(/correo|email/i)

```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - generic [ref=f1e3]:
    - link "Volver al inicio" [ref=f1e4] [cursor=pointer]:
      - /url: /
    - generic [ref=f1e7]:
      - generic [ref=f1e8]:
        - heading "Crea tu cuenta" [level=1] [ref=f1e9]
        - paragraph [ref=f1e10]: Elegí la invitación que mejor se adapta a tu evento
      - generic [ref=f1e11]:
        - generic [ref=f1e12]:
          - button "Gratis $ 0 Hasta 20 invitados Plantilla 100% personalizada Gestión de invitados Cuenta regresiva Hasta 5 fotos en el álbum ✕ Sin gestión de pagos ✕ Sin musica de fondo ✕ Sin Modo LIVE (fotos y mensajes en vivo) ✕ Sin Trivia ✕ Sin sugerencias DJ" [ref=f1e13]:
            - generic [ref=f1e15]:
              - heading "Gratis" [level=3] [ref=f1e16]
              - generic [ref=f1e17]: $ 0
            - list [ref=f1e20]:
              - listitem [ref=f1e21]:
                - generic [ref=f1e24]: Hasta 20 invitados
              - listitem [ref=f1e25]:
                - generic [ref=f1e28]: Plantilla 100% personalizada
              - listitem [ref=f1e29]:
                - generic [ref=f1e32]: Gestión de invitados
              - listitem [ref=f1e33]:
                - generic [ref=f1e36]: Cuenta regresiva
              - listitem [ref=f1e37]:
                - generic [ref=f1e40]: Hasta 5 fotos en el álbum
              - listitem [ref=f1e41]:
                - generic [ref=f1e42]: ✕
                - generic [ref=f1e43]: Sin gestión de pagos
              - listitem [ref=f1e44]:
                - generic [ref=f1e45]: ✕
                - generic [ref=f1e46]: Sin musica de fondo
              - listitem [ref=f1e47]:
                - generic [ref=f1e48]: ✕
                - generic [ref=f1e49]: Sin Modo LIVE (fotos y mensajes en vivo)
              - listitem [ref=f1e50]:
                - generic [ref=f1e51]: ✕
                - generic [ref=f1e52]: Sin Trivia
              - listitem [ref=f1e53]:
                - generic [ref=f1e54]: ✕
                - generic [ref=f1e55]: Sin sugerencias DJ
          - button "Premium $ 45.000 $ 35.000 22% OFF Invitados ilimitados Plantilla 100% personalizada Gestión de invitados y pagos Cuenta regresiva Hasta 15 fotos en el álbum Con musica de fondo Con Trivia Con sugerencias DJ ✕ Sin Modo LIVE (fotos y mensajes en vivo) ✕ Sin organización de mesas ✕ Sin control de ingreso por QR ✕ Sin ver quién abrió la invitación" [ref=f1e56]:
            - generic [ref=f1e58]:
              - heading "Premium" [level=3] [ref=f1e59]
              - generic [ref=f1e60]:
                - generic [ref=f1e61]: $ 45.000
                - generic [ref=f1e62]: $ 35.000
                - generic [ref=f1e63]: 22% OFF
            - list [ref=f1e65]:
              - listitem [ref=f1e66]:
                - generic [ref=f1e69]: Invitados ilimitados
              - listitem [ref=f1e70]:
                - generic [ref=f1e73]: Plantilla 100% personalizada
              - listitem [ref=f1e74]:
                - generic [ref=f1e77]: Gestión de invitados y pagos
              - listitem [ref=f1e78]:
                - generic [ref=f1e81]: Cuenta regresiva
              - listitem [ref=f1e82]:
                - generic [ref=f1e85]: Hasta 15 fotos en el álbum
              - listitem [ref=f1e86]:
                - generic [ref=f1e89]: Con musica de fondo
              - listitem [ref=f1e90]:
                - generic [ref=f1e93]: Con Trivia
              - listitem [ref=f1e94]:
                - generic [ref=f1e97]: Con sugerencias DJ
              - listitem [ref=f1e98]:
                - generic [ref=f1e99]: ✕
                - generic [ref=f1e100]: Sin Modo LIVE (fotos y mensajes en vivo)
              - listitem [ref=f1e101]:
                - generic [ref=f1e102]: ✕
                - generic [ref=f1e103]: Sin organización de mesas
              - listitem [ref=f1e104]:
                - generic [ref=f1e105]: ✕
                - generic [ref=f1e106]: Sin control de ingreso por QR
              - listitem [ref=f1e107]:
                - generic [ref=f1e108]: ✕
                - generic [ref=f1e109]: Sin ver quién abrió la invitación
          - 'button "Recomendado Diamond $ 60.000 $ 45.000 25% OFF Invitados ilimitados Plantilla 100% personalizada Gestión de invitados y pagos Cuenta regresiva Hasta 15 fotos en el álbum Con musica de fondo Con LIVE (fotos y mensajes en vivo) Único plan con “Modo LIVE”: las fotos y mensajes que suben tus invitados se proyectan en pantalla en tiempo real, durante la fiesta. Con organización de mesas Con control de ingreso por QR Ver quién abrió la invitación Con Trivia Con sugerencias DJ" [ref=f1e110]':
            - generic [ref=f1e111]: Recomendado
            - generic [ref=f1e115]:
              - heading "Diamond" [level=3] [ref=f1e116]
              - generic [ref=f1e117]:
                - generic [ref=f1e118]: $ 60.000
                - generic [ref=f1e119]: $ 45.000
                - generic [ref=f1e120]: 25% OFF
            - list [ref=f1e124]:
              - listitem [ref=f1e125]:
                - generic [ref=f1e128]: Invitados ilimitados
              - listitem [ref=f1e129]:
                - generic [ref=f1e132]: Plantilla 100% personalizada
              - listitem [ref=f1e133]:
                - generic [ref=f1e136]: Gestión de invitados y pagos
              - listitem [ref=f1e137]:
                - generic [ref=f1e140]: Cuenta regresiva
              - listitem [ref=f1e141]:
                - generic [ref=f1e144]: Hasta 15 fotos en el álbum
              - listitem [ref=f1e145]:
                - generic [ref=f1e148]: Con musica de fondo
              - listitem [ref=f1e149]:
                - generic [ref=f1e150]: Con LIVE (fotos y mensajes en vivo)
                - paragraph [ref=f1e158]: "Único plan con “Modo LIVE”: las fotos y mensajes que suben tus invitados se proyectan en pantalla en tiempo real, durante la fiesta."
              - listitem [ref=f1e159]:
                - generic [ref=f1e162]: Con organización de mesas
              - listitem [ref=f1e163]:
                - generic [ref=f1e166]: Con control de ingreso por QR
              - listitem [ref=f1e167]:
                - generic [ref=f1e170]: Ver quién abrió la invitación
              - listitem [ref=f1e171]:
                - generic [ref=f1e174]: Con Trivia
              - listitem [ref=f1e175]:
                - generic [ref=f1e178]: Con sugerencias DJ
        - button "Continuar" [ref=f1e179] [cursor=pointer]
        - paragraph [ref=f1e181]:
          - text: ¿Ya tienes cuenta?
          - link "Inicia sesión" [ref=f1e182] [cursor=pointer]:
            - /url: /login
  - alert [ref=f1e183]
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
> 25 |     await page.getByPlaceholder(/correo|email/i).fill('invalid-email');
     |                                                  ^ Error: locator.fill: Test timeout of 30000ms exceeded.
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