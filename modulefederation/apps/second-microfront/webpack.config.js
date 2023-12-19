const { withModuleFederation } = require('@nrwl/angular/module-federation');

module.exports = withModuleFederation({
  name: 'second-microfront',
  exposes: {
    './Module': 'apps/second-microfront/src/app/remote-entry/remote-entry.module.ts',
  },
});
