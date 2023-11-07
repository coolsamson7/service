import { Injectable, Injector } from "@angular/core";
import { Observable } from "rxjs";
import { ComponentDTO } from "../model/component.interface";
import { ServiceInstanceDTO } from "../model/service-instance.interface";
import { Healths } from "./update-service.service";
import { RegisterService } from "../common/communication/register-service.decorator";
import { AbstractService } from "../common/communication/abstract-service";


@Injectable({
    providedIn: 'root',
   })
@RegisterService("admin")
export class ComponentService extends AbstractService {
    // constructor
    
    constructor(injector: Injector){
      super(injector);
    }
  
    // public

  
    public listAll(): Observable<String[]>{
      return this.http.get<String[]>(`${this.url}/administration/services`);
    }

    public getDetails(component: String): Observable<ComponentDTO>{
      return this.http.get<ComponentDTO>(`${this.url}/administration/component/` + component);
    }

    public getServiceHealth(serviceName: String, serviceId: String): Observable<String>{
      return this.http.get<String>(`${this.url}/administration/health/` + serviceName + "/"+ serviceId);
    }

    public getServiceHealths(serviceName: String): Observable<Healths>{
      return this.http.get<Healths>(`${this.url}/administration/health/` + serviceName);
    }

    public getServiceInstances(serviceName: String): Observable<ServiceInstanceDTO[]>{
      return this.http.get<ServiceInstanceDTO[]>(`${this.url}/administration/service-instances/` + serviceName);
    }

    public listenTo(subscriber: String, component: String) {
     this.http.get(`${this.url}/administration/listen/component/` + subscriber + "/" + component);
    }
  }