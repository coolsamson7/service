/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @angular-eslint/use-lifecycle-interface */
import {
  AboutDialogService,
  AbstractFeature,
  Feature,
  FeatureData,
  FeatureRegistry,
  PortalManager,
  SessionManager,
  Ticket,
} from '@modulefederation/portal';
import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';

@Feature({
  id: 'public-portal',
  visibility: ['public'],
  tags: ['portal'],
  router: {
    lazyModule: 'PublicPortalModule',
  },
})
@Component({
  selector: 'public-portal',
  templateUrl: './public-portal-component.html',
  styleUrls: ['./public-portal-component.scss'],
})
export class PublicPortalComponent extends AbstractFeature {
  // instance data

  features: FeatureData[] = [];

  // constructor

  constructor(
    injector: Injector,
    private aboutDialogService: AboutDialogService,
    private router: Router,
    private featureRegistry: FeatureRegistry,
    private sessionManager: SessionManager<any, Ticket>,
    private portalManager: PortalManager
  ) {
    super(injector);

    featureRegistry.registry$.subscribe((_) => this.computeNavigation());
  }

  // public

  about() {
    this.aboutDialogService.show();
  }

  login() {
    this.sessionManager
      .openSession({
        user: 'admin',
        password: 'admin',
      })
      .subscribe(
        (session) => {
          this.portalManager
            .loadDeployment(true)
            .then((result) => this.router.navigate([this.router.url]));
        },
        (error) => {
          console.log(error);
        }
      );
  }

  // private

  private computeNavigation() {
    this.features = this.featureRegistry
      .finder()
      .withEnabled()
      .withTag('navigation')
      .find();
  }
}
