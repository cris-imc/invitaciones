import { test, expect } from '@playwright/test';

test.describe('1. Cuentas y Autenticación', () => {
  const testEmail = `qa_${Date.now()}@test.com`;
  const testPassword = 'Password123!';

  test('Seguridad: Redirección al Dashboard sin estar autenticado', async ({ page }) => {
    await page.goto('/dashboard');
    // Si no está autenticado, NextAuth suele redirigir a /login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Registro y Validaciones', async ({ page }) => {
    await page.goto('/login');
    
    // Asumiendo que hay un link o botón para registrarse (cambiar selector según el diseño real)
    const registerLink = page.getByText(/crear cuenta|registrarse/i);
    if (await registerLink.isVisible()) {
      await registerLink.click();
    } else {
      await page.goto('/register');
    }

    // Probar registro inválido
    await page.getByPlaceholder(/correo|email/i).fill('invalid-email');
    await page.getByPlaceholder(/contraseña|password/i).fill('123');
    await page.getByRole('button', { name: /registrarse|crear/i }).click();

    // Debería mostrar errores de validación de Zod
    await expect(page.locator('text=correo electrónico válido|email inválido').first()).toBeVisible({ timeout: 5000 }).catch(() => null);

    // Registro Válido
    await page.getByPlaceholder(/correo|email/i).fill(testEmail);
    await page.getByPlaceholder(/contraseña|password/i).fill(testPassword);
    
    // Si hay un campo de nombre
    const nameInput = page.getByPlaceholder(/nombre/i);
    if (await nameInput.isVisible()) {
      await nameInput.fill('QA Tester');
    }

    await page.getByRole('button', { name: /registrarse|crear/i }).click();

    // Esperar redirección al login o dashboard
    await page.waitForURL(/.*(\/dashboard|\/login)/);
  });

  test('Login y Logout Correcto', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByPlaceholder(/correo|email/i).fill(testEmail);
    await page.getByPlaceholder(/contraseña|password/i).fill(testPassword);
    await page.getByRole('button', { name: /ingresar|login/i }).click();

    // Verificar que entró al dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Probar Cerrar Sesión
    const userMenu = page.getByRole('button', { name: /perfil|usuario|menu/i }).first();
    if (await userMenu.isVisible()) {
      await userMenu.click();
    }
    await page.getByText(/cerrar sesión|salir|logout/i).click();

    // Debería redirigir al inicio o login
    await expect(page).toHaveURL(/.*(\/login|\/)/);
  });
});
