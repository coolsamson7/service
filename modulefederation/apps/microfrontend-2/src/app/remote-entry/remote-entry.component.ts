import { Component } from '@angular/core';
import { AbstractFeature, Feature } from '@modulefederation/portal';

@Feature({
  id: '',
  label: 'microfrontend-2',
  tags: ['navigation'],
  visibility: ['public', 'private'],
})
@Component({
  selector: 'microfrontend-2',
  template: `<div>microfrontend-2</div>`,
})
export class RemoteEntryComponent extends AbstractFeature {}
