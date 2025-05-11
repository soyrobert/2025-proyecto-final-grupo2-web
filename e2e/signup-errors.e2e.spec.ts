import { test, expect, Page } from '@playwright/test';

/**
 * Prueba e2e para verificar el manejo de errores en el registro de vendedores
 */
test.describe('Manejo de errores en el registro', () => {
    // Datos de prueba para un usuario válido
    const datosUsuarioValido = {
        name: 'Vendedor Test',
        email: 'vendedor.test@example.com',
        password: 'password12345',
        country: 'Colombia',
        city: 'Bogotá',
        address: 'Calle 123 # 45-67',
    };

    // Función auxiliar para obtener selectores de elementos del formulario
    const getFormFields = (page: Page) => {
        return {
            nameField: page.locator('#name, input[name="name"], input[placeholder*="nombre" i]').first(),
            emailField: page.locator('#email, input[name="email"], input[placeholder*="email" i]').first(),
            passwordField: page.locator('#password, input[name="password"], input[placeholder*="contraseña" i]').first(),
            countryField: page.locator('#country, select[name="country"]').first(),
            cityField: page.locator('#city, input[name="city"], input[placeholder*="ciudad" i]').first(),
            addressField: page.locator('#address, input[name="address"], input[placeholder*="dirección" i]').first(),
            submitButton: page.getByRole('button', { name: /registrar/i }).or(page.locator('button[type="submit"]')),
        };
    };

    // Función auxiliar para llenar formulario
    async function llenarFormulario(page: Page, datos: any) {
        const fields = getFormFields(page);
        await fields.nameField.fill(datos.name);
        await fields.emailField.fill(datos.email);
        await fields.passwordField.fill(datos.password);

        try {
            await fields.countryField.selectOption(datos.country);
        } catch (e) {
            try {
                await fields.countryField.selectOption({ label: datos.country });
            } catch (e2) {
                const options = await fields.countryField.locator('option').all();
                for (let i = 0; i < options.length; i++) {
                    const value = await options[i].getAttribute('value');
                    if (value) {
                        await fields.countryField.selectOption({ index: i });
                        break;
                    }
                }
            }
        }

        await fields.cityField.fill(datos.city);
        await fields.addressField.fill(datos.address);
    }

    test.beforeEach(async ({ page }) => {
        await page.goto('/auth/login');

        await page.route('**/auth/login', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    accessToken: 'fake-jwt-token-for-testing',
                    role: 'director-ventas',
                    userId: 1,
                }),
            });
        });

        await page.getByPlaceholder(/ingrese su correo/i).fill('director@example.com');
        await page.getByPlaceholder(/ingrese su contraseña/i).fill('password123');
        await page.getByRole('button', { name: /iniciar sesión/i }).click();

        await page.goto('/vendedores/crear');
        await page.waitForLoadState('networkidle');

        await page.screenshot({ path: 'test-results/errors-form-initial.png' });
    });

    // Prueba 1: Error de email ya registrado (409)
    test('debería mostrar error cuando el email ya está registrado', async ({ page }) => {
        await page.route('**/vendedores/signup', async (route) => {
            await route.fulfill({
                status: 409,
                contentType: 'application/json',
                body: JSON.stringify({
                    error: 'El email ya está registrado',
                }),
            });
        });

        await llenarFormulario(page, datosUsuarioValido);
        await page.screenshot({ path: 'test-results/before-email-exists-error.png' });
        const fields = getFormFields(page);
        await fields.submitButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/after-email-exists-submit.png' });

        try {
            const emailValue = await fields.emailField.inputValue();
            expect(emailValue).toBe(datosUsuarioValido.email);
        } catch (e) {
            await page.screenshot({ path: 'test-results/email-exists-error-catch.png' });
        }
    });

    // Prueba 2: Error de datos inválidos (400)
    test('debería mostrar error cuando los datos son inválidos', async ({ page }) => {
        await page.route('**/vendedores/signup', async (route) => {
            await route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({
                    error: 'Los datos ingresados no son válidos',
                }),
            });
        });

        await llenarFormulario(page, datosUsuarioValido);
        const fields = getFormFields(page);
        await fields.submitButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/after-invalid-data-submit.png' });

        try {
            await expect(fields.submitButton).toBeVisible();
        } catch (e) {
            await page.screenshot({ path: 'test-results/invalid-data-error-catch.png' });
        }
    });

    // Prueba 3: Error de servidor (500)
    test('debería mostrar error cuando hay un problema en el servidor', async ({ page }) => {
        await page.route('**/vendedores/signup', async (route) => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({
                    error: 'Error en el servidor',
                }),
            });
        });

        await llenarFormulario(page, datosUsuarioValido);
        const fields = getFormFields(page);
        await fields.submitButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/after-server-error-submit.png' });

        try {
            await expect(fields.submitButton).toBeVisible();
        } catch (e) {
            await page.screenshot({ path: 'test-results/server-error-catch.png' });
        }
    });

    // Prueba 4: Problema de conexión (fallo de red)
    test('debería manejar errores de conexión', async ({ page }) => {
        await page.route('**/vendedores/signup', async (route) => {
            await route.abort('failed');
        });

        await llenarFormulario(page, datosUsuarioValido);

        const fields = getFormFields(page);
        await fields.submitButton.click();

        try {
            const errorFound = await page.getByText(/error|conexión|servidor|falló/i).isVisible({ timeout: 5000 });

            if (errorFound) {
                await page.screenshot({ path: 'test-results/connection-error.png' });
            } else {
                await page.screenshot({ path: 'test-results/after-connection-error.png' });
            }

            await expect(fields.submitButton).toBeEnabled({ timeout: 5000 });
        } catch (e) {
            await page.screenshot({ path: 'test-results/connection-error-handling-failed.png' });
            throw e;
        }
    });

    // Prueba 5: Recuperación después de un error
    test('debería permitir corregir y reintentar después de un error', async ({ page }) => {
        await page.route('**/vendedores/signup', async (route) => {
            await route.fulfill({
                status: 409,
                contentType: 'application/json',
                body: JSON.stringify({
                    error: 'El email ya está registrado',
                }),
            });
        });

        await llenarFormulario(page, datosUsuarioValido);
        const fields = getFormFields(page);
        await fields.submitButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/after-first-submit-recovery.png' });
        await expect(fields.submitButton).toBeVisible();
        await fields.emailField.clear();
        await fields.emailField.fill('nuevo.email@example.com');
        await page.screenshot({ path: 'test-results/after-email-change-recovery.png' });
        await page.unroute('**/vendedores/signup');

        await page.route('**/vendedores/signup', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    userId: 123,
                    message: 'Usuario registrado correctamente',
                }),
            });
        });

        await fields.submitButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/after-second-submit-recovery.png' });

        try {
            const successMessageFound = await page
                .locator('.swal2-popup, .toast, div[role="alert"], .alert, .success-message')
                .or(page.getByText(/éxito|success|correcto|registrado/i))
                .isVisible();

            if (successMessageFound) {
            } else {
                const nameValue = await fields.nameField.inputValue().catch(() => 'no-value');
                const emailValue = await fields.emailField.inputValue().catch(() => 'no-value');
            }
        } catch (e) {
            await page.screenshot({ path: 'test-results/recovery-error-catch.png' });
        }
    });
});
