import { ComponentDTO } from "./component.interface"

export interface ServiceInstanceDTO {
    component: ComponentDTO // backlink

    instanceId:  string
    serviceId:  string
	host: string
    port: number
	isSecure: boolean
	uri : string
    scheme: string
	//TODO Map<String, String> getMetadata();
}