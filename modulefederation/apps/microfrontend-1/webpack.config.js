const { withModuleFederation } = require('@nx/angular/module-federation');

module.exports = withModuleFederation({
  name: 'microfrontend-1',
  exposes: {
    './Module':
      'apps/microfrontend-1/src/app/remote-entry/remote-entry.module.ts',
  },
});
