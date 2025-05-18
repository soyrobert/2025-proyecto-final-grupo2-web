import { test, expect } from '@playwright/test';

/**
 * Test para la pantalla de proveedores
 */
test.describe('Proveedores', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);

    // Login
    await page.goto('/auth/login');
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'fake-token',
          role: 'director-compras',
          userId: 1
        })
      });
    });

    await page.waitForTimeout(1000);
    await page.fill('input[type="email"], input[name="email"], input[placeholder*="correo"]', 'director@example.com');
    await page.fill('input[type="password"], input[name="password"], input[placeholder*="contraseña"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);
    await page.goto('/proveedores');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/proveedores-inicial.png' });
  });

  test('verificar contenido de la página de proveedores', async ({ page }) => {
    const textoImportacion = await page.textContent('h2, div') || '';
    expect(textoImportacion.includes('Importación masiva') ||
           textoImportacion.includes('proveedores')).toBeTruthy();

    const botonAgregar = await page.getByText(/Agregar proveedor/i);
    expect(await botonAgregar.isVisible()).toBeTruthy();

    const dropArea = await page.locator('.border-dashed, [class*="drop"]');
    expect(await dropArea.count()).toBeGreaterThan(0);

    await page.screenshot({ path: 'test-results/proveedores-basico.png' });
  });

  test('abrir modal para agregar proveedor', async ({ page }) => {
    await page.click('button:has-text("Agregar proveedor")');
    await page.waitForTimeout(1000);

    const modal = await page.locator('app-modal, [role="dialog"], div.modal');
    expect(await modal.count()).toBeGreaterThan(0);

    const campos = ['Nombre', 'Correo', 'Número de contacto', 'País', 'Características', 'Condiciones'];
    for (const campo of campos) {
      const elementoLabel = await page.getByText(new RegExp(campo, 'i'), { exact: false });
      expect(await elementoLabel.count()).toBeGreaterThan(0);
    }

    await page.screenshot({ path: 'test-results/proveedores-modal.png' });

    await page.click('button:has-text("Cancelar")');
  });

  test('validar formulario de agregar proveedor', async ({ page }) => {
    await page.click('button:has-text("Agregar proveedor")');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'test-results/proveedores-modal-abierto.png' });
    const formElements = await page.locator('input:visible, textarea:visible, select:visible').count();
    expect(formElements).toBeGreaterThan(0);
    await page.waitForTimeout(1000);

    await page.click('button:has-text("Cancelar")');
  });

  test('interactuar con área de importación masiva', async ({ page }) => {
    const importArea = await page.locator('.border-dashed, [class*="drop"]');
    expect(await importArea.count()).toBeGreaterThan(0);

    const textoCSV = await page.getByText(/CSV/i);
    expect(await textoCSV.count()).toBeGreaterThan(0);

    const botonSubir = await page.getByText(/Subir datos/i);
    expect(await botonSubir.isVisible()).toBeTruthy();

    await page.screenshot({ path: 'test-results/proveedores-importacion.png' });
  });
});

