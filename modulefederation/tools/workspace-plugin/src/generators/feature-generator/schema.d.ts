export interface FeatureGeneratorSchema {
  projectName: string,
  directory?: string,
  name: string,
  parent?: string,
  label?: string,
  folder?: string,
  path?: string,
  lazyModule?: string,
  categories?: string,
  permissions?: string,
  tags?: string,
  i18n?: string,
  style?: Styles,
  dialogMixin?: boolean,
  commandMixin?: boolean
  dialogMixin?: boolean
  stateMixin?: boolean
  viewMixin?: boolean
  routingMixin?: boolean
  speechCommandMixin?: boolean
  onLocaleChangeMixin?: boolean
}
