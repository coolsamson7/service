const { withModuleFederation } = require('@nx/angular/module-federation');

const coreLibraries = new Set([
  '@angular/core',
  '@angular/common',
  '@angular/common/http',
  '@angular/router',

  // A workspace library

  '@modulefederation/portal',
]);

module.exports = withModuleFederation({
  name: 'shell',
  exposes: {
    './Module': 'apps/shell/src/app/shell.module.ts',
  },/*
  shared: (libraryName, defaultConfig) => {
    if (coreLibraries.has(libraryName)) {
      console.log('shell share ' + libraryName);
      console.log(defaultConfig);

      return defaultConfig;
    }

    // Returning false means the library is not shared.

    return false;
  },*/
});
