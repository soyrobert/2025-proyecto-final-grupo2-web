import { test, expect } from '@playwright/test';

/**
 * Prueba e2e para verificar las validaciones del formulario de login
 */
test.describe('Validación del formulario de login', () => {
  // Antes de cada prueba, navegar a la página de login
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    // Esperar a que la página de login se cargue completamente
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  });

  // Prueba de validación de formato de correo electrónico
  test('debería validar el formato del correo electrónico', async ({ page }) => {
    await page.getByLabel('Correo electrónico').fill('correo-invalido');
    await page.getByLabel('Correo electrónico').blur();

    await expect(page.getByText('Ingrese un email válido')).toBeVisible();

    await page.getByLabel('Correo electrónico').fill('usuario@ejemplo.com');
    await page.getByLabel('Correo electrónico').blur();

    await expect(page.getByText('Luce bien')).toBeVisible();
  });

  // Prueba de validación de contraseña
  test('debería validar que la contraseña no esté vacía', async ({ page }) => {
    await page.getByLabel('Contraseña').click();
    await page.getByLabel('Contraseña').blur();

    await expect(page.getByText('La contraseña es obligatoria')).toBeVisible();

    await page.getByLabel('Contraseña').fill('password123');
    await page.getByLabel('Contraseña').blur();

    await expect(page.getByText('Luce bien')).toBeVisible();
  });

  // Prueba de habilitación/deshabilitación del botón de login
  test('debería habilitar el botón solo cuando el formulario sea válido', async ({ page }) => {

    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeDisabled();

    await page.getByLabel('Correo electrónico').fill('usuario@ejemplo.com');
    await page.getByLabel('Correo electrónico').blur();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeDisabled();

    await page.getByLabel('Correo electrónico').clear();
    await page.getByLabel('Contraseña').fill('password123');
    await page.getByLabel('Contraseña').blur();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeDisabled();

    await page.getByLabel('Correo electrónico').fill('usuario@ejemplo.com');
    await page.getByLabel('Correo electrónico').blur();
    await page.getByLabel('Contraseña').fill('password123');
    await page.getByLabel('Contraseña').blur();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled();

    await page.getByLabel('Correo electrónico').clear();
    await page.getByLabel('Correo electrónico').fill('correo-invalido');
    await page.getByLabel('Correo electrónico').blur();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeDisabled();
  });
});
