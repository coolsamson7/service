export interface FeatureGeneratorSchema {
  projectName: string,
  directory?: string,
  name: string,
  path?: string,
  categories?: string,
  style?: Styles,
  dialogMixin?: boolean,
  commandMixin?: boolean
  dialogMixin?: boolean
  stateMixin?: boolean
  viewMixin?: boolean
  routingMixin?: boolean
  speechCommandsMixin?: boolean
  featureMetadataMixin?: boolean
  onLocaleChangeMixin?: boolean
}
