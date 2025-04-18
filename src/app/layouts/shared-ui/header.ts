﻿import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Router, NavigationEnd } from '@angular/router';
import { AppService } from '../../service/app.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toggleAnimation } from 'src/app/shared/animations';
import { IconMenuComponent } from 'src/app/shared/icon/icon-menu';
import { IconSunComponent } from '../../shared/icon/icon-sun';
import { IconMoonComponent } from '../../shared/icon/icon-moon';
import { IconLaptopComponent } from '../../shared/icon/icon-laptop';
import { IconLogoutComponent } from '../../shared/icon/icon-logout';
import { MenuModule } from 'headlessui-angular';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MenuModule,
    IconMenuComponent,
    IconSunComponent,
    IconMoonComponent,
    IconLaptopComponent,
    IconLogoutComponent
  ],
  templateUrl: './header.html',
  animations: [toggleAnimation],
})
export class HeaderComponent implements OnInit {
  store: any;
  search = false;
  

  roleMap: Record<string, string> = {
    'director-ventas': 'Ventas',
    'encargado-logistica': 'Logística',
    'director-compras': 'Compras',
  };

  userEmail: string | null = null;
  userRoleText: string | null = null;
  
  constructor(
    public translate: TranslateService,
    public storeData: Store<any>,
    public router: Router,
    private appSetting: AppService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
  ) {
    this.initStore();
  }

  async initStore() {
    this.storeData.select((d) => d.index).subscribe((d) => {
      this.store = d;
    });
  }

  ngOnInit() {
    this.setActiveDropdown();

    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');

    this.userEmail = email;
    this.userRoleText = role ? this.roleMap[role] || 'Sin rol' : null;

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setActiveDropdown();
      }
    });
  }

  setActiveDropdown() {
    const selector = document.querySelector(
      'ul.horizontal-menu a[routerLink="' + window.location.pathname + '"]'
    );
    if (selector) {
      selector.classList.add('active');
      const all: any = document.querySelectorAll(
        'ul.horizontal-menu .nav-link.active'
      );
      for (let i = 0; i < all.length; i++) {
        all[0]?.classList.remove('active');
      }
      const ul: any = selector.closest('ul.sub-menu');
      if (ul) {
        let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
        if (ele) {
          ele = ele[0];
          setTimeout(() => {
            ele?.classList.add('active');
          });
        }
      }
    }
  }

  changeLanguage(item: any) {
    this.translate.use(item.code);
    this.appSetting.toggleLanguage(item);
    if (this.store.locale?.toLowerCase() === 'ae') {
      this.storeData.dispatch({ type: 'toggleRTL', payload: 'rtl' });
    } else {
      this.storeData.dispatch({ type: 'toggleRTL', payload: 'ltr' });
    }
    window.location.reload();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
