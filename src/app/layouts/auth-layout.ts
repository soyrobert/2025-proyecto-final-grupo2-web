import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { AppService } from '../service/app.service';
import { TranslateModule } from '@ngx-translate/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterOutlet],
  templateUrl: './auth-layout.html',
})
export class AuthLayout implements OnInit, OnDestroy {
  store: any;
  showTopButton = false;
  headerClass = '';

  constructor(public storeData: Store<any>, private service: AppService) {
    this.initStore();
  }

  ngOnInit(): void {
    this.toggleLoader();
    window.addEventListener('scroll', this.onScroll);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
  }

  private onScroll = (): void => {
    this.showTopButton =
      document.body.scrollTop > 50 || document.documentElement.scrollTop > 50;
  };

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
