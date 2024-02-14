import { Injectable, Injector } from "@angular/core";
import { Observable } from "rxjs";
import { ComponentDTO } from "../model/component.interface";
import { ServiceInstanceDTO } from "../model/service-instance.interface";
import { Healths } from "./update-service.service";
import { AbstractHTTPService, Service } from "@modulefederation/portal";
import { Server } from "../model/server.interface";
import { InterfaceDescriptor } from "../model/service.interface";

export interface Channel { // TODO
    name : string,
    uri : string[]
}

export type ApplicationChannels = { [component : string] : Channel }

@Injectable({providedIn: 'root'})
@Service({domain: "admin", prefix: "/administration"})
export class ComponentService extends AbstractHTTPService {
    // constructor

    constructor(injector : Injector) {
        super(injector);
    }

    // public

    public listAll() : Observable<string[]> {
        return this.get<string[]>(`/services`);
    }

    /**
     *
     * @param component
     * @returns
     */
    public getDetails(component : string) : Observable<ComponentDTO> {
        return this.get<ComponentDTO>(`/component/${component}`);
    }

    public getServices(component : string) : Observable<InterfaceDescriptor[]> {
        return this.get<InterfaceDescriptor[]>(`/component-services/${component}`);
    }

    public executeMethod(component : string, request : string) : Observable<string> {
        return this.post<string>(`/execute-method/${component}`, request);
    }

    public getServiceHealth(serviceName : string, serviceId : string) : Observable<string> {
        return this.get<string>(`/health/${serviceName}/${serviceId}`);
    }

    public getServiceHealths(serviceName : string) : Observable<Healths> {
        return this.get<Healths>(`/health/${serviceName}`)
    }

    public getServiceInstances(serviceName : string) : Observable<ServiceInstanceDTO[]> {
        return this.get<ServiceInstanceDTO[]>(`/service-instances/${serviceName}`)
    }

    public listenTo(subscriber : string, component : string) {
        return this.get(`/listen/component/${subscriber}/${component}` + subscriber)
    }

    public getOpenChannels(server : Server) : Observable<ApplicationChannels> {
        return this.post<ApplicationChannels>(`/application-channels`, server)
    }
}
