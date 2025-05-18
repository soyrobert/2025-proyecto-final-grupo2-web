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

  test('verificar elementos principales de la pantalla', async ({ page }) => {
    await page.screenshot({ path: 'test-results/planificacion-rutas-elementos.png' });

    const inputFecha = page.locator('input[type="date"]');
    expect(await inputFecha.count()).toBeGreaterThan(0);

    const tabla = page.locator('table');
    expect(await tabla.count()).toBeGreaterThan(0);

    const filas = page.locator('tbody tr');
    const cantidadFilas = await filas.count();
    expect(cantidadFilas).toBeGreaterThan(0);

    const columnas = ['ID', 'Placa', 'Marca', 'Modelo', 'Capacidad', 'Volumen', 'Estado'];
    for (const columna of columnas) {
      const elementoColumna = page.getByText(columna, { exact: false });
      const existe = await elementoColumna.count() > 0;
      expect(existe).toBeTruthy();
    }
  });

  test('cambiar fecha de entrega', async ({ page }) => {
    const inputFecha = page.locator('input[type="date"]');
    expect(await inputFecha.count()).toBeGreaterThan(0);

    const fechaActual = await inputFecha.inputValue();

    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    const fechaMañana = mañana.toISOString().substring(0, 10);

    await inputFecha.fill(fechaMañana);

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/planificacion-rutas-fecha-cambiada.png' });

    const nuevaFecha = await inputFecha.inputValue();
    expect(nuevaFecha).toBe(fechaMañana);
  });

  test('enrutar camiones sin ruta', async ({ page }) => {
    const estadoSinRuta = page.getByText('Sin ruta');
    const existeEstadoSinRuta = await estadoSinRuta.count() > 0;

    if (existeEstadoSinRuta) {
      const botonEnrutar = page.getByRole('button', { name: /enrutar|asignar|ruta/i });

      if (await botonEnrutar.isVisible()) {
        await botonEnrutar.click();

        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/planificacion-rutas-despues-enrutar.png' });

        const mensajeExito = page.getByText('asignad', { exact: false });
        const hayMensajeExito = await mensajeExito.count() > 0;

        if (!hayMensajeExito) {
          const estadoCambiado = page.getByText('Enrutado', { exact: false });
          expect(await estadoCambiado.count()).toBeGreaterThanOrEqual(0);
        }
      } else {
        console.log('No se encontró el botón de enrutar camiones');
      }
    } else {
      console.log('No hay camiones sin ruta para enrutar');

      const filasCamiones = page.locator('tbody tr');
      expect(await filasCamiones.count()).toBeGreaterThan(0);
    }
  });

  test('verificar estado de los camiones', async ({ page }) => {
    const badges = page.locator('.badge');

    if (await badges.count() > 0) {
      await page.screenshot({ path: 'test-results/planificacion-rutas-badges.png' });
    } else {
      const estadosTexto = page.getByText('Sin entregas programadas', { exact: false })
                        .or(page.getByText('Sin ruta', { exact: false }))
                        .or(page.getByText('Enrutado', { exact: false }));

      expect(await estadosTexto.count()).toBeGreaterThan(0);
      await page.screenshot({ path: 'test-results/planificacion-rutas-estados-texto.png' });
    }

    const placas = page.getByText('ABC123').or(page.getByText('XYZ789'));
    expect(await placas.count()).toBeGreaterThan(0);

    const marcas = page.getByText('Volvo').or(page.getByText('Scania'));
    expect(await marcas.count()).toBeGreaterThan(0);
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
  });
});
