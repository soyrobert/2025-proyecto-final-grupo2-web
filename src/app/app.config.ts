import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpBackend, HttpClient } from '@angular/common/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { indexReducer } from './store/index.reducer';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { NgScrollbarModule, provideScrollbarOptions } from 'ngx-scrollbar';
import { MenuModule } from 'headlessui-angular';


import { routes } from './app.route';
import { AppService } from './service/app.service';

export function HttpLoaderFactory(httpHandler: HttpBackend): TranslateHttpLoader {
  return new TranslateHttpLoader(new HttpClient(httpHandler));
}

export function getBaseUrl() {
  return document.getElementsByTagName('base')[0].href;
}

export const appConfig: ApplicationConfig = {
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
    ),
  ],
};
