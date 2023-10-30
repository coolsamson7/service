export interface ServiceInstanceDTO {
    instanceId:  string
    serviceId:  string
	host: string
    port: number
	isSecure: boolean
	uri : string
    scheme: string
	//TODO Map<String, String> getMetadata();
}