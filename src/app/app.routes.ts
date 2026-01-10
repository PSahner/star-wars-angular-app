import { Routes } from '@angular/router';
import { FrontpageComponent } from './features/frontpage/frontpage.component';
import { ResourceListComponent } from './features/resources/resource-list/resource-list.component';
import { ResourceDetailComponent } from './features/resources/resource-detail/resource-detail.component';

/**
 * Application routing configuration
 *
 * Routes:
 * - '' (root) -> frontpage
 * - '/people' -> People list view
 * - '/people/:id' -> People detail view
 * - '/films' -> Films list view
 * - '/films/:id' -> Films detail view
 * - '/planets' -> Planets list view
 * - '/planets/:id' -> Planets detail view
 * - '**' -> redirects to '/'
 */
export const routes: Routes = [
  {
    path: '',
    component: FrontpageComponent,
    title: 'Star Wars'
  },
  {
    path: 'people',
    component: ResourceListComponent,
    data: { resourceKey: 'people' },
    title: 'People | Star Wars'
  },
  {
    path: 'people/:id',
    component: ResourceDetailComponent,
    data: { resourceKey: 'people' },
    title: 'People Details | Star Wars'
  },
  {
    path: 'films',
    component: ResourceListComponent,
    data: { resourceKey: 'films' },
    title: 'Films | Star Wars'
  },
  {
    path: 'films/:id',
    component: ResourceDetailComponent,
    data: { resourceKey: 'films' },
    title: 'Film Details | Star Wars'
  },
  {
    path: 'planets',
    component: ResourceListComponent,
    data: { resourceKey: 'planets' },
    title: 'Planets | Star Wars'
  },
  {
    path: 'planets/:id',
    component: ResourceDetailComponent,
    data: { resourceKey: 'planets' },
    title: 'Planet Details | Star Wars'
  },
  {
    path: '**',
    redirectTo: '/'
  }
];
