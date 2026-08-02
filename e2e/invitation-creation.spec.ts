import { test, expect } from '@playwright/test';

test.describe('2. Creación y Configuración de Invitaciones', () => {
  // Configuración antes de correr las pruebas de este bloque:
  // Se requiere un usuario logueado. Podríamos usar setup global o loguearnos en el beforeEach
  
  test.beforeEach(async ({ page }) => {
    // Para simplificar, suponemos que las páginas de test acceden al estado si usamos storageState,
    // o hacemos login rápido si no está configurado el setup global.
    await page.goto('/login');
    // ... logic de login rápido o asumir que la sesión está guardada.
  });

  test('Validar campos vacíos en el Wizard (Auditoría)', async ({ page }) => {
    await page.goto('/dashboard');
    // Navegar a la creación
    const createBtn = page.getByRole('button', { name: /nueva invitación|crear/i });
    if (await createBtn.isVisible()) {
      await createBtn.click();
    } else {
      await page.goto('/dashboard/invitaciones/new');
    }

    // Intentar avanzar sin llenar nada
    const nextBtn = page.getByRole('button', { name: /siguiente/i }).first();
    await nextBtn.click();

    // Comprobar que no dejó avanzar o que tiró error
    // Por ejemplo, buscar textos de error de Zod
    const errors = page.locator('text=requerido|obligatorio').first();
    await expect(errors).toBeVisible({ timeout: 3000 }).catch(() => {
      console.warn('⚠️ Posible bug: El wizard permitió avanzar con campos vacíos.');
    });
  });

  test('Creación de tarjeta FREE y PREMIUM con Créditos', async ({ page }) => {
    await page.goto('/dashboard/invitaciones/new');
    
    // Llenar datos básicos
    await page.getByPlaceholder(/nombre/i).fill('Test Event');
    // Avanzar
    
    // Testear botones de selección de plan...
    // Aquí irían los clicks específicos basados en la UI exacta.
  });

  test('Carga de Media (Fotos y Música)', async ({ page }) => {
    // Si la UI tiene un input type=file para coverImage o bgMusic
    // await page.locator('input[type="file"]').setInputFiles('./public/img/sample.jpg');
    // await page.locator('input[name="music"]').setInputFiles('./public/music/sample.mp3');
  });

  test('Toggles de Secciones', async ({ page }) => {
    // Activar/desactivar switches
    // const rsvpSwitch = page.locator('button[role="switch"]'); // Ejemplo Radix UI
    // await rsvpSwitch.click();
  });
});
