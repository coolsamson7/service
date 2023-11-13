import { ChannelAddressDTO } from "./channel-address.interface"
import { InterfaceDescriptor } from "./service.interface"

 export interface ComponentModel {
     component: InterfaceDescriptor,
     services: InterfaceDescriptor[],
     models: InterfaceDescriptor[]
 }

export interface ComponentDTO {
     name: String,
     description: String,
     model: ComponentModel,
     channels: ChannelAddressDTO[]
}