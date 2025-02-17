import { ModdleExtensions } from "bpmn-js/lib/BaseViewer";

export const DiagramConfigurationToken = Symbol('DiagramConfigurationToken');

export interface DiagramConfiguration {
  extensions?: ModdleExtensions;
}
