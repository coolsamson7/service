export interface Portal {
  items : PortalElement[]
}

export interface PortalElement {
  icon : String
  label : String
  route : String
}
