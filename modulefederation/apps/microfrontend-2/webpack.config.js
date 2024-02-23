const { withModuleFederation } = require('@nx/angular/module-federation');

module.exports = withModuleFederation({
  name: 'microfrontend-2',
  exposes: {
    './Module':
      'apps/microfrontend-2/src/app/remote-entry/remote-entry.module.ts',
  },
});
