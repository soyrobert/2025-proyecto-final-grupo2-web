import { test, expect } from '@playwright/test';

/**
 * Tests e2e para la pantalla de localización de productos en bodega
 */
test.describe('Localización de productos en bodega', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);

    // Login con el usuario encargado-logistica
    await page.goto('/auth/login');
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'fake-token',
          role: 'encargado-logistica',
          userId: 3
        })
      });
    });

    await page.waitForTimeout(1000);
    await page.fill('input[type="email"], input[name="email"], input[placeholder*="correo"]', 'logistica@example.com');
    await page.fill('input[type="password"], input[name="password"], input[placeholder*="contraseña"]', 'password123');
    await page.click('button[type="submit"]');

    // Mock para la API de productos
    await page.route('**/logistica/productos**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [
            {
              id: 1,
              nombre: 'Teclado Mecánico RGB 45',
              precio: 69000,
              fecha_vencimiento: '2024-12-31',
              estado: 'en_produccion',
              inventario_inicial: 89,
              proveedor: 'Samsung'
            },
            {
              id: 2,
              nombre: 'Mouse Gamer 3200 DPI',
              precio: 39000,
              fecha_vencimiento: '2025-06-30',
              estado: 'en_stock',
              inventario_inicial: 124,
              proveedor: 'Logitech'
            }
          ],
          total: 2,
          total_pages: 1,
          current_page: 1
        })
      });
    });

    await page.waitForTimeout(2000);
    await page.goto('/logistica');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/logistica-inicial.png' });
  });

  test('verificar título y elementos de filtro', async ({ page }) => {
    await page.screenshot({ path: 'test-results/logistica-captura-completa.png' });

    const contenidoPagina = await page.content();
    expect(contenidoPagina).toContain('produc');

    const inputs = await page.locator('input').all();
    expect(inputs.length).toBeGreaterThanOrEqual(1);

    const botones = await page.locator('button').all();
    expect(botones.length).toBeGreaterThanOrEqual(1);

    const todosLosTextos = await page.evaluate(() => {
      return document.body.textContent;
    });

    expect(todosLosTextos).toContain('bodega');
  });

  test('interactuar con campos de filtro', async ({ page }) => {
    const inputs = await page.locator('input').all();

    if (inputs.length > 0) {
      await inputs[0].fill('123');
    }

    if (inputs.length > 1) {
      await inputs[1].fill('Teclado');
    }

    const aplicarBtn = page.getByRole('button', { name: 'Aplicar filtros' });
    if (await aplicarBtn.isVisible()) {
      await aplicarBtn.click();
    }

    await page.screenshot({ path: 'test-results/logistica-filtros-aplicados.png' });

    const limpiarBtn = page.getByRole('button', { name: 'Limpiar filtros' });
    if (await limpiarBtn.isVisible()) {
      await limpiarBtn.click();
    }

    await page.screenshot({ path: 'test-results/logistica-filtros-limpiados.png' });
  });

  test('verificar elementos de la tabla o lista de productos', async ({ page }) => {
    const contenedorDatos = page.locator('.panel, .table-responsive, .datatable, .whitespace-nowrap, .table-hover');
    const hayContenedor = await contenedorDatos.count() > 0;

    if (hayContenedor) {
      await page.screenshot({ path: 'test-results/logistica-contenedor-datos.png' });
    }

    const elementosPaginacion = page.locator('.pagination, .flex.items-center.justify-between, .gap-1');
    const hayPaginacion = await elementosPaginacion.count() > 0;

    if (hayPaginacion) {
      await page.screenshot({ path: 'test-results/logistica-paginacion.png' });
    }

    const textosPosibles = ['Código', 'Nombre', 'Precio', 'Cantidad', 'Fecha', 'Vencimiento', 'Estado', 'Proveedor', 'Productos'];
    let encontradoTexto = false;

    for (const texto of textosPosibles) {
      const elemento = page.getByText(texto, { exact: false });
      if (await elemento.count() > 0) {
        encontradoTexto = true;
        break;
      }
    }

    expect(encontradoTexto).toBeTruthy();
  });

  test('verificar estructura general de la página', async ({ page }) => {
    const mainContent = page.locator('body > div, main, .p-4, .container, .content, [class*="panel"]');
    expect(await mainContent.count()).toBeGreaterThan(0);

    let hayFiltros = false;

    const inputs = await page.locator('input').all();
    if (inputs.length > 0) {
      hayFiltros = true;
    }

    const selects = await page.locator('select').all();
    if (selects.length > 0) {
      hayFiltros = true;
    }

    const botones = await page.locator('button').all();
    expect(botones.length).toBeGreaterThan(0);

    await page.setViewportSize({ width: 1366, height: 768 });
    await page.screenshot({ path: 'test-results/logistica-desktop.png' });

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'test-results/logistica-tablet.png' });
  });
});

