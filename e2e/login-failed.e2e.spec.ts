import { test, expect } from '@playwright/test';

/**
 * Prueba e2e para verificar el comportamiento cuando el login falla
 * debido a credenciales incorrectas
 */
test.describe('Login fallido', () => {
  // Antes de cada prueba, navegar a la página de login
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    // Esperar a que la página de login se cargue completamente
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  });

  // Prueba de login fallido con credenciales incorrectas
  test('debería mostrar mensaje de error cuando las credenciales son incorrectas', async ({ page }) => {
    const invalidCredentials = {
      email: 'usuario.incorrecto@example.com',
      password: 'passwordincorrecta'
    };

    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Credenciales incorrectas'
        })
      });
    });

    await page.locator('#Email').fill(invalidCredentials.email);
    await page.locator('#Password').fill(invalidCredentials.password);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page.getByText('Credenciales incorrectas o error de autenticación')).toBeVisible();

    await expect(page).toHaveURL('/auth/login');

    const localStorageToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(localStorageToken).toBeNull();
  });

  // Prueba de login fallido por error de servidor
  test('debería mostrar mensaje de error cuando hay un error de servidor', async ({ page }) => {
    // Arrange
    const testUser = {
      email: 'usuario@example.com',
      password: 'password123'
    };

    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Error interno del servidor'
        })
      });
    });

    await page.locator('#Email').fill(testUser.email);
    await page.locator('#Password').fill(testUser.password);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page.getByText('Credenciales incorrectas o error de autenticación')).toBeVisible();
    await expect(page).toHaveURL('/auth/login');
  });

  // Prueba de login fallido por problema de conexión
  test('debería manejar errores de conexión', async ({ page }) => {
    const testUser = {
      email: 'usuario@example.com',
      password: 'password123'
    };

    await page.route('**/auth/login', async (route) => {
      await route.abort('failed');
    });

    await page.locator('#Email').fill(testUser.email);
    await page.locator('#Password').fill(testUser.password);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page.getByText('Credenciales incorrectas o error de autenticación')).toBeVisible();
    await expect(page).toHaveURL('/auth/login');

    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled();
  });
});
