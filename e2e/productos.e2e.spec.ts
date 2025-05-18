import { test, expect } from '@playwright/test';

/**
 * Test para la pantalla de importación de productos
 */
test.describe('Importación de productos', () => {
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

    // Mock para listar proveedores
    await page.route('**/proveedores', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, nombre: 'Proveedor Ejemplo 1' },
          { id: 2, nombre: 'Proveedor Ejemplo 2' }
        ])
      });
    });

    await page.waitForTimeout(2000);
    await page.goto('/proveedores/importar-productos');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/productos-inicial.png' });
  });

  test('verificar contenido de la página de importación de productos', async ({ page }) => {
    const textoImportacion = await page.textContent('h3, div') || '';
    expect(textoImportacion.includes('Importación masiva') ||
           textoImportacion.includes('producto')).toBeTruthy();

    const botonAgregar = await page.getByText(/Agregar producto/i);
    expect(await botonAgregar.isVisible()).toBeTruthy();

    const dropArea = await page.locator('.border-dashed, [class*="drop"]');
    expect(await dropArea.count()).toBeGreaterThan(0);

    const textoCSV = await page.getByText(/CSV/i);
    expect(await textoCSV.count()).toBeGreaterThan(0);

    await page.screenshot({ path: 'test-results/productos-basico.png' });
  });

  test('abrir modal para agregar producto', async ({ page }) => {
    await page.click('button:has-text("Agregar producto")');
    await page.waitForTimeout(1000);

    const modal = await page.locator('app-modal, [role="dialog"], div.modal');
    expect(await modal.count()).toBeGreaterThan(0);

    const camposEsperados = [
      'Nombre', 'Proveedor', 'Descripción', 'Precio', 'Tiempo de entrega',
      'Condiciones', 'Fecha de vencimiento', 'Estado', 'Inventario'
    ];

    for (const campo of camposEsperados) {
      const elementoTexto = await page.getByText(new RegExp(campo, 'i'), { exact: false });
      expect(await elementoTexto.count()).toBeGreaterThan(0);
    }

    await page.screenshot({ path: 'test-results/productos-modal-abierto.png' });

    await page.click('button:has-text("Cancelar")');
  });

  test('verificar validación del formulario de productos', async ({ page }) => {
    await page.click('button:has-text("Agregar producto")');
    await page.waitForTimeout(1000);

    const modal = await page.locator('app-modal, [role="dialog"], div.modal');
    expect(await modal.count()).toBeGreaterThan(0);
    const inputs = await modal.locator('input:visible, textarea:visible, select:visible').all();

    if (inputs.length >= 2) {
      await inputs[0].click();
      await inputs[1].click();
    }

    const submitButton = await modal.locator('button.btn-primary').filter({ hasText: /Agregar producto/i });
    expect(await submitButton.isDisabled()).toBeTruthy();
    await page.screenshot({ path: 'test-results/productos-validacion.png' });
    await page.click('button:has-text("Cancelar")');
  });

  test('verificar componente de selección de imágenes', async ({ page }) => {
    await page.click('button:has-text("Agregar producto")');
    await page.waitForTimeout(1000);

    const seccionImagenes = await page.getByText(/Imágenes del producto/i);
    expect(await seccionImagenes.isVisible()).toBeTruthy();
    const botonSeleccionar = await page.getByText(/Seleccionar imágenes/i);
    expect(await botonSeleccionar.isVisible()).toBeTruthy();
    await page.screenshot({ path: 'test-results/productos-seccion-imagenes.png' });

    await page.click('button:has-text("Cancelar")');
  });

  test('interactuar con área de importación masiva', async ({ page }) => {
    const importArea = await page.locator('.border-dashed, [class*="drop"]');
    expect(await importArea.count()).toBeGreaterThan(0);
    const textoCSV = await page.getByText(/CSV/i);
    expect(await textoCSV.count()).toBeGreaterThan(0);
    const botonSubir = await page.getByText(/Subir datos/i);
    expect(await botonSubir.isVisible()).toBeTruthy();
    expect(await botonSubir.isDisabled()).toBeTruthy();

    await page.screenshot({ path: 'test-results/productos-importacion-area.png' });
  });
});
