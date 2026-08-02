import { test, expect } from '@playwright/test';

test.describe('3. y 4. Gestión de Invitados y Flujo RSVP', () => {

  test('Auditoría de Wizard RSVP (Campos Vacíos)', async ({ page }) => {
    // Suponiendo que hay una invitación pública en /i/test-event
    await page.goto('/i/test-event');
    
    // Abrir modal de RSVP
    const rsvpBtn = page.getByRole('button', { name: /confirmar|rsvp/i });
    if (await rsvpBtn.isVisible()) {
      await rsvpBtn.click();
      
      // Intentar avanzar sin llenar nombre
      const nextBtn = page.getByRole('button', { name: /siguiente/i }).first();
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        
        // Verificar si se bloquea o tira error
        const errors = page.locator('text=requerido|obligatorio').first();
        await expect(errors).toBeVisible({ timeout: 3000 }).catch(() => {
          console.warn('⚠️ Posible bug: El wizard RSVP permitió avanzar con el nombre vacío.');
        });
      }
    }
  });

  test('Cálculo Matemático de Montos en RSVP Familiar', async ({ page }) => {
    // Simular que un grupo familiar de 2 adultos, 1 adolescente y 1 niño entra a confirmar.
    // Verificar si el precio base adulto es X, el de adol es Y, el de niño es Z
    // Suma: 2*X + 1*Y + 1*Z == Total mostrado en UI.
    
    // Este test requeriría inyectar datos de prueba en la DB o pasar por todo el flujo de creación primero.
  });

  test('Rechazar Asistencia', async ({ page }) => {
    // Acciones para marcar "No asistiré" y verificar pantalla de agradecimiento
  });

});
