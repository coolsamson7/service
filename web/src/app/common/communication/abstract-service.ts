import { HttpClient } from "@angular/common/http";
import { EndpointLocator } from "./endpoint-locator";
import { Injector } from "@angular/core";

export class AbstractService {
    // instance data
 
   protected http: HttpClient
   protected url: string
 
   // constructor

   protected constructor(injector: Injector) {
     this.http = injector.get(HttpClient)
     this.url = injector.get(EndpointLocator).getEndpoint(this.getDomain())
   }

   // protected

   protected getDomain() {
    return (this.constructor as any)["$$domain"] || ""; // see @RegisterService
   }
 }