import { Routes } from '@angular/router';
import { PeopleListComponent } from './features/people/people-list/people-list.component';
import { PeopleDetailComponent } from './features/people/people-detail/people-detail.component';
import { FrontpageComponent } from './features/frontpage/frontpage.component';

/**
 * Application routing configuration
 *
 * Routes:
 * - '' (root) -> redirects to /charaktere
 * - '/charaktere' -> People list view
 * - '/charaktere/:id' -> People detail view
 * - '/filme' -> Films list view (to be implemented)
 * - '/filme/:id' -> Films detail view (to be implemented)
 * - '/planeten' -> Planets list view (to be implemented)
 * - '/planeten/:id' -> Planets detail view (to be implemented)
 *
 * Note: Film and Planet routes are placeholders for user implementation
 */
export const routes: Routes = [
  // Root / Frontpage
  {
    path: '',
    component: FrontpageComponent,
    title: 'Star Wars'
  },

  // People/Characters routes (COMPLETE REFERENCE IMPLEMENTATION)
  {
    path: 'charaktere',
    component: PeopleListComponent,
    title: 'Charaktere | Star Wars'
  },
  {
    path: 'charaktere/:id',
    component: PeopleDetailComponent,
    title: 'Charakter Details | Star Wars'
  },

  // Films routes (TO BE IMPLEMENTED BY USER)
  // {
  //   path: 'filme',
  //   component: FilmsListComponent,
  //   title: 'Filme | Star Wars'
  // },
  // {
  //   path: 'filme/:id',
  //   component: FilmsDetailComponent,
  //   title: 'Film Details | Star Wars'
  // },

  // Planets routes (TO BE IMPLEMENTED BY USER)
  // {
  //   path: 'planeten',
  //   component: PlanetsListComponent,
  //   title: 'Planeten | Star Wars'
  // },
  // {
  //   path: 'planeten/:id',
  //   component: PlanetsDetailComponent,
  //   title: 'Planet Details | Star Wars'
  // },

  // Wildcard route - redirect to home
  {
    path: '**',
    redirectTo: '/'
  }
];
