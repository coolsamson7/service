const { withModuleFederation } = require('@nx/angular/module-federation');

module.exports = withModuleFederation({
  name: 'portal-shell',
  exposes: {
    './Module': 'apps/portal-shell/src/app/shell.module.ts',
  },
});
