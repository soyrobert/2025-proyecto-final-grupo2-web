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
    await page.locator('#Email').fill('correo-invalido');
    await page.locator('#Email').blur();

    await expect(page.getByText('Ingrese un email válido')).toBeVisible();
    await expect(page.locator('#email-error')).toBeVisible();

    await page.locator('#Email').fill('usuario@ejemplo.com');
    await page.locator('#Email').blur();

    await expect(page.getByText('Luce bien')).toBeVisible();
    await expect(page.locator('#email-valid')).toBeVisible();
  });

  // Prueba de validación de contraseña
  test('debería validar que la contraseña no esté vacía', async ({ page }) => {
    await page.locator('#Password').click();
    await page.locator('#Password').blur();

    await expect(page.getByText('La contraseña es obligatoria')).toBeVisible();
    await expect(page.locator('#password-error')).toBeVisible();

    await page.locator('#Password').fill('password123');
    await page.locator('#Password').blur();

    await expect(page.getByText('Luce bien')).toBeVisible();
    await expect(page.locator('#password-valid')).toBeVisible();
  });

  // Prueba de habilitación/deshabilitación del botón de login
  test('debería habilitar el botón solo cuando el formulario sea válido', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeDisabled();

    // Validación con correo electrónico válido pero sin contraseña
    await page.locator('#Email').fill('usuario@ejemplo.com');
    await page.locator('#Email').blur();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeDisabled();

    // Validación con contraseña pero sin correo electrónico
    await page.locator('#Email').clear();
    await page.locator('#Password').fill('password123');
    await page.locator('#Password').blur();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeDisabled();

    // Validación con ambos campos correctos
    await page.locator('#Email').fill('usuario@ejemplo.com');
    await page.locator('#Email').blur();
    await page.locator('#Password').fill('password123');
    await page.locator('#Password').blur();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled();

    // Validación con correo inválido y contraseña válida
    await page.locator('#Email').clear();
    await page.locator('#Email').fill('correo-invalido');
    await page.locator('#Email').blur();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeDisabled();
  });
});
