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
  ],
})
export class LoginPage {
  store: any;
  currYear: number = new Date().getFullYear();

  constructor(
    public translate: TranslateService,
    public storeData: Store<any>,
    public router: Router,
    private appSetting: AppService
  ) {
    this.initStore();
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
}
