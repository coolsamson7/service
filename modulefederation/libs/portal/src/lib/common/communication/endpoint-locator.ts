export abstract class EndpointLocator {
    /**
     * return a base url for server calls
     * @param domain a domain name
     */
    abstract getEndpoint(domain : string) : string
}
