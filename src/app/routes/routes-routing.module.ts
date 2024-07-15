import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ngxPermissionsGuard } from 'ngx-permissions';

import { environment } from '@env/environment';
import { authGuard } from '@core';
import { MainLayoutComponent } from '@theme/main-layout/main-layout.component';
import { AdminLayoutComponent } from '@theme/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from '@theme/auth-layout/auth-layout.component';
import { HomepageComponent } from '@theme/homepage/homepage.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NewsShowComponent } from './news/components';
import {
  UserSessionComponent,
  UserSessionsComponent,
  UserSessionStartComponent,
  UserSessionSummaryComponent
} from "./answer-sessions/components";
import { Error403Component, Error404Component, Error500Component, LoginComponent, RegisterComponent } from "./sessions";


const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomepageComponent },
      { path: 'news/:id', component: NewsShowComponent },
      { path: 'sessions', component: UserSessionsComponent },
      { path: 'sessions/start', component: UserSessionStartComponent },
      { path: 'sessions/:id', component: UserSessionComponent },
      { path: 'sessions/:id/summary', component: UserSessionSummaryComponent },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule),
      },
      { path: '403', component: Error403Component },
      { path: '404', component: Error404Component },
      { path: '500', component: Error500Component },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, ngxPermissionsGuard],
    canActivateChild: [authGuard],
    data: {
      permissions: {
        only: 'ROLE_ADMIN',
        redirectTo: '/',
      },
    },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule),
      },
      {
        path: 'users',
        loadChildren: () => import('./users/users.module').then(m => m.UsersModule),
      },
      {
        path: 'news',
        loadChildren: () => import('./news/news.module').then(m => m.NewsModule),
      },
      {
        path: 'sessions',
        loadChildren: () => import('./answer-sessions/answer-sessions.module').then(m => m.AnswerSessionsModule),
      },
      {
        path: 'questions',
        loadChildren: () => import('./questions/questions.module').then(m => m.QuestionsModule),
      },
      {
        path: 'quizzes',
        loadChildren: () => import('./quizzes/quizzes.module').then(m => m.QuizzesModule),
      },
      {
        path: 'sources',
        loadChildren: () => import('./sources/sources.module').then(m => m.SourceModule),
      },
      {
        path: 'categories',
        loadChildren: () => import('./categories/categories.module').then(m => m.CategoriesModule),
      },
      {
        path: 'sets',
        loadChildren: () => import('./sets/sets.module').then(m => m.SetsModule),
      },
      { path: '403', component: Error403Component },
      { path: '404', component: Error404Component },
      { path: '500', component: Error500Component },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },

  { path: '**', redirectTo: 'homepage' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: environment.useHash,
    }),
  ],
  exports: [RouterModule],
})
export class RoutesRoutingModule {}
