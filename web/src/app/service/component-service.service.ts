import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HTTPService } from "./http-service.service";
import { ComponentDTO } from "../model/component.interface";
import { ServiceInstanceDTO } from "../model/service-instance.interface";


@Injectable({
    providedIn: 'root',
   })
export class ComponentService extends HTTPService {
    // constructor
    
    constructor(http: HttpClient){
      super(http);
    }
  
    // public
  
    public listAll(): Observable<String[]>{
      return this.http.get<String[]>(`${this.baseURL}/administration/services`);
    }

    public getDetails(component: String): Observable<ComponentDTO>{
      return this.http.get<ComponentDTO>(`${this.baseURL}/administration/component/` + component);
    }

    public getServiceHealth(serviceName: String, serviceId: String): Observable<String>{
      return this.http.get<String>(`${this.baseURL}/administration/health/` + serviceName + "/"+ serviceId);
    }

    public getServiceInstances(serviceName: String): Observable<ServiceInstanceDTO[]>{
      return this.http.get<ServiceInstanceDTO[]>(`${this.baseURL}/administration/service-instances/` + serviceName);
    }
  }