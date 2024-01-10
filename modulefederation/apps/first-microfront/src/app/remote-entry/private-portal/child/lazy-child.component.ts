import { Feature } from "@modulefederation/portal";
import { Component } from "@angular/core";

@Feature({
  id: 'lazy-child',
  visibility: ["private", "public"],
  parent: "private-portal",
  router: {
    lazyModule: "LazyChildModule"
  }
})
@Component({
  selector: 'lazy-child',
  template: '<div>Lazy...</div>',
})
export class  LazyComponent {}
