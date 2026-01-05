import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';

/**
 * Application configuration
 * Provides essential services and configurations for the Angular app
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Zone.js change detection with event coalescing for better performance
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router configuration
    provideRouter(routes),

    // HTTP client configuration
    provideHttpClient(withInterceptorsFromDi())
  ]
};
