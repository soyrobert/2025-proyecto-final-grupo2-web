# 2025-proyecto-final-grupo2

## Integrantes del equipo

* Maria del Mar Alas Escalante
* Jhon Puentes
* Robert Castro
* Daniel Gamez

## Índice

1. [Flujo de trabajo y estrategia de versionamiento](#flujo-de-trabajo-y-estrategia-de-versionamiento)

## Flujo de trabajo y estrategia de versionamiento

Para gestionar el desarrollo de la plataforma, utilizamos **GitHub** con el modelo de ramificación basado similar a **Git Flow**. Este flujo permite un desarrollo estructurado y organizado, asegurando estabilidad en el código base.

### Estructura de ramas
- **`main`**: Contiene las versiones estables y listas para producción. Solo se actualiza con versiones etiquetadas.
- **`feature/*`**: Ramas dedicadas a nuevas funcionalidades. Se crean desde `develop` y se fusionan nuevamente en `develop` cuando están completas.
- **`hotfix/*`**: Para corregir errores críticos en `main`. Se crean desde `main`, se corrigen y luego se fusionan tanto en `main` como en `develop`.
- **`release/*`**: Preparación de una nueva versión estable. Se crean desde `develop`, se prueban y se fusionan en `main` cuando están listas.
- **`docs/*`**: Preparación de una rama con documentación.

### Proceso de desarrollo
1. Un desarrollador crea una rama `feature/nueva-funcionalidad` desde `main`.
2. Se desarrolla la funcionalidad y se crean pull requests (PR) para revisión de código. Esta revisión se hace de forma automática (por CodeRabbit) como por el companero que aprueba.
3. Tras aprobarse, se fusiona en `main` y se somete a consideración la eliminación de las ramas temporales.
4. Al completar un conjunto de funcionalidades, se crea una rama `release/x.y.z` para pruebas finales.
5. Si es aprobada, la `release/x.y.z` se fusiona en `main`, se etiqueta y se lanza la versión.
6. Si surgen errores críticos en producción, se crean ramas `hotfix/x.y.z+1` desde `main` y se aplican las correcciones.

## Estrategia de Versionamiento
Utilizamos **Semantic Versioning (SemVer)** para numerar versiones:
```bash
MAJOR.MINOR.PATCH
```
- **MAJOR**: Cambios incompatibles con versiones anteriores.
- **MINOR**: Nuevas funcionalidades sin romper compatibilidad.
- **PATCH**: Correcciones de errores y mejoras menores.

Manejaremos el estandard por release por sprint. Es decir, la version mayor avanzará a medida que avanza el sprint.
Haciendo coincidir, spritn 1 con la version 1.x.x, sprint 2 con la version 2.x.x.

### Ejemplo de versiones
- `1.0.0`: Primera versión estable del producto.
- `1.1.0`: Se agrega una nueva funcionalidad sin romper compatibilidad.
- `1.1.1`: Se corrige un bug sin modificar funcionalidades.
- `2.0.0`: Cambios importantes que hacen incompatible la nueva versión con la anterior.

### Manejo de versiones en Git
Cada versión estable se etiqueta en Git con el formato:
```bash
git tag -a vMAJOR.MINOR.PATCH -m "Descripción de la versión"
git push origin vMAJOR.MINOR.PATCH
```
Ejemplo:
```bash
git tag -a v1.0.0 -m "Primera versión estable"
git push origin v1.0.0
```
