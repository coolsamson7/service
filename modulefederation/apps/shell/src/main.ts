import { LocalDeploymentLoader } from './portal/deployment';

import * as localManifest from './assets/manifest.json';

new LocalDeploymentLoader(localManifest,"http://localhost:4201", "http://localhost:4202")
  .load()
  .then((deployment) => deployment.setRemoteDefinitions())
  .then(() => import('./bootstrap').catch((err) => console.error(err)));
