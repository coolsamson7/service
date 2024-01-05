// DO NOT TOUCH THIS FILE
// GENERATED BY MICROFRONTEND GENERATOR V1.0

import { Routes, RouterModule } from '@angular/router';

import { TranslationEditorComponent } from './translation/translation-editor.component';

import { MirofrontendsComponent } from './portal/microfrontends.component';

import { MicrofrontendDetailsComponent } from './portal/microfrontend-details.component';

import { NodesComponent } from './nodes/nodes.component';

import { NodeDetailsComponent } from './nodes/node-details.component';

import { OtherPreferences } from './home/preferences-dialog';

import { LocalePreferences } from './home/locale-preferences';

import { HomeComponent } from './home/home-component';

import { ErrorComponent } from './error/error-feature';

import { ComponentsComponent } from './components/components.component';

import { ComponentDetailsComponent } from './components/component-details.component';

import { ServiceInstanceComponent } from './components/service-instance.component';

export const localRoutes: Routes = [
  {
    path: '',
    redirectTo: 'translations',
    pathMatch: 'full',
  },
  {
    path: 'translations',
    component: TranslationEditorComponent,
    children: [],
  },
  {
    path: 'microfrontends',
    component: MirofrontendsComponent,
    children: [
      {
        path: ':microfrontend',
        component: MicrofrontendDetailsComponent,
        children: [],
      },
    ],
  },
  {
    path: 'nodes',
    component: NodesComponent,
    children: [
      {
        path: ':node',
        component: NodeDetailsComponent,
        children: [],
      },
    ],
  },
  {
    path: 'other-preferences',
    component: OtherPreferences,
    children: [],
  },
  {
    path: 'language-preferences',
    component: LocalePreferences,
    children: [],
  },
  {
    path: 'home',
    component: HomeComponent,
    children: [],
  },
  {
    path: 'error',
    component: ErrorComponent,
    children: [],
  },
  {
    path: 'components',
    component: ComponentsComponent,
    children: [
      {
        path: ':component',
        component: ComponentDetailsComponent,
        children: [
          {
            path: ':instance',
            component: ServiceInstanceComponent,
            children: [],
          },
        ],
      },
    ],
  },
];
