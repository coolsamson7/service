import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, finalize, Observable } from "rxjs";
import { ApplicationError, CommunicationError, HTTPCommunicationError, ServerError } from "../error";
import { ErrorManager } from "../../error";

@Injectable()
export class HTTPErrorInterceptor implements HttpInterceptor {
  // constructor

  constructor(private errorManager : ErrorManager) {
  }

  // private

  private translateError(error : HttpErrorResponse) : Error {

    //error.message
    //error.status

    console.log(error)



    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      return new HTTPCommunicationError(error.status, error.message, error);
    }
    else {
      if (error.error['@class']) {
        // expected or unexpected server side exceptions



        if (error.status == 512) // framework server error
          return new ServerError(error.error['@class'], error.error.detailMessage, error);



        else //if (error.status == 210) // framework application error
          return new ApplicationError(error.error['@class'], error.error.detailMessage, error);
      }

      // spring error

      else if (error.error.error)
        return new ServerError(error.error.status, error.error.error, error);

      // dunno...

      else
        return new ServerError("unknown", "error", error);
    }
  }

  // implement HttpInterceptor

  intercept(request : HttpRequest<unknown>, next : HttpHandler) : Observable<HttpEvent<unknown>> {
    const context = this.errorManager.clearContext();

    return next.handle(request)
      .pipe(
        catchError((error : HttpErrorResponse) => {
          console.log(error)

          let translatedError = this.translateError(error)

          // push context

          if (context) this.errorManager.pushContext(context);

          this.errorManager.pushContext({
            $type: 'http',
            request: request
          });

          // and handle error

          this.errorManager.handle(translatedError);

          throw translatedError
        }),
        finalize(() => {
          // restore context as found before the call

          this.errorManager.setContext(context!!);
        })
      )
  }
}
