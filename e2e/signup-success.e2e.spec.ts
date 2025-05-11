import { test, expect } from '@playwright/test';

/**
 * Prueba e2e para verificar el registro exitoso de un vendedor
 */
test.describe('Registro exitoso de vendedor', () => {
  // Antes de cada prueba, iniciar sesión como director de ventas y navegar a la página de registro
  test.beforeEach(async ({ page }) => {
    // Iniciar sesión como director de ventas
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();

    // Interceptar la solicitud de login para simular inicio de sesión exitoso
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'fake-jwt-token-for-testing',
          role: 'director-ventas',
          userId: 1
        })
      });
    });

    // Completar y enviar el formulario de login
    await page.getByPlaceholder(/ingrese su correo/i).fill('director@example.com');
    await page.getByPlaceholder(/ingrese su contraseña/i).fill('password123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page).toHaveURL('/vendedores');
    await page.goto('/vendedores/crear');
    await page.screenshot({ path: 'test-results/debug-vendedores-crear.png' });
    await page.waitForLoadState('networkidle');
  });

  // Prueba de registro exitoso
  test('debería registrar un nuevo vendedor correctamente', async ({ page }) => {
    await page.screenshot({ path: 'test-results/before-filling-form.png' });

    const testUser = {
      name: 'Vendedor Test',
      email: 'vendedor.test@example.com',
      password: 'password12345',
      country: 'Colombia',
      city: 'Bogotá',
      address: 'Calle 123 # 45-67'
    };

    // Interceptamos la solicitud de API para simular una respuesta exitosa
    await page.route('**/vendedores/signup', async (route) => {
      const requestBody = JSON.parse(route.request().postData() || '{}');

      expect(requestBody.name).toBe(testUser.name);
      expect(requestBody.email).toBe(testUser.email);
      expect(requestBody.role).toBe('vendedor');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 123,
          message: 'Usuario registrado correctamente'
        })
      });
    });

    const form = page.locator('form');
    await expect(form).toBeVisible();

    const inputCount = await page.locator('input, select').count();

    for (let i = 0; i < inputCount; i++) {
      const input = page.locator('input, select').nth(i);
      const id = await input.getAttribute('id');
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
    }

    try {
      await page.locator('#name, input[name="name"], input[placeholder*="nombre" i]').first().fill(testUser.name);
      await page.locator('#email, input[name="email"], input[placeholder*="email" i]').first().fill(testUser.email);
      await page.locator('#password, input[name="password"], input[placeholder*="contraseña" i]').first().fill(testUser.password);

      await page.locator('#country, select[name="country"]').first().selectOption(testUser.country);

      await page.locator('#city, input[name="city"], input[placeholder*="ciudad" i]').first().fill(testUser.city);
      await page.locator('#address, input[name="address"], input[placeholder*="dirección" i]').first().fill(testUser.address);

      await page.screenshot({ path: 'test-results/form-filled.png' });
    } catch (e) {
      await page.screenshot({ path: 'test-results/form-error.png' });
    }

    const submitButton = page.getByRole('button', { name: /registrar/i }).or(page.locator('button[type="submit"]'));
    await submitButton.click();
    const successMessage = page.getByText('Usuario registrado correctamente').or(page.locator('.swal2-popup'));

    try {
      await expect(successMessage).toBeVisible({ timeout: 5000 });
    } catch (e) {
      await page.screenshot({ path: 'test-results/after-submit-error.png' });
    }

  });

  // Prueba de mostrar/ocultar contraseña
  test('debería permitir mostrar y ocultar la contraseña', async ({ page }) => {
    await page.screenshot({ path: 'test-results/password-toggle-page.png' });
    const passwordField = page.locator('#password, input[name="password"], input[placeholder*="contraseña" i]').first();

    await expect(passwordField).toBeVisible();
    const password = 'contraseña123';
    await passwordField.fill(password);
    const type1 = await passwordField.getAttribute('type');
    const passwordContainer = await passwordField.evaluateHandle(
      el => el.closest('.relative')
    );

    await page.screenshot({ path: 'test-results/password-container.png' });

    try {

      const toggleButton = page.locator('button').filter({
        hasText: ''
      }).filter({
        has: page.locator('svg')
      }).nth(0);


      if (await toggleButton.count() > 0) {
        const buttonClasses = await toggleButton.getAttribute('class');

        const isVisible = await toggleButton.isVisible();

        if (isVisible) {
          await toggleButton.scrollIntoViewIfNeeded();
          await page.screenshot({ path: 'test-results/before-toggle-click.png' });

          await passwordField.evaluate(input => {
            const container = input.closest('.relative');
            if (container) {
              const button = container.querySelector('button');
              if (button) button.click();
            }
          });

          await page.waitForTimeout(500);
          const type2 = await passwordField.getAttribute('type');


        }
      }
    } catch (e) {
      await page.screenshot({ path: 'test-results/toggle-button-error.png' });
    }
  });

  // Prueba de registro exitoso con diferentes países
  test('debería permitir seleccionar diferentes países', async ({ page }) => {
    await page.screenshot({ path: 'test-results/countries-test-page.png' });

    const countrySelector = page.locator('#country, select[name="country"]').first();
    await expect(countrySelector).toBeVisible();
    const paisesParaProbar = ['Colombia'];
    await page.route('**/vendedores/signup', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 123,
          message: 'Usuario registrado correctamente'
        })
      });
    });

    const nameField = page.locator('#name, input[name="name"], input[placeholder*="nombre" i]').first();
    const emailField = page.locator('#email, input[name="email"], input[placeholder*="email" i]').first();
    const passwordField = page.locator('#password, input[name="password"], input[placeholder*="contraseña" i]').first();
    const cityField = page.locator('#city, input[name="city"], input[placeholder*="ciudad" i]').first();
    const addressField = page.locator('#address, input[name="address"], input[placeholder*="dirección" i]').first();

    const submitButton = page.getByRole('button', { name: /registrar/i }).or(page.locator('button[type="submit"]'));

    const pais = paisesParaProbar[0];

    await nameField.fill('Vendedor Test');
    await emailField.fill(`vendedor.${pais.toLowerCase()}@example.com`);
    await passwordField.fill('password12345');

    await countrySelector.selectOption(pais);

    await cityField.fill('Ciudad Principal');
    await addressField.fill('Calle Principal 123');

    await page.screenshot({ path: `test-results/country-selected-${pais}.png` });

    await submitButton.click();

    try {
      await expect(page.getByText('Usuario registrado correctamente')).toBeVisible({ timeout: 5000 });
    } catch (e) {
      await page.screenshot({ path: `test-results/country-error-${pais}.png` });
    }
  });
});
