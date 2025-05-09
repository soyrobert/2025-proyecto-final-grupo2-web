// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    apiBaseUrl: 'http://localhost:3011/api/v1/seguridad/gestor_usuarios/r',
    proveedoresApiUrl: 'http://localhost:3003/api/v1/inventario/gestor_proveedores',
    usuariosApiUrl: 'http://localhost:3011/api/v1/seguridad/gestor_usuarios/w',
    productosApiUrl: 'http://localhost:3001/api/v1/inventario/gestor_productos',
    busquedaProductosApiUrl: 'http://localhost:3001/api/v2/inventario/gestor_productos',
    storageSignedUrlEndpoint: 'https://service-signed-urls-224260405910.us-central1.run.app'
};
