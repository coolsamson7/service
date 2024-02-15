import "reflect-metadata"
import { getJestProjects } from '@nx/jest';

export default {
  projects: getJestProjects(),
};
