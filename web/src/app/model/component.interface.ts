import { ChannelAddressDTO } from "./channel-address.interface"
import { ServiceDTO } from "./service.interface"

export interface ComponentDTO {
     name: String,
     description: String,
     services: ServiceDTO[]
     channels: ChannelAddressDTO[]
}