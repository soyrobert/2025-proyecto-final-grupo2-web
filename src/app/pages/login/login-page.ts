import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { toggleAnimation } from 'src/app/shared/animations';
import { AppService } from 'src/app/service/app.service';
import { IconCaretDownComponent } from 'src/app/shared/icon/icon-caret-down';
import { IconMailComponent } from 'src/app/shared/icon/icon-mail';
import { IconLockDotsComponent } from 'src/app/shared/icon/icon-lock-dots';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MenuModule } from 'headlessui-angular';

@Component({
  standalone: true,
  selector: 'app-login-page',
  templateUrl: './login-page.html',
  animations: [toggleAnimation],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    IconCaretDownComponent,
    IconMailComponent,
    IconLockDotsComponent,
    MenuModule,
  ],
})
export class LoginPage {
  store: any;
  currYear: number = new Date().getFullYear();

  email: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string | null = null;
  submitted: boolean = false;
  emailTouched = false;
  passwordTouched = false;
  isEmailValid = true;

  constructor(
    public translate: TranslateService,
    public storeData: Store<any>,
    public router: Router,
    private appSetting: AppService,
    private authService: AuthService
  ) {
    this.initStore();
  }

  async onSubmit() {
    this.submitted = true;
    this.emailTouched = true;
    this.passwordTouched = true;

    if (!this.email || !this.password) {
      return;
    }

    this.errorMessage = null;
    this.loading = true;
    const success = await this.authService.login(this.email, this.password);
    this.loading = false;

    if (success) {
      const role = localStorage.getItem('userRole');
      setTimeout(() => {
        switch (role) {
          case 'director-ventas':
            this.router.navigate(['/vendedores']);
            break;
          case 'encargado-logistica':
            this.router.navigate(['/logistica']);
            break;
          case 'director-compras':
            this.router.navigate(['/proveedores']);
            break;
          default:
            this.router.navigate(['/auth/login']);
        }
      });
    } else {
      this.errorMessage = this.translate.instant('msg_credenciales_incorrectas');
    }
  }

  async initStore() {
    this.storeData.select((d) => d.index).subscribe((d) => {
      this.store = d;
    });
  }

  changeLanguage(item: any) {
    this.translate.use(item.code);
    this.appSetting.toggleLanguage(item);
    if (this.store?.rtlClass) {
      document.querySelector('body')?.classList.add(this.store.rtlClass);
    }
  }

  trackByLangCode(index: number, item: any) {
    return item.code;
  }

  onEmailBlur() {
    this.emailTouched = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.isEmailValid = emailRegex.test(this.email);
  }

  onPasswordBlur() {
    this.passwordTouched = true;
  }
}
