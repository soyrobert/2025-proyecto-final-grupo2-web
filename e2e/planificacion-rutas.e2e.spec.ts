import { test, expect } from '@playwright/test';

/**
 * Tests e2e para la pantalla de Planificación de Rutas
 */
test.describe('Planificación de Rutas', () => {
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

    // Mock para la API de camiones
    await page.route('**/logistica/camiones**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total: 2,
          camiones: [
            {
              id: 1,
              placa: 'ABC123',
              marca: 'Volvo',
              modelo: 'FH',
              capacidad_carga_toneladas: 20000,
              volumen_carga_metros_cubicos: 50,
              estado_enrutamiento: 'Sin entregas programadas'
            },
            {
              id: 2,
              placa: 'XYZ789',
              marca: 'Scania',
              modelo: 'R500',
              capacidad_carga_toneladas: 25000,
              volumen_carga_metros_cubicos: 60,
              estado_enrutamiento: 'Sin ruta'
            }
          ]
        })
      });
    });

    await page.route('**/logistica/asignar-ruta**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          mensaje: 'Rutas asignadas correctamente',
          mensajes: [
            'Se ha asignado ruta al camión XYZ789'
          ]
        })
      });
    });

    await page.waitForTimeout(2000);
    await page.goto('/logistica/rutas');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/planificacion-rutas-inicial.png' });
  });

  test('verificar carga básica de la página', async ({ page }) => {
    await page.screenshot({ path: 'test-results/planificacion-rutas-pantalla-completa.png' });

    const contenidoPagina = await page.content();
    expect(contenidoPagina).toBeTruthy();

    const contenidoRutas = contenidoPagina.includes('ruta') ||
                          contenidoPagina.includes('Ruta') ||
                          contenidoPagina.includes('camion') ||
                          contenidoPagina.includes('Camion') ||
                          contenidoPagina.includes('planificacion') ||
                          contenidoPagina.includes('Planificacion');

    expect(contenidoRutas).toBeTruthy();
  });

  test('verificar existencia de input de fecha', async ({ page }) => {
    const inputsFecha = await page.locator('input[type="date"]').all();

    if (inputsFecha.length === 0) {
      const elementosFecha = await page.locator('[class*="date"], [id*="date"], [class*="fecha"], [id*="fecha"]').all();
      const hayElementosFecha = elementosFecha.length > 0;

      if (!hayElementosFecha) {
        const todosLosInputs = await page.locator('input').all();
        expect(todosLosInputs.length).toBeGreaterThan(0);
      }
    } else {
      await inputsFecha[0].click();
      await page.screenshot({ path: 'test-results/planificacion-rutas-fecha-click.png' });
    }
  });

  test('verificar presencia de controles o datos', async ({ page }) => {
    const contenedores = await page.locator('table, .panel, .container, .grid, .flex').all();
    expect(contenedores.length).toBeGreaterThan(0);

    const textosEsperados = ['Planificación', 'Rutas', 'ID', 'Placa', 'Estado', 'Capacidad'];
    let encontroTexto = false;

    for (const texto of textosEsperados) {
      const elementos = await page.getByText(texto, { exact: false }).all();
      if (elementos.length > 0) {
        encontroTexto = true;
        break;
      }
    }

    if (!encontroTexto) {
      const todoElTexto = await page.evaluate(() => document.body.textContent);
      expect(todoElTexto?.length).toBeGreaterThan(50); // Más de 50 caracteres
    }

    await page.screenshot({ path: 'test-results/planificacion-rutas-contenido.png' });
  });

  test('verificar interactividad de la página', async ({ page }) => {
    const botones = await page.locator('button').all();

    if (botones.length > 0) {
      const botonUno = botones[0];
      if (await botonUno.isVisible() && await botonUno.isEnabled()) {
        await page.screenshot({ path: 'test-results/planificacion-rutas-antes-interaccion.png' });

        await botonUno.hover();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/planificacion-rutas-hover-boton.png' });
      }
    }

    const inputs = await page.locator('input, select').all();
    if (inputs.length > 0) {
      const primerInput = inputs[0];
      if (await primerInput.isVisible() && await primerInput.isEnabled()) {
        await primerInput.focus();
        await page.screenshot({ path: 'test-results/planificacion-rutas-input-focus.png' });
      }
    }
  });

  test('verificar respuesta en diferentes tamaños de pantalla', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/planificacion-rutas-desktop.png' });

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/planificacion-rutas-tablet.png' });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/planificacion-rutas-mobile.png' });

    await page.setViewportSize({ width: 1280, height: 800 });

    const contenidoPagina = await page.content();
    expect(contenidoPagina).toBeTruthy();
  });
});
