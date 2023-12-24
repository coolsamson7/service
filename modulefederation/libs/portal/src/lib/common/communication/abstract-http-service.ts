import { HttpClient, HttpContext, HttpHeaders, HttpParams } from "@angular/common/http";
import { EndpointLocator } from "./endpoint-locator";
import { Injector } from "@angular/core";
import { Observable } from "rxjs";
import { ServiceConfig } from "./register-service.decorator";

export class AbstractHTTPService {
    // instance data

    private http : HttpClient
    private url : string

    // constructor

    protected constructor(injector : Injector) {
        let config = this.getConfig()

        this.http = injector.get(HttpClient)
        this.url = injector.get(EndpointLocator).getEndpoint(config.domain) + (config.prefix || "")
    }

    // HttpClient methods

    /**
     * Constructs a `GET` request that interprets the body as JSON and returns
     * the response body in a given type.
     *
     * @param url     The endpoint URL.
     * @param options The HTTP options to send with the request.
     *
     * @return An `Observable` of the `HttpResponse`, with a response body in the requested type.
     */
    get<T>(url : string, options? : {
        headers? : HttpHeaders | {
            [header : string] : string | string[];
        };
        context? : HttpContext;
        observe? : 'body';
        params? : HttpParams | {
            [param : string] : string | number | boolean | ReadonlyArray<string | number | boolean>;
        };
        reportProgress? : boolean;
        responseType? : 'json';
        withCredentials? : boolean;
    }) : Observable<T> {
        return this.http.get<T>(this.url + url, options)
    }


    /**
     * Constructs a `POST` request that interprets the body as JSON
     * and returns the response body as an object parsed from JSON.
     *
     * @param url The endpoint URL.
     * @param body The content to replace with.
     * @param options HTTP options
     *
     * @return An `Observable` of the response, with the response body as an object parsed from JSON.
     */
    post<T>(url : string, body : any | null, options? : {
        headers? : HttpHeaders | {
            [header : string] : string | string[];
        };
        context? : HttpContext;
        observe? : 'body';
        params? : HttpParams | {
            [param : string] : string | number | boolean | ReadonlyArray<string | number | boolean>;
        };
        reportProgress? : boolean;
        responseType? : 'json';
        withCredentials? : boolean
    }) : Observable<T> {
        return this.http.post<T>(this.url + url, body, options)
    }

    // TODO put, etc.

    // protected

    protected getConfig() : ServiceConfig {
        return (this.constructor as any)["$$config"] || {domain: "", prefix: ""}; // see @Service
    }
}
