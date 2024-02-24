/* eslint-disable @angular-eslint/component-selector */
import { Component } from '@angular/core';
import {
  FeatureData,
  FeatureRegistry,
  SessionManager,
  Ticket,
} from '@modulefederation/portal';

@Component({
  selector: 'app-root',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  // instance data

  portal: FeatureData

  // private

  constructor(featureRegistry: FeatureRegistry, private sessionManager: SessionManager<any, Ticket>) {
    featureRegistry.registry$.subscribe(registry => (this.portal = this.determinePortal(featureRegistry)));

    this.portal = this.determinePortal(featureRegistry);
  }

  // constructor

  determinePortal(featureRegistry: FeatureRegistry): FeatureData {
    return featureRegistry
      .finder()
      .withTag('portal')
      .withVisibility(this.sessionManager.hasSession() ? 'private' : 'public')
      .findOne()
  }
}
