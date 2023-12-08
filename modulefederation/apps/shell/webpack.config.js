const { withModuleFederation } = require('@nrwl/angular/module-federation');

module.exports = withModuleFederation({
  name: 'shell',
  exposes: {
    './Module': 'apps/shell/src/app/app.module.ts',
  }
});
