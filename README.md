# 2025-proyecto-final-grupo2

## Integrantes del equipo

* Maria del Mar Alas Escalante
* Jhon Puentes
* Robert Castro
* Daniel Gamez

## Índice

1. [Flujo de trabajo y estrategia de versionamiento](#flujo-de-trabajo-y-estrategia-de-versionamiento)


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
