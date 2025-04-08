import { ApplicationConfig, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
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

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { ConfigService } from './services/config/config.service';

export function HttpLoaderFactory(httpHandler: HttpBackend): TranslateHttpLoader {
  return new TranslateHttpLoader(new HttpClient(httpHandler));
}

export function getBaseUrl() {
  return document.getElementsByTagName('base')[0].href;
}

// Factory para inicializar el ConfigService
export function initializeConfigService(configService: ConfigService) {
  return () => configService.initialize();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] },
    // Inicialización del ConfigService antes de que arranque la app
    {
      provide: APP_INITIALIZER,
      useFactory: initializeConfigService,
      deps: [ConfigService],
      multi: true
    },
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