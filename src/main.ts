import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/**
 * Application entry point
 * Bootstraps the Angular application with standalone components
 */
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
