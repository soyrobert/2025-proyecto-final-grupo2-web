import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { AppService } from '../../service/app.service';
import { SidebarComponent } from './../shared-ui/sidebar';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './../shared-ui/header';

@Component({
  selector: 'vendedores-layout',
  standalone: true,
  imports: [CommonModule, TranslateModule, SidebarComponent,  RouterOutlet, HeaderComponent],
  templateUrl: './vendedores-layout.html',
})
export class VendedoresLayout implements OnInit, OnDestroy {
  store: any;
  showTopButton = false;
  headerClass = '';

  constructor(
    public translate: TranslateService,
    public storeData: Store<any>,
    private service: AppService,
    private router: Router
  ) {
    this.initStore();
  }

  ngOnInit(): void {
    this.initAnimation();
    this.toggleLoader();
    window.addEventListener('scroll', () => {
        if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
            this.showTopButton = true;
        } else {
            this.showTopButton = false;
        }
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
  }

  private onScroll = (): void => {
    this.showTopButton =
      document.body.scrollTop > 50 || document.documentElement.scrollTop > 50;
  };

  initAnimation(): void {
    this.service.changeAnimation();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.service.changeAnimation();
      }
    });

    const ele: any = document.querySelector('.animation');
    if (ele) {
      ele.addEventListener('animationend', () => {
        this.service.changeAnimation('remove');
      });
    }
  }

  toggleLoader(): void {
    this.storeData.dispatch({ type: 'toggleMainLoader', payload: true });
    setTimeout(() => {
      this.storeData.dispatch({ type: 'toggleMainLoader', payload: false });
    }, 500);
  }

  async initStore(): Promise<void> {
    this.storeData.select((d) => d.index).subscribe((d) => {
      this.store = d;
    });
  }

  goToTop(): void {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }
}
