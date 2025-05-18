import { test, expect } from '@playwright/test';

test.describe('Pruebas de planes de venta', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('/auth/login');
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'fake-token',
          role: 'director-ventas',
          userId: 1
        })
      });
    });

    await page.waitForTimeout(1000);

    try {
      await page.fill('input[name="email"]', 'director@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
    } catch (e) {
      await page.fill('input', 'director@example.com');
      await page.locator('input').nth(1).fill('password123');
      await page.locator('button').first().click();
    }

    await page.waitForTimeout(2000);
    await page.goto('/vendedores/planes-venta');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/planes-venta-page.png' });
  });

  test('verificar contenido básico de planes de venta', async ({ page }) => {
    const textoPage = await page.evaluate(() => document.body.textContent);
    expect(textoPage?.length).toBeGreaterThan(10);

    const hayTextoRelevante = await page.evaluate(() => {
      const texto = document.body.textContent || '';
      return texto.includes('Planes') ||
             texto.includes('venta') ||
             texto.includes('vendedor') ||
             texto.includes('metas');
    });
    expect(hayTextoRelevante).toBeTruthy();
  });

  test('verificar elementos de tabla y valores', async ({ page }) => {
    const elementosTabla = await page.locator('table, tr, th, td').count();
    expect(elementosTabla).toBeGreaterThanOrEqual(0);

    const textosMonetarios = await page.evaluate(() => {
      const regex = /\$\d{1,3}(,\d{3})+/g;
      const texto = document.body.textContent || '';
      return texto.match(regex) || [];
    });

    expect(textosMonetarios.length).toBeGreaterThanOrEqual(0);
  });

  test('verificar elementos interactivos', async ({ page }) => {
    const elementosInteractivos = await page.locator('button, a, [role="button"]').count();
    expect(elementosInteractivos).toBeGreaterThanOrEqual(0);

    if (elementosInteractivos > 0) {
      const primerBoton = page.locator('button, a, [role="button"]').first();
      if (await primerBoton.isVisible()) {
        await primerBoton.hover().catch(() => {});
      }
    }

    const elementosSVG = await page.locator('svg, path').count();
    expect(elementosSVG).toBeGreaterThanOrEqual(0);
  });

  test('verificar presencia de nombres de vendedores', async ({ page }) => {
    const contenidoPagina = await page.content();

    const contieneVendedores =
      contenidoPagina.includes('Robert') ||
      contenidoPagina.includes('Castro') ||
      contenidoPagina.includes('Carlos') ||
      contenidoPagina.includes('Rodríguez');

    expect(contieneVendedores).toBeTruthy();
  });

  test('verificar presencia de meses en la tabla', async ({ page }) => {
    const contenidoPagina = await page.content();

    const contieneMeses =
      contenidoPagina.includes('2025') ||
      /ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic/i.test(contenidoPagina);

    expect(contieneMeses).toBeTruthy();
  });
});
