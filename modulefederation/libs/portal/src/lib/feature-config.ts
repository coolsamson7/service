import {Observable} from "rxjs";

export interface FeatureConfig {
  parent?: string
  name: string
  description?: string
  isDefault?: boolean
  label?: string
  component?: string
  tags?: string[]
  categories?: string[]
  visibility?:string[]
  permissions?: string[]
  featureToggles?: string[]

  ngComponent?: any
  load?: () => Observable<any>
}
