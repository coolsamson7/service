import {ModuleConfig} from "./module-config";

export function RegisterModule(config: ModuleConfig) {
  return (ctor: Function) => {
    console.log("RegisterModule: " + config.name);
  }
}
