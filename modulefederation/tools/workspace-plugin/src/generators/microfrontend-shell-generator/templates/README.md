# Introduction

This is a minimal implementation of a shell, ready to integrate additional microfrontends.

## Portal

The implemented logic assumes that the overall application provides features marked with the tag "portal" that will provide the top-level frames
for the application. Depending on the visibility "private" or "public" it will pick the corresponding feature based on the state of the session ( e.g. logged or not logged in )

## Additional generators

There are additional generators that will help you

## Microfrontend generator

`nx g microfrontend-generator`

will let you scaffold a new microfrontend

### Feature generator

`nx g feature-generator`

is used to scaffold new features.

### Portal artifact generator

`nx g portal-artifact-generator`

is used to generate additional code artifacts based on a project, which are
* `webpack.config.js`
* the extracted meta-data in form of a `manifest.json`
* Angular routes and the corresponding modules

