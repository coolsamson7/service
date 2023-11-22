import { Injectable, Injector } from "@angular/core";
import { Observable } from "rxjs";
import { ComponentDTO } from "../model/component.interface";
import { ServiceInstanceDTO } from "../model/service-instance.interface";
import { Healths } from "./update-service.service";
import { RegisterService } from "../common/communication/register-service.decorator";
import { AbstractHTTPService } from "../common/communication/abstract-http-service";
import { Server } from "../model/server.interface";
import { InterfaceDescriptor } from "../model/service.interface";

export interface Channel { // TODO
  name: string,
  uri: string[]
} 
export type ApplicationChannels = {[ component: string] : Channel}

@Injectable({providedIn: 'root'})
@RegisterService({domain: "admin", prefix: "/administration"})
export class ComponentService extends AbstractHTTPService {
    // constructor
    
    constructor(injector: Injector){
      super(injector);
    }
  
    // public
  
    public listAll(): Observable<String[]>{
      return this.get<String[]>(`/services`);
    }

    public getDetails(component: String): Observable<ComponentDTO>{
      return this.get<ComponentDTO>(`/component/${component}`);
    }

    public getServices(component: String): Observable<InterfaceDescriptor[]>{
      return this.get<InterfaceDescriptor[]>(`/component-services/${component}`);
    }

    public executeMethod(component: String, request: string): Observable<string>{
      return this.post<string>(`/execute-method/${component}`, request);
    }

    public getServiceHealth(serviceName: String, serviceId: String): Observable<String>{
      return this.get<String>(`/health/${serviceName}/${serviceId}`);
    }

    public getServiceHealths(serviceName: String): Observable<Healths>{
      return this.get<Healths>(`/health/${serviceName}`)
    }

    public getServiceInstances(serviceName: String): Observable<ServiceInstanceDTO[]>{
      return this.get<ServiceInstanceDTO[]>(`/service-instances/${serviceName}`)
    }

    public listenTo(subscriber: String, component: String) {
      return this.get(`/listen/component/${subscriber}/${component}` + subscriber)
    }

    public getOpenChannels(server: Server): Observable<ApplicationChannels>{
      return this.post<ApplicationChannels>(`/application-channels`, server)
    }
  }