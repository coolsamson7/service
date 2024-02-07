const { withModuleFederation } = require('@nx/angular/module-federation');

module.exports = withModuleFederation({
  name: 'first-microfront',
  exposes: {
    './Module':
      'apps/first-microfront/src/app/remote-entry/remote-entry.module.ts',
  },
});
