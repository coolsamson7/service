import { LocalDeploymentLoader } from './app/deployment';


new LocalDeploymentLoader("http://localhost:4201", "http://localhost:4202")
  .load()
  .then((deployment) => deployment.setRemoteDefinitions())
  .then(() => import('./bootstrap').catch((err) => console.error(err)));
