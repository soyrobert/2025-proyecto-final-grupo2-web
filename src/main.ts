import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.route';
import { provideAnimations } from '@angular/platform-browser/animations';

import { StoreModule } from '@ngrx/store';
import { indexReducer } from './app/store/index.reducer';

// Shared module conversion
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpBackend, HttpClient, HttpClientModule } from '@angular/common/http';
import { NgScrollbarModule, provideScrollbarOptions } from 'ngx-scrollbar';
import { MenuModule } from 'headlessui-angular';
import { IconModule } from './app/shared/icon/icon.module';
import { AppService } from './app/service/app.service';

export function HttpLoaderFactory(httpHandler: HttpBackend): TranslateHttpLoader {
  return new TranslateHttpLoader(new HttpClient(httpHandler));
}

export function getBaseUrl() {
  return document.getElementsByTagName('base')[0].href;
}

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] },
    provideRouter(routes),
    provideAnimations(),
    provideScrollbarOptions({
      visibility: 'hover',
      appearance: 'compact',
    }),
    AppService,
    importProvidersFrom(
      HttpClientModule,
      FormsModule,
      ReactiveFormsModule,
      StoreModule.forRoot({ index: indexReducer }),
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpBackend],
        },
      }),
      NgScrollbarModule,
      MenuModule,
      IconModule
    ),
  ],
}).catch((err) => console.error(err));
