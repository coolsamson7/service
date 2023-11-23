import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, throwError } from "rxjs";
import { ApplicationError, CommunicationError, ServerError } from "../error/error";

@Injectable()
export class HTTPErrorInterceptor implements HttpInterceptor {
    // constructor

    constructor() {
    }

    // implement HttpInterceptor

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(request)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    if (error.error instanceof ErrorEvent) {
                        return throwError(new CommunicationError(error.error.message));
                    } 
                    else {
                        if ( error.error['@class'] && error.status == 512)
                            return throwError(new ServerError( error.error['@class'], error.error.detailMessage));
                        else if ( error.error['@class'] && error.status == 210)
                            return throwError(new ApplicationError( error.error['@class'],  error.error.detailMessage));
                        else
                            return throwError(new ServerError("unknown", "error"));
                    }
                })
            )
    }
}