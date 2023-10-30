import { HttpClient } from "@angular/common/http";

export class HTTPService {
    // isntance data
 
   baseURL: string = 'http://localhost:8080'; // TODO
 
   protected constructor(protected http: HttpClient){}
 }