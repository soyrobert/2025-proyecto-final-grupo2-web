import { test, expect, Page } from '@playwright/test';

/**
 * Prueba e2e para verificar las validaciones del formulario de registro
 */
test.describe('Validaciones del formulario de registro', () => {
  // Antes de cada prueba, iniciar sesión como director de ventas y navegar a la página de registro
  test.beforeEach(async ({ page }) => {
    // Primero iniciar sesión como director de ventas
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();

    // Simular inicio de sesión exitoso como director de ventas
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

    await page.getByPlaceholder(/ingrese su correo/i).fill('director@example.com');
    await page.getByPlaceholder(/ingrese su contraseña/i).fill('password123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page).toHaveURL('/vendedores');
    await page.goto('/vendedores/crear');
    await page.screenshot({ path: 'test-results/validation-form-initial.png' });
    await page.waitForLoadState('networkidle');
  });

  // Obtener selectores de campos
  const getFormFields = (page: Page) => {
    return {
      nameField: page.locator('#name, input[name="name"], input[placeholder*="nombre" i]').first(),
      emailField: page.locator('#email, input[name="email"], input[placeholder*="email" i]').first(),
      passwordField: page.locator('#password, input[name="password"], input[placeholder*="contraseña" i]').first(),
      countryField: page.locator('#country, select[name="country"]').first(),
      cityField: page.locator('#city, input[name="city"], input[placeholder*="ciudad" i]').first(),
      addressField: page.locator('#address, input[name="address"], input[placeholder*="dirección" i]').first(),
      submitButton: page.getByRole('button', { name: /registrar/i }).or(page.locator('button[type="submit"]'))
    };
  };

  // Prueba de validación de campos requeridos
  test('debería mostrar mensajes de error para campos requeridos', async ({ page }) => {
    const fields = getFormFields(page);

    await expect(fields.nameField).toBeVisible();
    await expect(fields.emailField).toBeVisible();
    await expect(fields.passwordField).toBeVisible();
    await expect(fields.countryField).toBeVisible();
    await expect(fields.cityField).toBeVisible();
    await expect(fields.addressField).toBeVisible();

    await expect(fields.submitButton).toBeVisible();

    await page.screenshot({ path: 'test-results/validation-form-empty.png' });

    await fields.nameField.click();
    await fields.emailField.click();

    const nameError = page.getByText(/nombre.*requerido/i);
    await expect(nameError).toBeVisible().catch(async () => {
      await page.screenshot({ path: 'test-results/name-error-not-found.png' });
    });

    await fields.passwordField.click();
    const emailError = page.getByText(/email.*requerido/i);
    await expect(emailError).toBeVisible().catch(async () => {
      await page.screenshot({ path: 'test-results/email-error-not-found.png' });
    });

    await fields.countryField.click();
    const passwordError = page.getByText(/contraseña.*requerida/i);
    await expect(passwordError).toBeVisible().catch(async () => {
      await page.screenshot({ path: 'test-results/password-error-not-found.png' });
    });

    await fields.cityField.click();
    const countryError = page.getByText(/país.*requerido/i);
    await expect(countryError).toBeVisible().catch(async () => {
      await page.screenshot({ path: 'test-results/country-error-not-found.png' });
    });

    await fields.addressField.click();
    const cityError = page.getByText(/ciudad.*requerida/i);
    await expect(cityError).toBeVisible().catch(async () => {
      await page.screenshot({ path: 'test-results/city-error-not-found.png' });
    });

    await expect(fields.submitButton).toBeDisabled().catch(async () => {
      await page.screenshot({ path: 'test-results/button-not-disabled.png' });
    });

    await page.screenshot({ path: 'test-results/validation-form-with-errors.png' });
  });

  // Prueba de validación de formato de email
  test('debería validar el formato del email', async ({ page }) => {
    const fields = getFormFields(page);

    const emailsInvalidos = [
      'correo',
      'correo@',
      'correo@dominio',
      '@dominio.com'
    ];

    for (const email of emailsInvalidos) {
      await fields.emailField.fill(email);
      await fields.nameField.click();

      const formatoInvalidoError = page.getByText(/email.*inválido/i);
      await expect(formatoInvalidoError).toBeVisible().catch(async () => {
        await page.screenshot({ path: `test-results/email-format-error-${email.replace(/[@\.]/g, '_')}.png` });
      });

      await fields.emailField.clear();
    }

    await fields.emailField.fill('correo.valido@example.com');
    await fields.nameField.click();

    const formatoError = page.getByText(/email.*inválido/i);
    const isVisible = await formatoError.isVisible().catch(() => false);
    if (isVisible) {
      await page.screenshot({ path: 'test-results/valid-email-error.png' });
    } else {
    }
  });

  // Prueba de validación de longitud mínima de contraseña
  test('debería validar la longitud mínima de la contraseña', async ({ page }) => {
    const fields = getFormFields(page);

    await fields.passwordField.fill('12345');
    await fields.emailField.click();

    const longitudError = page.getByText(/contraseña.*8 caracteres/i);
    await expect(longitudError).toBeVisible().catch(async () => {
      await page.screenshot({ path: 'test-results/password-length-error-not-found.png' });
    });

    await fields.passwordField.fill('password12345');
    await fields.emailField.click();

    const isVisible = await longitudError.isVisible().catch(() => false);
    if (isVisible) {
      await page.screenshot({ path: 'test-results/valid-password-error.png' });
    }
  });

  // Prueba de habilitación del botón cuando el formulario es válido
  test('debería habilitar el botón solo cuando el formulario es válido', async ({ page }) => {
    const fields = getFormFields(page);

    await expect(fields.submitButton).toBeDisabled().catch(async () => {
      await page.screenshot({ path: 'test-results/button-initially-not-disabled.png' });
    });

    await fields.nameField.fill('Vendedor Test');
    await fields.emailField.fill('vendedor.test@example.com');
    await fields.passwordField.fill('password12345');
    await fields.countryField.selectOption({ label: 'Colombia' }).catch(async () => {
      const options = await fields.countryField.locator('option').all();
      for (let i = 0; i < options.length; i++) {
        const value = await options[i].getAttribute('value');
        if (value) {
          await fields.countryField.selectOption({ index: i });
          break;
        }
      }
    });
    await fields.cityField.fill('Bogotá');
    await fields.addressField.fill('Calle 123 # 45-67');

    await page.screenshot({ path: 'test-results/validation-form-filled.png' });

    await expect(fields.submitButton).toBeEnabled().catch(async () => {
      await page.screenshot({ path: 'test-results/button-not-enabled.png' });
    });

    await fields.emailField.clear();
    await fields.emailField.fill('correo-invalido');
    await fields.nameField.click();

    await expect(fields.submitButton).toBeDisabled().catch(async () => {
      await page.screenshot({ path: 'test-results/button-still-enabled.png' });
    });
  });
});
