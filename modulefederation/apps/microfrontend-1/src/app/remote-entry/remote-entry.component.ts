import { Component } from '@angular/core';
import { AbstractFeature, Feature } from '@modulefederation/portal';

@Feature({
  id: '',
  label: 'microfrontend-1',
  tags: ['navigation'],
  visibility: ['public', 'private'],
})
@Component({
  selector: 'microfrontend-1',
  template: `<div>hallo andi microfrontend-1 ssssss</div>`,
})
export class RemoteEntryComponent extends AbstractFeature {}
