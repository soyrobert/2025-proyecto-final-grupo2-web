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
    ventasApiUrl: 'http://localhost:3008/api/v1/ventas/gestor_ventas/vendedores/planes-venta',
    obtenerRutasApiUrl: 'http://localhost:3006/api/v1/logistica/gestor_entregas/ruta_camiones',
    asignarRutasApiUrl: 'http://localhost:3006/api/v1/logistica/gestor_entregas/asignar_ruta',
    listaVendedoresApiUrl: 'http://localhost:3011/api/v1/seguridad/gestor_usuarios/r/vendedores',
    listaProductosApiUrl: 'http://localhost:3011/api/v1/inventario/gestor_productos/productos',
    listaZonasApiUrl: 'http://localhost:3011/api/v1/inventario/gestor_productos/zonas',
    clientesVentasApiUrl: 'http://localhost:3008/api/v1/ventas/gestor_ventas/reporte/clientes-ventas',
    historicoVentasApiUrl: 'http://localhost:3008/api/v1/ventas/gestor_ventas/reporte/historico-ventas',
    planesMetaApiUrl: 'http://localhost:3008/api/v1/ventas/gestor_ventas/reporte/planes-y-metas',
    storageSignedUrlEndpoint: 'https://service-signed-urls-224260405910.us-central1.run.app'
};
