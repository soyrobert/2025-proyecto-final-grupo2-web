import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { slideDownUp } from '../../shared/animations';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { IconCaretsDownComponent } from '../../shared/icon/icon-carets-down';
import { IconMenuUsersComponent } from '../../shared/icon/menu/icon-menu-users';
import { PlanesVentaComponent } from 'src/app/shared/icon/planes-venta';
import { IconChartSquareComponent } from 'src/app/shared/icon/icon-chart-square';
import { IconUserPlusComponent } from 'src/app/shared/icon/icon-user-plus';
import { IconBoxComponent } from 'src/app/shared/icon/icon-box';
import { IconSearchComponent } from 'src/app/shared/icon/icon-search';
import { MenuService } from 'src/app/services/menu.service';
import {IconMapPinComponent} from 'src/app/shared/icon/icon-map-pin';
import { IconShoppingBagComponent } from 'src/app/shared/icon/icon-shopping-bag';
import { MenuGroup } from 'src/app/config/menu.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule,
    TranslateModule,
    NgScrollbarModule,
    IconCaretsDownComponent,
    IconMenuUsersComponent,
    PlanesVentaComponent,
    IconChartSquareComponent,
    IconUserPlusComponent,
    RouterModule,
    IconBoxComponent,
    IconSearchComponent,
    IconMapPinComponent,
    IconShoppingBagComponent
  ],
  templateUrl: './sidebar.html',
  animations: [slideDownUp],
})
export class SidebarComponent implements OnInit {
  active = false;
  store: any;
  activeDropdown: string[] = [];
  parentDropdown: string = '';
  menuGroups: MenuGroup[] = [];

  constructor(
    public translate: TranslateService,
    public storeData: Store<any>,
    public router: Router,
    private menuService: MenuService
  ) {
    this.initStore();
  }

  async initStore() {
    this.storeData.select((d) => d.index).subscribe((d) => {
      this.store = d;
    });
  }

  ngOnInit() {
    const role = localStorage.getItem('userRole');
    this.menuGroups = this.menuService.getMenuByRole(role);
    this.setActiveDropdown();
  }

  setActiveDropdown() {
    const selector = document.querySelector(
      '.sidebar ul a[routerLink="' + window.location.pathname + '"]'
    );
    if (selector) {
      selector.classList.add('active');
      const ul: any = selector.closest('ul.sub-menu');
      if (ul) {
        let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
        if (ele.length) {
          ele = ele[0];
          setTimeout(() => {
            ele.click();
          });
        }
      }
    }
  }

  toggleMobileMenu() {
    if (window.innerWidth < 1024) {
      this.storeData.dispatch({ type: 'toggleSidebar' });
    }
  }

  toggleAccordion(name: string, parent?: string) {
    if (this.activeDropdown.includes(name)) {
      this.activeDropdown = this.activeDropdown.filter((d) => d !== name);
    } else {
      this.activeDropdown.push(name);
    }
  }
}
