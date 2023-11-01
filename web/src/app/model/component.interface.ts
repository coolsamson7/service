import { ChannelAddressDTO } from "./channel-address.interface"
import { ServiceInstanceDTO } from "./service-instance.interface"
import { InterfaceDescriptor } from "./service.interface"

export interface ComponentDTO {
     name: String,
     description: String,
     services: InterfaceDescriptor[],
     channels: ChannelAddressDTO[]
}