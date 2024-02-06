import { Component, Injector, OnInit } from '@angular/core';
import { AbstractFeature, Feature } from '@modulefederation/portal';

@Component({
  selector: 'page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
@Feature({
  id: "**",
  label: "Page not found",
  icon: "language",
  isPageNotFound: true
})
export class PageNotFoundComponent extends AbstractFeature {
  // constructor

  constructor(injector: Injector) {
    super(injector)
  }
}
