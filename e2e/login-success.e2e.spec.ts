import { test, expect } from '@playwright/test';

/**
 * Prueba e2e para verificar el inicio de sesión exitoso
 * con redirección según el rol del usuario
 */
test.describe('Login exitoso', () => {
  // Antes de cada prueba, navegar a la página de login
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    // Esperar a que la página de login se cargue completamente
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  });

  // Prueba de login exitoso para el rol de director de ventas
  test('debería iniciar sesión como director de ventas y redirigir a /vendedores', async ({ page }) => {
    const testUser = {
      email: 'ventas@ccp.com',
      password: '1234',
      role: 'director-ventas'
    };

    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'fake-jwt-token-for-testing',
          role: testUser.role,
          userId: 1
        })
      });
    });

    await page.locator('#Email').fill(testUser.email);
    await page.locator('#Password').fill(testUser.password);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page).toHaveURL('/vendedores');

    const localStorageRole = await page.evaluate(() => localStorage.getItem('userRole'));
    expect(localStorageRole).toBe(testUser.role);

    await expect(page.getByText('Histórico de ventas')).toBeVisible();
  });

  // Prueba de login exitoso para el rol de encargado de logística
  test('debería iniciar sesión como encargado de logística y redirigir a /logistica', async ({ page }) => {
    const testUser = {
      email: 'logistica@ccp.com',
      password: '1234',
      role: 'encargado-logistica'
    };

    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'fake-jwt-token-for-testing',
          role: testUser.role,
          userId: 2
        })
      });
    });

    await page.locator('#Email').fill(testUser.email);
    await page.locator('#Password').fill(testUser.password);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page).toHaveURL('/logistica');

    const localStorageRole = await page.evaluate(() => localStorage.getItem('userRole'));
    expect(localStorageRole).toBe(testUser.role);

    await expect(page.getByText('Logística')).toBeVisible();
  });

  // Prueba de login exitoso para el rol de director de compras
  test('debería iniciar sesión como director de compras y redirigir a /proveedores', async ({ page }) => {
    const testUser = {
      email: 'compras@ccp.com',
      password: '1234',
      role: 'director-compras'
    };

    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'fake-jwt-token-for-testing',
          role: testUser.role,
          userId: 3
        })
      });
    });

    await page.locator('#Email').fill(testUser.email);
    await page.locator('#Password').fill(testUser.password);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page).toHaveURL('/proveedores');

    const localStorageRole = await page.evaluate(() => localStorage.getItem('userRole'));
    expect(localStorageRole).toBe(testUser.role);

    await expect(page.getByText('Agregar proveedor')).toBeVisible();
  });
});
