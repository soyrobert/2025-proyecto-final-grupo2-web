export interface MenuItem {
    icon: string;
    label: string;
    path: string;
  }
  
  export interface MenuGroup {
    title: string;
    items: MenuItem[];
  }
  
  export const ROLE_MENUS: Record<string, MenuGroup[]> = {
    'director-ventas': [
      {
        title: 'item_vendedores',
        items: [
          {
            icon: 'icon-chart-square',
            label: 'txt_reportes_e_informes',
            path: '/vendedores',
          },
          {
            icon: 'icon-shopping-bag',
            label: 'txt_planes_de_venta_vendedores',
            path: '/vendedores/planes-venta',
          },
        ],
      },
    ],
    'director-compras': [
      {
        title: 'txt_title_proveedores',
        items: [
          {
            icon: 'icon-user-plus',
            label: 'txt_registro_proveedores',
            path: '/proveedores',
          },
        ],
      },
      {
        title: 'txt_title_proveedores_productos',
        items: [
          {
            icon: 'icon-box',
            label: 'txt_registro_productos',
            path: '/proveedores/importar-productos',
          },
          
        ],
      },
    ],
    'encargado-logistica': [
      {
        title: 'txt_title_logistica_productos',
        items: [
          {
            icon: 'icon-search',
            label: 'txt_logisitica_busqueda_productos',
            path: '/logistica',
          },
          
        ],
      },
      {
        title: 'txt_title_logistica_visitas',
        items: [
          {
            icon: 'icon-map-pin',
            label: 'txt_logistica_planificacion_rutas',
            path: '/logistica/rutas',
          },
        ],
      },
    ]
  };
  